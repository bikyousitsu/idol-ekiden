import { notFound } from 'next/navigation';
import { article,validEvent,read } from '../../../lib/event-store';
import { ArticleReader } from '../../news-components';
import { publicArticle } from '../../../lib/articles.mjs';
export const dynamic='force-dynamic';
async function lookup(props:any){const {id}=await props.params,q=await props.searchParams;try{const event=validEvent(q.event),n=await article(id,event,q.key);return {n,event};}catch{return {n:null,event:'production'};}}
export async function generateMetadata(props:any){const {n}=await lookup(props);return {title:n?n.headline+' | ケイテキ!ニュース':'記事が見つかりません',description:n?.summary,robots:{index:false,follow:false},referrer:'no-referrer',openGraph:n?{title:n.headline,description:n.summary,type:'article',siteName:'ケイテキ!ニュース'}:undefined};}
export default async function NewsPage(props:any){const {n,event}=await lookup(props);if(!n)notFound();const related=n.audience==='team'?[]:(await read(event)).state.news.filter((r:any)=>r.published&&!r.private&&r.id!==n.id).slice(-3).map(publicArticle);return <ArticleReader article={n} event={event} related={related}/>;}
