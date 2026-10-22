(()=>{'use strict';
const $=id=>document.getElementById(id),all=window.PB_DATA.words,overlay=$('v6Overlay'),mainAudio=$('teacherAudio'),audio=new Audio();
let letter='A',index=0,priorFocus=null,teacherSegmentCleanup=null,teacherMetadataCleanup=null,teacherRequest=0,lastSound=null,playEpoch=0,activeKind=null;
function clearTeacherPending(){if(teacherMetadataCleanup){teacherMetadataCleanup();teacherMetadataCleanup=null}if(teacherSegmentCleanup){teacherSegmentCleanup();teacherSegmentCleanup=null}}
const pool=()=>all.filter(w=>w.letter===letter),current=()=>pool()[index],data=()=>{try{return JSON.parse(localStorage.getItem('pb4clips')||'{}')||{}}catch{return {}}};
function edits(){try{return JSON.parse(localStorage.getItem('pbClipEdits37')||'{}')}catch{return {}}}
function groupKey(word){const gs=window.PB_TEACHER_GROUPS||{};for(const key in gs){if(gs[key].includes(word))return gs[key][0]}return word}
function groupNames(word){const gs=window.PB_TEACHER_GROUPS||{};for(const key in gs){if(gs[key].includes(word))return gs[key]}return [word]}
function getRange(word){const c=(window.PB_CLIPS||{})[word];const e=edits()[groupKey(word)];return c?{...c,start:Number(e?.start??c.start),end:Number(e?.end??c.end)}:null}
function updateEditor(){const c=getRange(current()?.word);if(!c){$('v6ClipStart').value='';$('v6ClipEnd').value='';return;}$('v6ClipStart').value=c.start.toFixed(2);$('v6ClipEnd').value=c.end.toFixed(2)}
function notify(message){$('v6Feedback').textContent=message}
function status(message){
 const el=$('v57AudioState');if(el)el.textContent=message;
 const pic=$('v58PictureTap');const speaking=activeKind!==null;
 if(pic){pic.classList.toggle('is-speaking',speaking);pic.setAttribute('aria-busy',String(speaking));
  const hint=pic.querySelector('.v58-picture-hint');if(hint)hint.textContent=speaking?(activeKind==='teacher'?'♫ 老師原音播放中':activeKind==='sentence'?'♫ 正在聽短句':'♫ 單字播放中'):'🔊 點圖片聽單字';}
 const voiceButtons={word:'v6SpeakWord',sentence:'v6SpeakSentence',teacher:'v6Teacher'};
 Object.keys(voiceButtons).forEach(k=>{const btn=$(voiceButtons[k]);if(btn){btn.classList.toggle('is-playing',k===activeKind);btn.setAttribute('aria-pressed',String(k===activeKind))}});
}
function stopSound(){playEpoch++;activeKind=null;teacherRequest++;clearTeacherPending();audio.pause();audio.onended=null;if('speechSynthesis' in window)try{window.speechSynthesis.cancel()}catch(e){};status('已停止播放。')}
function startSound(kind){
 stopSound();const w=current();if(!w)return;
 const ticket=playEpoch;lastSound={kind,word:w.word};activeKind=kind;
 status(kind==='teacher'?'正在播放老師原音…':kind==='sentence'?'正在朗讀完整短句…':'正在朗讀英文單字…');
 if(kind==='teacher')playTeacherClip(ticket);
 else {const success=speak(kind==='sentence'?w.sentence:w.word);if(success===false&&ticket===playEpoch){activeKind=null;status('英文朗讀無法播放，請改聽老師原音。')}}
}
$('v57Replay').onclick=()=>{if(!lastSound||lastSound.word!==current()?.word){status('請先選一種聲音播放。');return}startSound(lastSound.kind)};
$('v57Stop').onclick=stopSound;
window.addEventListener('chac-speech-ended',e=>{if(overlay.hidden||!lastSound||activeKind==='teacher')return;const w=current();const expected=lastSound.kind==='sentence'?w?.sentence:w?.word;if(e.detail?.text!==expected)return;activeKind=null;status('朗讀完成，可以再點圖片重聽。')});
window.addEventListener('chac-speech-failed',e=>{const w=current();if(!overlay.hidden&&activeKind&&activeKind!=='teacher'&&e.detail?.text===(activeKind==='sentence'?w?.sentence:w?.word)){activeKind=null;status('朗讀中斷，請再按一次或改聽老師原音。')}});
$('v58PictureTap').addEventListener('click',()=>startSound('word'));
$('v58PictureTap').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();startSound('word')}});

