(()=>{'use strict';
// Keep the original IMG element in the DOM. Removing it breaks focus-card updates
// after intermittent offline / GitHub Pages image failures.
document.addEventListener('error',event=>{
 const img=event.target;
 if(!(img instanceof HTMLImageElement)||img.dataset.fallbackApplied)return;
 img.dataset.fallbackApplied='1';
 const label=img.getAttribute('alt')||img.getAttribute('src')?.split('/').pop()?.split('.')[0]||'單字圖片';
 const fallback=document.createElement('span');
 fallback.className='v17-image-fallback';fallback.textContent='🖼️ '+label+'（圖片暫時無法顯示）';
 fallback.setAttribute('role','status');
 img.hidden=true;img.insertAdjacentElement('afterend',fallback);
},true);
document.addEventListener('load',event=>{
 const img=event.target;
 if(!(img instanceof HTMLImageElement)||!img.dataset.fallbackApplied)return;
 img.hidden=false;delete img.dataset.fallbackApplied;
 const next=img.nextElementSibling;
 if(next?.classList.contains('v17-image-fallback'))next.remove();
},true);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){document.getElementById('teacherAudio')?.pause();
  if('speechSynthesis' in window)try{window.speechSynthesis.cancel()}catch(e){}}
});
})();
