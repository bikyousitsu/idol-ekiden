import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,calculate,append,publicView} from '../lib/core.mjs';
import {prepareScandalNews,withActionNews} from '../lib/news-workflow.mjs';
import {updateTeams} from '../lib/team-settings.mjs';
import {teamItinerary} from '../lib/team-itinerary.mjs';
import {staffTimetable} from '../lib/staff-timetable.mjs';
import {managerMessages} from '../lib/manager-messages.mjs';
import {reviseArticle} from '../lib/articles.mjs';

const renamed=state=>state.teams.map(t=>({...t,name:t.id==='G1'?'ネオンスター':t.id==='G2'?'月光組':t.name}));
test('名前の保存で順位・予定・スタッフ受付・LINE原稿・既存下書きが連動し、残高は保持する',()=>{
 let state=prepareScandalNews(append(emptyState(),{id:'start',kind:'phase',value:'tour',time:'15:30'}));
 state=withActionNews(append(state,{id:'joint',kind:'collab',teamIds:['G1','G2'],time:'16:00'}));
 const old=calculate(state),next=updateTeams(state,renamed(state),{now:'2026-10-12T03:00:00Z',editor:'森本'}),c=calculate(next);
 assert.equal(c.teams.find(t=>t.id==='G1').name,'ネオンスター');
 assert.equal(publicView(next).teams.find(t=>t.id==='G2').name,'月光組');
 assert.deepEqual(c.teams.map(t=>[t.id,t.gb,t.totalFans,t.rank]),old.teams.map(t=>[t.id,t.gb,t.totalFans,t.rank]));
 assert.equal(teamItinerary('G2',c.schedule,next.teams)[2].partners[0],'ネオンスター');
 const staffText=JSON.stringify(staffTimetable(c.schedule,next.teams));
 assert.match(staffText,/ネオンスターの衣装/);assert.match(staffText,/ネオンスター・月光組の合同ロケ/);
 assert.match(JSON.stringify(managerMessages(c.teams.find(t=>t.id==='G1'),c.schedule)),/ネオンスター/);
 const scandal=next.news.find(n=>n.templateKey==='scandal-G1');
 assert.match(scandal.headline,/ネオンスター/);assert.equal(scandal.revision,1);
 assert.match(next.news.find(n=>n.sourceId==='joint').body,/ネオンスターと月光組/);
 assert.ok(!JSON.stringify(next.news.map(({headline,summary,body,comments})=>({headline,summary,body,comments}))).includes('グループ1、'));
 assert.deepEqual(state.actions,next.actions);assert.equal(state.teams[0].name,'グループ1');
});
test('手動で編集した下書きの文言とコメントを残し、名前だけ更新して旧版と編集衝突を保持する',()=>{
 const state=prepareScandalNews(emptyState()),n=state.news[0];
 n.headline='グループ1、独自の振付に挑戦';n.summary='グループ1が工夫した。';n.body='グループ1を現地取材。追記した文章は残す。';n.reviewedBy='担当者';
 n.comments=[{id:'c',author:'記者',text:'グループ1に期待。',stance:'応援',agree:4,disagree:0}];
 const next=updateTeams(state,renamed(state),{now:'2026-10-12T03:00:00Z',editor:'森本'}),draft=next.news[0];
 assert.equal(draft.body,'ネオンスターを現地取材。追記した文章は残す。');assert.equal(draft.comments[0].text,'ネオンスターに期待。');
 assert.equal(draft.comments[0].author,'記者');assert.equal(draft.reviewedBy,'担当者');
 assert.equal(draft.history.at(-1).body,n.body);assert.equal(draft.revision,1);
 assert.throws(()=>reviseArticle(draft,{...draft,revision:0,status:'draft'},'now','担当'),/ARTICLE_CONFLICT/);
});
test('公開・チーム共有済みの記事は変更せず、色だけの保存は下書きを改版しない',()=>{
 const state=prepareScandalNews(emptyState());state.news[0].published=true;state.news[1].sharedAt='yesterday';
 const next=updateTeams(state,renamed(state));assert.strictEqual(next.news[0],state.news[0]);assert.strictEqual(next.news[1],state.news[1]);
 const colors=state.teams.map(t=>({...t,color:'#111111'})),colorNext=updateTeams(state,colors);
 assert.strictEqual(colorNext.news,state.news);assert.equal(colorNext.teams[0].color,'#111111');
});
test('名前交換・名前の前方一致・正規表現記号を一度の置換で扱う',()=>{
 const state=prepareScandalNews(emptyState());
 state.teams[0].name='星';state.teams[1].name='星組';state.teams[2].name='A+B(仮)';
 state.news[0]={...state.news[0],headline:'星と星組とA+B(仮)',summary:'星と星組',body:'星／星組／A+B(仮)',comments:[]};
 const names=state.teams.map(t=>({...t,name:t.id==='G1'?'星組':t.id==='G2'?'星':t.id==='G3'?'正式組':t.name}));
 assert.equal(updateTeams(state,names).news[0].body,'星組／星／正式組');
});
test('ID変更・重複名・古い設定・長すぎる下書きへの変更を拒否し、原本は変えない',()=>{
 const state=prepareScandalNews(emptyState()),before=JSON.stringify(state),input=renamed(state);
 assert.throws(()=>updateTeams(state,input.map((t,i)=>i===0?{...t,id:'G7'}:t)),/不正/);
 assert.throws(()=>updateTeams(state,input.map((t,i)=>i===0?{...t,name:input[1].name}:t)),/重複/);
 assert.throws(()=>updateTeams(state,input,{baseTeams:input}),/別の担当者/);
 state.news[0].headline='グループ1'+'字'.repeat(95);
 assert.throws(()=>updateTeams(state,input.map((t,i)=>i===0?{...t,name:'長'.repeat(30)}:t)),/文字数/);
 state.news[0].headline=JSON.parse(before).news[0].headline;assert.equal(JSON.stringify(state),before);
});
