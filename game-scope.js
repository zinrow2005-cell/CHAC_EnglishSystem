/* CHAC V60: all game types use the same selected letters. */
(()=>{'use strict';
const words=window.PB_DATA.words;
const all=[...new Set(words.map(x=>x.letter))].sort();
const area=document.getElementById('chacGameScope'),board=document.getElementById('chacGameLetters'),status=document.getElementById('chacScopeStatus');
let mode='single',selected=['A'];
try{const saved=JSON.parse(localStorage.getItem('chac-game-scope-v60')||'null');if(saved&&['single','multi','all','random'].includes(saved.mode)){mode=saved.mode;selected=(saved.letters||[]).filter(x=>all.includes(x));if(!selected.length)selected=[all[0]]}}catch(e){}
const activeLesson=()=>document.querySelector('.letter.active')?.dataset.letter||all[0];
const letters=()=>mode==='single'?[selected[0]||activeLesson()]:mode==='multi'?selected:all;
const pool=()=>words.filter(w=>letters().includes(w.letter));
window.CHAC_GAME_POOL=pool;
window.CHAC_GAME_LABEL=()=>mode==='random'?'A～G 隨機挑戰':letters().join('、')+' 字母';
function persist(){try{localStorage.setItem('chac-game-scope-v60',JSON.stringify({mode,letters:selected}))}catch(e){}}
function draw(){area.querySelectorAll('[data-chac-preset]').forEach(b=>{const is=b.dataset.chacPreset===mode;b.classList.toggle('active',is);b.setAttribute('aria-pressed',String(is))});board.hidden=mode==='all'||mode==='random';board.innerHTML=all.map(l=>{const n=words.filter(w=>w.letter===l).length,on=letters().includes(l);return `<button type="button" data-chac-letter="${l}" class="${on?'selected':''}" aria-pressed="${on}">${l}${l.toLowerCase()} <small>${n}字</small></button>`}).join('');let total=pool().length;status.textContent=(mode==='random'?'🎲 從 A～G 隨機抽題':`目前練習：${letters().join('、')}`)+` · ${total} 個單字；下方四種遊戲都會使用這個範圍。`;persist()}
area.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.chacPreset){const next=b.dataset.chacPreset;if(next==='single'&&mode!=='single')selected=[activeLesson()];if(next==='multi'&&mode!=='multi'&&selected.length===0)selected=[activeLesson()];mode=next;draw();return}if(b.dataset.chacLetter){const l=b.dataset.chacLetter;if(mode==='single'){selected=[l]}else if(mode==='multi'){if(selected.includes(l)){if(selected.length===1){status.textContent='請至少保留一個字母。';return}selected=selected.filter(x=>x!==l)}else selected=[...selected,l].sort()}else{mode='single';selected=[l]}draw()}});
// Buttons keep their original handlers; the shared pool is read when each game starts.
draw();
})();