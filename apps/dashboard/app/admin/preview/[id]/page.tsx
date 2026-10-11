import { notFound } from 'next/navigation';
import { getOperatorUser } from '../../../../lib/operator-auth';
import { role,read,validEvent } from '../../../../lib/event-store';
import { publicArticle } from '../../../../lib/articles.mjs';
import { ArticleReader } from '../../../news-components';
export const dynamic='force-dynamic';
export const metadata={title:'運営用プレビュー',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function Preview(props:any){const user=await getOperatorUser();if(!user)return <main className="login-card"><h1>運営用プレビュー</h1><a href="/admin">ログインして編集画面へ</a></main>;if(!await role(user.userId))notFound();const {id}=await props.params,q=await props.searchParams,event=validEvent(q.event),n=(await read(event)).state.news.find((n:any)=>n.id===id);if(!n)notFound();return <ArticleReader article={publicArticle(n)} event={event} preview/>;}
