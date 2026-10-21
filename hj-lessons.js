/* CHAC v63: H/I/J audio-only course choices; no unverified vocabulary. */
(()=>{'use strict';
const target=document.getElementById('letters');if(!target)return;
const audio=document.getElementById('teacherAudio');
const block=document.createElement('section');block.id='chacPendingLesson';block.hidden=true;block.className='chac-pending-lesson';
block.innerHTML='<div class="chac-pending-art"><img src="assets/ui/headphones.png" alt="蠟筆耳機" /></div><div class="chac-pending-copy"><p class="eyebrow">NEW LESSON · 待校對</p><h2 id="chacPendingTitle">Hh · 老師錄音</h2><p>H～J 新錄音已加入，但老師實際教的單字與短句尚未逐字確認。目前可先聽完整原音，不會顯示猜測的單字卡。</p><div class="chac-pending-actions"><button type="button" id="chacHJPlay" class="primary">▶ 播放 H～J 老師原音</button><button type="button" id="chacHJBack">返回 A～G 圖卡</button></div><p id="chacHJState" aria-live="polite">點擊播放後可在下方控制暫停及進度。</p><audio id="chacHJAudio" controls preload="metadata" src="audio/HJ.m4a"></audio></div>';
target.insertAdjacentElement('afterend',block);
const player=block.querySelector('#chacHJAudio');let chosen='';
function decorate(){for(const letter of 'HIJ'){if(!target.querySelector('[data-chac-hj="'+letter+'"]')){const b=document.createElement('button');b.className='letter chac-pending-letter';b.type='button';b.dataset.chacHj=letter;b.setAttribute('aria-label',letter+' 字母，老師錄音待校對');b.innerHTML=letter+'<small>'+letter.toLowerCase()+'</small><span class="chac-new-dot" aria-hidden="true">新</span>';target.appendChild(b)}} if(chosen){target.querySelectorAll('.letter').forEach(b=>b.classList.toggle('active',b.dataset.chacHj===chosen))}}
const observer=new MutationObserver(()=>{decorate()});observer.observe(target,{childList:true});decorate();
function show(letter){chosen=letter;decorate();block.querySelector('#chacPendingTitle').textContent=letter+letter.toLowerCase()+' · 老師新錄音';block.hidden=false;document.getElementById('learnSection').hidden=true;const focus=document.getElementById('v6FocusLaunch');if(focus)focus.hidden=true;try{audio?.pause()}catch(e){};try{speechSynthesis.cancel()}catch(e){};block.scrollIntoView({behavior:'smooth',block:'start'})}
function clear(){chosen='';player.pause();block.hidden=true;const learn=document.getElementById('learnSection');if(learn)learn.hidden=false;const focus=document.getElementById('v6FocusLaunch');if(focus)focus.hidden=false;decorate()}
target.addEventListener('click',e=>{const b=e.target.closest('[data-chac-hj]');if(b){e.preventDefault();e.stopImmediatePropagation();show(b.dataset.chacHj)}else if(e.target.closest('[data-letter]')){clear()}},true);
block.querySelector('#chacHJPlay').addEventListener('click',()=>{try{audio?.pause()}catch(e){};player.currentTime=0;player.play().then(()=>block.querySelector('#chacHJState').textContent='正在播放 H～J 完整課堂錄音').catch(()=>block.querySelector('#chacHJState').textContent='無法播放，請確認已上傳 audio/HJ.m4a')});
block.querySelector('#chacHJBack').addEventListener('click',()=>{clear();target.querySelector('[data-letter="A"]')?.click()});
player.addEventListener('error',()=>block.querySelector('#chacHJState').textContent='載入失敗：請確認 audio/HJ.m4a 已上傳到 GitHub');
window.addEventListener('chac-section-changed',()=>player.pause());
document.querySelectorAll('[data-v55-target]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.v55Target!=='learn')player.pause()}));
})();