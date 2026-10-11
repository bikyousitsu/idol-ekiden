'use client';
import { useEffect,useState } from 'react';
import FinalResults from '../final-results';
import { NewsHeader,NewsFooter } from '../news-components';
export default function ResultsPage({event}:any){const [data,setData]=useState<any>(null),[error,setError]=useState('');useEffect(()=>{let active=true;async function load(){try{const r=await fetch('/api/event?event='+event,{cache:'no-store'});if(!r.ok)throw Error('結果を読み込めませんでした');const d:any=await r.json();if(active){setData(d);setError('');}}catch(e){if(active)setError((e as Error).message);}}load();const timer=setInterval(load,5000);return()=>{active=false;clearInterval(timer);};},[event]);return <main className="news-site"><NewsHeader event={event} section="結果発表"/><div className="results-shell">{error&&<p role="alert">{error}</p>}{data?<FinalResults data={data} event={event}/>:<p>結果を読み込み中…</p>}</div><NewsFooter/></main>;}
