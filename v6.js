(()=>{'use strict';
const $=id=>document.getElementById(id),all=window.PB_DATA.words,overlay=$('v6Overlay'),mainAudio=$('teacherAudio'),audio=new Audio();
let letter='A',index=0,priorFocus=null,teacherSegmentCleanup=null,teacherMetadataCleanup=null,teacherRequest=0,lastSound=null,playEpoch=0,activeKind=null;
function clearTeacherPending(){if(teacherMetadataCleanup){teacherMetadataCleanup();teacherMetadataCleanup=null}if(teacherSegmentCleanup){teacherSegmentCleanup();teacherSegmentCleanup=null}}
const pool=()=>all.filter(w=>w.letter===letter),current=()=>pool()[index],data=()=>{try{return JSON.parse(localStorage.getItem('pb4clips')||'{}')||{}}catch{return {}}};
function edits(){try{return JSON.parse(localStorage.getItem('pbClipEdits37')||'{}')}catch{return {}}}
function groupKey(word){const gs=window.PB_TEACHER_GROUPS||{};for(const key in gs){if(gs[key].includes(word))return gs[key][0]}return word}
function groupNames(word){const gs=window.PB_TEACHER_GROUPS||{};for(const key in gs){if(gs[key].includes(word))return gs[key]}return [word]}
function getRange(word){const c=(window.PB_CLIPS||{})[word];const e=edits()[groupKey(word)];return c?{...c,start:Number(e?.start??c.start),end:Number(e?.end??c.end)}:null}
function updateEditor(){const c=getRange(current()?.word);if(!c)return;$('v6ClipStart').value=c.start.toFixed(2);$('v6ClipEnd').value=c.end.toFixed(2)}
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
function draw(){lastSound=null;stopSound();status('點大圖片可直接聽英文單字。');const w=current();if(!w)return;$('v6Position').textContent=`${letter} · ${index+1}/${pool().length}`;$('v6Picture').src=`assets/words/${w.word}.jpg`;$('v6Picture').alt=`${w.zh}：${w.word}`;const upcoming=pool()[index+1];if(upcoming){const preload=new Image();preload.src=`assets/words/${upcoming.word}.jpg`;}$('v6Word').textContent=w.word;$('v6Zh').textContent=w.zh;$('v6Sentence').textContent=w.sentence;$('v6Translation').textContent=w.translation;updateScene(w.word);$('v6Prev').disabled=index===0;$('v6Next').querySelector('.button-label').textContent=index===pool().length-1?'完成這個字母 ✓':'下一個 →';$('v6Teacher').querySelector('.button-label').textContent=groupNames(w.word).length>1?'老師前兩字共同教學':'老師單字片段';$('v6Mark').querySelector('.button-label').textContent=(JSON.parse(localStorage.getItem('pbDone')||'[]').includes(w.word))?'已學會':'我學會了';updateEditor();const dialog=overlay.querySelector('.v6-dialog');if(dialog)dialog.scrollTop=0;notify(groupNames(w.word).length>1?'此字母前兩張卡共用老師原音教學；不是單獨的單字發音。':'先看圖片，再點「聽單字」跟讀。')}
function open(){mainAudio.pause();const active=document.querySelector('.letter.active');letter=active?.textContent?.trim()?.[0]?.toUpperCase()||'A';index=0;priorFocus=document.activeElement;overlay.hidden=false;document.body.classList.add('modal-open');draw();$('v6Close').focus()}
function close(){lastSound=null;stopSound();overlay.hidden=true;document.body.classList.remove('modal-open');if('speechSynthesis'in window)window.speechSynthesis.cancel();priorFocus?.focus()}
$('v6Open').onclick=open;$('v6Close').onclick=close;
overlay.addEventListener('click',e=>{if(e.target===overlay)close()});document.addEventListener('keydown',e=>{if(overlay.hidden)return;if(e.key==='Escape')close();if(e.key==='Tab'){let controls=Array.from(overlay.querySelectorAll('button:not(:disabled)'));let first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
$('v6SpeakWord').onclick=()=>startSound('word');$('v6SpeakSentence').onclick=()=>startSound('sentence');
$('v6Prev').onclick=()=>{if(index>0){index--;draw()}};$('v6Next').onclick=()=>{if(index<pool().length-1){index++;draw()}else{notify(`🎉 ${letter} 字母完成！你可以再複習一次，或離開選下一個字母。`);index=0;draw();notify(`🎉 ${letter} 字母完成！已回到第一張，可以重新練習。`)}};
$('v6Mark').onclick=()=>{let w=current();let done=[];try{done=JSON.parse(localStorage.getItem('pbDone')||'[]')}catch{}if(!done.includes(w.word)){done.push(w.word);localStorage.setItem('pbDone',JSON.stringify(done));$('v6Mark').querySelector('.button-label').textContent='已學會';window.dispatchEvent(new Event('pb-progress-changed'));notify(`太棒了！${w.word} 已存到本機學習紀錄。`)}else notify('這個字已經在學會清單裡了。')};
function playRange(override){
 const w=current(),c=override?{...getRange(w?.word),...override}:getRange(w?.word);
 teacherRequest++;const ticket=teacherRequest;clearTeacherPending();audio.pause();audio.onended=null;
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
function playTeacherClip(epoch){
 if('speechSynthesis' in window)try{window.speechSynthesis.cancel()}catch(e){}
 const w=current(),clip=window.CHAC_SEGMENTS?.[w?.word];
 teacherRequest++;const ticket=teacherRequest;clearTeacherPending();audio.pause();
 const edited=edits()[groupKey(w?.word)];
 if(edited){playRange();return}
 if(!clip){notify('尚無老師候選片段，請使用時間微調預聽。');return}
 // The teaching clip is a standalone file, so old Safari need not seek into a long recording.
 audio.src=clip.file;audio.load();
 audio.onended=()=>{if(ticket===teacherRequest&&epoch===playEpoch){activeKind=null;notify('老師片段播放完成。');status('老師原音播放完成。')}};
 audio.play().then(()=>{if(ticket===teacherRequest)notify(groupNames(w.word).length>1?'正在播放前兩字共同教學（切點待確認）。':'正在播放老師教學片段（切點待確認）。')}).catch(()=>{if(ticket===teacherRequest&&epoch===playEpoch){activeKind=null;notify('老師片段無法播放，請確認網路或再按一次。');status('音檔無法播放。')}});
}
$('v6Teacher').onclick=()=>startSound('teacher');
function auditionBoundary(edge){
 const c=getRange(current()?.word);if(!c)return;
 const t=edge==='start'?{start:Math.max(0,c.start-1.5),end:Math.min(c.end,c.start+3.5)}:{start:Math.max(c.start,c.end-3.5),end:c.end+1.5};
 playRange(t);
}
$('v52StartBoundary').onclick=()=>auditionBoundary('start');
$('v52EndBoundary').onclick=()=>auditionBoundary('end');
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
