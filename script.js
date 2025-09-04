const challenges = [
  { 
    title: "Level 1: Beginner Cipher", 
    text: "Decrypt this: 'URYYB ZRFFNTR' (Caesar cipher)", 
    flag: "FLAG{hello}" 
  },
  { 
    title: "Level 2: Source Hunt", 
    text: "Check the page source... something is hidden there.", 
    flag: "FLAG{matrix}" 
  },
  { 
    title: "Level 3: Console Logs", 
    text: "Open the developer console (F12) and look for signals.", 
    flag: "FLAG{overlord}" 
  },
  { 
    title: "Level 4: Hidden Data", 
    text: "Somewhere in the static noise lies the key... (image stego placeholder)", 
    flag: "FLAG{elite}" 
  },
  { 
    title: "Level 5: Final Riddle", 
    text: "I am the predator at the top of the cyber food chain. Who am I?", 
    flag: "FLAG{apex}" 
  }
];

let current = 0;

function submitFlag() {
  const input = document.getElementById("flag-input").value.trim();
  const feedback = document.getElementById("feedback");

  if (input === challenges[current].flag) {
    feedback.innerText = "✅ Correct! " + getPunchline(current);
    nextChallenge();
  } else {
    feedback.innerText = "❌ Try again!";
  }
}

function nextChallenge() {
  current++;
  if (current < challenges.length) {
    document.getElementById("challenge-title").innerText = challenges[current].title;
    document.getElementById("challenge-text").innerText = challenges[current].text;
    document.getElementById("flag-input").value = "";
    document.getElementById("feedback").innerText = "";
  } else {
    document.getElementById("challenge-box").innerHTML = "<h2>🎉 You’ve completed all challenges! 🎉</h2>";
  }
}

function getPunchline(level) {
  const lines = [
    "Welcome, beginner hacker. You lit the neon.",
    "You broke the surface. The Matrix whispers your name.",
    "Packets obey you. You’re in control.",
    "The hidden data bends to your will.",
    "You are the apex predator. Nothing stops you."
  ];
  return lines[level];
}

// Loading screen timeout
window.onload = () => {
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("hidden");
    document.getElementById("game-container").classList.remove("hidden");
    console.log("Psst... here's a flag: FLAG{overlord}");
  }, 2000);
};
