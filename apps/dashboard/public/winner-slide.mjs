// The public API already resolves all final-stage tie breakers.
export function winnerResult(data) {
  if(data?.phase!=='announced')return null;
  if(!Array.isArray(data.teams)||data.teams.length!==6)throw Error('全6組の確定結果を確認できません');
  if(!data.teams.every(t=>t.final&&typeof t.name==='string'&&t.name.trim()&&Number.isFinite(t.totalFans)&&t.totalFans>=0&&Number.isInteger(t.rank)&&t.rank>0))throw Error('確定結果が不完全です');
  const winners=data.teams.filter(t=>t.rank===1);
  if(!winners.length||!winners.every(t=>t.totalFans===winners[0].totalFans))throw Error('優勝グループを確認できません');
  return {names:winners.map(t=>t.name),fans:winners[0].totalFans,joint:winners.length>1};
}

export function initWinnerSlide(doc=document,win=window) {
  const by=id=>doc.getElementById(id),stage=by('stage'),name=by('winner'),title=by('award'),fans=by('fans'),status=by('status'),revealButton=by('reveal');
  const preview=new URL(win.location.href).searchParams.get('preview')==='1',jointPreview=preview&&new URL(win.location.href).searchParams.get('joint')==='1';
  let result=null,revealed=false,serial=0;
  function fit(){stage.style.transform=`translate(-50%,-50%) scale(${Math.min(win.innerWidth/1280,(win.innerHeight-(doc.fullscreenElement?0:70))/720)})`;}
  function fitNames(){let size=result?.names.length>2?48:result?.names.length===2?76:108;name.style.fontSize=size+'px';const overflow=()=>name.scrollHeight>name.clientHeight||name.scrollWidth>name.clientWidth||Array.from(name.children).some(line=>line.scrollHeight>line.clientHeight||line.scrollWidth>line.clientWidth);while(overflow()&&size>24){size-=2;name.style.fontSize=size+'px';}}
  function reveal(){if(!result||revealed)return;revealed=true;title.textContent=result.joint?'レコード大賞　共同受賞':'レコード大賞';name.classList.toggle('joint-many',result.names.length>2);name.replaceChildren();result.names.forEach(n=>{const line=doc.createElement('span');line.textContent=n;name.append(line);});fans.textContent='獲得ファン数　'+result.fans.toLocaleString('ja-JP')+'人';by('debut').textContent=result.joint?'全受賞グループがメジャーデビュー':'メジャーデビュー決定';stage.classList.add('revealed');fitNames();revealButton.disabled=true;status.textContent=preview?'デザイン確認用のサンプルです':'確定した優勝結果を表示中';}
  function reset(){revealed=false;result=null;serial++;stage.classList.remove('revealed');name.classList.remove('joint-many');title.textContent='レコード大賞';name.replaceChildren('優勝発表');name.style.fontSize='108px';fans.textContent='';by('debut').textContent='';revealButton.disabled=true;refresh();}
  async function refresh(){if(revealed)return;const request=++serial;revealButton.disabled=true;result=null;status.textContent='本番の確定結果を確認中';
    try{
      const data=preview?{phase:'announced',teams:Array.from({length:6},(_,i)=>({name:jointPreview?'共同受賞グループ'+(i+1):i===0?'優勝グループ名':'出演グループ',rank:jointPreview?1:i+1,totalFans:jointPreview?1000000:1000000-i*10000,final:{total:50}}))}:await(async()=>{const response=await win.fetch('/api/event?event=production',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('本番に接続できません');return response.json();})();
      if(request!==serial||revealed)return;result=winnerResult(data);revealButton.disabled=!result;status.textContent=preview?'デザイン確認用。Enterでサンプル表示':result?'結果確定。司会の発表に合わせてEnterで表示':'結果は未確定です。運営画面で全組の採点と結果発表を完了してください';
    }catch(error){if(request!==serial||revealed)return;result=null;revealButton.disabled=true;status.textContent='結果を取得できません。「更新」を押すか、通信を確認してください';}
  }
  by('reveal').onclick=reveal;by('refresh').onclick=refresh;by('reset').onclick=reset;
  by('fullscreen').onclick=()=>{by('fullscreen').blur();doc.documentElement.requestFullscreen?.().catch(()=>{status.textContent='全画面にできません。ブラウザの全画面機能をご利用ください';});};
  win.addEventListener('resize',()=>{fit();if(revealed)fitNames();});doc.addEventListener('fullscreenchange',fit);
  win.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT','BUTTON'].includes(doc.activeElement?.tagName))return;if(e.key==='Enter'||e.key===' '){e.preventDefault();reveal();}if(e.key.toLowerCase()==='f')by('fullscreen').click();if(e.key.toLowerCase()==='r')refresh();});
  if(preview){by('sample').hidden=false;doc.title='デザイン確認用サンプル／優勝発表';}
  fit();refresh();win.setInterval(()=>{if(!revealed)refresh();},15000);
}

if(typeof document!=='undefined')initWinnerSlide();
