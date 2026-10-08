import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createPilot, processEvents, resolveTargets, validSignature, pushText } from '../server.mjs';

const id = n => 'C' + String(n).padStart(32, '0');
const event = (n, type = 'join', at = 100) => ({ type, timestamp: at, source: { type: 'group', groupId: id(n) } });

async function fixture(t, options = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'idol-ekiden-test-'));
  const pilot = createPilot({ directory, secret: 'test-secret', ...options });
  await Promise.all([pilot.admin, pilot.webhook].map(server => new Promise(resolve => server.listen(0, '127.0.0.1', resolve))));
  const origin = `http://127.0.0.1:${pilot.admin.address().port}`;
  const webhook = `http://127.0.0.1:${pilot.webhook.address().port}/webhook`;
  t.after(async () => {
    await Promise.all([pilot.admin, pilot.webhook].map(server => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); })));
    if (path.dirname(directory) === os.tmpdir() && path.basename(directory).startsWith('idol-ekiden-test-')) fs.rmSync(directory, { recursive: true });
  });
  return {
    directory,
    post: (route, body, extra = {}) => fetch(`${origin}/api/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Gaia-Admin': '1', Origin: origin, ...extra }, body: JSON.stringify(body) }),
    state: async () => (await fetch(`${origin}/api/state`)).json(),
    hook: (events, secret = 'test-secret') => {
      const raw = JSON.stringify({ events });
      return fetch(webhook, { method: 'POST', headers: { 'x-line-signature': createHmac('sha256', secret).update(raw).digest('base64') }, body: raw });
    }
  };
}

test('全体、特定チーム、全チームはそれぞれ別の送り先になる', () => {
  const state = { groups: [{ id: id(1), role: 'all', active: true }, { id: id(2), role: 'team', active: true }, { id: id(3), role: 'team', active: true }, { id: id(4), role: 'unassigned', active: true }, { id: id(5), role: 'team', active: false }] };
  assert.deepEqual(resolveTargets(state, { kind: 'all' }).map(g => g.id), [id(1)]);
  assert.deepEqual(resolveTargets(state, { kind: 'group', id: id(2) }).map(g => g.id), [id(2)]);
  assert.deepEqual(resolveTargets(state, { kind: 'teams' }).map(g => g.id), [id(2), id(3)]);
  assert.throws(() => resolveTargets(state, { kind: 'group', id: id(4) }));
});

test('署名は受信した本文そのもので確認する', () => {
  const raw = Buffer.from('{"events":[],"text":"駅伝"}');
  const signature = createHmac('sha256', 'secret').update(raw).digest('base64');
  assert.equal(validSignature(raw, signature, 'secret'), true);
  assert.equal(validSignature(Buffer.from(raw.toString() + ' '), signature, 'secret'), false);
  assert.equal(validSignature(raw, signature, 'wrong'), false);
  assert.equal(validSignature(raw, '', 'secret'), false);
});

test('古いイベントで退出グループを復活させず、本文や個人IDも保存しない', () => {
  const state = { groups: [] };
  processEvents(state, [event(1), { ...event(1, 'message', 120), message: { text: 'private' }, source: { type: 'group', groupId: id(1), userId: 'private-user' } }, event(1, 'leave', 200), event(1, 'message', 150)]);
  assert.equal(state.groups.length, 1);
  assert.equal(state.groups[0].active, false);
  assert.equal(JSON.stringify(state).includes('private'), false);
});

test('Webhook検証用の空イベントは受理し、不正署名は拒否する', async t => {
  const f = await fixture(t);
  assert.equal((await f.hook([])).status, 200);
  assert.equal((await f.hook([event(1)], 'wrong')).status, 401);
  assert.equal((await f.state()).groups.length, 0);
  assert.equal((await f.hook([event(1)])).status, 200);
  assert.equal((await f.state()).groups.length, 1);
});

test('練習操作は外部送信せず、記録を保存し、同じプレビューを再送しない', async t => {
  let calls = 0;
  const f = await fixture(t, { fetcher: async () => { calls++; throw new Error('unexpected'); } });
  await f.post('demo', {});
  const preview = await (await f.post('preview', { selection: { kind: 'teams' }, text: '帰還してください' })).json();
  assert.equal(preview.targets.length, 2);
  const response = await f.post('send', { previewId: preview.id, actual: false });
  assert.equal(response.status, 200);
  assert.equal(calls, 0);
  assert.equal((await f.post('send', { previewId: preview.id })).status, 400);
  const saved = JSON.parse(fs.readFileSync(path.join(f.directory, 'state.json')));
  assert.equal(saved.history.length, 1);
  assert.equal(saved.history[0].results.every(r => r.status === 'practice'), true);
});

test('別サイトからの管理操作と、未設定での実送信を拒否する', async t => {
  const f = await fixture(t);
  assert.equal((await f.post('demo', {}, { Origin: 'https://other.example' })).status, 403);
  await f.post('demo', {});
  const preview = await (await f.post('preview', { selection: { kind: 'all' }, text: 'テスト' })).json();
  assert.equal((await f.post('send', { previewId: preview.id, actual: true })).status, 400);
  assert.equal((await f.state()).history.length, 0);
});

test('実送信は選択したチームだけに送る（LINEへの通信は模擬）', async t => {
  const requests = [];
  const f = await fixture(t, { live: true, token: 'test-token', fetcher: async (url, opts) => { requests.push({ url, ...opts }); return new Response('{}', { status: 200 }); } });
  await f.hook([event(1), event(2), event(3)]);
  for (const [n, role] of [[1, 'all'], [2, 'team'], [3, 'team']]) await f.post('group', { id: id(n), name: `group-${n}`, role });
  const preview = await (await f.post('preview', { selection: { kind: 'group', id: id(2) }, text: '限定情報' })).json();
  assert.equal((await f.post('send', { previewId: preview.id, actual: true })).status, 200);
  assert.equal(requests.length, 1);
  assert.deepEqual(JSON.parse(requests[0].body), { to: id(2), messages: [{ type: 'text', text: '限定情報' }] });
  assert.equal(requests[0].headers.Authorization, 'Bearer test-token');
  assert.match(requests[0].headers['X-Line-Retry-Key'], /^[0-9a-f-]{36}$/);
  assert.equal((await f.state()).history[0].results[0].status, 'accepted');
  const all = await (await f.post('preview', { selection: { kind: 'all' }, text: '全体連絡' })).json();
  await f.post('send', { previewId: all.id, actual: true });
  const teams = await (await f.post('preview', { selection: { kind: 'teams' }, text: 'チームごとの連絡' })).json();
  await f.post('send', { previewId: teams.id, actual: true });
  assert.deepEqual(requests.map(r => JSON.parse(r.body).to), [id(2), id(1), id(2), id(3)]);
  assert.equal(new Set(requests.map(r => r.headers['X-Line-Retry-Key'])).size, 4);
});

test('途中で退出した送り先には送信せず、複数の全体グループも拒否する', async t => {
  const f = await fixture(t);
  await f.hook([event(1), event(2)]);
  await f.post('group', { id: id(1), name: '全体', role: 'all' });
  assert.equal((await f.post('group', { id: id(2), name: '全体2', role: 'all' })).status, 400);
  const preview = await (await f.post('preview', { selection: { kind: 'all' }, text: 'テスト' })).json();
  await f.hook([event(1, 'leave', 200)]);
  assert.equal((await f.post('send', { previewId: preview.id })).status, 400);
});

test('失敗を送信成功として扱わず、既受付の再試行は識別する', async () => {
  await assert.rejects(pushText({ groupId: id(1), text: 'test', token: 'test', retryKey: 'test', fetcher: async () => new Response('{}', { status: 429 }) }), /429/);
  assert.equal(await pushText({ groupId: id(1), text: 'test', token: 'test', retryKey: 'test', fetcher: async () => new Response('{}', { status: 409, headers: { 'x-line-accepted-request-id': 'previous' } }) }), 'accepted');
});
