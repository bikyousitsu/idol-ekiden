import http from 'node:http';
import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const groupIdPattern = /^C[0-9a-f]{32}$/i;
const roles = ['unassigned', 'all', 'team'];

export function validSignature(raw, signature, secret) {
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(raw).digest();
  const received = Buffer.from(signature, 'base64');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function processEvents(state, events) {
  for (const event of events) {
    const source = event.source;
    if (source?.type !== 'group' || !groupIdPattern.test(source.groupId)) continue;
    if (!['join', 'leave', 'message'].includes(event.type)) continue;
    let group = state.groups.find(g => g.id === source.groupId);
    if (!group) {
      group = { id: source.groupId, name: '新しいLINEグループ', role: 'unassigned', active: true, lastEventAt: 0 };
      state.groups.push(group);
    }
    // 再配信された古いイベントで、退出済みグループを再開させない。
    const at = Number(event.timestamp) || 0;
    if (at < group.lastEventAt) continue;
    group.lastEventAt = at;
    group.active = event.type !== 'leave';
  }
}

export function resolveTargets(state, selection) {
  if (!selection || typeof selection !== 'object') throw new Error('送り先を選んでください。');
  const active = state.groups.filter(g => g.active);
  let targets;
  if (selection.kind === 'all') targets = active.filter(g => g.role === 'all');
  else if (selection.kind === 'teams') targets = active.filter(g => g.role === 'team');
  else if (selection.kind === 'group') targets = active.filter(g => g.id === selection.id && g.role === 'team');
  else throw new Error('送り先の種類が不正です。');
  if (!targets.length) throw new Error('その送り先に登録済みのグループがありません。');
  if (selection.kind === 'all' && targets.length !== 1) throw new Error('全体グループを一つに設定してください。');
  return targets;
}

export function validateText(text) {
  if (typeof text !== 'string' || !text.trim() || text.length > 5000) throw new Error('本文を1〜5000文字で入力してください。');
  return text.trim();
}

export async function pushText({ groupId, text, token, retryKey, fetcher = fetch }) {
  const response = await fetcher('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Line-Retry-Key': retryKey },
    body: JSON.stringify({ to: groupId, messages: [{ type: 'text', text }] }),
    signal: AbortSignal.timeout(15000)
  });
  if (response.ok) return 'accepted';
  if (response.status === 409 && response.headers.get('x-line-accepted-request-id')) return 'accepted';
  if (response.status >= 500 || response.status === 409) throw new Error('受付結果が不明です。LINE側の状況を確認してください。');
  throw new Error(`LINEが送信を受け付けませんでした（${response.status}）。設定・配信枠を確認してください。`);
}

function readBody(req, limit = 256000) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > limit) { reject(new Error('データが大きすぎます。')); req.destroy(); }
      else chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

