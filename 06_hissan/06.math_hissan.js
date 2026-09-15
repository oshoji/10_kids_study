function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randDigitNum(d) {
  if (!d) return null;
  const min = Math.pow(10, d - 1);
  const max = Math.pow(10, d) - 1;
  return randInt(min, max);
}

let answers = []; // { correct, isAddSub, numAnswerDigits }

function hissanRow(text, opCell, numDigits) {
  const digits = String(text).padStart(numDigits, " ").split("");
  const opTd = `<td class="hissan-op-cell">${opCell}</td>`;
  const digitTds = digits.map(d => `<td>${d === " " ? "" : d}</td>`).join("");
  return `<tr>${opTd}${digitTds}</tr>`;
}

function digitInputsHTML(idx, numAnswerDigits) {
  let inputs = "";
  for (let d = 0; d < numAnswerDigits; d++) {
    inputs += `<input id="ans-${idx}-${d}" type="text" inputmode="numeric" maxlength="1" class="hissan-digit-input border-2 p-0 text-center" />`;
  }
  return `<div class="hissan-answer-digits">${inputs}</div>`;
}

function toColumns(numStr, width) {
  return numStr.padStart(width, " ").split("").map(ch => ch === " " ? null : ch);
}

// 各列につき実在するセル(a/b/answer)のうち最大1つだけを空欄にする。
// これにより一の位から順に繰り上がり/繰り下がりを確定させながら一意に解ける。
function chooseBlanks(colsA, colsB, colsR, width, blankCount) {
  const candidates = [];
  for (let c = 0; c < width; c++) {
    const present = ["a", "b", "r"].filter(k => ({ a: colsA, b: colsB, r: colsR })[k][c] !== null);
    if (present.length > 0) candidates.push({ c, present });
  }

  const shuffled = candidates.slice().sort(() => Math.random() - 0.5);
  const n = Math.min(Math.max(1, blankCount || 1), shuffled.length);

  const blankMap = {};
  shuffled.slice(0, n).forEach(({ c, present }) => {
    blankMap[c] = present[randInt(0, present.length - 1)];
  });
  return blankMap;
}

function createBlankVerticalHTML(op, a, b, idx, blankCount) {
  const numDigits = Math.max(String(a).length, String(b).length);
  const width = numDigits + 1;
  const correct = op === "+" ? a + b : a - b;

  const rowsData = {
    a: toColumns(String(a), width),
    b: toColumns(String(b), width),
    r: toColumns(String(correct), width),
  };

  const blankMap = chooseBlanks(rowsData.a, rowsData.b, rowsData.r, width, blankCount);
  const cells = [];

  function renderRow(rowKey, opChar) {
    const opTd = `<td class="hissan-op-cell">${opChar}</td>`;
    let tds = "";
    for (let c = 0; c < width; c++) {
      const val = rowsData[rowKey][c];
      if (val === null) {
        tds += `<td></td>`;
      } else if (blankMap[c] === rowKey) {
        const id = `blank-${idx}-${rowKey}-${c}`;
        cells.push({ id, correct: val });
        tds += `<td><input id="${id}" type="text" inputmode="numeric" maxlength="1" class="hissan-digit-input border-2 p-0 text-center" /></td>`;
      } else {
        tds += `<td>${val}</td>`;
      }
    }
    return `<tr>${opTd}${tds}</tr>`;
  }

  const html = `
    <div class="problem-container">
      <table class="hissan-table">
        ${renderRow("a", "")}
        ${renderRow("b", op)}
        <tr><td colspan="${width + 1}"><hr class="border-t-4 border-gray-600 my-2" /></td></tr>
        ${renderRow("r", "")}
      </table>
    </div>`;

  return { html, cells };
}

