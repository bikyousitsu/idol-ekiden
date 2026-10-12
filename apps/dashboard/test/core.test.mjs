import test from 'node:test';import assert from 'node:assert/strict';import {append,calculate,emptyState,publicView,rules} from '../lib/core.mjs';
function touring(){return append({...emptyState(),legacyAllScandals:true},{id:'start',kind:'phase',value:'tour',time:'15:00'});}function apply(s,a){return append(s,{id:crypto.randomUUID(),time:'16:00',...a});}const team=(s,id='G1')=>calculate(s).teams.find(t=>t.id===id);
test('全6組は600GBで始まり、残高を公開する',()=>{const s=publicView(emptyState());assert.equal(s.teams.length,6);assert(s.teams.every(t=>t.gb===600));});
test('会場の四項目を換算、二重受取と範囲外を拒否',()=>{let s=touring();s=apply(s,{kind:'stage',teamId:'G1',venue:'A',scores:[5,5,5,10]});assert.equal(team(s).fans,250000);assert.throws(()=>apply(s,{kind:'stage',teamId:'G1',venue:'A',scores:[1,1,1,1]}),/採点済み/);assert.throws(()=>apply(touring(),{kind:'stage',teamId:'G1',venue:'A',scores:[6,5,5,10]}),/整数/);});
test('商品上限、資金不足、成功証拠を検証',()=>{let s=touring();for(let i=0;i<5;i++)s=apply(s,{kind:'purchase',teamId:'G1',productId:'ad'});assert.equal(team(s).fans,100000);assert.throws(()=>apply(s,{kind:'purchase',teamId:'G1',productId:'ad'}),/購入上限/);assert.throws(()=>apply(s,{kind:'purchase',teamId:'G1',productId:'lesson'}),/残高/);assert.throws(()=>apply(touring(),{kind:'purchase',teamId:'G1',productId:'specialAd'}),/受付終了/);});
test('同じ操作IDでの再送は二重入金しない',()=>{const a={id:'retry',kind:'relay_battle',teamIds:['G1','G2'],winnerId:'G1',proof:'ゴールを確認済み',time:'16:00'},s=append(touring(),a);assert.throws(()=>append(s,a),/登録済み/);assert.equal(team(s).gb,1100);});
test('旧合同ロケの固定報酬記録を保持し、新規の固定報酬を拒否',()=>{let s=touring();s.actions.push({id:'old-collab',kind:'collab',teamIds:['G1','G2'],time:'16:00'});assert.equal(team(s,'G1').gb,900);assert.equal(team(s,'G2').fans,30000);assert.throws(()=>apply(s,{kind:'collab',teamIds:['G2','G3']}),/受付終了/);assert.equal(team(s,'G3').gb,600);});
test('旧SNS記録は15分間隔・最大4万人の結果を保持する',()=>{let s=touring();for(let i=0;i<5;i++)s.actions.push({id:crypto.randomUUID(),kind:'sns',teamId:'G1',postType:'idol',time:['15:30','15:45','16:00','16:15','16:30'][i],proof:'決めポーズ写真'});assert.equal(team(s).fans,40000);s.actions.push({id:'invalid-old',kind:'sns',teamId:'G1',postType:'idol',time:'16:35',proof:'写真'});assert.throws(()=>calculate(s),/15分/);});
test('旧古参レポート記録は会場採点後・会場1回の制約を再現する',()=>{const report={id:'old-report',kind:'sns',teamId:'G1',postType:'fan',venue:'B',time:'16:00',proof:'ライブ報告'};let s=touring();assert.throws(()=>calculate({...s,actions:[...s.actions,report]}),/採点後/);s=apply(s,{kind:'stage',teamId:'G1',venue:'B',scores:[3,3,3,5]});s.actions.push(report);assert.equal(team(s).fans,140000+10000);s.actions.push({...report,id:'duplicate'});assert.throws(()=>calculate(s),/受理済み/);});
test('全組1件のスキャンダル、解決ファンは公開時に反映',()=>{let s=touring();for(let i=1;i<=6;i++)s=apply(s,{kind:'scandal_open',teamId:'G'+i});s=apply(s,{kind:'scandal_resolve',teamId:'G1',resolution:'apology',proof:'指定語3つの会見'});assert.equal(team(s).fans,0);assert.equal(publicView(s).teams.find(t=>t.id==='G1').scandal,null);assert.throws(()=>apply(s,{kind:'scandal_open',teamId:'G1'}),/1回/);s=apply(s,{kind:'scandal_publish',time:'16:50'});assert.equal(team(s).fans,20000);assert.equal(team(s,'G2').fans,0);});
test('もみ消しは200GBだけ一度減算する',()=>{let s=apply(touring(),{kind:'scandal_open',teamId:'G1'});s=apply(s,{kind:'scandal_resolve',teamId:'G1',resolution:'cover'});assert.equal(team(s).gb,400);assert.throws(()=>apply(s,{kind:'scandal_resolve',teamId:'G1',resolution:'cover'}),/未対応/);});
test('定期入金は1回、FC上限300GB',()=>{let s=touring();for(const m of ['sponsor','fanclub'])s.actions.push({id:'old-'+m,kind:'mission',teamId:'G1',missionId:m,time:'16:00'});s=apply(s,{kind:'adjust',teamId:'G1',gb:0,fans:990000,reason:'試験用のファン数'});s.actions.push({id:'old-settle',kind:'settle',time:'17:00'});assert.equal(team(s).income,500);assert.throws(()=>apply(s,{kind:'settle',time:'17:00'}),/清算済み/);});
test('取引17:20締切・スキャンダル16:45締切・時刻不正を拒否',()=>{assert.throws(()=>apply(touring(),{kind:'mission',teamId:'G1',missionId:'relay',time:'17:20'}),/締切/);let s=apply(touring(),{kind:'scandal_open',teamId:'G1'});assert.throws(()=>apply(s,{kind:'scandal_resolve',teamId:'G1',resolution:'cover',time:'16:46'}),/締切/);assert.throws(()=>apply(s,{kind:'clock',value:'29:00'}),/不正/);});
test('取消履歴を残し、収入取消によるマイナスを拒否',()=>{let s=touring();s.actions.push({id:'income',kind:'mission',teamId:'G1',missionId:'relay',time:'16:00'});for(const p of ['lesson','lesson']){try{s=apply(s,{kind:'purchase',teamId:'G1',productId:p});}catch{}}for(let i=0;i<5;i++)s=apply(s,{kind:'purchase',teamId:'G1',productId:'ad'});assert.equal(team(s).gb,0);assert.throws(()=>apply(s,{kind:'void',targetId:'income',reason:'誤入力のため取消'}),/マイナス|残高/);});
test('採点訂正は同じチーム・会場だけを置き換える',()=>{let s=append(touring(),{id:'score',kind:'stage',teamId:'G1',venue:'A',scores:[1,1,1,1],time:'16:00'});s=apply(s,{kind:'replace',targetId:'score',replacement:{kind:'stage',teamId:'G1',venue:'A',scores:[5,5,5,10]},reason:'紙原票との照合訂正'});assert.equal(team(s).fans,250000);assert.equal(s.actions.length,3);assert.throws(()=>apply(s,{kind:'replace',targetId:s.actions.at(-1).id,replacement:{kind:'stage',teamId:'G2',venue:'A',scores:[1,1,1,1]},reason:'チーム変更'}),/同じ種類/);});
test('武道館は3人の平均合計を一度丸め、公開前に隠す',()=>{let s=touring();for(let i=1;i<=6;i++)s=apply(s,{kind:'scandal_open',teamId:'G'+i});s=apply(s,{kind:'scandal_publish',time:'16:50'});s=apply(s,{kind:'settle',time:'17:00'});s=apply(s,{kind:'phase',value:'closed',time:'17:20'});s=apply(s,{kind:'phase',value:'live',time:'17:30'});const j=[[10,15,10,10,15],[10,15,10,10,15],[9,15,10,10,15]];s=apply(s,{kind:'final',teamId:'G1',judges:j,time:'17:31'});assert.equal(team(s).final.total,59.7);assert.equal(publicView(s).teams.find(t=>t.id==='G1').final,null);assert.equal(publicView(s).teams.find(t=>t.id==='G1').totalFans,0);assert.throws(()=>apply(s,{kind:'phase',value:'announced',time:'17:54'}),/全6組/);for(let i=2;i<=6;i++)s=apply(s,{kind:'final',teamId:'G'+i,judges:[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],time:'17:50'});s=apply(s,{kind:'phase',value:'announced',time:'17:54'});assert.equal(team(s).totalFans,597000);assert.equal(team(s).rank,1);});
test('正本rulesのコピーが一致する',async()=>{const fs=await import('node:fs/promises');const canonical=JSON.parse(await fs.readFile(new URL('../../../data/rules.json',import.meta.url),'utf8'));assert.deepEqual(rules,canonical);});

