// ——— helpers ———
function caesarShift(str, amount){
  let out=''; for(let i=0;i<str.length;i++){
    const c=str.charCodeAt(i);
    if(c>=65&&c<=90) out+=String.fromCharCode((c-65-amount+26)%26+65);
    else if(c>=97&&c<=122) out+=String.fromCharCode((c-97-amount+26)%26+97);
    else out+=str[i];
  } return out;
}
function setResult(id,msg,ok=false){
  const el=document.getElementById(id); if(!el) return;
  el.textContent=msg; el.style.opacity=.95;
  el.style.textShadow = ok ? '0 0 6px #ffb6c1' : 'none';
  typeSfx();
}
function unlockSection(id){
  const el=document.getElementById(id); if(!el) return;
  el.style.display='block'; el.classList.add('unlocked');
  confettiBurst(); saveProgress(); updateProgressUI();
}
function confettiBurst(){
  // CSS-only confetti (no canvas)
  const wrap=document.createElement('div'); wrap.className='confetti';
  const colors=['#ffb6c1','#5df2ff','#c38bff','#a8ff60','#fff176','#ff8a65'];
  const count=80;
  for(let i=0;i<count;i++){
    const piece=document.createElement('i');
    piece.style.left=Math.random()*100+'vw';
    piece.style.background=colors[i%colors.length];
    piece.style.transform=`translateY(-10vh) rotate(${Math.random()*360}deg)`;
    piece.style.animationDelay=(Math.random()*0.3)+'s';
    piece.style.width=(6+Math.random()*6)+'px';
    piece.style.height=(10+Math.random()*10)+'px';
    wrap.appendChild(piece);
  }
  document.body.appendChild(wrap);
  setTimeout(()=>wrap.remove(), 1900);
}
function typeSfx(){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='square'; o.frequency.setValueAtTime(440,ctx.currentTime);
    g.gain.setValueAtTime(0.04,ctx.currentTime);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.05);
  }catch(e){}
}

// ——— progress ———
const solved = JSON.parse(localStorage.getItem('ctfProgress') || '{}');
function markSolved(key, ids=[]){
  solved[key]=true; localStorage.setItem('ctfProgress', JSON.stringify(solved));
  ids.forEach(unlockSection);
  const allOpen=['about','skills','projects','certs','achievements'].every(id=>{
    const el=document.getElementById(id); return el && getComputedStyle(el).display!=='none';
  });
  if(allOpen) unlockSection('final');
}
function restoreProgress(){
  if(solved.c1) unlockSection('about'), unlockSection('challenge2');
  if(solved.c2) unlockSection('skills'), unlockSection('challenge3');
  if(solved.c3) unlockSection('projects'), unlockSection('challenge4');
  if(solved.c4) unlockSection('certs'), unlockSection('challenge5');
  if(solved.c5) unlockSection('achievements');
  updateProgressUI();
}
function saveProgress(){}
function updateProgressUI(){
  let count=0; if(solved.c1)count++; if(solved.c2)count++; if(solved.c3)count++; if(solved.c4)count++; if(solved.c5)count++;
  const pct=Math.round(count/5*100);
  const bar=document.getElementById('progressBar'), text=document.getElementById('progressText');
  if(bar) bar.style.width=pct+'%'; if(text) text.textContent=`Solved: ${count} / 5`;
}

// ——— cinematic console + hint ———
function emitNetworkNoise(){
  const lines=[
    '[SYS-ALERT] anomaly detected on port 443',
    '[TRACE] sniffing packet → decryption in progress...',
    '[HANDSHAKE] key-exchange complete',
    '[DECRYPT] >>> FLAG{firewall_overlord}', // The flag they need
    '[NOTE] This is your way in. Don’t screw it up.'
  ];
  console.log('%c— intranet link —', 'color:#ffb6c1; font-weight:bold;');
  lines.forEach(l => console.log('%c'+l, 'color:#5df2ff'));
  console.log("%c\n" +
"   ____       _        _   _ _   _ _ _ _ \n" +
"  / ___|  ___| |_ __ _| |_(_) |_(_) | (_)\n" +
"  \\___ \\ / _ \\ __/ _` | __| | __| | | | |\n" +
"   ___) |  __/ || (_| | |_| | |_| | | | |\n" +
"  |____/ \\___|\\__\\__,_|\\__|_|\\__|_|_|_|_|\n" +
"  Find all flags to unlock the résumé.    \n", "color:#c38bff");

  if(!solved.c3){
    const hintEl=document.getElementById('c3-hint');
    if(hintEl){ setTimeout(()=>{ hintEl.style.display='inline-block'; }, 4000); }
  }
}

// ——— challenges (creative flags) ———
// C1: ROT(5) -> "Hello" -> forge "hello_world_order" -> FLAG{hello_world_order}
function checkChallenge1(){
  const val=(document.getElementById('input1').value||'').trim();
  const decoded=caesarShift('Mjqqt',5); // "Hello"
  const expected='FLAG{hello_world_order}';
  if(val.toLowerCase()===expected.toLowerCase()){
    setResult('result1','✅ Access node breached. “Welcome to the underground.”',true);
    markSolved('c1',['about','challenge2']);
  }else{
    setResult('result1','❌ Tip: decode → "Hello". Then forge phrase "hello_world_order" and wrap: FLAG{...}');
  }
}

// C2: Base64 in HTML comment -> FLAG{pink_protocol_1337}
function checkChallenge2(){
  const val=(document.getElementById('input2').value||'').trim();
  const expected='FLAG{pink_protocol_1337}';
  if(val===expected){
    setResult('result2','✅ You’ve unlocked the Pink Protocol. “Things just got real.”',true);
    markSolved('c2',['skills','challenge3']);
  }else{
    setResult('result2','❌ Decode the Base64 from page source. The answer is a FLAG{...}.');
  }
}

// C3: Console leak -> FLAG{firewall_overlord}
function checkChallenge3(){
  const val=(document.getElementById('input3').value||'').trim();
  const expected='FLAG{firewall_overlord}';
  if(val===expected){
    setResult('result3','✅ Firewall neutralized. “We’re in.”',true);
    markSolved('c3',['projects','challenge4']);
  }else{
    setResult('result3','❌ Check the Console for a line that begins with [DECRYPT].');
  }
}

// C4: comment says BASE64 → REVERSE → result should be FLAG{certified_elite_h4x0r}
function checkChallenge4(){
  const val=(document.getElementById('input4').value||'').trim();
  const expected='FLAG{certified_elite_h4x0r}';
  if(val===expected){
    setResult('result4','✅ Credentials verified. “You don’t just get in — you belong here.”',true);
    markSolved('c4',['certs','challenge5']);
  }else{
    setResult('result4','❌ Hint: take the comment payload → Base64 decode → then reverse the string.');
  }
}

// C5: 1st place codename -> FLAG{top_of_the_foodchain}
function checkChallenge5(){
  const val=(document.getElementById('input5').value||'').trim();
  const expected='FLAG{top_of_the_foodchain}';
  if(val===expected){
    setResult('result5','🏆 Apex unlocked. “You’re the predator now.”',true);
    markSolved('c5',['achievements']);
  }else{
    setResult('result5','❌ Forge the codename for finishing #1: FLAG{top_of_the_foodchain}.');
  }
}

// ——— init ———
(function init(){
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  restoreProgress(); emitNetworkNoise();
  const reset=document.getElementById('resetProgress');
  if(reset){ reset.addEventListener('click',()=>{ localStorage.removeItem('ctfProgress'); location.reload(); }); }
})();

