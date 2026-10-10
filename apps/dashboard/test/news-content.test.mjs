import test from 'node:test';
import assert from 'node:assert/strict';
import { editorialDraft, sampleArticles, scandalResultDraft, commentDraft } from '../lib/news-content.mjs';

const team = (resolution, id = 'G1') => ({
  id, name: `架空${id}`, rank: 1, totalFans: 400000,
  scandal: { topic: `非公開トピックの目印-${id}`, resolution, published: true,
    result: { cover: 0, apology: 20000, publicity: 30000, failed: -30000 }[resolution] ?? -30000 },
});
function checkArticle(article) {
  assert.ok(Array.from(article.headline).length <= 100);
  assert.ok(Array.from(article.summary).length <= 180);
  assert.ok(Array.from(article.body).length <= 6000);
  assert.match(article.body, /この記事とコメント.*架空/);
  assert.ok(article.comments.length >= 4 && article.comments.length <= 6);
  assert.equal(new Set(article.comments.map(c => c.id)).size, article.comments.length);
  for (const c of article.comments) {
    assert.ok(Array.from(c.text).length <= 250);
    assert.ok(['応援', '考察', '辛口'].includes(c.stance));
    assert.ok(Number.isInteger(c.agree) && c.agree >= 0);
    assert.ok(Number.isInteger(c.disagree) && c.disagree >= 0);
  }
}

test('練習記事は8本、全て架空・練習の表示と独立IDを持つ', () => {
  const articles = sampleArticles();
  assert.equal(articles.length, 8);
  assert.equal(new Set(articles.map(a => a.id)).size, 8);
  for (const a of articles) {
    checkArticle(a);
    assert.match(a.headline, /練習記事/);
    assert.equal(a.practice, true);
    assert.equal(a.published, true);
    assert.equal(a.private, false);
  }
});

test('掲載見送りは見出し・要約・本文・コメントにトピックを残さない', () => {
  const t = team('cover');
  const result = scandalResultDraft(t);
  checkArticle(result);
  assert.match(result.headline, /掲載見送り/);
  assert.ok(!JSON.stringify(result).includes(t.scandal.topic));
  assert.equal(result.private, false);
  assert.equal(result.time, '16:50');
  assert.equal(scandalResultDraft({ ...t, scandal: { ...t.scandal, published: false } }), null);
});

test('各スキャンダル結果は確定値に従い、対応の区別と下限を表示する', () => {
  for (const [mode, expected] of [['apology', '+2万人'], ['publicity', '+3万人'], ['failed', '-3万人'], [null, '-3万人']]) {
    const t = team(mode);
    const result = scandalResultDraft(t);
    checkArticle(result);
    assert.ok(result.body.includes(expected));
    assert.ok(result.body.includes(t.scandal.topic));
    assert.match(result.body, /下限はゼロ/);
    assert.deepEqual(result.teamIds, [t.id]);
  }
});

test('未公開の採点から記事を作らず、掲載予告はprivateを保持する', () => {
  assert.equal(editorialDraft({ kind: 'final' }, { teams: [] }, null), null);
  const t = team('cover');
  const result = editorialDraft({ kind: 'scandal_open', teamId: t.id }, { teams: [t] }, {
    headline: '掲載予告', body: '対象チームのみ。16:45が締切。', private: true, target: t.id,
  });
  checkArticle(result);
  assert.equal(result.private, true);
  assert.equal(result.target, t.id);
  assert.match(result.headline, /運営プレビュー/);
});

test('6組の総括記事も、掲載見送りのトピックを漏らさない', () => {
  const teams = ['cover', 'apology', 'publicity', 'failed', null, 'cover'].map((mode, i) => team(mode, `G${i + 1}`));
  const result = editorialDraft({ kind: 'scandal_publish' }, { teams }, { headline: '結果', body: '旧形式の元稿', target: 'all' });
  checkArticle(result);
  assert.ok(!JSON.stringify(result).includes(teams[0].scandal.topic));
  assert.ok(!JSON.stringify(result).includes(teams[5].scandal.topic));
  assert.ok(result.body.includes(teams[1].scandal.topic));
});

test('確定した活動のGB・ファン変動を掲載し、原稿で新しい加点をしない', () => {
  const t = team('apology');
  const result = editorialDraft({ id: 'ad-test', kind: 'purchase', productId: 'specialAd', teamId: t.id }, {
    teams: [t], effects: [{ id: 'ad-test', label: 'スペシャル宣伝', gb: -200, fans: 60000 }],
  }, { headline: '宣伝', body: '元稿', target: 'all' });
  checkArticle(result);
  assert.match(result.body, /-200GB/);
  assert.match(result.body, /\+6万人/);
  assert.deepEqual(result.teamIds, [t.id]);
});

test('コメントの三種に応援と考察を残し、長い文字列でも架空表示は削らない', () => {
  for (const style of ['mixed', 'supportive', 'spicy']) {
    const comments = commentDraft(style, '合同CM', '架空グループ');
    assert.ok(comments.some(c => c.stance === '応援'));
    assert.ok(comments.some(c => c.stance === '考察'));
  }
  const long = editorialDraft({ kind: 'notice' }, { teams: [] }, {
    headline: '長'.repeat(300), body: '本文'.repeat(5000), target: 'all',
  });
  checkArticle(long);
  assert.match(long.body, /実在の報道・人物評価ではありません。$/);
});
