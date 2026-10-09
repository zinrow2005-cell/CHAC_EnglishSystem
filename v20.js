(()=>{'use strict';
const grid=document.getElementById('wordgrid');
const rate=document.getElementById('rateSelect');
function sayWord(w){const n=document.getElementById('voiceNotice');if(n)n.textContent='🔊 '+w; if(typeof window.PB_SPEAK_WORD==='function')window.PB_SPEAK_WORD(w)}
const msg=document.createElement('p');msg.id='voiceNotice';msg.className='v20-voice-notice';msg.setAttribute('aria-live','polite');
grid.parentNode.insertBefore(msg,grid);
function activate(e){const card=e.target.closest('[data-picture]');if(!card||!grid.contains(card))return;if(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' ')return;if(e.type==='keydown')e.preventDefault();sayWord(card.dataset.picture)}
grid.addEventListener('click',activate);grid.addEventListener('keydown',activate);
// Keep the home progress meter accurate when focus mode marks a word learned.
window.addEventListener('pb-progress-changed',()=>{
  const done=new Set(JSON.parse(localStorage.getItem('pbDone')||'[]'));
  const total=window.PB_DATA.words.length;
  const stat=document.getElementById('statDone');if(stat)stat.textContent='✅ 已學 '+done.size+'/'+total;
  document.querySelectorAll('[data-progress]').forEach(b=>{
    const l=b.dataset.progress,all=window.PB_DATA.words.filter(w=>w.letter===l),n=all.filter(w=>done.has(w.word)).length;
    const label=b.querySelector('span');if(label)label.textContent=n+' / '+all.length;
    const bar=b.querySelector('em');if(bar)bar.style.width=100*n/all.length+'%';
  });
});
})();