function speak(text){teacherRequest++;clearTeacherPending();audio.pause();audio.onended=null;if(typeof window.PB_SPEAK_WORD==='function'){const ok=window.PB_SPEAK_WORD(text);notify(ok?'🔊 裝置英文朗讀（不是老師原音）':'請改聽老師完整錄音。');if(!ok)status('英文語音無法播放，請改聽老師原音。');return ok;}if(!('speechSynthesis' in window)){notify('此裝置無法使用合成語音，請改聽老師完整錄音。');return false;}try{window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=Number($('rateSelect').value)||.83;window.speechSynthesis.speak(u);notify('🔊 裝置英文朗讀（不是老師原音）');return true}catch{notify('語音播放失敗，請確認裝置聲音設定。');return false}}
function updateScene(word){const scene=window.PB_SCENES?.[word];const el=$('v46Scene');if(!el)return;el.open=false;const exists=!!scene?.image;el.hidden=!exists;if(!exists)return;$('v46SceneImage').src=scene.image;$('v46SceneImage').alt=scene.title||'短句情境';$('v46SceneTitle').textContent=scene.phrase||scene.title||'';$('v46SceneTip').textContent=scene.tip||''}
let focusPictureEpoch=0;
function draw(){lastSound=null;stopSound();status('點大圖片可直接聽英文單字。');const w=current();if(!w)return;$('v6Position').textContent=`${letter} · ${index+1}/${pool().length}`;const art=$('v6Picture'),pictureToken=++focusPictureEpoch;
 art.style.visibility='hidden';art.onload=()=>{if(pictureToken===focusPictureEpoch)art.style.visibility='visible'};
 art.onerror=()=>{if(pictureToken!==focusPictureEpoch)return;art.onerror=null;art.src=`assets/game-pictures/${encodeURIComponent(w.word)}.jpg?v=627`};
 art.src=`assets/card-art/${encodeURIComponent(w.word)}.jpg?v=627`;$('v6Picture').alt=`${w.zh}：${w.word}`;const upcoming=pool()[index+1];if(upcoming){const preload=new Image();preload.src=`assets/card-art/${encodeURIComponent(upcoming.word)}.jpg?v=627`;}$('v6Word').textContent=w.word;$('v6Zh').textContent=w.zh;$('v6Sentence').textContent=w.sentence;$('v6Translation').textContent=w.translation;updateScene(w.word);$('v6Prev').disabled=index===0;$('v6Next').querySelector('.button-label').textContent=index===pool().length-1?'完成這個字母 ✓':'下一個 →';$('v6Teacher').querySelector('.button-label').textContent=groupNames(w.word).length>1?'老師前兩字共同教學':'老師單字片段';$('v6Mark').querySelector('.button-label').textContent=(JSON.parse(localStorage.getItem('pbDone')||'[]').includes(w.word))?'已學會':'我學會了';updateEditor();const dialog=overlay.querySelector('.v6-dialog');if(dialog)dialog.scrollTop=0;notify(groupNames(w.word).length>1?'此字母前兩張卡共用老師原音教學；不是單獨的單字發音。':'先看圖片，再點「聽單字」跟讀。')}
