/* V55 child-first navigation; integrates without replacing the lesson/game engine. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const sections={home:['v55Dashboard'],learn:['letters','v6FocusLaunch','learnSection'],teacher:['teacher'],games:['gamesSection'],progress:['progressSection']};
 const currentKey='chac-v55-view';
 function syncHeaderOffset(){const header=document.querySelector('header');document.documentElement.style.setProperty('--chac-header-height', (header?Math.ceil(header.getBoundingClientRect().height):65)+'px')}
 function stopOtherAudio(){const teacher=$('teacherAudio');if(teacher&&!teacher.paused)teacher.pause();if(window.speechSynthesis)try{window.speechSynthesis.cancel()}catch(e){} }
 window.addEventListener('resize',syncHeaderOffset);window.addEventListener('orientationchange',syncHeaderOffset);syncHeaderOffset();
 function go(view,scroll=true){if(!sections[view])view='home';const previous=document.body.dataset.v55View;if(previous&&previous!==view){stopOtherAudio();const focusOverlay=$('v6Overlay');if(focusOverlay&&!focusOverlay.hidden)$('v6Close')?.click();const quiz=$('quizOverlay');if(quiz&&!quiz.hidden)$('closeQuiz')?.click()}document.body.dataset.v55View=view;
   document.querySelectorAll('[data-v55-target]').forEach(b=>{const active=b.dataset.v55Target===view;b.classList.toggle('selected',active);b.setAttribute('aria-current',active?'page':'false')});
   try{sessionStorage.setItem(currentKey,view)}catch(e){}
   if(view==='home')refresh();
   if(scroll)window.scrollTo({top:0,behavior:'auto'});syncHeaderOffset();
 }
 function refresh(){try{const learned=JSON.parse(localStorage.getItem('pbDone')||'[]');const done=Array.isArray(learned)?learned.length:0;const total=window.PB_DATA?.words?.length||54;const name=$('v55ProgressLabel');if(name)name.textContent=`已學會 ${done} / ${total} 個單字`;const p=$('v55ProgressBar');if(p)p.style.width=(Math.min(100,100*done/total)||0)+'%';const count=$('v55StarCount');if(count)count.textContent=String(Number(localStorage.getItem('pbStars')||0))}catch(e){}}
 document.querySelectorAll('[data-v55-target]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.v55Target)));
 $('v55Start')?.addEventListener('click',()=>{go('learn',false);$('v6Open')?.click()});
 $('v55Continue')?.addEventListener('click',()=>{go('learn',false);$('v6Open')?.click()});
 // Keep all previous controls functional; switch visible section when existing UI controls navigate.
 $('homeBtn')?.addEventListener('click',()=>go('home'),true);
 $('reviewBtn')?.addEventListener('click',()=>go('learn',false),true);
 $('quizBtn')?.addEventListener('click',()=>go('games',false),true);
 $('letters')?.addEventListener('click',e=>{if(e.target.closest('[data-letter]'))go('learn',false)},true);
 $('progressGrid')?.addEventListener('click',e=>{if(e.target.closest('[data-progress]'))go('learn',false)},true);
 window.addEventListener('pb-progress-changed',refresh);window.addEventListener('storage',refresh);
 const prefetch=()=>{const imgs=window.PB_DATA?.words?.slice(0,3)||[];imgs.forEach(w=>{if(w.word){const img=new Image();img.src=`assets/words/${w.word}.jpg?v=623`}})};
 refresh();go('home',false);if('requestIdleCallback'in window)requestIdleCallback(prefetch);else setTimeout(prefetch,400);
})();
