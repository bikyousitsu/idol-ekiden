import test from 'node:test';import assert from 'node:assert/strict';
import {commentCatalog,commentTopic,catalogComments} from '../lib/comment-catalog.mjs';
test('108種の原案は記事テーマに合い、本文と表示名の上限・各スタイルを満たす',()=>{
 assert.equal(Object.values(commentCatalog).flatMap(p=>Object.values(p).flat()).length,108);
 const cases=[['出発・全国ツアー開幕','departure'],['お笑いステージを完了','tour'],['労働バトルのリレーで勝利','relay'],['合同ロケで18点','collab'],['衣装を購入','wardrobe'],['宣伝を完了','ad'],['SNS投稿を評価','sns'],['神対応成功','goodwill'],['謝罪動画・疑惑への対応','scandal'],['武道館で受賞','final'],['運営より','general'],['掲載見送り','cover']];
 for(const [headline,topic] of cases){assert.equal(commentTopic(headline),topic);for(const style of ['mixed','supportive','spicy']){
  const cs=catalogComments(style,headline,'長'.repeat(80));assert(cs.length>=4&&cs.length<=5);assert.equal(new Set(cs.map(c=>c.id)).size,cs.length);assert(cs.some(c=>c.stance==='応援'));assert(cs.some(c=>c.stance==='考察'));assert.equal(cs.some(c=>c.stance==='辛口'),style!=='supportive');
  for(const c of cs){assert(c.text.length<=250&&c.author.length<=30);assert(Number.isInteger(c.agree)&&Number.isInteger(c.disagree));assert(!c.text.includes('{{name}}'));}
 }}
});
test('同じ記事は再計算しても安定し、別案の指定で複数の本文と表示名が得られる',()=>{
 const original=catalogComments('mixed','合同ロケで18点','テスト組');assert.deepEqual(original,catalogComments('mixed','合同ロケで18点','テスト組'));
 const sets=Array.from({length:40},(_,i)=>catalogComments('mixed','合同ロケで18点','テスト組',String(i)));
 assert(new Set(sets.map(cs=>cs.map(c=>c.text).join('|'))).size>=6);assert(new Set(sets.flatMap(cs=>cs.map(c=>c.text))).size>=8);
});
test('掲載見送りのコメントは見出しに含む秘密や疑惑を漏らさない',()=>{
 const cs=catalogComments('mixed','掲載見送り：秘密の目印、口パク疑惑','名前の目印');assert(!JSON.stringify(cs).includes('秘密の目印'));assert(!JSON.stringify(cs).includes('口パク'));assert(!JSON.stringify(cs).includes('名前の目印'));
});
