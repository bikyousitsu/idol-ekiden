import assert from 'node:assert/strict';
const base=new URL(process.env.LOCAL_TEST_URL||'http://127.0.0.1:5173');
assert(['127.0.0.1','localhost'].includes(base.hostname),'端末内の試運転にのみ使います');
const cookie='__sites_local_auth=1',url=new URL('/api/admin/event?event=rehearsal',base),headers={'Content-Type':'application/json',Origin:base.origin,Cookie:cookie};
const checks=[];
async function get(auth=true){const r=await fetch(url,{headers:auth?{Cookie:cookie}:{}});assert.equal(r.status,200);return r.json();}
async function post(body,h=headers){const r=await fetch(url,{method:'POST',headers:h,body:JSON.stringify(body)});const text=await r.text();let result;try{result=JSON.parse(text);}catch{result={error:text};}return {status:r.status,body:result};}
const initial=await get();assert(initial.operator,'ローカル画面で初回管理者登録を先に実施');
const backup=initial.raw;
try {
 let r=await post({command:'action',version:initial.version,action:{kind:'phase',value:'tour',id:'api-test-phase'}},{'Content-Type':'application/json',Origin:base.origin});assert.equal(r.status,401);checks.push('未認証の書込みを拒否');
 r=await post({command:'teams',version:initial.version,teams:backup.teams},{...headers,Origin:'https://example.invalid'});assert([400,403].includes(r.status));checks.push('別サイトからの書込みを拒否');
 r=await post({command:'import',version:initial.version,state:{...backup,actions:[],news:[]}});assert.equal(r.status,200);
 let s=await get();r=await post({command:'action',version:s.version,action:{kind:'phase',value:'tour',id:'api-test-phase',time:'15:00'}});assert.equal(r.status,200);
 const stale=s.version;s=await get();assert.equal(s.phase,'tour');assert.equal(s.raw.actions.length,1);checks.push('台帳保存後、別リクエストでも復元');
 r=await post({command:'teams',version:stale,teams:backup.teams});assert.equal(r.status,409);checks.push('古い版の同時入力を拒否');
 r=await post({command:'action',version:s.version,action:{kind:'mission',teamId:'G1',missionId:'work1',id:'api-test-work',time:'15:30'}});assert.equal(r.status,200);s=await get();assert.equal(s.teams.find(t=>t.id==='G1').gb,800);checks.push('報酬が共有残高に反映');
 r=await post({command:'action',version:s.version,action:{kind:'mission',teamId:'G1',missionId:'work1',id:'api-test-work',time:'15:30'}});assert.equal(r.status,400);assert.equal((await get()).teams.find(t=>t.id==='G1').gb,800);checks.push('同じ操作の再送で二重入金しない');
 r=await post({command:'action',version:s.version,action:{kind:'scandal_open',teamId:'G1',id:'api-test-scandal',time:'16:00'}});assert.equal(r.status,200);s=await get();const secret=s.raw.news.find(n=>n.private);assert(secret);
 async function articlePost(body){const r=await fetch(new URL('/api/admin/articles?event=rehearsal',base),{method:'POST',headers,body:JSON.stringify(body)});return {status:r.status,body:await r.json()};}
 const secretInput={...secret,revision:secret.revision||0,status:'publish'};
 r=await articlePost(secretInput);assert.equal(r.status,400);checks.push('チーム限定の掲載予告を全体公開できない');
 r=await articlePost({...secretInput,status:'share'});assert.equal(r.status,200);const shared=r.body.article;
 let a=await fetch(new URL('/api/articles/'+shared.id+'?event=rehearsal',base));assert.equal(a.status,404);
 a=await fetch(new URL('/api/articles/'+shared.id+'?event=rehearsal&key='+shared.shareKey,base));assert.equal(a.status,200);const dto=await a.json();assert(!('shareKey' in dto));assert(!('reviewedBy' in dto));checks.push('チーム限定の記事は正しい鍵のみ、秘密フィールドは除外');
 r=await articlePost({...shared,status:'draft'});assert.equal(r.status,200);
 a=await fetch(new URL('/api/articles/'+shared.id+'?event=rehearsal&key='+shared.shareKey,base));assert.equal(a.status,404);checks.push('共有を停止すると古いURLでも記事は読めない');
 s=await get();const ordinary=s.raw.news.find(n=>!n.private);r=await articlePost({...ordinary,status:'publish'});assert.equal(r.status,200);const published=r.body.article;
 a=await fetch(new URL('/news/'+published.id+'?event=rehearsal',base));assert.equal(a.status,200);const html=await a.text();assert(html.includes('og:title'));assert(html.includes(published.headline));assert(html.includes('架空'));checks.push('独立記事ページとLINE向けメタ情報');
 r=await articlePost({...ordinary,status:'publish',headline:'古い入力'});assert.equal(r.status,409);checks.push('古い原稿版の上書きを拒否');
 const publicAsOperator=await (await fetch(new URL('/api/event?event=rehearsal',base),{headers:{Cookie:cookie}})).json();assert(!('raw' in publicAsOperator));assert(!('userId' in publicAsOperator));assert(!publicAsOperator.news.some(n=>n.private));assert(!publicAsOperator.news.some(n=>n.reviewedBy||n.history||n.shareKey));checks.push('ログイン済みでも参加者APIは公開情報だけ');
 a=await fetch(new URL('/api/admin/event',base));assert.equal(a.status,401);checks.push('運営APIは未認証の読取りも拒否');
 a=await fetch(new URL('/api/event',base),{method:'POST',headers,body:JSON.stringify({command:'claim'})});assert.equal(a.status,403);checks.push('参加者APIは運営でも書込み不可');
 const publicData=await (await fetch(new URL('/api/event?event=rehearsal',base))).json();assert(!('raw' in publicData));assert(!publicData.teams.find(t=>t.id==='G1').scandal);assert(!publicData.news.some(n=>n.private));checks.push('閲覧者へ台帳・未公開スキャンダルを返さない');
 for(let i=2;i<=6;i++){s=await get();r=await post({command:'action',version:s.version,action:{kind:'scandal_open',teamId:'G'+i,id:'api-scandal-'+i,time:'16:00'}});assert.equal(r.status,200);}
 s=await get();r=await post({command:'action',version:s.version,action:{kind:'scandal_resolve',teamId:'G1',resolution:'cover',id:'api-cover',time:'16:10'}});assert.equal(r.status,200);
 s=await get();r=await post({command:'action',version:s.version,action:{kind:'scandal_publish',id:'api-results',time:'16:50'}});assert.equal(r.status,200);s=await get();const results=s.raw.news.filter(n=>n.sourceId==='api-results');assert.equal(results.length,6);const cover=results.find(n=>n.teamIds.includes('G1'));const hidden=s.calculated.teams.find(t=>t.id==='G1').scandal.topic;assert(!JSON.stringify(cover).includes(hidden));assert(results.every(n=>!n.private&&!n.published));r=await articlePost({...cover,status:'publish'});assert.equal(r.status,200);const visible=await (await fetch(new URL('/api/event?event=rehearsal',base))).json();assert(!visible.teams.find(t=>t.id==='G1').scandal);assert(!JSON.stringify(visible).includes(hidden));checks.push('6組の個別結果原稿を作成し、もみ消しの疑惑は公開情報に残さない');
 s=await get();const goodBackup=JSON.parse(JSON.stringify(s.raw));r=await post({command:'import',version:s.version,state:goodBackup});assert.equal(r.status,200);assert.deepEqual((await get()).raw,goodBackup);checks.push('書出し相当のJSONを復元できる');
 s=await get();const badBackup=JSON.parse(JSON.stringify(s.raw));badBackup.news[0].body={broken:true};r=await post({command:'import',version:s.version,state:badBackup});assert.equal(r.status,400);checks.push('壊れたバックアップを拒否');
 console.log(JSON.stringify({pass:checks.length,checks},null,2));
} finally {const s=await get();const r=await post({command:'import',version:s.version,state:backup});assert.equal(r.status,200,'元のリハーサル台帳へ戻す');}
