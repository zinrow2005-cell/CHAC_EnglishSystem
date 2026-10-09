(()=>{'use strict';let last=0,active=0;
window.PB_SAY_CORRECT=()=>{const now=Date.now();if(now-last<180)return;last=now;
 if(!('speechSynthesis' in window))return;const serial=++active;
 try{const engine=window.speechSynthesis;engine.cancel();const u=new SpeechSynthesisUtterance('答對了！');u.lang='zh-TW';u.rate=.86;u.pitch=1.08;
 const voices=engine.getVoices()||[];u.voice=voices.find(v=>v.lang.toLowerCase()==='zh-tw')||voices.find(v=>v.lang.toLowerCase().startsWith('zh'))||null;
 engine.speak(u);}catch(e){}
};
window.PB_CANCEL_CORRECT=()=>{active++;if('speechSynthesis' in window)try{speechSynthesis.cancel()}catch(e){}};
})();