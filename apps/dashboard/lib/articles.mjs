export const categories=['活動','スキャンダル','合同ロケ','武道館','運営'];
export const portalHref=(event='production')=>event==='production'?'/':event==='rehearsal'?'/rehearsal':'/demo';
export function normalizeArticle(n){return {...n,summary:n.summary||n.body.slice(0,120),category:n.category||'活動',illustration:n.illustration||'stage',teamIds:n.teamIds||(n.private?[n.target]:[]),comments:n.comments||[],revision:n.revision||0};}
export function validateArticle(n){
 for(const [k,max] of [['headline',100],['summary',180],['body',6000]])if(typeof n[k]!=='string'||!n[k].trim()||n[k].length>max)throw Error(`${k}の文字数を確認してください（上限${max}字）`);
 if(!categories.includes(n.category)||!['stage','scandal','collab','award','notice'].includes(n.illustration))throw Error('記事の分類が不正です');
 if(!Array.isArray(n.teamIds)||n.teamIds.some(id=>!/^G[1-6]$/.test(id)))throw Error('対象チームが不正です');
 if(!Array.isArray(n.comments)||n.comments.length>12||n.comments.some(c=>typeof c.id!=='string'||typeof c.author!=='string'||!c.author.trim()||c.author.length>30||typeof c.text!=='string'||!c.text.trim()||c.text.length>250||!['応援','考察','辛口'].includes(c.stance)||!Number.isInteger(c.agree)||c.agree<0||c.agree>99999||!Number.isInteger(c.disagree)||c.disagree<0||c.disagree>99999))throw Error('コメントは12件まで、本文250字・表示名30字以内です');
 return n;
}
export function publicArticle(n){n=normalizeArticle(n);return Object.fromEntries(['id','headline','summary','body','category','illustration','teamIds','comments','time','publishedAt','editedAt','revision'].map(k=>[k,n[k]]).concat([['audience',n.private?'team':'all']]));}
export function selectArticle(state,id,key){const n=state.news.find(n=>n.id===id);return n&&((n.published&&!n.private)||(n.private&&n.sharedAt&&n.shareKey&&n.shareKey===key))?publicArticle(n):null;}
export function articleHref(n,event='production',includeKey=false){const q=new URLSearchParams();if(event!=='production')q.set('event',event);if(n.private&&includeKey&&n.sharedAt&&n.shareKey)q.set('key',n.shareKey);return `/news/${encodeURIComponent(n.id)}${q.size?'?'+q:''}`;}
export function reviseArticle(old,input,now,editor){
 old=normalizeArticle(old);if(input.revision!==old.revision)throw Error('ARTICLE_CONFLICT');
 const fields=validateArticle(input);if(old.private&&input.status==='publish')throw Error('チーム限定の予告は全体公開できません');
 if(!['draft','publish','share'].includes(input.status)||(!old.private&&input.status==='share'))throw Error('公開方法が不正です');
 const picked=Object.fromEntries(['headline','summary','body','category','illustration','teamIds','comments'].map(k=>[k,fields[k]]));
 const next={...old,...picked,published:input.status==='publish',reviewedBy:editor,editedAt:now,revision:old.revision+1,history:[...(old.history||[]),{...publicArticle(old),editor}].slice(-20)};
 if(next.published)next.publishedAt=old.publishedAt||now;
 if(old.private){next.sharedAt=input.status==='share'?now:null;if(input.status==='share')next.shareKey=old.shareKey||Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');}
 return next;
}