test('終了したスペシャル宣伝は新規購入できず、旧台帳の残高・ファンは維持する',()=>{
 const old=touring();old.actions.push({id:'old-special',kind:'purchase',teamId:'G1',productId:'specialAd',proof:'旧原稿を確認済み',time:'16:00'});
 assert.equal(team(old).gb,400);assert.equal(team(old).fans,60000);
 assert(!rules.products.some(p=>p.id==='specialAd'));
 assert.throws(()=>apply(touring(),{kind:'purchase',teamId:'G1',productId:'specialAd',proof:'新原稿'}),/受付終了/);
 const next=apply(old,{kind:'purchase',teamId:'G1',productId:'ad'});
 assert.equal(team(next).gb,300);assert.equal(team(next).fans,80000);
});

test('リレーは勝者のみ500GB、敗者0GBで両組の受取を一度に記録',()=>{
 const a={kind:'relay_battle',teamIds:['G1','G2'],winnerId:'G2',proof:'同じ周回数でゴールを確認'};
 const s=apply(touring(),{...a,rewardGb:9999});assert.equal(team(s,'G1').gb,600);assert.equal(team(s,'G2').gb,1100);assert.equal(team(s,'G2').fans,0);
 assert.equal(s.actions.at(-1).rewardGb,500);assert(team(s,'G1').missions.relay&&team(s,'G2').missions.relay);
 assert.throws(()=>apply(s,{...a,winnerId:'G1'}),/受取済み/);
 assert.throws(()=>apply(touring(),{...a,winnerId:'G3'}),/勝者/);
 assert.throws(()=>apply(touring(),{...a,teamIds:['G1','G3']}),/対戦組/);
 assert.throws(()=>apply(touring(),{...a,teamIds:['G1','G1']}),/異なる2組/);
 assert.throws(()=>apply(touring(),{...a,proof:''}),/確認内容/);
 assert.throws(()=>apply(touring(),{kind:'mission',teamId:'G1',missionId:'relay'}),/勝者/);
 const reset=apply(s,{kind:'void',targetId:s.actions.at(-1).id,reason:'勝者を誤記したため'});assert.equal(team(reset,'G2').gb,600);assert(!team(reset).missions.relay);
 const corrected=apply(reset,{...a,winnerId:'G1'});assert.equal(team(corrected).gb,1100);assert.equal(team(corrected,'G2').gb,600);
});
test('旧リレーと旧オタ芸の各200GBを保持し、新報酬との二重受取を拒否',()=>{
 for(const missionId of ['relay','otagei']){const old=touring();old.actions.push({id:'old-work',kind:'mission',teamId:'G1',missionId,time:'16:00'});assert.equal(team(old).gb,800);assert.throws(()=>apply(old,{kind:'relay_battle',teamIds:['G1','G2'],winnerId:'G1',proof:'到達を確認済み'}),/受取済み/);}
});
