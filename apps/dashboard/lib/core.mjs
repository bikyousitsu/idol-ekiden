import rules from './rules.json' with { type: 'json' };
import { defaultSchedule,validateSchedule } from './schedule.mjs';
import { idolScandals,validateTopics } from './scandal-plan.mjs';
import { liveTopicCandidates,selectionOrder } from './live-topics.mjs';
import { SCANDAL_WORKFLOW,APOLOGY_MIN,APOLOGY_MAX } from './scandal-flow.mjs';
import { selectAttentionTeams } from './attention-event.mjs';
export { rules };
export const PHASES = ['preparing','tour','closed','live','announced'];
export function minutes(t) { if(!/^\d{2}:\d{2}$/.test(t)) throw Error('時刻はHH:mmで入力してください'); const [h,m]=t.split(':').map(Number);if(h>23||m>59)throw Error('時刻が不正です');return h*60+m; }
function assert(ok,msg){if(!ok)throw Error(msg);}
function int(n,min,max){assert(Number.isInteger(n)&&n>=min&&n<=max,`数値は${min}〜${max}の整数です`);return n;}
function scores(arr,maxima){assert(Array.isArray(arr)&&arr.length===maxima.length,'採点項目数が違います');return arr.map((x,i)=>int(x,0,maxima[i]));}
export function emptyState(){return {phase:'preparing',clock:'15:00',teams:rules.teams.map(t=>({...t})),actions:[],news:[]};}
export function demonstration(){const s=emptyState();s.actions.push({id:'seed-phase',kind:'phase',value:'tour',time:'15:00'});for(let i=0;i<6;i++)s.actions.push({id:`seed-stage-${i}`,kind:'stage',teamId:`G${i+1}`,venue:'A',scores:[3+(i%2),3,4,5+(i%3)],time:'15:35'});s.actions.push({id:'seed-work',kind:'mission',teamId:'G2',missionId:'work1',time:'15:40'},{id:'seed-ad',kind:'purchase',teamId:'G1',productId:'ad',time:'15:45'},{id:'seed-clock',kind:'clock',value:'16:00',time:'16:00'});s.news.push({id:'welcome',headline:'恵迪寮発、6組のアイドルがツアーへ',body:'これは操作確認用の練習データです。実際の参加結果ではありません。全チームのGBとファン数を一覧で確認できます。',published:true,time:'15:00'});return s;}
export function calculate(state){
 const voided=new Set(state.actions.filter(a=>a.kind==='void'||a.kind==='replace').map(a=>a.targetId));
 const teams=Object.fromEntries(state.teams.map(t=>[t.id,{...t,gb:t.initialGb,fans:0,stages:{},purchases:{},missions:{},collab:null,sns:[],scandal:null,final:null}]));
 let phase='preparing',clock='15:00',settled=false,scandalPublished=false,schedule=validateSchedule(state.schedule||defaultSchedule()),scandalTopics=[...idolScandals],attentionEvent=null,goodwill=null,liveTopics=null;const legacyAllScandals=!!state.legacyAllScandals||state.actions.some(a=>a.kind==='scandal_open'&&!a.targeted);const effects=[];
 for(const original of state.actions){if(original.kind==='void'||voided.has(original.id))continue;const a=original.kind==='replace'?{...original.replacement,id:original.id,time:original.time,reason:original.reason}:original;const t=teams[a.teamId];let gb=0,fans=0,label=a.kind;
  if(['stage','collab_score','mission','purchase','sns','scandal_open','scandal_contact','scandal_resolve','final','adjust'].includes(a.kind))assert(t,'グループが不正です');
  if(a.kind==='phase'){assert(PHASES.includes(a.value),'進行段階が不正です');phase=a.value;}
  else if(a.kind==='clock'){minutes(a.value);clock=a.value;}
  else if(a.kind==='schedule'){schedule=validateSchedule(a.value);label='全体予定の変更';}
  else if(a.kind==='scandal_plan'){scandalTopics=validateTopics(a.value);label='スキャンダルのお題設定';}
  else if(a.kind==='attention_event'){assert(!attentionEvent,'途中順位イベントは実施済みです');assert(teams[a.leaderId]&&teams[a.lowestId]&&a.leaderId!==a.lowestId,'異なる2組が必要です');const leader=teams[a.leaderId];assert(!leader.scandal,'旧方式の予告があるため再発生できません');leader.scandal={topic:a.topic,resolution:null,workflow:a.scandalWorkflow||'targeted-v1'};attentionEvent={...a};label='途中順位の対象を固定';}
  else if(a.kind==='live_topics_start'){assert(!liveTopics,'お題の選択順は確定済みです');assert(Array.isArray(a.order)&&a.order.length===6&&new Set(a.order).size===6&&a.order.every(id=>teams[id]),'6組の選択順が必要です');assert(Array.isArray(a.catalog)&&a.catalog.length>=3&&new Set(a.catalog.map(t=>t.id)).size===a.catalog.length&&a.catalog.every(t=>typeof t.id==='string'&&typeof t.label==='string'&&t.label.length>0&&t.label.length<=60&&typeof t.brief==='string'),'お題一覧が不正です');liveTopics={order:a.order,catalog:a.catalog,fanSnapshot:a.fanSnapshot,choices:[],turn:null};label='ファン順位で演目選択順を固定';}
  else if(a.kind==='live_choice_open'){assert(liveTopics&&!liveTopics.turn&&liveTopics.choices.length<6,'次のお題選択を開始できません');assert(a.teamId===liveTopics.order[liveTopics.choices.length],'順位順の対象を確認してください');assert(Number.isFinite(Date.parse(a.startedAt)),'開始時刻が不正です');liveTopics.turn={teamId:a.teamId,startedAt:a.startedAt};label='チームLINE送信済み・1分の目安を開始';}
  else if(a.kind==='live_choice'){assert(liveTopics?.turn?.teamId===a.teamId,'今のお題選択の対象を確認してください');const topic=liveTopics.catalog.find(t=>t.id===a.topicId);assert(topic,'お題が不正です');assert(liveTopics.choices.filter(c=>c.topicId===a.topicId).length<2,'同じお題は2グループまでです');liveTopics.choices.push({teamId:a.teamId,topicId:topic.id,label:topic.label,time:a.time});liveTopics.turn=null;label='武道館のお題を確定';}
  else if(a.kind==='live_choice_correct'){const choice=liveTopics?.choices.find(c=>c.teamId===a.teamId),topic=liveTopics?.catalog.find(t=>t.id===a.topicId);assert(choice&&topic,'確定済みの組とお題を選んでください');assert(a.reason?.trim().length>=4,'訂正理由を4文字以上で入力してください');assert(liveTopics.choices.filter(c=>c.teamId!==a.teamId&&c.topicId===a.topicId).length<2,'同じお題は2グループまでです');Object.assign(choice,{topicId:topic.id,label:topic.label,correctedAt:a.time});label='武道館のお題を訂正';}
  else if(a.kind==='goodwill'){assert(attentionEvent&&a.teamId===attentionEvent.lowestId&&!goodwill,'対象の神対応イベントは受付済み、または対象が違います');assert(typeof a.success==='boolean','成立結果を選んでください');fans=a.success?50000:0;goodwill={teamId:a.teamId,success:a.success,fans,time:a.time};label=a.success?'神対応成功':'神対応・未成立';}
  else if(a.kind==='stage'){const v=rules.venues.find(v=>v.id===a.venue);assert(v,'会場が不正です');assert(!t.stages[v.id],'この会場は採点済みです');const sc=scores(a.scores,v.maxima);t.stages[v.id]=sc;fans=sc.reduce((n,x)=>n+x,0)*10000;label=v.theme+'ステージ';}
  else if(a.kind==='relay_battle'){
   assert(!a.teamId&&Array.isArray(a.teamIds)&&a.teamIds.length===2&&a.teamIds[0]!==a.teamIds[1]&&a.teamIds.every(id=>teams[id]),'異なる2組を選んでください');
   assert(rules.laborVisits.some(v=>v.pointId==='L1'&&v.teamIds.every(id=>a.teamIds.includes(id))),'労働バトルの予定にある対戦組を選んでください');
   assert(a.teamIds.includes(a.winnerId),'勝者は対戦する2組から選んでください');
   assert(a.proof?.trim().length>=4,'勝敗の確認内容を4文字以上で入力してください');
   for(const id of a.teamIds)assert(!teams[id].missions.relay&&!teams[id].missions.otagei,'この労働は受取済みです');
   const reward=int(a.rewardGb,0,10000);
   for(const id of a.teamIds)teams[id].missions.relay=true;
   teams[a.winnerId].gb+=reward;gb=reward;label=`労働バトル・${teams[a.winnerId].name}が勝利`;
  }
  else if(a.kind==='mission'){const m=rules.missions.find(m=>m.id===a.missionId);assert(m,'ミッションが不正です');assert(!t.missions[m.id]&&!(m.id==='relay'&&t.missions.otagei),'この労働は受取済みです');t.missions[m.id]=true;gb=m.gb;fans=m.fans;label=m.name;}
  else if(a.kind==='collab_score'){
   assert(!t.missions.collab,'合同ロケはこの組で採点済み、または旧報酬を受取済みです');
   const score=int(a.score,0,rules.collabScoring.maxScore);
   fans=score*rules.collabScoring.fanPerPoint;t.missions.collab=true;t.collab={score,fans,time:a.time};label='合同ロケ採点';
  }
  else if(a.kind==='collab'){assert(Array.isArray(a.teamIds)&&a.teamIds.length===2&&a.teamIds[0]!==a.teamIds[1],'異なる2組を選んでください');for(const id of a.teamIds){const c=teams[id];assert(c&&!c.missions.collab,'合同ロケは各組1回です');c.missions.collab=true;c.gb+=300;c.fans+=30000;}label='合同ロケ';}
  else if(a.kind==='purchase'){const p=rules.products.find(p=>p.id===a.productId)||(rules.retiredProducts||[]).find(p=>p.id===a.productId);assert(p,'商品が不正です');assert((t.purchases[p.id]||0)<p.max,'購入上限です');assert(!p.proofRequired||a.proof?.trim(),'成功の確認内容が必要です');assert(t.gb>=p.price,'GB残高が足りません');t.purchases[p.id]=(t.purchases[p.id]||0)+1;gb=-p.price;fans=p.fans;label=p.name;}
  else if(a.kind==='sns'){
   assert(['idol','fan'].includes(a.postType),'投稿の種類を選んでください');assert(a.proof?.trim(),'投稿内容・確認根拠が必要です');
   if(a.snsPolicy==='manual-v2'){
    assert(a.managerApproved===true,'森本の投稿許可と全体LINEへの掲載を確認してください');
    assert(Number.isSafeInteger(a.gbDelta)&&Number.isSafeInteger(a.fanDelta),'GB・ファン数は整数で入力してください');
    gb=Math.max(-t.gb,a.gbDelta);fans=Math.max(-t.fans,a.fanDelta);label='SNS投稿の本部評価';
   }else{
    // Replay historical fixed rewards without changing already recorded balances.
    const historical=t.sns.filter(p=>p.snsPolicy!=='manual-v2');
    if(a.postType==='idol'){const prev=historical.filter(p=>p.postType==='idol').at(-1);assert(!prev||minutes(a.time)-minutes(prev.time)>=15,'アイドル投稿は15分に1回です');}
    else{assert(rules.venues.some(v=>v.id===a.venue),'ライブ報告の会場を選んでください');assert(t.stages[a.venue],'会場の採点後にライブ報告できます');assert(!historical.some(p=>p.postType==='fan'&&p.venue===a.venue),'この会場のライブ報告は受理済みです');}
    fans=historical.length<4?10000:0;label='SNS掲載（旧方式）';
   }
   t.sns.push({...a});
  }
  else if(a.kind==='scandal_open'){assert(!t.scandal,'スキャンダルは各組1回です');t.scandal={topic:a.topic||rules.scandal.topics[Number(t.id.slice(1))-1],resolution:null};label='掲載予告';}
  else if(a.kind==='scandal_contact'){assert(t.scandal?.workflow===SCANDAL_WORKFLOW&&!t.scandal.contacted&&!t.scandal.resolution&&!t.scandal.published,'未取材の対象首位を選んでください');assert(typeof a.memberName==='string'&&a.memberName.trim().length>0&&a.memberName.trim().length<=30,'対象アイドルの呼び名を30字以内で入力してください');assert(a.rumorPosted===true&&a.interviewDone===true,'全体LINEの書き込みと突撃取材を確認してください');Object.assign(t.scandal,{memberName:a.memberName.trim(),contacted:true,contactTime:a.time});label='架空投稿・突撃取材の確認';}
  else if(a.kind==='scandal_resolve'){assert(t.scandal&&!t.scandal.resolution,'未対応の予告が必要です');const modern=t.scandal.workflow===SCANDAL_WORKFLOW;assert((modern?['cover','apology']:['cover','apology','publicity','failed']).includes(a.resolution),'対応は口止め料か謝罪動画を選んでください');if(modern){assert(t.scandal.contacted,'全体LINEの書き込みと突撃取材を先に確認してください');if(a.resolution==='apology'){assert(a.videoShared===true,'謝罪動画の全体LINE投稿を確認してください');assert(a.proof?.trim().length>=4,'動画の完成度・増減理由を4文字以上で入力してください');t.scandal.requestedDelta=int(a.fanDelta,APOLOGY_MIN,APOLOGY_MAX);t.scandal.videoShared=true;t.scandal.evaluation=a.proof.trim();}}assert(a.resolution==='cover'||a.proof?.trim(),'確認内容が必要です');if(a.resolution==='cover'){assert(t.gb>=200,'口止め料200GBが足りません');gb=-200;}t.scandal.resolution=a.resolution;label=modern?'口止め・謝罪動画の受付':'スキャンダル対応';}
  else if(a.kind==='scandal_publish'){assert(!scandalPublished,'結果は公開済みです');assert(legacyAllScandals?Object.values(teams).every(t=>t.scandal):!!attentionEvent,'途中順位イベントで首位の予告を発生させてください（旧方式は全6組の予告が必要です）');for(const c of Object.values(teams).filter(t=>t.scandal)){const mode=c.scandal.resolution||'ignored',modern=c.scandal.workflow===SCANDAL_WORKFLOW,delta=mode==='cover'?0:mode==='apology'?(modern?int(c.scandal.requestedDelta,APOLOGY_MIN,APOLOGY_MAX):20000):mode==='publicity'?30000:-30000;const previous=c.fans;c.fans=Math.max(0,c.fans+delta);c.scandal.published=true;c.scandal.result=modern?c.fans-previous:delta;}scandalPublished=true;label=attentionEvent?.scandalWorkflow===SCANDAL_WORKFLOW?'スキャンダル結果確定':'スキャンダル結果公開';}
  else if(a.kind==='settle'){assert(!settled,'17時の定期収入は清算済みです');for(const c of Object.values(teams)){let x=0;if(a.incomePolicy!=='disabled-v2'){if(c.missions.sponsor)x+=rules.income.sponsorGb;if(c.missions.fanclub)x+=Math.min(300,Math.floor(c.fans/100000)*50);}c.gb+=x;c.income=x;}settled=true;label=a.incomePolicy==='disabled-v2'?'ツアー終了の照合':'17時定期収入';}
  else if(a.kind==='final'){assert(!t.final,'武道館は採点済みです');assert(Array.isArray(a.judges)&&a.judges.length===3,'審査員3人の採点が必要です');const all=a.judges.map(j=>scores(j,rules.final.maxima)),avg=rules.final.maxima.map((_,i)=>all.reduce((s,r)=>s+r[i],0)/3),total=Math.round(avg.reduce((s,x)=>s+x,0)*10)/10;t.final={judges:all,averages:avg,total,fans:Math.round(total*10000)};label='武道館採点（公開待ち）';}
  else if(a.kind==='adjust'){assert(a.reason?.trim().length>=4,'訂正の理由を4文字以上で入力してください');gb=int(a.gb,-10000,10000);fans=int(a.fans,-10000000,10000000);label='手動訂正';}
  else throw Error('不明な操作です');
  if(t){t.gb+=gb;t.fans=Math.max(0,t.fans+fans);assert(Number.isSafeInteger(t.gb)&&Number.isSafeInteger(t.fans),'合計が扱える整数の範囲を超えています');assert(t.gb>=0,'訂正すると残高がマイナスになります。関連する購入を先に取り消してください');}
  effects.push({id:a.id,teamId:a.teamId,teamIds:a.teamIds,kind:a.kind,label,gb,fans,time:a.time,reason:a.reason||a.proof||''});
 }
 if(phase==='announced')assert(Object.values(teams).every(t=>t.final),'全6組の武道館採点が必要です');
 const ordered=Object.values(teams).map(t=>({...t,totalFans:t.fans+(phase==='announced'?(t.final?.fans||0):0)})).sort((a,b)=>b.totalFans-a.totalFans||(phase==='announced'?((b.final?.total||0)-(a.final?.total||0)||(b.final?.averages[3]||0)-(a.final?.averages[3]||0)):0)||a.id.localeCompare(b.id));
 let prev=null,rank=0;ordered.forEach((t,i)=>{const key=[t.totalFans,phase==='announced'?t.final?.total:0,phase==='announced'?t.final?.averages[3]:0].join(':');if(key!==prev)rank=i+1;t.rank=rank;prev=key;});
 return {teams:ordered,phase,clock,schedule,attentionEvent,goodwill,liveTopics,legacyAllScandals,scandalTopics:scandalTopics.map((t,i)=>teams['G'+(i+1)].scandal?.topic||t),settled,scandalPublished,effects,voided:[...voided]};
}
export function append(state,input){assert(input&&typeof input==='object','操作を指定してください');assert(!state.actions.some(a=>a.id===input.id),'同じ操作は登録済みです');const current=calculate(state),a={...input,id:input.id||crypto.randomUUID(),time:input.time||current.clock},s=current.schedule;minutes(a.time);
 if(!['phase','clock','void','adjust','final','replace','schedule','scandal_plan','live_choice_open','live_choice','live_choice_correct'].includes(a.kind)){assert(current.phase==='tour','この操作はツアー中に行います');assert(minutes(a.time)<minutes(s.tradeDeadline),`取引は${s.tradeDeadline}で締切です`);}
 if(a.kind==='purchase')assert(rules.products.some(p=>p.id===a.productId),'この商品は受付終了、または対象外です');
 if(a.kind==='purchase'&&a.productId==='costume'&&a.venue){assert(rules.venues.some(v=>v.id===a.venue),'購入会場が不正です');assert(!current.teams.find(t=>t.id===a.teamId)?.stages[a.venue],'その会場の披露は採点済みです。披露前に衣装を購入してください');}
 if(a.kind==='sns')a.snsPolicy='manual-v2';
 if(a.kind==='collab')throw Error('固定報酬は受付終了です。「合同ロケ採点」で1組ずつ入力してください');
 if(a.kind==='settle')a.incomePolicy='disabled-v2';
 if(a.kind==='relay_battle')a.rewardGb=rules.laborRelay.winnerGb;
 if(a.kind==='mission'&&a.missionId==='relay')throw Error('リレーは「労働バトルの勝敗（2組）」で勝者を登録してください');
 if(a.kind==='live_topics_start'){assert(!current.liveTopics,'お題の選択順は確定済みです');assert(current.settled&&current.scandalPublished&&(current.legacyAllScandals||current.goodwill),'スキャンダル・神対応・ツアー終了の照合を先に確定してください');assert(current.teams.every(t=>Object.keys(t.stages).length===4),'全24会場の採点を照合してから順位を固定してください');assert(current.teams.every(t=>t.missions.collab),'全6組の合同ロケ採点を照合してから順位を固定してください');a.order=selectionOrder(current.teams);a.catalog=structuredClone(rules.liveTopics?.catalog||liveTopicCandidates);a.fanSnapshot=current.teams.map(t=>({id:t.id,fans:t.totalFans}));}
 if(['live_choice_open','live_choice','live_choice_correct'].includes(a.kind))assert(current.phase==='tour','お題選択は武道館前のツアー中に行います');
 if(a.kind==='live_choice_open')a.startedAt=new Date().toISOString();
 if(a.kind==='mission')throw Error('労働の報酬は受付終了です。合同ロケ採点か労働バトルの勝敗を選んでください');
 if(a.kind==='schedule')a.value=validateSchedule(a.value);
 if(a.kind==='scandal_plan'){a.value=validateTopics(a.value);for(const t of current.teams)assert(!t.scandal||t.scandal.topic===a.value[Number(t.id.slice(1))-1],'予告済みのチームのお題は変更できません');}
 if(a.kind==='attention_event'){assert(!current.attentionEvent,'途中順位イベントは実施済みです');assert(!current.legacyAllScandals,'旧方式の予告がある台帳です。旧リハーサルはそのまま完了し、新方式は予告前の台帳で試してください');assert(minutes(a.time)>=minutes(s.scandalAnnounce),`途中順位イベントは${s.scandalAnnounce}以降です`);Object.assign(a,selectAttentionTeams(current.teams));a.topic=current.scandalTopics[Number(a.leaderId.slice(1))-1];a.scandalWorkflow=SCANDAL_WORKFLOW;}
 if(a.kind==='goodwill'){assert(current.attentionEvent&&a.teamId===current.attentionEvent.lowestId&&!current.goodwill,'神対応イベントの対象を確認してください');assert(a.proof?.trim(),'応答・紹介・決めポーズの確認内容を入力してください');}
 if(a.kind==='scandal_open')assert(current.legacyAllScandals,'新方式は「途中順位イベント」を一度登録し、首位だけに予告を発生させます');
 if(a.kind==='scandal_open')a.topic=current.scandalTopics[Number(a.teamId?.slice(1))-1];
 if(a.kind==='replace'){const old=state.actions.find(x=>x.id===a.targetId),oldKind=old?.kind==='replace'?old.replacement.kind:old?.kind;assert(old&&!current.voided.includes(old.id)&&['stage','final','collab_score'].includes(oldKind),'訂正する有効な採点を選んでください');assert(a.reason?.trim().length>=4,'訂正理由を4文字以上で入力してください');assert(a.replacement?.kind===oldKind&&a.replacement?.teamId===(old?.teamId||old?.replacement?.teamId),'同じ種類・チームの採点だけ訂正できます');if(oldKind==='stage')assert(a.replacement.venue===(old.venue||old.replacement?.venue),'同じ会場の採点だけ訂正できます');}
 if(a.kind==='scandal_contact')assert(current.attentionEvent&&minutes(a.time)>=minutes(current.attentionEvent.time),'途中順位の対象確定より前に取材済みを登録できません');
 if(['scandal_contact','scandal_resolve'].includes(a.kind))assert(minutes(a.time)<=minutes(s.scandalDeadline),`対応は${s.scandalDeadline}で締切です`);
 if(a.kind==='scandal_publish')assert(minutes(a.time)>=minutes(s.scandalPublish),`結果公開は${s.scandalPublish}以降です`);
 if(a.kind==='settle')assert(minutes(a.time)>=minutes(s.incomeSettlement),`定期収入は${s.incomeSettlement}以降です`);
 if(a.kind==='final')assert(current.phase==='live'&&minutes(a.time)>=minutes(s.showStart),'武道館採点はライブ開始後です');
 if(a.kind==='phase'){const old=PHASES.indexOf(current.phase),next=PHASES.indexOf(a.value);assert(next===old+1,'進行段階は順番に進めてください');if(a.value==='closed'){assert(current.settled,'ツアー終了の照合を記録してください');assert(current.scandalPublished,'スキャンダル結果を公開してください');assert(current.legacyAllScandals||!!current.goodwill,'神対応イベントの成立・未成立を記録してください');if(current.attentionEvent?.scandalWorkflow===SCANDAL_WORKFLOW)assert(current.liveTopics?.choices.length===6,'6組の武道館のお題を確定してください');}}
 if(a.kind==='void'){const target=state.actions.find(x=>x.id===a.targetId);assert(target&&!['void','phase','clock','schedule','scandal_plan','attention_event','live_topics_start','live_choice_open','live_choice','live_choice_correct'].includes(target.kind),'取り消せる取引を選んでください');assert(!current.voided.includes(a.targetId),'取り消し済みです');assert(a.reason?.trim().length>=4,'理由を4文字以上で入力してください');}
 const next={...state,actions:[...state.actions,a]};calculate(next);return next;
}
export function publicView(state){const c=calculate(state);return {phase:c.phase,clock:c.clock,schedule:c.schedule,attentionEvent:c.attentionEvent?{time:c.attentionEvent.time,leaderId:c.attentionEvent.leaderId,lowestId:c.attentionEvent.lowestId}:null,goodwill:c.goodwill,liveSelections:c.liveTopics?.choices.length===6?c.liveTopics.choices:null,teams:c.teams.map(({final,scandal,sns,...t})=>({...t,final:c.phase==='announced'?final:null,scandal:scandal?.published?{resolution:scandal.resolution,published:true,result:scandal.result}:null})),news:state.news.filter(n=>n.published),settled:c.settled,scandalPublished:c.scandalPublished};}
export function draftFor(a,state){const c=calculate(state),t=c.teams.find(t=>t.id===a.teamId),name=t?.name||'出演グループ',e=c.effects.find(e=>e.id===a.id);if(a.kind==='scandal_open')return {headline:`週刊ケイテキから${name}へ掲載予告`,body:`${t.scandal.topic}。16:45までに、もみ消し200GB、30秒の釈明、15秒の話題化から対応を選んでください。`,target:a.teamId,private:true};if(a.kind==='goodwill')return {headline:a.success?`${name}、ファンへの神対応で好感度アップ`:`${name}のファン交流、成立を確認できず`,body:a.success?`ファン役への応答、グループ紹介、決めポーズを運営が確認。ファン数＋5万人。確認内容：${a.proof}`:`成立を確認できず、追加のファン加算はなし。確認内容：${a.proof}`,target:'all'};if(a.kind==='scandal_resolve')return null;if(a.kind==='final')return null;if(a.kind==='relay_battle')return {headline:`${c.teams.find(t=>t.id===a.winnerId)?.name}、労働バトルのリレーで勝利`,body:`${a.teamIds.map(id=>c.teams.find(t=>t.id===id)?.name).join('と')}の対戦結果を運営が確認。勝者に${a.rewardGb}GBを入金、敗者の入金は0GB。ファン数の加算はありません。確認内容：${a.proof}`,target:'all'};if(a.kind==='collab_score'){const partner=rules.laborVisits.find(v=>v.pointId==='L2'&&v.teamIds.includes(a.teamId))?.teamIds.find(id=>id!==a.teamId),other=c.teams.find(t=>t.id===partner)?.name||partner;return {headline:`${name}、合同ロケで${a.score}点を獲得`,body:`${name}と${other}の合同ロケで、${name}を25点満点で個別採点。${a.score}点×1万人でファン${a.score*10000}人を追加、GBの入金はありません。確認内容：${a.proof||'実施内容を追記してください'}`,target:'all'};}if(a.kind==='collab')return {headline:'ライバル2組、合同CMで共演',body:`${a.teamIds.map(id=>c.teams.find(t=>t.id===id)?.name).join('と')}が合同ロケを完了。各組に出演料300GB、新規ファン3万人を追加しました。`,target:'all'};if(a.kind==='scandal_publish')return {headline:'週刊ケイテキ、6組の対応結果を公開',body:c.teams.map(t=>`${t.name}：${({cover:'もみ消し',apology:'釈明',publicity:'話題化',failed:'対応失敗'})[t.scandal?.resolution]||'未対応'}。ファン変動${t.scandal?.result>=0?'+':''}${(t.scandal?.result||0)/10000}万人。`).join('\n'),target:'all'};if(a.kind==='phase'&&a.value==='announced')return {headline:`${c.teams.filter(t=>t.rank===1).map(t=>t.name).join('・')}がメジャーデビュー`,body:c.teams.map(t=>`${t.rank}位 ${t.name}：${(t.totalFans/10000).toFixed(1)}万人`).join('\n'),target:'all'};if(e&&t&&['stage','mission','purchase','sns'].includes(a.kind))return {headline:`${name}、${e.label}を完了`,body:`${e.label}の結果、GB変動${e.gb>=0?'+':''}${e.gb}GB、ファン変動${e.fans>=0?'+':''}${e.fans/10000}万人。確認済みの活動内容をここに追記してください。`,target:'all'};return null;}
