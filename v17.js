(()=>{'use strict';
const body=document.body;
// The image element remains visible and its parent shows a readable fallback.
document.addEventListener('error',event=>{
  const img=event.target;
  if(!(img instanceof HTMLImageElement)||img.dataset.fallbackApplied)return;
  img.dataset.fallbackApplied='1';
  const label=img.getAttribute('alt')||img.getAttribute('src')?.split('/').pop()?.split('.')[0]||'單字圖片';
  const replacement=document.createElement('span');replacement.className='v17-image-fallback';replacement.textContent='🖼️ '+label+'（圖片暫時無法顯示）';
  img.replaceWith(replacement);
},true);
// Pause teacher recording on opening the games, and stop it during page hide (mobile multitask).
document.addEventListener('visibilitychange',()=>{if(document.hidden){document.getElementById('teacherAudio')?.pause();if('speechSynthesis' in window)window.speechSynthesis.cancel()}});
})();
