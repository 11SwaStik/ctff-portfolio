function caesarShift(str, amount) {
  let output = '';
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c >= 65 && c <= 90) {
      output += String.fromCharCode((c - 65 - amount + 26) % 26 + 65);
    } else if (c >= 97 && c <= 122) {
      output += String.fromCharCode((c - 97 - amount + 26) % 26 + 97);
    } else {
      output += str.charAt(i);
    }
  }
  return output;
}

function checkChallenge1() {
  let input = document.getElementById("input1").value.trim();
  let correct = caesarShift("Mjqqt", 5); // decrypt with shift 5
  if (input.toLowerCase() === correct.toLowerCase()) {
    document.getElementById("about").style.display = "block";
    document.getElementById("result1").innerText = "✅ Correct! Section unlocked.";
  } else {
    document.getElementById("result1").innerText = "❌ Incorrect. Try again.";
  }
}
