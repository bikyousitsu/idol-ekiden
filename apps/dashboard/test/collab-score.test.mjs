import test from 'node:test';
import assert from 'node:assert/strict';
import {append,calculate,emptyState,publicView} from '../lib/core.mjs';
import {withActionNews} from '../lib/news-workflow.mjs';
const add=(s,a)=>append(s,{id:crypto.randomUUID(),time:'16:00',...a});
const tour=()=>add(emptyState(),{kind:'phase',value:'tour',time:'15:00'});
const team=(s,id)=>calculate(s).teams.find(t=>t.id===id);

test('合同ロケを各組25点で別々に採点し、GBを変えず点数×1万人を加算',()=>{
 let s=add(tour(),{kind:'collab_score',teamId:'G3',score:10,gb:9999,fans:999999});
 assert.equal(team(s,'G3').gb,600);assert.equal(team(s,'G3').fans,100000);assert.equal(team(s,'G4').fans,0);assert(!team(s,'G4').missions.collab);
 s=add(s,{kind:'collab_score',teamId:'G4',score:25});assert.equal(team(s,'G4').fans,250000);assert.equal(team(s,'G4').gb,600);
 assert.equal(publicView(s).teams.find(t=>t.id==='G4').collab.score,25);
 assert.throws(()=>add(s,{kind:'collab_score',teamId:'G3',score:10}),/採点済み/);
});
test('点数0を受け付け、空欄・小数・範囲外・不明なチームを拒否',()=>{
 assert.equal(team(add(tour(),{kind:'collab_score',teamId:'G1',score:0}),'G1').fans,0);
 for(const score of [undefined,'',-1,26,1.5,NaN])assert.throws(()=>add(tour(),{kind:'collab_score',teamId:'G1',score}),/整数/);
 assert.throws(()=>add(tour(),{kind:'collab_score',teamId:'G9',score:10}),/グループ/);
 assert.throws(()=>add(tour(),{kind:'collab_score',teamId:'G1',score:10,time:'17:20'}),/締切/);
});
test('点数訂正は理由付きで置き換え、二重加算せず別チームの訂正を拒否',()=>{
 let s=add(tour(),{kind:'collab_score',teamId:'G1',score:20});
 const correct={kind:'replace',targetId:s.actions.at(-1).id,replacement:{kind:'collab_score',teamId:'G1',score:12},reason:'原票を確認して点数訂正'};
 assert.throws(()=>add(s,{...correct,reason:''}),/理由/);
 assert.throws(()=>add(s,{...correct,replacement:{kind:'collab_score',teamId:'G2',score:12}}),/同じ種類/);
 s=add(s,correct);assert.equal(team(s,'G1').fans,120000);assert.equal(team(s,'G1').gb,600);assert.equal(team(s,'G1').collab.score,12);
 s=add(s,{...correct,targetId:s.actions.at(-1).id,replacement:{kind:'collab_score',teamId:'G1',score:15}});assert.equal(team(s,'G1').fans,150000);
 s=add(s,{kind:'void',targetId:s.actions.at(-1).id,reason:'今回は実施していなかった'});assert.equal(team(s,'G1').fans,0);assert(!team(s,'G1').missions.collab);
});
test('旧合同ロケ報酬を保持し、新方式の二重登録と固定報酬の新規受付を拒否',()=>{
 const old=tour();old.actions.push({id:'historical-collab',kind:'collab',teamIds:['G1','G2'],time:'16:00'});
 assert.equal(team(old,'G1').gb,900);assert.equal(team(old,'G2').fans,30000);
 assert.throws(()=>add(old,{kind:'collab_score',teamId:'G1',score:10}),/旧報酬/);
 assert.throws(()=>add(tour(),{kind:'collab',teamIds:['G1','G2']}),/受付終了/);
 for(const missionId of ['sponsor','fanclub','work1'])assert.throws(()=>add(tour(),{kind:'mission',teamId:'G1',missionId}),/受付終了/);
 const fresh=add(tour(),{kind:'settle',time:'17:00',incomePolicy:'legacy'});assert(fresh.actions.at(-1).incomePolicy==='disabled-v2');assert(calculate(fresh).teams.every(t=>t.gb===600));
});
test('個別採点の記事下書きは得点と獲得ファンを示し、相方へ同じ点数を付けない',()=>{
 const s=withActionNews(add(tour(),{kind:'collab_score',teamId:'G3',score:18,proof:'相方の紹介と見せ場を確認'}));const n=s.news.at(-1);
 assert(n.headline.includes('グループ3'));assert(n.headline.includes('18点'));assert(n.summary.includes('18万人'));assert(n.body.includes('GBの入金はありません'));assert.deepEqual(n.teamIds,['G3']);assert.equal(n.published,false);assert(n.comments.length>0);assert.equal(team(s,'G4').fans,0);
});
