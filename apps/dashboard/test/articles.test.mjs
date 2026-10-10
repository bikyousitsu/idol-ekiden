import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeArticle, validateArticle, publicArticle, selectArticle, articleHref, reviseArticle,
} from '../lib/articles.mjs';

const NOW = '2026-10-11T07:50:00.000Z';
const COMMENT = { id: 'c1', author: '架空の古参', stance: '考察', text: '次のステージも見たい。', agree: 10, disagree: 2 };
function article(overrides = {}) {
  return {
    id: 'story-1', headline: '架空ニュースの見出し', summary: '架空の記事のまとめ',
    body: 'これは企画内の架空記事です。', category: '活動', illustration: 'stage',
    teamIds: ['G1'], comments: [{ ...COMMENT }], time: '16:50', revision: 2,
    private: false, published: true, reviewedBy: 'operator-secret-id',
    shareKey: 'secret-share-key', history: [{ body: '公開しない旧稿', editor: 'secret-editor' }],
    ...overrides,
  };
}
function input(old, overrides = {}) {
  return { ...old, status: 'publish', ...overrides };
}

test('公開DTOは許可した誌面フィールドのみ、運営履歴・共有鍵・確認者を除外する', () => {
  const old = article({ internalNote: '掲載見送りの元トピック', reviewedAt: 'secret-date' });
  const dto = publicArticle(old);
  assert.deepEqual(Object.keys(dto).sort(), [
    'id', 'headline', 'summary', 'body', 'category', 'illustration', 'teamIds', 'comments',
    'time', 'publishedAt', 'editedAt', 'revision', 'audience',
  ].sort());
  assert.equal(dto.audience, 'all');
  for (const secret of ['secret-share-key', 'operator-secret-id', '公開しない旧稿', 'secret-editor', '掲載見送りの元トピック', 'secret-date']) {
    assert.ok(!JSON.stringify(dto).includes(secret));
  }
  assert.ok(!('private' in dto));
  assert.ok(!('published' in dto));
});

test('公開記事は鍵なしで読めるが、下書きと不明IDは読めない', () => {
  const state = { news: [article(), article({ id: 'draft', published: false })] };
  assert.equal(selectArticle(state, 'story-1').id, 'story-1');
  assert.equal(selectArticle(state, 'draft'), null);
  assert.equal(selectArticle(state, 'missing'), null);
});

test('非公開予告は共有開始後の正しいkeyだけ許可し、DTOにkeyは含めない', () => {
  const old = article({ private: true, published: false, target: 'G1', sharedAt: NOW });
  const state = { news: [old] };
  assert.equal(selectArticle(state, old.id), null);
  assert.equal(selectArticle(state, old.id, ''), null);
  assert.equal(selectArticle(state, old.id, 'wrong-key'), null);
  assert.equal(selectArticle(state, old.id, 'SECRET-SHARE-KEY'), null);
  const dto = selectArticle(state, old.id, old.shareKey);
  assert.equal(dto.audience, 'team');
  assert.ok(!('shareKey' in dto));
  assert.equal(selectArticle({ news: [{ ...old, sharedAt: null }] }, old.id, old.shareKey), null);
  assert.equal(selectArticle({ news: [{ ...old, shareKey: null }] }, old.id, 'any-key'), null);
});

test('withdraw相当のdraft変更後は、過去の公開URLもチームの共有鍵も拒否する', () => {
  const publicOld = article();
  const withdrawn = reviseArticle(publicOld, input(publicOld, { status: 'draft' }), NOW, 'editor');
  assert.equal(withdrawn.published, false);
  assert.equal(selectArticle({ news: [withdrawn] }, withdrawn.id), null);
  const privateOld = article({ private: true, published: false, sharedAt: NOW, target: 'G1' });
  const privateWithdrawn = reviseArticle(privateOld, input(privateOld, { status: 'draft' }), NOW, 'editor');
  assert.equal(privateWithdrawn.sharedAt, null);
  assert.equal(selectArticle({ news: [privateWithdrawn] }, privateWithdrawn.id, privateOld.shareKey), null);
});

