import Dashboard from '../dashboard';
import { chatGPTSignInPath } from '../chatgpt-auth';
import { getOperatorUser } from '../../lib/operator-auth';
import OperatorLogin from './operator-login';
export const dynamic='force-dynamic';
export const metadata={title:'運営専用 | アイドル駅伝',robots:{index:false,follow:false}};
export default async function Admin(){const user=await getOperatorUser();return user?<Dashboard/>:<main className="login-card"><p className="eyebrow">KEITEKI CONTROL</p><h1>運営ログイン</h1><OperatorLogin/><details><summary>森本の初期設定・復旧</summary><p className="footnote">サイト所有者のアカウントから管理者IDを発行できます。</p><a href={chatGPTSignInPath('/admin')} target="_top">所有者のChatGPTでログイン</a></details><p><a href="/">参加者ページを見る →</a></p></main>;}
