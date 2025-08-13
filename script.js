// ——— Utilities ———
function caesarShift(str, amount) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c >= 65 && c <= 90) out += String.fromCharCode((c - 65 - amount + 26) % 26 + 65);
    else if (c >= 97 && c <= 122) out += String.fromCharCode((c - 97 - amount + 26) % 26 + 97);
    else out += str[i];
  }
  return out;
}
function fireConfetti() {
  const confetti = document.createElement('canvas');
  confetti.style.position = 'fixed';
  confetti.style.top = '0';
  confetti.style.left = '0';
  confetti.style.width = '100%';
  confetti.style.height = '100%';
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = '9999';
  document.body.appendChild(confetti);

  const ctx = confetti.getContext('2d');
  const pieces = Array.from({length: 50}).map(() => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    w: 5 + Math.random() * 5,
    h: 8 + Math.random() * 8,
    color: `hsl(${Math.random() * 360}, 100%, 70%)`,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.5) * 8,
    ay: 0.2
  }));

  function update() {
    ctx.clearRect(0, 0, confetti.width, confetti.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.ay;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
    });
  }

  function animate() {
    update();
    requestAnimationFrame(animate);
  }

  confetti.width = window.innerWidth;
  confetti.height = window.innerHeight;
  animate();
  setTimeout(() => confetti.remove(), 2000);
}




function unlockSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'block';
  el.classList.add('unlocked');
  fireConfetti(); // 🎉 burst when unlocked
  saveProgress();
  updateProgressUI();
}


function setResult(id, msg, ok=false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = 0.95;
  el.style.textShadow = ok ? '0 0 6px #ffb6c1' : 'none';
}

// ——— Progress (localStorage) ———
const CHAIN = ['about','skills','projects','certs','achievements','final'];
const solved = JSON.parse(localStorage.getItem('ctfProgress') || '{}');

function markSolved(key, sectionToUnlockIds=[]) {
  solved[key] = true;
  localStorage.setItem('ctfProgress', JSON.stringify(solved));
  sectionToUnlockIds.forEach(unlockSection);
  // If all core sections (about, skills, projects, certs, achievements) are visible → unlock final.
  const allOpen = ['about','skills','projects','certs','achievements'].every(id => {
    const el = document.getElementById(id);
    return el && getComputedStyle(el).display !== 'none';
  });
  if (allOpen) unlockSection('final');
}

function restoreProgress() {
  if (solved.c1) unlockSection('about'), unlockSection('challenge2');
  if (solved.c2) unlockSection('skills'), unlockSection('challenge3');
  if (solved.c3) unlockSection('projects'), unlockSection('challenge4');
  if (solved.c4) unlockSection('certs'), unlockSection('challenge5');
  if (solved.c5) unlockSection('achievements');
  updateProgressUI();
}

function saveProgress() {
  // Nothing extra yet; just a hook if you expand.
}

function updateProgressUI() {
  let count = 0;
  if (solved.c1) count++;
  if (solved.c2) count++;
  if (solved.c3) count++;
  if (solved.c4) count++;
  if (solved.c5) count++;
  const pct = Math.round((count / 5) * 100);
  const bar = document.getElementById('progressBar');
  const text = document.getElementById('progressText');
  if (bar) bar.style.width = pct + '%';
  if (text) text.textContent = `Solved: ${count} / 5`;
}

// ——— Challenges ———
function checkChallenge1() {
  const input = (document.getElementById('input1').value || '').trim();
  const correct = caesarShift('Mjqqt', 5); // "Hello"
  if (input.toLowerCase() === correct.toLowerCase()) {
    setResult('result1', '✅ Correct! About + next challenge unlocked.', true);
    markSolved('c1', ['about', 'challenge2']);
  } else {
    setResult('result1', '❌ Incorrect. Try your toolkit.');
  }
}

function checkChallenge2() {
  const input = (document.getElementById('input2').value || '').trim();
  const correct = atob('c2tpbGxzX2ZsYWc='); // "skills_flag" (hidden in HTML comment)
  if (input === correct) {
    setResult('result2', '✅ Nice! Skills + next challenge unlocked.', true);
    markSolved('c2', ['skills','challenge3']);
  } else {
    setResult('result2', '❌ Nope. Inspect source → Base64 → decode.');
  }
}

function checkChallenge3() {
  const input = (document.getElementById('input3').value || '').trim().toLowerCase();
  // Accept common variants
  const ok = ['agni shield','agni-shield','agnishield'].includes(input);
  if (ok) {
    setResult('result3', '✅ Good catch. Projects + next challenge unlocked.', true);
    markSolved('c3', ['projects','challenge4']);
  } else {
    setResult('result3', '❌ Wrong service. Re-check console logs.');
  }
}

function checkChallenge4() {
  const input = (document.getElementById('input4').value || '').trim();
  // Expect the original CEH license exactly as on resume:
  const correct = 'ECC3417659820';
  if (input === correct) {
    setResult('result4', '✅ Verified. Certificates + next challenge unlocked.', true);
    markSolved('c4', ['certs','challenge5']);
  } else {
    setResult('result4', '❌ Not the original. Decode fully (reverse → base64 → original).');
  }
}

function checkChallenge5() {
  const raw = (document.getElementById('input5').value || '').trim().toLowerCase();
  const ok = raw === '1st' || raw === '1' || raw === 'first';
  if (ok) {
    setResult('result5', '🏆 Correct! Achievements unlocked. Final access available.', true);
    markSolved('c5', ['achievements']);
  } else {
    setResult('result5', '❌ Think leaderboard positions. Out of 100…');
  }
}

// ——— Console Logs for Challenge 3 ———
function emitNetworkNoise() {
  const rows = [
    '[scan] 10.0.0.12:443 — tls service (ok)',
    '[scan] 10.0.0.15:22 — ssh (key only)',
    '[scan] api.internal.local — healthy',
    '[scan] agni-shield.local — waf/admin reachable',
    '[scan] 10.0.0.22:8080 — http (redirect)',
    '[scan] cache.node — miss rate 2.1%',
  ];
  console.log('%c— network scan —', 'color:#ffb6c1; font-weight:bold;');
  rows.forEach(r => console.log('%c' + r, 'color:#ffb6c1;'));
  console.log('%cHint: Which service name matches a project above?', 'color:#ffb6c1; opacity:0.8;');
}

// ——— Page init ———
(function init() {
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
  // Restore local progress
  restoreProgress();
  // Emit console logs for Challenge 3
  emitNetworkNoise();
  // Reset
  const resetBtn = document.getElementById('resetProgress');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('ctfProgress');
      location.reload();
    });
  }
})();
// ——— Starfield Background ———
(function starfield() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * w,
      });
    }
  }

  function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffb6c1';
    stars.forEach(s => {
      let k = 128.0 / s.z;
      let px = s.x * k + w / 2;
      let py = s.y * k + h / 2;
      if (px >= 0 && px <= w && py >= 0 && py <= h) {
        let size = (1 - s.z / w) * 3;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, 2 * Math.PI);
        ctx.fill();
      }
      s.z -= 2;
      if (s.z <= 0) {
        s.x = Math.random() * w - w / 2;
        s.y = Math.random() * h - h / 2;
        s.z = w;
      }
    });
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  loop();
  window.addEventListener('resize', resize);
})();
