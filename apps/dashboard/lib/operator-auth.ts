import { cookies } from 'next/headers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { config } from './event-store';
import { COOKIE_NAME,digest } from './staff-crypto.mjs';
export async function getOperatorUser(){const token=(await cookies()).get(COOKIE_NAME)?.value;if(token&&/^[a-f0-9]{64}$/.test(token)){const row=await config.DB.prepare('SELECT a.id,a.display_name,o.role FROM staff_sessions s JOIN staff_accounts a ON a.id=s.staff_id JOIN operators o ON o.user_id=\'staff:\'||a.id WHERE s.token_hash=? AND s.expires_at>? AND a.active=1').bind(await digest(token),Math.floor(Date.now()/1000)).first<{id:string,display_name:string,role:string}>();if(row)return {userId:'staff:'+row.id,displayName:row.display_name,email:'',fullName:row.display_name,staffId:row.id,authKind:'staff',role:row.role};}const user=await getChatGPTUser();return user?{...user,staffId:null,authKind:'chatgpt',role:null}:null;}
