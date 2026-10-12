import { getOperatorUser } from '../../../../lib/operator-auth';
import { append, calculate, draftFor } from '../../../../lib/core.mjs';
import { editorialDraft,scandalResultDraft } from '../../../../lib/news-content.mjs';
import { withActionNews,prepareScandalNews } from '../../../../lib/news-workflow.mjs';
import { updateTeams } from '../../../../lib/team-settings.mjs';
import { normalizeArticle,validateArticle } from '../../../../lib/articles.mjs';
import { config,response,eventId,read,role,mayClaim,sameOrigin,save,adminView } from '../../../../lib/event-store';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const user=await getOperatorUser();if(!user)return response({error:'運営アカウントでサインインしてください'},401);const operator=await role(user.userId);if(!operator)return response({signedIn:true,userId:user.userId,operator:false,canClaim:await mayClaim(user)});const id=eventId(req);return response(adminView(await read(id),id,user,operator));}catch(e){return response({error:(e as Error).message},503);}}
export async function POST(req:Request){try{sameOrigin(req);const user=await getOperatorUser();if(!user)return response({error:'運営アカウントでサインインしてください'},401);const data:any=await req.json();if(data.command==='claim'){if(!await mayClaim(user))return response({error:'管理者の初期登録を受け付けていません'},403);await config.DB.prepare("INSERT INTO operators(user_id,role,created_at) SELECT ?,'owner',? WHERE NOT EXISTS(SELECT 1 FROM operators)").bind(user.userId,new Date().toISOString()).run();return response({ok:!!await role(user.userId)});}
 const operator=await role(user.userId);if(!operator)return response({error:'運営の権限がありません'},403);
 if(data.command==='grant'){if(operator!=='owner')return response({error:'管理者のみ追加できます'},403);if(typeof data.userId!=='string'||!/^[-\w:]{4,160}$/.test(data.userId))throw Error('スタッフのユーザーIDが不正です');await config.DB.prepare("INSERT INTO operators(user_id,role,created_at) VALUES(?,'editor',?) ON CONFLICT(user_id) DO NOTHING").bind(data.userId,new Date().toISOString()).run();return response({ok:true});}
 const id=eventId(req),r=await read(id);if(!Number.isInteger(data.version)||data.version!==r.version)return response({error:'別の担当者が更新しました。最新の画面を確認してください'},409);
 let next=r.state;
 if(data.command==='action'){if(next.actions.length>=800)throw Error('操作数の上限です。台帳を書き出して確認してください');if(['schedule','scandal_plan','attention_event','live_topics_start','live_choice_open','live_choice','live_choice_correct'].includes(data.action?.kind)&&operator!=='owner')return response({error:'全体予定・お題・途中順位の対象確定は管理者のみ操作できます'},403);next=withActionNews(append(r.state,{...data.action,operator:user.userId,operatorName:user.displayName,recordedAt:new Date().toISOString()}));}
 else if(data.command==='prepare_scandal'){next=prepareScandalNews(r.state);}
 else if(data.command==='teams'){next=updateTeams(r.state,data.teams,{editor:user.displayName,baseTeams:data.baseTeams});}
 else if(data.command==='import'){if(operator!=='owner')return response({error:'復元は管理者のみできます'},403);const raw=data.state;if(!raw||!Array.isArray(raw.actions)||raw.actions.length>800||!Array.isArray(raw.teams)||raw.teams.length!==6||!Array.isArray(raw.news)||raw.news.length>1600||raw.teams.some((t:any,i:number)=>t.id!==`G${i+1}`||t.initialGb!==600||typeof t.name!=='string'||!t.name.trim()||t.name.length>30||!/^#[\da-f]{6}$/i.test(t.color))||raw.news.some((n:any)=>typeof n.id!=='string'||typeof n.headline!=='string'||n.headline.length>100||typeof n.body!=='string'||n.body.length>6000||(n.private!==undefined&&typeof n.private!=='boolean')||typeof n.published!=='boolean'||(n.private&&n.published)))throw Error('バックアップの形式が不正です');raw.news.forEach((n:any)=>validateArticle(normalizeArticle(n)));calculate(raw);next=raw;}
 else throw Error('操作が不正です');
 if(!await save(id,r,next))return response({error:'同時更新がありました。最新の画面を確認してください'},409);return response({ok:true,version:r.version+1});
 }catch(e){return response({error:(e as Error).message},400);}}
