// ===== Helpers =====
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

// ===== Progress =====
const solved = JSON.parse(localStorage.getItem('ctfProgress') || '{}');
function markSolved(key, ids=[], punchline=''){
  solved[key]=true; localStorage.setItem('ctfProgress', JSON.stringify(solved));
  ids.forEach(unlockSection);
  if(punchline) console.log('%c[ACCESS]', 'color:#5df2ff', punchline);
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
  let count=0; ['c1','c2','c3','c4','c5'].forEach(k=>{ if(solved[k]) count++; });
  const pct=Math.round(count/5*100);
  const bar=document.getElementById('progressBar'), text=document.getElementById('progressText');
  if(bar) bar.style.width=pct+'%'; if(text) text.textContent=`Solved: ${count} / 5`;
}

// ===== Progressive Hints / Reveal =====
const challengeMeta = {
  1: {
    expected: 'FLAG{neon}',
    hints: [
      'Cipher, not code: think ROT(5).',
      'Decode <sjts> with ROT(5). Wrap it: FLAG{...}.'
    ],
    punch: 'First light acquired. The city’s glow is no longer just for watching — it’s yours to direct.'
  },
  2: {
    expected: 'FLAG{cyber}',
    hints: [
      'View the page source; there’s a Base64 string waiting.',
      'Decode the string you find into the final FLAG.'
    ],
    punch: 'You cut through the static. The network feels smaller already.'
  },
  3: {
    expected: 'FLAG{overlord}',
    hints: [
      'Open DevTools → Console. Watch for [DECRYPT].',
      'The answer is printed cleanly — copy it as is.'
    ],
    punch: 'The fortress walls crumble. Their “overlord” is just another variable you control.'
  },
  4: {
    expected: 'FLAG{elite}',
    hints: [
      'Decode the source comment with Base64.',
      'Now reverse the decoded text to read the true FLAG.'
    ],
    punch: 'Credentials verified. You’re operating above the grid now — among the unseen.'
  },
  5: {
    expected: 'FLAG{apex}',
    hints: [
      '“Crown among a hundred” — think status.',
      'Four letters. The point where everything converges.'
    ],
    punch: 'Every system bends. Every lock yields. You are the apex — and the hunt is over.'
  }
};

const attempts = {1:0,2:0,3:0,4:0,5:0};
const timers = {}; // { n: {start:number, hint1:timeoutId, reveal:timeoutId } }

function onFirstAttempt(n){
  if(timers[n]) return;
  timers[n] = {};
  timers[n].start = Date.now();
  // time-based hint after 30s (if not solved)
  timers[n].hint1 = setTimeout(()=> showHint(n, 0), 30000);
  // time-based reveal after 60s (if not solved)
  timers[n].reveal = setTimeout(()=> showReveal(n), 60000);
}

function showHint(n, idx){
  if(solved['c'+n]) return;
  const el = document.getElementById('hint'+n);
  if(!el) return;
  el.textContent = '💡 ' + challengeMeta[n].hints[idx];
  el.hidden = false;
}

function showReveal(n){
  if(solved['c'+n]) return;
  const btn = document.getElementById('reveal'+n);
  if(btn) btn.hidden = false;
}

function revealAnswer(n){
  const expected = challengeMeta[n].expected;
  const input = document.getElementById('input'+n);
  if(input){ input.value = expected; }
  // trigger the checker
  window['checkChallenge'+n]();
}

