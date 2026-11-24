(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const sourceIds=['monkey','moon','mouth','mushroom','mouse','nose','nurse','net','nest','nail'];
 const KEY='CHAC_MN_AudioReview_V636'; // keep key for draft compatibility
 const total=191.125333;
 const source = window.PB_DATA?.words || [];
 const base = Object.fromEntries(sourceIds.map(id=>{
   const word = source.find(w=>w.word===id);
   const cut = window.PB_CLIPS?.[id] || {};
   return [id,{sourceWord:id,letter:word?.letter||'',word:word?.word||id,zh:word?.zh||'',sentence:word?.sentence||'',translation:word?.translation||'',start:Number(cut.start)||0,end:Number(cut.end)||total,notes:'',confirmed:false,confirmedAt:null}];
 }));
 function safeRead(){try{const obj=JSON.parse(localStorage.getItem(KEY)||'null');return obj&&typeof obj==='object'?obj:null}catch{return null}}
 function safeSave(){try{localStorage.setItem(KEY,JSON.stringify({words:drafts,updatedAt:new Date().toISOString()}));$('saveStatus').textContent='✓ 目前修改已存到這台裝置。'}catch{$('saveStatus').textContent='目前瀏覽器無法保存草稿，請使用匯出 JSON 備份。'}}
 let drafts={...base}; const old=safeRead();
 if(old?.words){for(const id of sourceIds){if(old.words[id]&&typeof old.words[id]==='object')drafts[id]={...base[id],...old.words[id],sourceWord:id};}}
 let selected=sourceIds[0],endAt=null,playMode='',animationId=0, playbackToken=0, imageEpoch=0;
 const audio=$('originalAudio');
 function fmt(secs){secs=Math.max(0,Number(secs)||0);return `${Math.floor(secs/60)}:${String(Math.floor(secs%60)).padStart(2,'0')}`}
 function validateCut(d){return Number.isFinite(Number(d.start))&&Number.isFinite(Number(d.end))&&Number(d.start)>=0&&Number(d.end)<=total+0.08&&Number(d.end)>Number(d.start)+0.3}
 function flash(text){$('audioStatus').textContent=text}
 function readForm(){const d=drafts[selected];['word','zh','sentence','translation','notes'].forEach(k=>d[k]=$(k).value.trim());d.start=Number($('start').value);d.end=Number($('end').value)}
 function saveForm(){readForm();safeSave();showList();updateHeading();drawWave()}
 function showList(){
  const root=$('wordList'); root.replaceChildren();
  for(const id of sourceIds){const d=drafts[id],b=document.createElement('button');b.className=`item${id===selected?' active':''}${d.confirmed?' reviewed':''}`;b.type='button';b.setAttribute('aria-pressed',String(id===selected));
   const label=document.createElement('span');label.textContent=`${d.letter} · ${d.word}`;
   const mark=document.createElement('small');mark.className='dot';mark.textContent=d.confirmed?'✓ 已核對':'待核對';b.append(label,mark);b.addEventListener('click',()=>choose(id));root.append(b);
  }
  $('progress').textContent=`已核對 ${sourceIds.filter(id=>drafts[id].confirmed).length} / ${sourceIds.length}`;
 }
 function updateHeading(){const d=drafts[selected];$('wordHeading').textContent=`${d.letter}${d.letter.toLowerCase()} · ${d.word}`;$('wordState').textContent=d.confirmed?'✓ 人工已核對':'⚠️ 暫定教材（待核對）'}
 function choose(id){ if(!sourceIds.includes(id))return;stop(); selected=id;const d=drafts[id];
  for(const k of ['word','zh','sentence','translation','notes','start','end'])$(k).value= d[k];
  const img=$('wordImage'), picStatus=$('imageStatus'), epoch=++imageEpoch;
  img.alt=`${d.zh}（暫定 ${d.word}）蠟筆插圖`;
  picStatus.classList.remove('is-error');picStatus.textContent='正在載入圖片…';
  img.onload=()=>{if(epoch!==imageEpoch)return;picStatus.classList.remove('is-error');picStatus.textContent='✓ 圖片已載入';};
  let usingFallback=false;
  img.onerror=()=>{if(epoch!==imageEpoch)return;
    if(!usingFallback){usingFallback=true;picStatus.textContent='主圖未載入，嘗試遊戲備用圖…';img.src=`assets/game-pictures/${encodeURIComponent(id)}.jpg?v=637`;}
    else{picStatus.classList.add('is-error');picStatus.textContent=`✕ 找不到 ${id} 圖片；請上傳 assets/card-art/${id}.jpg 及 assets/game-pictures/${id}.jpg`;img.removeAttribute('src');}
  };
  img.removeAttribute('src');img.src=`assets/card-art/${encodeURIComponent(id)}.jpg?v=637`;
  $('saveStatus').textContent='編輯後會自動保存在目前瀏覽器。';showList();updateHeading();drawWave();flash(`候選片段 ${fmt(d.start)}–${fmt(d.end)}。請親自核對原音內容。`);
 }
 function stop(){playbackToken++;endAt=null;playMode='';audio.pause();audio.muted=false;flash('已停止播放。')}
 // Always start play() *inside the user's click handler*. Awaiting metadata first loses
 // Safari's transient user gesture and may reject audio playback.
 function play(a,b,label){
  if(!Number.isFinite(a)||a<0||a>total){flash('開始秒數不合理');return}
  if(b!==null && (!Number.isFinite(b)||b<=a+0.1||b>total+0.1)){flash('結束秒數不合理，請修改');return}
  stop();const token=playbackToken;endAt=b;playMode=label;
  let waitingForSeek=audio.readyState<1;
  if(waitingForSeek && a>0)audio.muted=true;
  const seek=()=>{
    if(token!==playbackToken)return;
    try{audio.currentTime=a;}catch(e){flash('正在定位錄音片段，請使用下方原生播放控制嘗試播放。');return}
    if(waitingForSeek&&a>0){
      const onSeeked=()=>{if(token===playbackToken)audio.muted=false};
      audio.addEventListener('seeked',onSeeked,{once:true});
      // Some mobile media implementations don't dispatch seeked when the target is buffered.
      if(Math.abs(audio.currentTime-a)<0.15)audio.muted=false;
    }
    waitingForSeek=false;
  };
  if(waitingForSeek)audio.addEventListener('loadedmetadata',seek,{once:true});
  else seek();
  let pending;
  try{pending=audio.play();}catch(e){flash(`播放被瀏覽器阻擋（${e.name||'Error'}）。請點原音播放器的 ▶，或按「直接開啟老師原始錄音」。`);return}
  flash(`▶ 正在載入並播放 ${label}，目標 ${fmt(a)}${b===null?' 至結束':`–${fmt(b)}`}…`);
  if(pending&&typeof pending.then==='function')pending.then(()=>{
    if(token===playbackToken)flash(`▶ 正在播放 ${label}：${fmt(a)}${b===null?' 至結束':`–${fmt(b)}`}`);
  }).catch(e=>{
    if(token!==playbackToken)return;
    audio.muted=false;
    const msg=e?.name==='NotAllowedError'?'瀏覽器阻擋播放，請點播放器內的 ▶ 鍵。':
      `無法播放（${e?.name||'Error'}），可能是 audio/MN.m4a 未上傳或網址有誤。請按上方資源檢查。`;
    flash(msg);
  });
 }
 audio.addEventListener('error',()=>{
   const code=audio.error?.code||0;
   if(code)flash(`✕ 錄音載入錯誤（MediaError ${code}）：檢查 audio/MN.m4a 是否在 GitHub 與 index.html 同一層級下的 audio 資料夾。`);
 });
 function currentCut(){saveForm();const d=drafts[selected];if(!validateCut(d)){flash('開始與結束秒數無效：必須介於 0～191.13 秒，結束需晚於開始。');return null}return d}
 $('playClip').addEventListener('click',()=>{const d=currentCut();if(d)play(d.start,d.end,`${d.word} 候選片段`)});
 $('playStart').addEventListener('click',()=>{const d=currentCut();if(d)play(Math.max(0,d.start-2),Math.min(total,d.start+3.5),`${d.word} 開頭前後`)});
 $('playEnd').addEventListener('click',()=>{const d=currentCut();if(d)play(Math.max(0,d.end-3.5),Math.min(total,d.end+2),`${d.word} 結尾前後`)});
 $('playAll').addEventListener('click',()=>play(0,null,'M–N 完整原音'));
 $('stopAudio').addEventListener('click',stop);
 audio.addEventListener('timeupdate',()=>{if(endAt!==null && audio.currentTime>=endAt-0.04){stop()};drawWave()});
 audio.addEventListener('ended',()=>{endAt=null;flash('播放結束。');drawWave()});
 for(const id of ['word','zh','sentence','translation','notes','start','end']) $(id).addEventListener('input',()=>{const d=drafts[selected];if(d.confirmed){d.confirmed=false;d.confirmedAt=null}saveForm()});
 $('confirm').addEventListener('click',()=>{
  const d=currentCut();if(!d)return;
  if(!d.word||!d.zh||!d.sentence){$('saveStatus').textContent='請先完成英文單字、中文意思及老師短語，再標示已核對。';return}
  d.confirmed=true;d.confirmedAt=new Date().toISOString();safeSave();showList();updateHeading();$('saveStatus').textContent='✓ 已標記人工核對。請記得匯出 JSON，以供正式版整合。';
 });
 $('unconfirm').addEventListener('click',()=>{const d=drafts[selected];d.confirmed=false;d.confirmedAt=null;safeSave();showList();updateHeading()});
 $('prevWord').addEventListener('click',()=>choose(sourceIds[(sourceIds.indexOf(selected)+sourceIds.length-1)%sourceIds.length]));
 $('nextWord').addEventListener('click',()=>choose(sourceIds[(sourceIds.indexOf(selected)+1)%sourceIds.length]));
 $('exportBtn').addEventListener('click',()=>{
   saveForm();
   const result={schema:'CHAC-MN-Review-1',baselineVersion:'63.5',reviewerVersion:'63.6',originalAudio:'audio/MN.m4a',audioDuration:total,exportedAt:new Date().toISOString(),reviewCount:sourceIds.filter(id=>drafts[id].confirmed).length,words:sourceIds.map(id=>({...drafts[id]}))};
   const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='CHAC_MN_老師原音核對結果.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   $('saveStatus').textContent='已產生 JSON 檔；下載後可上傳到 ChatGPT 供下一版正式整合。';
 });
 $('importBtn').addEventListener('click',()=>$('importFile').click());
 $('importFile').addEventListener('change',async e=>{
   const file=e.target.files?.[0];if(!file)return;
   try{
    const result=JSON.parse(await file.text());
    if(result.schema!=='CHAC-MN-Review-1'||!Array.isArray(result.words))throw Error('檔案格式不符');
    for(const w of result.words){const id=w.sourceWord;if(sourceIds.includes(id)&&w&&typeof w==='object'){drafts[id]={...base[id],...w,sourceWord:id};}}
    safeSave();choose(selected);$('saveStatus').textContent='已匯入先前核對結果（本機草稿已更新）。';
   }catch(err){$('saveStatus').textContent='匯入失敗：請選擇由本核對頁匯出的 JSON。'}
   e.target.value='';
 });

 async function verifyOne(path){
   try{const res=await fetch(path,{cache:'no-store'});return res.ok?{ok:true,status:res.status}:{ok:false,status:res.status};}
   catch(e){return{ok:false,status:'網路連線或網站路徑失敗'}}
 }
 $('checkAssets').addEventListener('click',async()=>{
   const report=$('assetReport');const btn=$('checkAssets');btn.disabled=true;
   report.textContent='正在逐張檢查圖片及老師原音檔…';
   try{
     const items=[...sourceIds.map(id=>`assets/card-art/${id}.jpg?v=637`),'audio/MN.m4a?v=637'];
     const results=await Promise.all(items.map(verifyOne));
     const missing=items.filter((_,i)=>!results[i].ok).map((path,i)=>path+'（'+results[items.indexOf(path)].status+'）');
     const imgs=results.slice(0,10).filter(x=>x.ok).length, sound=results[10].ok;
     report.textContent=`圖片：${imgs}/10；完整錄音：${sound?'已找到':'找不到'}。`+
       (missing.length?'\n缺少或無法讀取：\n'+missing.join('\n'):'\n✓ 所有 M–N 主圖與完整原音都可以從目前網站取得。若仍無聲，請點原音播放器 ▶ 檢查裝置音量與播放權限。');
   }finally{btn.disabled=false}
 });

 const canvas=$('wave'),ctx=canvas.getContext('2d');
 function drawWave(){
  if(!ctx)return;
  const rect=canvas.getBoundingClientRect(),width=Math.round(rect.width*window.devicePixelRatio)||900,height=Math.round(rect.height*window.devicePixelRatio)||115;
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
  ctx.clearRect(0,0,width,height);ctx.fillStyle='#f3f7fb';ctx.fillRect(0,0,width,height);
  const wave=window.MN_WAVEFORM||[];const half=height/2;
  ctx.strokeStyle='#4386bd';ctx.lineWidth=Math.max(1,width/1400);
  for(let x=0;x<width;x++){
    const idx=Math.floor(x/width*wave.length),amp=Number(wave[Math.min(wave.length-1,idx)])||0;
    ctx.beginPath();ctx.moveTo(x,half-amp*half*.87);ctx.lineTo(x,half+amp*half*.87);ctx.stroke();
  }
  const d=drafts[selected];
  if(d){const left=Math.max(0,Math.min(1,d.start/total))*width,right=Math.max(0,Math.min(1,d.end/total))*width;
    ctx.fillStyle='rgba(245,172,55,0.27)';ctx.fillRect(left,0,right-left,height);
    ctx.strokeStyle='#e79b20';ctx.lineWidth=2;for(const x of [left,right]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
  }
  if(Number.isFinite(audio.currentTime)){const x=Math.min(1,audio.currentTime/total)*width;ctx.strokeStyle='#d34f52';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
 }
 canvas.addEventListener('click',event=>{const r=canvas.getBoundingClientRect(),seconds=Math.min(total,Math.max(0,(event.clientX-r.left)/r.width*total));play(seconds,null,`波形跳到 ${fmt(seconds)}`)});
 window.addEventListener('resize',drawWave);
 showList();choose(selected);
})();
