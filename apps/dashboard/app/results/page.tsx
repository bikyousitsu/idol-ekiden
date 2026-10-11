import ResultsPage from './results-page';
export const metadata={title:'レコード大賞・確定結果 | アイドル駅伝',robots:{index:false,follow:false}};
export default async function Page({searchParams}:any){const q=await searchParams,event=['practice','rehearsal'].includes(q.event)?q.event:'production';return <ResultsPage event={event}/>;}
