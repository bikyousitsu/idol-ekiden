import Dashboard from '../dashboard';
import { getChatGPTUser,chatGPTSignInPath } from '../chatgpt-auth';
export const dynamic='force-dynamic';
export const metadata={title:'運営専用 | アイドル駅伝',robots:{index:false,follow:false}};
export default async function Admin(){const user=await getChatGPTUser();return user?<Dashboard/>:<main className="login-card"><p className="eyebrow">KEITEKI CONTROL</p><h1>運営専用ページ</h1><p>採点・報酬の記録と記事編集には、運営の権限が必要です。</p><a className="primary" href={chatGPTSignInPath('/admin')} target="_top">運営アカウントでログイン</a><p><a href="/">参加者ページを見る →</a></p></main>;}
