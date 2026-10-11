'use client';
import {useState} from 'react';
import {showRun,currentRanking} from '../../lib/show-run.mjs';
export default function ShowRun({snapshot}:{snapshot:any}){const [notice,setNotice]=useState(''),steps=showRun(snapshot.schedule),ranking=currentRanking(snapshot.teams);
async function copy(text:string){try{await navigator.clipboard.writeText(text);setNotice('コピーしました。現在値と確定した出順を確認して使ってください。');}catch{setNotice('原稿欄を選択してコピーしてください。');}}
return <section className="content show-run"><h2>武道館の司会・進行</h2><p>シャネル・スーダンの漫才 → 披露方法の説明 → 現在順位の確認 → 司会進行。{snapshot.schedule.showStart}に第1組の実演を始める10分の前説案です。</p><p className="footnote">実演3分＋入替1分、前説の分配は仮案です。音響担当と出順を別途確定してください。音源は会場の端末で再生します。</p>{snapshot.schedule.tradeDeadline>steps[0].start&&<p className="error">集合・取引締切が前説開始より後です。集合時刻か前説の長さを調整し、順位確認前に本部で照合してください。</p>}
<div className="live-choice-message"><h3>ライブ前の現在順位</h3><p>イベント時刻 {snapshot.clock}／5秒ごとの台帳更新。取引終了後、森本の照合合図を受けて読み上げます。お題選択時に固定した順位とは別です。</p><textarea aria-label="現在順位の読み上げ原稿" rows={7} readOnly value={ranking}/><button onClick={()=>copy(ranking)}>現在順位をコピー</button></div>
{steps.map(s=><article className="live-choice-message" key={s.task}><h3>{s.start}〜{s.end}　{s.task}</h3><p><strong>音響・本部：</strong>{s.cue}</p><textarea aria-label={s.task+'の台本'} rows={s.task.includes('漫才')?9:6} readOnly value={s.script}/><button onClick={()=>copy(s.script)}>台本をコピー</button></article>)}{notice&&<p role="status" className="notice">{notice}</p>}</section>;
}