test('古いrevisionの更新を拒否して、原稿も履歴も変更しない', () => {
  const old = article();
  const snapshot = structuredClone(old);
  assert.throws(() => reviseArticle(old, input(old, { revision: 1 }), NOW, 'editor'), /ARTICLE_CONFLICT/);
  assert.throws(() => reviseArticle(old, input(old, { revision: '2' }), NOW, 'editor'), /ARTICLE_CONFLICT/);
  assert.deepEqual(old, snapshot);
});

test('非公開予告を全体publishできず、公開原稿をteam-shareにも変更できない', () => {
  const old = article({ private: true, published: false, target: 'G1' });
  assert.throws(() => reviseArticle(old, input(old), NOW, 'editor'), /全体公開できません/);
  const publicOld = article();
  assert.throws(() => reviseArticle(publicOld, input(publicOld, { status: 'share' }), NOW, 'editor'), /公開方法/);
  assert.throws(() => reviseArticle(publicOld, input(publicOld, { status: 'withdraw' }), NOW, 'editor'), /公開方法/);
});

test('チーム共有は新規の十分長い鍵を作り、再編集でも同じURLを保つ', () => {
  const old = article({ private: true, published: false, shareKey: undefined, target: 'G1' });
  const first = reviseArticle(old, input(old, { status: 'share' }), NOW, 'editor');
  assert.match(first.shareKey, /^[0-9a-f]{48}$/);
  assert.equal(first.sharedAt, NOW);
  assert.equal(first.published, false);
  const edited = reviseArticle(first, input(first, { status: 'share', headline: '修正版の予告' }), '2026-10-11T08:00:00.000Z', 'editor2');
  assert.equal(edited.shareKey, first.shareKey);
  assert.equal(selectArticle({ news: [edited] }, edited.id, first.shareKey).headline, '修正版の予告');
});

test('改稿は公開済みの初回日時を保ち、revision・確認者・旧稿履歴を更新する', () => {
  const old = article({ publishedAt: '2026-10-11T07:00:00.000Z' });
  const snapshot = structuredClone(old);
  const next = reviseArticle(old, input(old, { headline: '編集後の見出し' }), NOW, 'new-editor');
  assert.equal(next.headline, '編集後の見出し');
  assert.equal(next.publishedAt, old.publishedAt);
  assert.equal(next.editedAt, NOW);
  assert.equal(next.reviewedBy, 'new-editor');
  assert.equal(next.revision, old.revision + 1);
  assert.equal(next.history.at(-1).headline, old.headline);
  assert.equal(next.history.at(-1).editor, 'new-editor');
  assert.ok(!('shareKey' in next.history.at(-1)));
  assert.deepEqual(old, snapshot);
  const initiallyDraft = article({ published: false, publishedAt: undefined });
  assert.equal(reviseArticle(initiallyDraft, input(initiallyDraft), NOW, 'editor').publishedAt, NOW);
});

test('履歴の上限20件を守り、運営専用フィールドの偽装は取り込まない', () => {
  const old = article({ history: Array.from({ length: 20 }, (_, i) => ({ id: `previous-${i}` })) });
  const next = reviseArticle(old, input(old, {
    id: 'injected-id', private: true, shareKey: 'injected-key',
    reviewedBy: 'injected-editor', history: [], target: 'all',
  }), NOW, 'actual-editor');
  assert.equal(next.id, old.id);
  assert.equal(next.private, old.private);
  assert.equal(next.shareKey, old.shareKey);
  assert.equal(next.reviewedBy, 'actual-editor');
  assert.equal(next.history.length, 20);
  assert.equal(next.history[0].id, 'previous-1');
});

