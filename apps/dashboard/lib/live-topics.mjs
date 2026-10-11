export const liveTopicCandidates=[
 {id:'oogiri',label:'大喜利',brief:'お題3問に全員で回答'},
 {id:'monoboke',label:'モノボケ',brief:'共通の3道具で交代して披露'},
 {id:'posing',label:'ボディビル風ポーズ',brief:'紹介文と全員の決めポーズ'},
 {id:'tableau',label:'組体操風の床上ポーズ',brief:'立つ・座る群像ポーズ3つ'},
 {id:'dance',label:'ダンス',brief:'指定曲の短い音源で披露'},
 {id:'comedy',label:'ショートコント',brief:'「こんなアイドルは嫌だ」'},
 {id:'reaction',label:'リアクション芸',brief:'封筒のお題を無言で表現、古参が当てる'},
 {id:'rap',label:'ラップ',brief:'司会の8小節へ各人が返す'},
];
const pick=n=>{const limit=Math.floor(4294967296/n)*n;let v;do{v=crypto.getRandomValues(new Uint32Array(1))[0];}while(v>=limit);return v%n;};
export function selectionOrder(teams){const ordered=[...teams].sort((a,b)=>b.totalFans-a.totalFans),result=[];for(let i=0;i<ordered.length;){let j=i+1;while(j<ordered.length&&ordered[j].totalFans===ordered[i].totalFans)j++;const tied=ordered.slice(i,j);while(tied.length)result.push(tied.splice(pick(tied.length),1)[0].id);i=j;}return result;}
export function remainingTopics(queue){const catalog=queue?.catalog||liveTopicCandidates;return catalog.map(t=>({...t,remaining:2-(queue?.choices||[]).filter(c=>c.topicId===t.id).length})).filter(t=>t.remaining>0);}
export function selectionMessage(team,queue){return `【マネージャー森本／武道館のお題選択】\n${team?.name||'対象のグループ'}の番です！ ファン数の順位が高いグループから順に選んでいます。\n\n残っているお題は次のとおりです。\n${remainingTopics(queue).map(t=>`・${t.label}（残り${t.remaining}組）：${t.brief}`).join('\n')}\n\n目安1分で、このチームLINEにお題を1つ返信してください。同じお題は2グループまでです。迷ったら相談してください。1分で自動的に締め切ることはしません。\n\n確定の返信を待ってから準備を進めましょう。必要な音源・道具、アイドル全員の出番も教えてください。これはお題の選択順で、ステージの出演順とは別です。`;}