function createVerticalHTML(op, a, b, idx) {
  const numDigits = Math.max(String(a).length, String(b).length);
  const totalCols = numDigits + 1;
  const totalWidthEm = (0.9 + numDigits * 1.1).toFixed(2); // .hissan-table の列幅(op:0.9em, 桁:1.1em)と合わせる

  // 足し算・引き算は桁ごとに解答欄を分ける(桁数は第1・第2数のいずれか大きい方+1)
  const isAddSub = op === "+" || op === "-";
  const answerHTML = isAddSub
    ? digitInputsHTML(idx, numDigits + 1)
    : `<input id="ans-${idx}" type="text" style="width:${totalWidthEm}em" class="border-2 p-2 text-right" />`;

  return `
    <div class="problem-container">
      <table class="hissan-table">
        ${hissanRow(a, "", numDigits)}
        ${hissanRow(b, op, numDigits)}
        <tr><td colspan="${totalCols}"><hr class="border-t-4 border-gray-600 my-2" /></td></tr>
      </table>
      ${answerHTML}
    </div>`;
}

function generateProblems() {
  const op = document.getElementById("operator").value;
  const count = +document.getElementById("count").value;
  const min = +document.getElementById("min").value;
  const max = +document.getElementById("max").value;
  const digitsA = +document.getElementById("digitsA").value || null;
  const digitsB = +document.getElementById("digitsB").value || null;
  const blankCount = +document.getElementById("blankCount").value || 3;

  const isBlank = op === "+blank" || op === "-blank";
  const baseOp = isBlank ? op[0] : op;

  const container = document.getElementById("problems");
  container.innerHTML = "";
  answers = [];

  for (let i = 0; i < count; i++) {
    let a = digitsA ? randDigitNum(digitsA) : randInt(min, max);
    let b = digitsB ? randDigitNum(digitsB) : randInt(min, max);

    if (baseOp === "/") {
      b = b === 0 ? 1 : b;
      const q = randInt(1, Math.floor(max / b));
      a = b * q;
    } else if (baseOp === "-") {
      // 第1数(a)＞第2数(b)を維持する。桁数指定がある場合はそれぞれの桁数の範囲内で再抽選する
      let guard = 0;
      while (a <= b && guard < 100) {
        a = digitsA ? randDigitNum(digitsA) : randInt(min, max);
        b = digitsB ? randDigitNum(digitsB) : randInt(min, max);
        guard++;
      }
    }

    if (isBlank) {
      const { html, cells } = createBlankVerticalHTML(baseOp, a, b, i, blankCount);
      container.innerHTML += html;
      answers.push({ type: "blank", cells });
      continue;
    }

    container.innerHTML += createVerticalHTML(op, a, b, i);

    let correct;
    switch (op) {
      case "+": correct = a + b; break;
      case "-": correct = a - b; break;
      case "*": correct = a * b; break;
      case "/": correct = a / b; break;
    }

    const isAddSub = op === "+" || op === "-";
    const numDigits = Math.max(String(a).length, String(b).length);
    answers.push({
      correct,
      isAddSub,
      numAnswerDigits: numDigits + 1,
    });
  }

  document.getElementById("check").classList.remove("hidden");
}

function markField(field, isCorrect) {
  if (isCorrect) {
    field.classList.add("bg-green-100", "border-green-500");
    field.classList.remove("bg-red-100", "border-red-500");
  } else {
    field.classList.add("bg-red-100", "border-red-500");
    field.classList.remove("bg-green-100", "border-green-500");
  }
}

function checkAnswers() {
  answers.forEach((entry, idx) => {
    if (entry.type === "blank") {
      entry.cells.forEach(({ id, correct }) => {
        const field = document.getElementById(id);
        const val = field.value.trim();
        markField(field, val !== "" && val === correct);
      });
    } else if (entry.isAddSub) {
      const fields = [];
      let text = "";
      for (let d = 0; d < entry.numAnswerDigits; d++) {
        const field = document.getElementById(`ans-${idx}-${d}`);
        fields.push(field);
        text += field.value.trim();
      }
      const isCorrect = text !== "" && Number(text) === entry.correct;
      fields.forEach(field => markField(field, isCorrect));
    } else {
      const field = document.getElementById(`ans-${idx}`);
      const user = Number(field.value);
      markField(field, user === entry.correct);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("generate").addEventListener("click", generateProblems);
  document.getElementById("check").addEventListener("click", checkAnswers);
  generateProblems();
});
