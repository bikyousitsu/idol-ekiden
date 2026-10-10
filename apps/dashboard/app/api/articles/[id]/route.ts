import { article,eventId,response } from '../../../../lib/event-store';
export const dynamic='force-dynamic';
export async function GET(req:Request,context:{params:Promise<{id:string}>}){try{const n=await article((await context.params).id,eventId(req),new URL(req.url).searchParams.get('key')||undefined);return n?response(n):response({error:'記事が見つかりません'},404);}catch{return response({error:'記事が見つかりません'},404);}}