export function createPilot({ directory = path.join(root, 'data'), secret = '', token = '', live = false, fetcher = fetch } = {}) {
  fs.mkdirSync(directory, { recursive: true });
  const stateFile = path.join(directory, 'state.json');
  const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : { groups: [], history: [] };
  const save = () => {
    const tmp = `${stateFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, stateFile);
  };
  const liveReady = live && Boolean(secret && token);
  const admin = http.createServer(async (req, res) => {
    try {
      // 管理画面はローカル専用。公開用のWebhookとは別ポート。
      const host = req.headers.host || '';
      if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host)) return json(res, 403, { error: 'ローカル管理画面です。' });
      const url = new URL(req.url, `http://${host}`);
      if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY' });
        return res.end(fs.readFileSync(path.join(root, 'admin.html')));
      }
      if (req.method === 'GET' && url.pathname === '/api/state') return json(res, 200, { ...state, liveReady, liveRequested: live });
      if (req.method !== 'POST') return json(res, 404, { error: '見つかりません。' });
      if (req.headers['x-gaia-admin'] !== '1' || req.headers.origin !== `http://${host}`) return json(res, 403, { error: '管理画面から操作してください。' });
      const body = JSON.parse((await readBody(req)).toString('utf8'));
      if (url.pathname === '/api/demo') {
        if (live) throw new Error('接続モードでは練習用グループを追加できません。');
        for (const [i, name, role] of [[1, '全体（練習用）', 'all'], [2, 'チームA（練習用）', 'team'], [3, 'チームB（練習用）', 'team']]) {
          const id = `demo-${i}`;
          if (!state.groups.some(g => g.id === id)) state.groups.push({ id, name, role, active: true, lastEventAt: 0 });
        }
        save(); return json(res, 200, { ok: true });
      }
      if (url.pathname === '/api/group') {
        const group = state.groups.find(g => g.id === body.id);
        if (!group || !roles.includes(body.role) || typeof body.name !== 'string' || !body.name.trim() || body.name.length > 80) throw new Error('グループ設定を確認してください。');
        if (body.role === 'all' && state.groups.some(g => g.id !== group.id && g.role === 'all' && g.active)) throw new Error('全体グループは一つです。現在の全体グループの用途を変更してから設定してください。');
        group.name = body.name.trim(); group.role = body.role;
        save(); return json(res, 200, { ok: true });
      }
      if (url.pathname === '/api/preview') {
        const text = validateText(body.text);
        const targets = resolveTargets(state, body.selection);
        const preview = { id: randomUUID(), text, targets: targets.map(g => ({ id: g.id, name: g.name })), createdAt: Date.now() };
        // プレビュー時点の送り先と本文を固定。表示後の変更は再プレビューが必要。
        previews.set(preview.id, preview);
        for (const [id, p] of previews) if (Date.now() - p.createdAt > 600000) previews.delete(id);
        return json(res, 200, preview);
      }
      if (url.pathname === '/api/send') {
        const preview = previews.get(body.previewId);
        if (!preview || Date.now() - preview.createdAt > 600000) throw new Error('もう一度プレビューしてください。');
        const actual = body.actual === true;
        if (actual && !liveReady) throw new Error('LINEの接続設定がまだ完了していません。');
        if (actual && preview.targets.some(t => !groupIdPattern.test(t.id))) throw new Error('練習用グループには実際の配信はできません。');
        if (preview.targets.some(t => !state.groups.some(g => g.id === t.id && g.active && g.role !== 'unassigned'))) throw new Error('送り先が変更されています。再プレビューしてください。');
        previews.delete(preview.id);
        const job = { id: preview.id, at: new Date().toISOString(), text: preview.text, mode: actual ? 'live' : 'practice', results: preview.targets.map(t => ({ ...t, retryKey: randomUUID(), status: 'pending' })) };
        state.history.unshift(job); save();
        for (const result of job.results) {
          if (!actual) result.status = 'practice';
          else {
            try { result.status = await pushText({ groupId: result.id, text: job.text, token, retryKey: result.retryKey, fetcher }); }
            catch (error) { result.status = 'check-required'; result.error = error.message; }
          }
          save();
        }
        return json(res, 200, job);
      }
      return json(res, 404, { error: '見つかりません。' });
    } catch (error) { if (!res.destroyed) json(res, 400, { error: error.message }); }
  });
  const previews = new Map();
  const webhook = http.createServer(async (req, res) => {
    if (req.url !== '/webhook' || req.method !== 'POST') return json(res, 404, { error: 'not found' });
    try {
      if (!secret) return json(res, 503, { error: 'not configured' });
      const raw = await readBody(req);
      if (!validSignature(raw, req.headers['x-line-signature'], secret)) return json(res, 401, { error: 'invalid signature' });
      const payload = JSON.parse(raw.toString('utf8'));
      if (!Array.isArray(payload.events)) return json(res, 400, { error: 'invalid events' });
      processEvents(state, payload.events); save();
      // チャット本文や個人のLINE IDは保存しない。
      return json(res, 200, { ok: true });
    } catch { if (!res.destroyed) json(res, 400, { error: 'invalid request' }); }
  });
  return { admin, webhook };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const adminPort = Number(process.env.ADMIN_PORT || 4318);
  const webhookPort = Number(process.env.WEBHOOK_PORT || 4319);
  const pilot = createPilot({ secret: process.env.LINE_CHANNEL_SECRET, token: process.env.LINE_CHANNEL_ACCESS_TOKEN, live: process.env.LINE_LIVE === 'true' });
  for (const server of [pilot.admin, pilot.webhook]) server.on('error', error => { console.error(`起動できませんでした: ${error.code}`); process.exitCode = 1; });
  pilot.admin.listen(adminPort, '127.0.0.1', () => console.log(`管理画面: http://127.0.0.1:${adminPort}`));
  pilot.webhook.listen(webhookPort, '127.0.0.1', () => console.log(`LINE接続先（公開HTTPSへの接続が必要）: http://127.0.0.1:${webhookPort}/webhook`));
}
