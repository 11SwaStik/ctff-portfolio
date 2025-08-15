// =================== Encoded flags & meta ===================
/*
  We store Base64-encoded strings to reduce trivial Ctrl+F solves.
  Flags (decoded):
  1 → FLAG{neon}
  2 → FLAG{cyber}
  3 → FLAG{overlord}
  4 → FLAG{elite}     (inside PNG tEXt chunk too)
  5 → FLAG{apex}
*/
const b64Flags = {
  1: "RkxBR3tuZW9ufQ==",
  2: "RkxBR3tjeWJlcn0=",
  3: "RkxBR3tvdmVybG9yZH0=",
  4: "RkxBR3tlbGl0ZX0=",
  5: "RkxBR3thcGV4fQ=="
};
const meta = {
  1: {
    type: "caesar",
    prompt: "Decode sjts with ROT(5) and wrap in FLAG{...}",
    hints: [
      "Cipher, not code: think ROT(5).",
      "s→n, j→e, t→o, s→n. Wrap it."
    ],
    punch: "First light acquired. The city’s glow answers to you."
  },
  2: {
    type: "base64",
    prompt: "Find Base64 in page source; decode and wrap.",
    hints: [
      "Open View Source (CTRL/CMD+U).",
      "Search for a long Base64-looking string and decode it."
    ],
    punch: "You cut through the static. Layers start to peel back."
  },
  3: {
    type: "console",
    prompt: "Open DevTools Console and read the [DECRYPT] line.",
    hints: [
      "Press F12 → Console tab.",
      "Look for [DECRYPT] >>> … it’s clean."
    ],
    punch: "The perimeter falters. Their ‘overlord’ now runs your script."
  },
  4: {
    type: "image-text-chunk",
    prompt: "Extract PNG tEXt chunk from ctf_stego.png.",
    hints: [
      "PNG has chunks: IHDR, IDAT, IEND… and tEXt.",
      "Use the Toolkit → PNG Inspector to read text chunks."
    ],
    punch: "Hidden channels bend in your direction. You’re above the grid."
  },
  5: {
    type: "riddle",
    prompt: "Crown among a hundred. Four letters. The end of the hunt.",
    hints: [
      "Think status, not number.",
      "Short, decisive: the top of the chain."
    ],
    punch: "Every system bends. Every lock yields. You are the apex."
  }
};

// =================== UI helpers ===================
function setResult(id,msg,ok=false){
  const el=document.getElementById(id); if(!el) return;
  el.textContent=msg; el.style.opacity=.95;
  el.style.textShadow = ok ? '0 0 6px #ffb6c1' : 'none';
  typeSfx();
}
function unlock(id){
  const el=document.getElementById(id);
  if(el){ el.style.display='block'; el.classList.add('unlocked'); }
  confettiBurst(); updateProgressUI();
}
function confettiBurst(){
  const wrap=document.createElement('div'); wrap.className='confetti';
  const colors=['#ffb6c1','#5df2ff','#c38bff','#a8ff60','#ffc857','#ff8a65'];
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

// =================== Progress ===================
const solved = JSON.parse(localStorage.getItem('ctfProgressV2') || '{}');
function markSolved(n){
  solved['l'+n]=true; localStorage.setItem('ctfProgressV2', JSON.stringify(solved));
  console.log('%c[ACCESS]', 'color:#5df2ff', meta[n].punch);
  // Unlock gated content in sequence
  if(n===1){ unlock('about'); unlock('level2'); }
  if(n===2){ unlock('skills'); unlock('level3'); }
  if(n===3){ unlock('projects'); unlock('level4'); }
  if(n===4){ unlock('certs'); unlock('level5'); }
  if(n===5){ unlock('achievements'); unlock('final'); }
  updateProgressUI();
}
function restore(){
  if(solved.l1){ unlock('about'); unlock('level2'); }
  if(solved.l2){ unlock('skills'); unlock('level3'); }
  if(solved.l3){ unlock('projects'); unlock('level4'); }
  if(solved.l4){ unlock('certs'); unlock('level5'); }
  if(solved.l5){ unlock('achievements'); unlock('final'); }
  updateProgressUI();
}
function updateProgressUI(){
  let count=0; for(let i=1;i<=5;i++) if(solved['l'+i]) count++;
  const pct=Math.round(count/5*100);
  const bar=document.getElementById('progressBar'), text=document.getElementById('progressText');
  if(bar) bar.style.width=pct+'%'; if(text) text.textContent=`Solved: ${count} / 5`;
}

// =================== Progressive hints / reveal ===================
const attempts = {1:0,2:0,3:0,4:0,5:0};
const timers = {}; // first-attempt timers

function onFirstAttempt(n){
  if(timers[n]) return;
  timers[n] = {};
  timers[n].start = Date.now();
  timers[n].hint1 = setTimeout(()=> showHint(n,0), 30000);
  timers[n].reveal = setTimeout(()=> showReveal(n), 60000);
}
function showHint(n, idx){
  if(solved['l'+n]) return;
  const el=document.getElementById('hint'+n);
  if(!el) return;
  el.textContent='💡 '+meta[n].hints[idx];
  el.hidden=false;
}
function showReveal(n){
  if(solved['l'+n]) return;
  const btn=document.getElementById('reveal'+n);
  if(btn) btn.hidden=false;
}
function revealAnswer(n){
  const expected=atob(b64Flags[n]);
  const input=document.getElementById('input'+n);
  if(input){ input.value=expected; }
  checkLevel(n);
}

// =================== Level checkers ===================
function checkLevel(n){
  onFirstAttempt(n);
  const input=(document.getElementById('input'+n).value||'').trim();
  const expected = atob(b64Flags[n]);

  // exact match, case-sensitive
  if(input === expected){
    setResult('result'+n, '✅ '+meta[n].punch, true);
    markSolved(n);
    // Special: show blinking hint for L3 after console noise
    if(n===3){ const h=document.getElementById('c3-hint'); if(h) h.style.display='none'; }
    return;
  }

  attempts[n]++;
  // tailored feedback
  let fb='❌ Try again.';
  if(n===1) fb='❌ Try again. ROT(5) will turn letters gently.';
  if(n===2) fb='❌ Decode exactly what you find in source.';
  if(n===3) fb='❌ The [DECRYPT] line in Console prints the flag.';
  if(n===4) fb='❌ Read PNG tEXt chunk (use Toolkit → PNG Inspector).';
  if(n===5) fb='❌ Think status. Four letters.';
  setResult('result'+n, fb);

  if(attempts[n]===3) showHint(n,0);
  if(attempts[n]===5) showReveal(n);
}

// =================== Console noise for Level 3 ===================
function emitNetworkNoise(){
  const lines=[
    '[SYS-ALERT] anomaly detected on port 443',
    '[TRACE] sniffing packet → decryption in progress...',
    '[HANDSHAKE] key-exchange complete',
    '[DECRYPT] >>> FLAG{overlord}', // target
    '[NOTE] Pull lightly; alarms are sleepy, not blind.'
  ];
  console.log('%c— intranet link —', 'color:#ffb6c1; font-weight:bold;');
  lines.forEach(l => console.log('%c'+l, 'color:#5df2ff'));
  if(!solved.l3){
    const hintEl=document.getElementById('c3-hint');
    if(hintEl){ setTimeout(()=>{ hintEl.style.display='inline-block'; }, 4000); }
  }
}

// =================== Init ===================
(function init(){
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  restore(); emitNetworkNoise();

  const reset=document.getElementById('resetProgress');
  if(reset){ reset.addEventListener('click',()=>{ localStorage.removeItem('ctfProgressV2'); location.reload(); }); }
})();
