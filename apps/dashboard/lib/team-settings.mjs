import { normalizeArticle, publicArticle, validateArticle } from './articles.mjs';

const signature = teams => JSON.stringify(teams.map(({id,name,color})=>({id,name,color})));
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

/** Save names by stable group ID; migrate only unpublished, unshared article text.
 * @param {any} state
 * @param {any[]} input
 * @param {{now?:string,editor?:string,baseTeams?:any[]}} options
 */
export function updateTeams(state,input,{now=new Date().toISOString(),editor='運営',baseTeams}={}){
 if(baseTeams&&signature(baseTeams)!==signature(state.teams))throw Error('別の担当者がグループ名・色を変更しました。最新の設定を読み直してください');
 if(!Array.isArray(input)||input.length!==6)throw Error('6チームを指定してください');
 const teams=state.teams.map((old,i)=>{
  const next=input[i];
  if(!next||next.id!==old.id||typeof next.name!=='string'||!next.name.trim()||next.name.trim().length>30||typeof next.color!=='string'||!/^#[\da-f]{6}$/i.test(next.color))throw Error('グループ名・色が不正です');
  return {...old,name:next.name.trim(),color:next.color};
 });
 if(new Set(teams.map(t=>t.name)).size!==6)throw Error('グループ名は6組で重複しない名前にしてください');
 const changed=state.teams.filter((t,i)=>t.name!==teams[i].name);
 if(!changed.length)return {...state,teams};
 if(new Set(state.teams.map(t=>t.name)).size!==6)throw Error('現在のグループ名が重複しています。下書きの対象を確認してから変更してください');
 const names=new Map(state.teams.map((t,i)=>[t.name,teams[i].name]));
 // Include unchanged longer names to avoid matching a changed name inside them.
 const pattern=new RegExp([...names.keys()].sort((a,b)=>b.length-a.length).map(escape).join('|'),'g');
 const replace=text=>typeof text==='string'?text.replace(pattern,match=>names.get(match)):text;
 const news=state.news.map(article=>{
  if(article.published||article.sharedAt)return article;
  const old=normalizeArticle(article);
  const fields={headline:replace(old.headline),summary:replace(old.summary),body:replace(old.body),comments:old.comments.map(c=>({...c,text:replace(c.text)}))};
  if(['headline','summary','body'].every(k=>fields[k]===old[k])&&fields.comments.every((c,i)=>c.text===old.comments[i].text))return article;
  const next={...old,...fields,editedAt:now,revision:old.revision+1,history:[...(old.history||[]),{...publicArticle(old),editor,change:'グループ名変更'}].slice(-20)};
  try{validateArticle(next);}catch{throw Error(`下書き「${old.headline}」が名前変更後に文字数上限を超えます。名前か下書きを短くしてから保存してください`);}
  return next;
 });
 return {...state,teams,news};
}
