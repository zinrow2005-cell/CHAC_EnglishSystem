(()=>{'use strict';
const $=id=>document.getElementById(id),all=window.PB_DATA.words,overlay=$('v6Overlay'),mainAudio=$('teacherAudio'),audio=new Audio();
let letter='A',index=0,priorFocus=null,teacherSegmentCleanup=null,teacherMetadataCleanup=null,teacherRequest=0;
function clearTeacherPending(){if(teacherMetadataCleanup){teacherMetadataCleanup();teacherMetadataCleanup=null}if(teacherSegmentCleanup){teacherSegmentCleanup();teacherSegmentCleanup=null}}
const pool=()=>all.filter(w=>w.letter===letter),current=()=>pool()[index],data=()=>{try{return JSON.parse(localStorage.getItem('pb4clips')||'{}')||{}}catch{return {}}};
function edits(){try{return JSON.parse(localStorage.getItem('pbClipEdits37')||'{}')}catch{return {}}}
function groupKey(word){const gs=window.PB_TEACHER_GROUPS||{};for(const key in gs){if(gs[key].includes(word))return gs[key][0]}return word}
function groupNames(word){const gs=window.PB_TEACHER_GROUPS||{};for(const key in gs){if(gs[key].includes(word))return gs[key]}return [word]}
function getRange(word){const c=(window.PB_CLIPS||{})[word];const e=edits()[groupKey(word)];return c?{...c,start:Number(e?.start??c.start),end:Number(e?.end??c.end)}:null}
function updateEditor(){const c=getRange(current()?.word);if(!c)return;$('v6ClipStart').value=c.start.toFixed(2);$('v6ClipEnd').value=c.end.toFixed(2)}
function notify(message){$('v6Feedback').textContent=message}
function speak(text){if(typeof window.PB_SPEAK_WORD==='function'){const ok=window.PB_SPEAK_WORD(text);notify(ok?'🔊 裝置英文朗讀（不是老師原音）':'請改聽老師完整錄音。');return;}if(!('speechSynthesis' in window)){notify('此裝置無法使用合成語音，請改聽老師完整錄音。');return;}try{window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=Number($('rateSelect').value)||.83;window.speechSynthesis.speak(u);notify('🔊 裝置英文朗讀（不是老師原音）')}catch{notify('語音播放失敗，請確認裝置聲音設定。')}}
function updateScene(word){const scene=window.PB_SCENES?.[word];const el=$('v46Scene');if(!el)return;el.open=false;const exists=!!scene?.image;el.hidden=!exists;if(!exists)return;$('v46SceneImage').src=scene.image;$('v46SceneImage').alt=scene.title||'短句情境';$('v46SceneTitle').textContent=scene.phrase||scene.title||'';$('v46SceneTip').textContent=scene.tip||''}
function draw(){teacherRequest++;clearTeacherPending();audio.pause();const w=current();if(!w)return;$('v6Position').textContent=`${letter} · ${index+1}/${pool().length}`;$('v6Picture').src=`assets/words/${w.word}.jpg`;$('v6Picture').alt=`${w.zh}：${w.word}`;$('v6Word').textContent=w.word;$('v6Zh').textContent=w.zh;$('v6Sentence').textContent=w.sentence;$('v6Translation').textContent=w.translation;updateScene(w.word);$('v6Prev').disabled=index===0;$('v6Next').querySelector('.button-label').textContent=index===pool().length-1?'完成這個字母 ✓':'下一個 →';$('v6Teacher').querySelector('.button-label').textContent=groupNames(w.word).length>1?'老師前兩字共同教學':'老師單字片段';$('v6Mark').querySelector('.button-label').textContent=(JSON.parse(localStorage.getItem('pbDone')||'[]').includes(w.word))?'已學會':'我學會了';updateEditor();notify(groupNames(w.word).length>1?'此字母前兩張卡共用老師原音教學；不是單獨的單字發音。':'先看圖片，再點「聽單字」跟讀。')}
function open(){mainAudio.pause();const active=document.querySelector('.letter.active');letter=active?.textContent?.trim()?.[0]?.toUpperCase()||'A';index=0;priorFocus=document.activeElement;overlay.hidden=false;document.body.classList.add('modal-open');draw();$('v6Close').focus()}
function close(){teacherRequest++;clearTeacherPending();audio.pause();overlay.hidden=true;document.body.classList.remove('modal-open');if('speechSynthesis'in window)window.speechSynthesis.cancel();priorFocus?.focus()}
$('v6Open').onclick=open;$('v6Close').onclick=close;
overlay.addEventListener('click',e=>{if(e.target===overlay)close()});document.addEventListener('keydown',e=>{if(overlay.hidden)return;if(e.key==='Escape')close();if(e.key==='Tab'){let controls=Array.from(overlay.querySelectorAll('button:not(:disabled)'));let first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
$('v6SpeakWord').onclick=()=>speak(current().word);$('v6SpeakSentence').onclick=()=>speak(current().sentence);
$('v6Prev').onclick=()=>{if(index>0){index--;draw()}};$('v6Next').onclick=()=>{if(index<pool().length-1){index++;draw()}else{notify(`🎉 ${letter} 字母完成！你可以再複習一次，或離開選下一個字母。`);index=0;draw();notify(`🎉 ${letter} 字母完成！已回到第一張，可以重新練習。`)}};
$('v6Mark').onclick=()=>{let w=current();let done=[];try{done=JSON.parse(localStorage.getItem('pbDone')||'[]')}catch{}if(!done.includes(w.word)){done.push(w.word);localStorage.setItem('pbDone',JSON.stringify(done));$('v6Mark').querySelector('.button-label').textContent='已學會';window.dispatchEvent(new Event('pb-progress-changed'));notify(`太棒了！${w.word} 已存到本機學習紀錄。`)}else notify('這個字已經在學會清單裡了。')};
function playRange(override){
 const w=current(),c=override?{...getRange(w?.word),...override}:getRange(w?.word);
 teacherRequest++;const ticket=teacherRequest;clearTeacherPending();audio.pause();
 if(!c){notify('尚無對應錄音');return}
 if(!(c.end>c.start+0.5)){notify('結束時間必須大於開始時間至少 0.5 秒。');return}
 const src=`audio/${c.source}.m4a`;
 const stop=()=>{if(ticket!==teacherRequest)return;if(audio.currentTime>=c.end-0.04){audio.pause();clearTeacherPending()}};
 const play=()=>{if(ticket!==teacherRequest||overlay.hidden||current()?.word!==w.word)return;
  audio.currentTime=c.start;audio.addEventListener('timeupdate',stop);teacherSegmentCleanup=()=>audio.removeEventListener('timeupdate',stop);
  audio.play().catch(()=>notify('播放失敗，請再按一次。'));
  notify(groupNames(w.word).length>1?'👩‍🏫 本字母前兩個單字共用同一段教學。切點尚未經逐字核對。':'👩‍🏫 老師原音按教材與停頓定位，切點尚未經逐字核對。');
 };
 if(!audio.src.endsWith(src)){audio.src=src;audio.load()}
 if(audio.readyState>=1)play();else{const cb=()=>{audio.removeEventListener('loadedmetadata',cb);teacherMetadataCleanup=null;play()};audio.addEventListener('loadedmetadata',cb);teacherMetadataCleanup=()=>audio.removeEventListener('loadedmetadata',cb)}
}
$('v6Teacher').onclick=()=>{updateEditor();playRange()};
$('v6ClipPreview').onclick=()=>{
 const a=Number($('v6ClipStart').value),b=Number($('v6ClipEnd').value),c=(window.PB_CLIPS||{})[current().word];
 if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<=a+.5||b>c.end+15){notify('請檢查起點與終點秒數。');return}
 playRange({start:a,end:b});
};
$('v6ClipSave').onclick=()=>{
 const a=Number($('v6ClipStart').value),b=Number($('v6ClipEnd').value),c=(window.PB_CLIPS||{})[current().word];
 if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<=a+.5||b>c.end+15){notify('時間不合理，請重新輸入。');return}
 const existing=edits();existing[groupKey(current().word)]={start:a,end:b};localStorage.setItem('pbClipEdits37',JSON.stringify(existing));notify(`✅ 已儲存 ${groupNames(current().word).join(' + ')} 的共同調整秒數`);
};
$('v6ClipReset').onclick=()=>{const e=edits();delete e[groupKey(current().word)];localStorage.setItem('pbClipEdits37',JSON.stringify(e));updateEditor();notify('已恢復此單字預設片段。')};
})();
