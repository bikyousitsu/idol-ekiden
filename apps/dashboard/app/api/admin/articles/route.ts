import { getChatGPTUser } from '../../../chatgpt-auth';
import { eventId,read,response,role,sameOrigin,save } from '../../../../lib/event-store';
import { reviseArticle } from '../../../../lib/articles.mjs';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{sameOrigin(req);const user=await getChatGPTUser();if(!user)return response({error:'サインインしてください'},401);if(!await role(user.userId))return response({error:'運営の権限がありません'},403);const input:any=await req.json(),id=eventId(req),r=await read(id);let old=r.state.news.find((n:any)=>n.id===input.id);
 if(input.create){if(r.state.news.length>=1600)throw Error('記事数の上限です');if(old)throw Error('記事はすでに作成されています');old={id:crypto.randomUUID(),headline:'新しい記事',summary:'記事の要約',body:'記事の本文',private:!!input.private,published:false,time:r.state.clock,revision:0,target:input.private?input.teamIds?.[0]:'all'};if(old.private&&input.teamIds?.length!==1)throw Error('予告は1チームを指定してください');}
 if(!old) return response({error:'記事が見つかりません'},404);
 const revised=reviseArticle(old,input,new Date().toISOString(),user.userId);const next={...r.state,news:input.create?[...r.state.news,revised]:r.state.news.map((n:any)=>n.id===old.id?revised:n)};
 if(!await save(id,r,next))return response({error:'別の担当者が記録を更新しました。下書きは画面に残しています。もう一度保存してください'},409);return response({ok:true,article:revised});
 }catch(e){const message=(e as Error).message;return response({error:message==='ARTICLE_CONFLICT'?'この記事を別の担当者が編集しました。入力を控えてから保存済み原稿を読み直してください':message},message==='ARTICLE_CONFLICT'?409:400);}}
