import { env } from 'cloudflare:workers';
import { calculate,demonstration,emptyState,publicView } from './core.mjs';
import { sampleArticles } from './news-content.mjs';
import { normalizeArticle,publicArticle,selectArticle } from './articles.mjs';
export const config=env as unknown as {DB:D1Database,ALLOW_OWNER_BOOTSTRAP?:string,BOOTSTRAP_OWNER_EMAIL?:string,PUBLIC_ORIGIN?:string};
export function response(body:unknown,status=200){return Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});}
export function eventId(req:Request){return validEvent(new URL(req.url).searchParams.get('event'));}
export function validEvent(id?:string|null){id=id||'production';if(!['practice','rehearsal','production'].includes(id))throw Error('イベントが不正です');return id;}
export async function read(id:string){const row=await config.DB.prepare('SELECT payload,version FROM event_store WHERE id=?').bind(id).first<{payload:string,version:number}>();return {state:row?JSON.parse(row.payload):id==='practice'?{...demonstration(),news:sampleArticles()}:emptyState(),version:row?.version||0,exists:!!row};}
export async function role(userId:string|undefined){if(!userId)return null;return (await config.DB.prepare('SELECT role FROM operators WHERE user_id=?').bind(userId).first<{role:string}>())?.role||null;}
export async function mayClaim(user:any){if(!user||!config.BOOTSTRAP_OWNER_EMAIL||user.email.toLowerCase()!==config.BOOTSTRAP_OWNER_EMAIL.toLowerCase()||config.ALLOW_OWNER_BOOTSTRAP!=='true')return false;return (await config.DB.prepare('SELECT COUNT(*) AS n FROM operators').first<{n:number}>())?.n===0;}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(!origin||![new URL(req.url).origin,config.PUBLIC_ORIGIN].includes(origin))throw Error('同じサイトの画面から操作してください');}
export async function save(id:string,r:any,next:any){if(!r.exists)await config.DB.prepare('INSERT INTO event_store(id,payload,version,updated_at) VALUES(?,?,0,?) ON CONFLICT(id) DO NOTHING').bind(id,JSON.stringify(r.state),new Date().toISOString()).run();const result=await config.DB.prepare('UPDATE event_store SET payload=?,version=version+1,updated_at=? WHERE id=? AND version=?').bind(JSON.stringify(next),new Date().toISOString(),id,r.version).run();return result.meta.changes===1;}
export function participantView(state:any){const p=publicView(state);return {...p,teams:p.teams.map((t:any)=>({id:t.id,name:t.name,color:t.color,gb:t.gb,totalFans:t.totalFans,rank:t.rank,stages:t.stages,final:t.final})),news:state.news.filter((n:any)=>n.published&&!n.private).map(publicArticle)};}
export function adminView(r:any,id:string,user:any,operator:string){return {...participantView(r.state),version:r.version,event:id,operator:true,role:operator,userId:user.userId,signedIn:true,raw:{...r.state,news:r.state.news.map(normalizeArticle)},calculated:calculate(r.state)};}
export async function article(id:string,event:string,key?:string){return selectArticle((await read(event)).state,id,key);}