function open(){mainAudio.pause();const active=document.querySelector('.letter.active');letter=active?.textContent?.trim()?.[0]?.toUpperCase()||'A';index=0;priorFocus=document.activeElement;overlay.hidden=false;document.body.classList.add('modal-open');draw();$('v6Close').focus()}
function close(){lastSound=null;stopSound();overlay.hidden=true;document.body.classList.remove('modal-open');if('speechSynthesis'in window)window.speechSynthesis.cancel();priorFocus?.focus()}
$('v6Open').onclick=open;$('v6Close').onclick=close;
overlay.addEventListener('click',e=>{if(e.target===overlay)close()});document.addEventListener('keydown',e=>{if(overlay.hidden)return;if(e.key==='Escape')close();if(e.key==='Tab'){let controls=Array.from(overlay.querySelectorAll('button:not(:disabled)'));let first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
$('v6SpeakWord').onclick=()=>startSound('word');$('v6SpeakSentence').onclick=()=>startSound('sentence');
$('v6Prev').onclick=()=>{if(index>0){index--;draw()}};$('v6Next').onclick=()=>{if(index<pool().length-1){index++;draw()}else{notify(`🎉 ${letter} 字母完成！你可以再複習一次，或離開選下一個字母。`);index=0;draw();notify(`🎉 ${letter} 字母完成！已回到第一張，可以重新練習。`)}};
$('v6Mark').onclick=()=>{let w=current();let done=[];try{done=JSON.parse(localStorage.getItem('pbDone')||'[]')}catch{}if(!done.includes(w.word)){done.push(w.word);localStorage.setItem('pbDone',JSON.stringify(done));$('v6Mark').querySelector('.button-label').textContent='已學會';window.dispatchEvent(new Event('pb-progress-changed'));notify(`太棒了！${w.word} 已存到本機學習紀錄。`)}else notify('這個字已經在學會清單裡了。')};
function showTeacherFinished(message='老師原音播放完成。'){
 activeKind=null;status(message);notify(message);
}
function allowedRange(word, start, end){
 const c=(window.PB_CLIPS||{})[word];
 if(!c||!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start+0.5)return false;
 const max=(window.CHAC_AUDIO_DURATIONS||{})[c.source];
 return end<=((Number.isFinite(max)?max:c.end+15)+0.02);
}
function playRange(override){
 const w=current();if(!w)return;
 const c=override?{...getRange(w.word),...override}:getRange(w.word);
 teacherRequest++;const ticket=teacherRequest, epoch=playEpoch;
 clearTeacherPending();audio.pause();audio.onended=null;audio.onerror=null;
 if(!c||!allowedRange(w.word,c.start,c.end)){activeKind=null;status('錄音秒數不合理，請重新檢查。');notify('錄音邊界超出音檔，請重新調整。');return}
 activeKind='teacher';status('正在播放老師原音…');
 const src=`audio/${c.source}.m4a`;
 const valid=()=>ticket===teacherRequest&&epoch===playEpoch&&!overlay.hidden&&current()?.word===w.word;
 const finish=()=>{
  if(!valid())return;
  audio.pause();clearTeacherPending();audio.onended=null;audio.onerror=null;
  showTeacherFinished();
 };
 const stop=()=>{if(valid()&&audio.currentTime>=c.end-0.035)finish()};
 const play=()=>{
  if(!valid())return;
  audio.currentTime=c.start;
  audio.addEventListener('timeupdate',stop);
  teacherSegmentCleanup=()=>audio.removeEventListener('timeupdate',stop);
  audio.onended=finish;
  audio.onerror=()=>{if(valid()){activeKind=null;status('原始錄音載入失敗。');notify('請確認完整原音檔是否已上傳。')}};
  audio.play().then(()=>{if(valid())notify(groupNames(w.word).length>1?'👩‍🏫 前兩字共同教學；停頓切點已微調，內容仍待人工聽音。':'👩‍🏫 錄音以停頓位置修正，仍待人工聽音確認。')}).catch(()=>{if(valid()){activeKind=null;status('音檔無法播放。');notify('請再按一次播放，並檢查裝置是否允許聲音。')}});
 };
 if(!audio.src.endsWith(src)){audio.src=src;audio.load()}
 if(audio.readyState>=1)play();else{
  const cb=()=>{audio.removeEventListener('loadedmetadata',cb);teacherMetadataCleanup=null;play()};
  audio.addEventListener('loadedmetadata',cb);
  teacherMetadataCleanup=()=>audio.removeEventListener('loadedmetadata',cb);
 }
}
function playTeacherClip(epoch){
 if('speechSynthesis' in window)try{window.speechSynthesis.cancel()}catch(e){}
 const w=current(),clip=window.CHAC_SEGMENTS?.[w?.word];
 teacherRequest++;const ticket=teacherRequest;
 clearTeacherPending();audio.pause();audio.onended=null;audio.onerror=null;
 if(edits()[groupKey(w?.word)]){playRange();return}
 if(!clip){activeKind=null;status('此單字尚無老師錄音片段。');notify('可改聽完整課堂錄音。');return}
 audio.src=clip.file;audio.load();
 const valid=()=>ticket===teacherRequest&&epoch===playEpoch&&!overlay.hidden&&current()?.word===w.word;
 audio.onended=()=>{if(valid())showTeacherFinished()};
 audio.onerror=()=>{if(valid()){activeKind=null;status('音檔無法播放。');notify('老師片段無法載入，請確認媒體檔案。')}};
 audio.play().then(()=>{if(valid())notify(groupNames(w.word).length>1?'正在播放前兩字共同教學（音檔切點已依停頓調整）。':'正在播放老師錄音（停頓切點已調整，內容待聽音）。')}).catch(()=>{if(valid()){activeKind=null;status('音檔無法播放。');notify('請再按一次，或檢查 GitHub 媒體是否完整。')}});
}
$('v6Teacher').onclick=()=>startSound('teacher');
function inputRange(){
 const w=current();if(!w)return null;
 const a=Number($('v6ClipStart').value),b=Number($('v6ClipEnd').value);
 if(!allowedRange(w.word,a,b)){notify('請輸入合理的開始及結束秒數。');return null}
 return {start:a,end:b};
}
function auditionBoundary(edge){
 const c=inputRange();if(!c)return;
 const t=edge==='start'?{start:Math.max(0,c.start-1.5),end:Math.min(c.end,c.start+3.5)}:{start:Math.max(c.start,c.end-3.5),end:Math.min((window.CHAC_AUDIO_DURATIONS||{})[(window.PB_CLIPS||{})[current().word].source]||c.end+1.5,c.end+1.5)};
 playRange(t);
}
$('v52StartBoundary').onclick=()=>auditionBoundary('start');
$('v52EndBoundary').onclick=()=>auditionBoundary('end');
$('v6ClipPreview').onclick=()=>{const c=inputRange();if(c)playRange(c)};
$('v6ClipSave').onclick=()=>{
 const c=inputRange();if(!c)return;
 const existing=edits();existing[groupKey(current().word)]=c;
 localStorage.setItem('pbClipEdits37',JSON.stringify(existing));
 notify(`✅ 已儲存 ${groupNames(current().word).join(' + ')} 的時間設定；可重播測試。`);
};
$('v6ClipReset').onclick=()=>{
 const e=edits();delete e[groupKey(current().word)];localStorage.setItem('pbClipEdits37',JSON.stringify(e));
 stopSound();updateEditor();notify('已恢復本版停頓校正的預設片段。');
};
})();
