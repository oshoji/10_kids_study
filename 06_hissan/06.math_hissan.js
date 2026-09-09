function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randDigitNum(d) {
  if (!d) return null;
  const min = Math.pow(10, d - 1);
  const max = Math.pow(10, d) - 1;
  return randInt(min, max);
}

let answers = [];

function createVerticalHTML(op, a, b, idx) {
  const width = Math.max(String(a).length, String(b).length) + 2;
  return `
    <div class="problem-container">
      <div class="flex flex-col items-end">
        <div style="min-width:${width}ch" class="text-right">${a}</div>
        <div style="min-width:${width}ch" class="text-right">${op} ${b}</div>
        <hr class="border-t-2 border-gray-600 w-full my-1" />
        <input id="ans-${idx}" type="text" style="width:${width}ch" class="border p-1 text-right" />
      </div>
    </div>`;
}

function generateProblems() {
  const op = document.getElementById("operator").value;
  const count = +document.getElementById("count").value;
  const min = +document.getElementById("min").value;
  const max = +document.getElementById("max").value;
  const digitsA = +document.getElementById("digitsA").value || null;
  const digitsB = +document.getElementById("digitsB").value || null;

  const container = document.getElementById("problems");
  container.innerHTML = "";
  answers = [];

  for (let i = 0; i < count; i++) {
    let a = digitsA ? randDigitNum(digitsA) : randInt(min, max);
    let b = digitsB ? randDigitNum(digitsB) : randInt(min, max);

    if (op === "/") {
      b = b === 0 ? 1 : b;
      const q = randInt(1, Math.floor(max / b));
      a = b * q;
    } else if (op === "-" && a < b) {
      [a, b] = [b, a];
    }

    container.innerHTML += createVerticalHTML(op, a, b, i);

    let correct;
    switch (op) {
      case "+": correct = a + b; break;
      case "-": correct = a - b; break;
      case "*": correct = a * b; break;
      case "/": correct = a / b; break;
    }
    answers.push(correct);
  }

  document.getElementById("check").classList.remove("hidden");
}

function checkAnswers() {
  answers.forEach((ans, idx) => {
    const field = document.getElementById(`ans-${idx}`);
    const user = Number(field.value);
    if (user === ans) {
      field.classList.add("bg-green-100", "border-green-500");
      field.classList.remove("bg-red-100", "border-red-500");
    } else {
      field.classList.add("bg-red-100", "border-red-500");
      field.classList.remove("bg-green-100", "border-green-500");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("generate").addEventListener("click", generateProblems);
  document.getElementById("check").addEventListener("click", checkAnswers);
});
