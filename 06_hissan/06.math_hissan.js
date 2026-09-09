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

function hissanRow(text, opCell, numDigits) {
  const digits = String(text).padStart(numDigits, " ").split("");
  const opTd = `<td class="hissan-op-cell">${opCell}</td>`;
  const digitTds = digits.map(d => `<td>${d === " " ? "" : d}</td>`).join("");
  return `<tr>${opTd}${digitTds}</tr>`;
}

function createVerticalHTML(op, a, b, idx) {
  const numDigits = Math.max(String(a).length, String(b).length);
  const totalCols = numDigits + 1;
  const totalWidthEm = (0.9 + numDigits * 1.1).toFixed(2); // .hissan-table の列幅(op:0.9em, 桁:1.1em)と合わせる
  return `
    <div class="problem-container">
      <table class="hissan-table">
        ${hissanRow(a, "", numDigits)}
        ${hissanRow(b, op, numDigits)}
        <tr><td colspan="${totalCols}"><hr class="border-t-4 border-gray-600 my-2" /></td></tr>
      </table>
      <input id="ans-${idx}" type="text" style="width:${totalWidthEm}em" class="border-2 p-2 text-right" />
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
    } else if (op === "-") {
      // 第1数(a)＞第2数(b)を維持する。桁数指定がある場合はそれぞれの桁数の範囲内で再抽選する
      let guard = 0;
      while (a <= b && guard < 100) {
        a = digitsA ? randDigitNum(digitsA) : randInt(min, max);
        b = digitsB ? randDigitNum(digitsB) : randInt(min, max);
        guard++;
      }
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
  generateProblems();
});
