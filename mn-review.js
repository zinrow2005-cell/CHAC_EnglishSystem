(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const sourceIds=['monkey','moon','mouth','mushroom','mouse','nose','nurse','net','nest','nail'];
 const KEY='CHAC_MN_AudioReview_V636';
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
 let selected=sourceIds[0],endAt=null,playMode='',animationId=0;
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
  const img=$('wordImage');img.src=`assets/card-art/${encodeURIComponent(id)}.jpg?v=636`;img.alt=`${d.zh}（暫定 ${d.word}）蠟筆插圖`;
  $('saveStatus').textContent='編輯後會自動保存在目前瀏覽器。';showList();updateHeading();drawWave();flash(`候選片段 ${fmt(d.start)}–${fmt(d.end)}。請親自核對原音內容。`);
 }
 function stop(){endAt=null;playMode='';audio.pause();flash('已停止播放。')}
 async function play(a,b,label){
  if(!Number.isFinite(a)||a<0||a>total){flash('開始秒數不合理');return}
  if(b!==null && (!Number.isFinite(b)||b<=a+0.1||b>total+0.1)){flash('結束秒數不合理，請修改');return}
  stop();endAt=b;playMode=label;
  try{
    if(audio.readyState===0) await new Promise((resolve,reject)=>{audio.addEventListener('loadedmetadata',resolve,{once:true});audio.addEventListener('error',reject,{once:true});audio.load()});
    audio.currentTime=a;
    await audio.play();
    flash(`▶ ${label}：從 ${fmt(a)}${b===null?' 播至結束':` 播至 ${fmt(b)}`}`);
  }catch(e){flash('無法播放原始錄音，請確認音檔已完整上傳 GitHub，並在瀏覽器點擊播放。')}
 }
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
