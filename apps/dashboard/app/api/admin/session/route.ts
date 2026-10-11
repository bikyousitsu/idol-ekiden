import { cookies } from 'next/headers';
import { config,response,sameOrigin } from '../../../../lib/event-store';
import { COOKIE_NAME,cleanPasscode,staffId,digest,newToken,passcodeHash,equalHash,sessionCookie,SESSION_SECONDS } from '../../../../lib/staff-crypto.mjs';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{sameOrigin(req);const data:any=await req.json(),secure=new URL(req.url).protocol==='https:';
 if(data.command==='logout'){const token=(await cookies()).get(COOKIE_NAME)?.value;if(token)await config.DB.prepare('DELETE FROM staff_sessions WHERE token_hash=?').bind(await digest(token)).run();const r=response({ok:true});r.headers.set('Set-Cookie',sessionCookie('',secure));return r;}
 if(data.command!=='login')throw Error('操作が不正です');const id=staffId(data.id),passcode=cleanPasscode(data.passcode);if(!/^[A-Z2-9]{10}$/.test(passcode))return response({error:'運営IDまたはパスコードを確認してください'},401);
 const now=Math.floor(Date.now()/1000),attempt=await config.DB.prepare('INSERT INTO staff_login_attempts(id,attempts,window_start) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END,window_start=CASE WHEN window_start<=? THEN ? ELSE window_start END WHERE window_start<=? OR attempts<5 RETURNING attempts,window_start').bind(id,now,now-900,now-900,now,now-900).first<{attempts:number,window_start:number}>();
 if(!attempt)return response({error:'ログインを続けて失敗したため、15分待ってから試してください'},429);
 const account=await config.DB.prepare('SELECT id,pass_hash,salt,active FROM staff_accounts WHERE id=?').bind(id).first<any>();
 const hashed=await passcodeHash(passcode,account?.salt||'00000000000000000000000000000000');if(!account?.active||!equalHash(hashed,account.pass_hash))return response({error:'運営IDまたはパスコードを確認してください'},401);
 const token=newToken(),result=await config.DB.prepare('INSERT INTO staff_sessions(token_hash,staff_id,expires_at) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM staff_accounts WHERE id=? AND pass_hash=? AND active=1)').bind(await digest(token),id,now+SESSION_SECONDS,id,account.pass_hash).run();if(result.meta.changes!==1)return response({error:'パスコードが更新されました。新しいコードで入り直してください'},401);
 await config.DB.batch([config.DB.prepare('DELETE FROM staff_login_attempts WHERE id=? AND window_start=? AND attempts=?').bind(id,attempt.window_start,attempt.attempts),config.DB.prepare('DELETE FROM staff_sessions WHERE expires_at<=?').bind(now)]);
 const r=response({ok:true});r.headers.set('Set-Cookie',sessionCookie(token,secure));return r;
 }catch(e){return response({error:(e as Error).message},400);}}