// ===== Cinematic Console + Hint for C3 =====
function emitNetworkNoise(){
  const lines=[
    '[SYS-ALERT] anomaly detected on port 443',
    '[TRACE] sniffing packet → decryption in progress...',
    '[HANDSHAKE] key-exchange complete',
    '[DECRYPT] >>> FLAG{overlord}', // The flag they need
    '[NOTE] Pull lightly; alarms are sleepy, not blind.'
  ];
  console.log('%c— intranet link —', 'color:#ffb6c1; font-weight:bold;');
  lines.forEach(l => console.log('%c'+l, 'color:#5df2ff'));
  console.log("%c\n" +
"   ____       _        _   _ _   _ _ _ _ \n" +
"  / ___|  ___| |_ __ _| |_(_) |_(_) | (_)\n" +
"  \\___ \\ / _ \\ __/ _` | __| | __| | | | |\n" +
"   ___) |  __/ || (_| | |_| | |_| | | | |\n" +
"  |____/ \\___|\\__\\__,_|\\__|_|\\__|_|_|_|_|\n" +
"   Find the flags. Watch the city change.\n", "color:#c38bff");

  if(!solved.c3){
    const hintEl=document.getElementById('c3-hint');
    if(hintEl){ setTimeout(()=>{ hintEl.style.display='inline-block'; }, 4000); }
  }
}

// ===== Checkers =====
function checkChallenge1(){
  onFirstAttempt(1);
  const val=(document.getElementById('input1').value||'').trim();
  const expected=challengeMeta[1].expected; // FLAG{neon}
  if(val.toLowerCase()===expected.toLowerCase()){
    setResult('result1','✅ '+challengeMeta[1].punch,true);
    markSolved('c1',['about','challenge2'],challengeMeta[1].punch);
  }else{
    attempts[1]++;
    setResult('result1','❌ Try again. ROT(5) will treat letters gently.');
    if(attempts[1]===3) showHint(1,0);
    if(attempts[1]===5) showReveal(1);
  }
}

function checkChallenge2(){
  onFirstAttempt(2);
  const val=(document.getElementById('input2').value||'').trim();
  const expected=challengeMeta[2].expected;
  if(val===expected){
    setResult('result2','✅ '+challengeMeta[2].punch,true);
    markSolved('c2',['skills','challenge3'],challengeMeta[2].punch);
  }else{
    attempts[2]++;
    setResult('result2','❌ You’re close. The answer is exactly what the Base64 decodes to.');
    if(attempts[2]===3) showHint(2,0);
    if(attempts[2]===5) showReveal(2);
  }
}

function checkChallenge3(){
  onFirstAttempt(3);
  const val=(document.getElementById('input3').value||'').trim();
  const expected=challengeMeta[3].expected;
  if(val===expected){
    setResult('result3','✅ '+challengeMeta[3].punch,true);
    markSolved('c3',['projects','challenge4'],challengeMeta[3].punch);
  }else{
    attempts[3]++;
    setResult('result3','❌ Look for the [DECRYPT] line in Console.');
    if(attempts[3]===3) showHint(3,0);
    if(attempts[3]===5) showReveal(3);
  }
}

function checkChallenge4(){
  onFirstAttempt(4);
  const val=(document.getElementById('input4').value||'').trim();
  const expected=challengeMeta[4].expected;
  if(val===expected){
    setResult('result4','✅ '+challengeMeta[4].punch,true);
    markSolved('c4',['certs','challenge5'],challengeMeta[4].punch);
  }else{
    attempts[4]++;
    setResult('result4','❌ Follow the order: Base64 decode first, then reverse the text.');
    if(attempts[4]===3) showHint(4,0);
    if(attempts[4]===5) showReveal(4);
  }
}

function checkChallenge5(){
  onFirstAttempt(5);
  const val=(document.getElementById('input5').value||'').trim();
  const expected=challengeMeta[5].expected;
  if(val===expected){
    setResult('result5','🏆 '+challengeMeta[5].punch,true);
    markSolved('c5',['achievements'],challengeMeta[5].punch);
  }else{
    attempts[5]++;
    setResult('result5','❌ Think status. Short, decisive, four letters.');
    if(attempts[5]===3) showHint(5,0);
    if(attempts[5]===5) showReveal(5);
  }
}

// ===== Init =====
(function init(){
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  restoreProgress(); emitNetworkNoise();
  const reset=document.getElementById('resetProgress');
  if(reset){ reset.addEventListener('click',()=>{ localStorage.removeItem('ctfProgress'); location.reload(); }); }
})();