test('本文・要約・タイトルは空白だけ、不正型、上限超過を拒否する', () => {
  for (const [field, max] of [['headline', 100], ['summary', 180], ['body', 6000]]) {
    for (const value of ['', ' \n\t ', null, 7, '字'.repeat(max + 1)]) {
      assert.throws(() => validateArticle(article({ [field]: value })), new RegExp(field));
    }
    assert.doesNotThrow(() => validateArticle(article({ [field]: '字'.repeat(max) })));
  }
});

test('分類・誌面テーマ・対象チームを既定の値に制限する', () => {
  for (const overrides of [
    { category: '架空の未知分類' }, { illustration: '<script>' },
    { teamIds: ['G7'] }, { teamIds: ['G0'] }, { teamIds: ['all'] }, { teamIds: null },
  ]) assert.throws(() => validateArticle(article(overrides)));
  assert.doesNotThrow(() => validateArticle(article({ teamIds: [] })));
  assert.doesNotThrow(() => validateArticle(article({ category: '運営', illustration: 'notice', teamIds: ['G1', 'G6'] })));
});

test('架空コメントの件数・文字数・stance・反応数の不正値を拒否する', () => {
  assert.throws(() => validateArticle(article({ comments: Array.from({ length: 13 }, () => ({ ...COMMENT })) })), /コメント/);
  assert.throws(() => validateArticle(article({ comments: 'not-an-array' })), /コメント/);
  for (const overrides of [
    { id: 5 }, { author: '' }, { author: '名'.repeat(31) },
    { text: ' ' }, { text: '字'.repeat(251) }, { stance: 'アンチ' },
    { agree: -1 }, { agree: 1.5 }, { agree: 100000 }, { agree: NaN },
    { disagree: -1 }, { disagree: '2' }, { disagree: 100000 },
  ]) assert.throws(() => validateArticle(article({ comments: [{ ...COMMENT, ...overrides }] })), /コメント/);
  assert.doesNotThrow(() => validateArticle(article({ comments: [] })));
  assert.doesNotThrow(() => validateArticle(article({ comments: [{ ...COMMENT, author: '名'.repeat(30), text: '字'.repeat(250), agree: 99999, disagree: 0 }] })));
});

test('旧稿に不足した表示フィールドを補完し、非公開チーム対象を引き継ぐ', () => {
  const old = { id: 'old', headline: '旧見出し', body: '旧形式の本文', private: true, target: 'G2' };
  const next = normalizeArticle(old);
  assert.equal(next.summary, old.body);
  assert.equal(next.category, '活動');
  assert.equal(next.illustration, 'stage');
  assert.deepEqual(next.teamIds, ['G2']);
  assert.deepEqual(next.comments, []);
  assert.equal(next.revision, 0);
  assert.ok(!('summary' in old));
});

test('公開URLは記事単位で、練習イベントと鍵を正しくエンコードする', () => {
  const ordinary = article();
  assert.equal(articleHref(ordinary), '/news/story-1');
  assert.equal(articleHref(ordinary, 'practice'), '/news/story-1?event=practice');
  const privateOld = article({ id: '特別/予告?x#', private: true, sharedAt: NOW, shareKey: 'a+/&=?' });
  const privateLink = new URL(articleHref(privateOld, 'rehearsal', true), 'https://example.test');
  assert.equal(privateLink.pathname, '/news/%E7%89%B9%E5%88%A5%2F%E4%BA%88%E5%91%8A%3Fx%23');
  assert.equal(privateLink.searchParams.get('event'), 'rehearsal');
  assert.equal(privateLink.searchParams.get('key'), privateOld.shareKey);
  assert.equal(new URL(articleHref(privateOld), 'https://example.test').searchParams.has('key'), false);
  assert.equal(new URL(articleHref({ ...privateOld, sharedAt: null }, 'production', true), 'https://example.test').searchParams.has('key'), false);
  assert.equal(new URL(articleHref(ordinary, 'production', true), 'https://example.test').searchParams.has('key'), false);
});
