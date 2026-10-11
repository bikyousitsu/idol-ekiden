const encoder=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export function staffId(value){if(typeof value!=='string')throw Error('運営IDを入力してください');const id=value.trim().toUpperCase();if(!/^[A-Z0-9_-]{3,20}$/.test(id))throw Error('運営IDは英数字3〜20文字です');return id;}
export function cleanPasscode(value){return typeof value==='string'?value.replace(/[\s-]/g,'').toUpperCase():'';}
export function newPasscode(){const alphabet='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';const bytes=crypto.getRandomValues(new Uint8Array(10));const plain=Array.from(bytes,b=>alphabet[b%32]).join('');return plain.slice(0,5)+'-'+plain.slice(5);}
export const newToken=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export const newSalt=()=>hex(crypto.getRandomValues(new Uint8Array(16)));
export async function digest(value){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
export async function passcodeHash(value,salt){const key=await crypto.subtle.importKey('raw',encoder.encode(cleanPasscode(value)),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},key,256));}
export function equalHash(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let difference=0;for(let i=0;i<a.length;i++)difference|=a.charCodeAt(i)^b.charCodeAt(i);return difference===0;}
export const SESSION_SECONDS=8*60*60;
export const COOKIE_NAME='keiteki_staff_session';
export function sessionCookie(token,secure=true){return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${token?SESSION_SECONDS:0}${secure?'; Secure':''}`;}
