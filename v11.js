(()=>{'use strict';
const $=id=>document.getElementById(id);
// 所有音訊按鈕若連續觸發，先停止另一個播放來源，避免重疊。
const teacher=$('teacherAudio'),word=$('v10Audio');
for(const id of ['v10Hear','v10Again','v6Open'])$(id)?.addEventListener('click',()=>{teacher?.pause()}, {capture:true});
for(const id of ['v6Teacher','clipStart','clipEnd','v7Preview'])$(id)?.addEventListener('click',()=>{word?.pause()}, {capture:true});
// 切換遊戲時，先停止音訊和裝置朗讀。
for(const id of ['startPractice','startListening','startMatch','startMemory'])$(id)?.addEventListener('click',()=>{word?.pause();teacher?.pause();if('speechSynthesis'in window)window.speechSynthesis.cancel()}, {capture:true});
// 簡易鍵盤操作：Esc 關閉彈窗（原本的程式仍負責焦點還原）。
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('v6Overlay').hidden)word?.pause()});
})();
