function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

// cards: 数字配列（0や重複を含みうる）, r: 使用枚数
// インデックスベースで全順列を列挙→先頭桁0除外→文字列化してSetで重複順列をdedupe→数値ソート
function enumeratePermutationNumbers(cards, r) {
  const n = cards.length;
  const used = new Array(n).fill(false);
  const resultSet = new Set();
  const current = [];

  function backtrack() {
    if (current.length === r) {
      if (current[0] === 0 && r > 1) return; // 先頭0除外（r=1のときの単独"0"は許容）
      resultSet.add(current.join(""));
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(cards[i]);
      backtrack();
      current.pop();
      used[i] = false;
    }
  }

  backtrack();
  return Array.from(resultSet, Number).sort((a, b) => a - b);
}

function resolveBool(mode) {
  if (mode === "random") return Math.random() < 0.5;
  return mode === "include";
}

// n枚のカードを作る。重複を含める場合、重複させる数字は0以外から選ぶ
// （0の重複は先頭0除外が増えるだけで教育的意味が薄いため）
function buildCards(n, includeZero, includeDup) {
  const basePool = shuffle(includeZero ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9]);

  if (!includeDup) {
    return shuffle(basePool.slice(0, n));
  }

  const base = basePool.slice(0, n - 1);
  const dupCandidates = base.filter(d => d !== 0);
  const dupDigit = dupCandidates.length > 0
    ? dupCandidates[randInt(0, dupCandidates.length - 1)]
    : base[randInt(0, base.length - 1)];
  return shuffle(base.concat([dupDigit]));
}

function cardsHTML(cards) {
  return `<div class="card-row">${cards.map(c => `<span class="card-box">${c}</span>`).join("")}</div>`;
}

function useText(cards, r) {
  return r === cards.length
    ? "ぜんぶ ならべて"
    : `${cards.length}まいの 中から ${r}まいを えらんで ならべて`;
}

function makeProblemText(cards, r) {
  return `上の カードを ${useText(cards, r)}、${r}けたの 数を つくります。`;
}

function renderRankProblem(cards, r, dir, k, correct) {
  const askText = k === 1
    ? (dir === "desc" ? "一番 大きい 数" : "一番 小さい 数")
    : (dir === "desc"
        ? `大きい ほうから ${k}ばんめに 大きい 数`
        : `小さい ほうから ${k}ばんめに 小さい 数`);

  return `
    <div class="problem-container">
      ${cardsHTML(cards)}
      <p class="question-text">${makeProblemText(cards, r)}<br>${askText}は 何ですか。</p>
      <input type="number" inputmode="numeric" class="answer-input border-2 p-2 text-center" data-correct="${correct}" />
    </div>`;
}

function renderThresholdProblem(cards, r, dir, x, correct) {
  const dirText = dir === "gt" ? "より 大きい" : "より 小さい";

  return `
    <div class="problem-container">
      ${cardsHTML(cards)}
      <p class="question-text">${makeProblemText(cards, r)}<br>${x} ${dirText} 数は 何とおり ありますか。</p>
      <input type="number" inputmode="numeric" class="answer-input border-2 p-2 text-center" data-correct="${correct}" />
    </div>`;
}

function buildOneProblem(settings) {
  for (let guard = 0; guard < 50; guard++) {
    const N = (settings.randomizeAll || settings.cardCountMode === "random")
      ? randInt(3, 7)
      : settings.cardCountValue;

    const usePartial = settings.randomizeAll
      ? Math.random() < 0.5
      : settings.useAllMode === "random"
        ? Math.random() < 0.5
        : settings.useAllMode === "partial";

    let r = N;
    if (usePartial && N > 2) {
      const maxR = N - 1;
      const desired = (!settings.randomizeAll && settings.useAllMode !== "random" && settings.useCountValue)
        ? settings.useCountValue
        : randInt(2, maxR);
      r = Math.min(Math.max(2, desired), maxR);
    }

    const includeZero = resolveBool(settings.randomizeAll ? "random" : settings.zeroMode);
    const includeDup = resolveBool(settings.randomizeAll ? "random" : settings.dupMode);

    const cards = buildCards(N, includeZero, includeDup);
    const numbers = enumeratePermutationNumbers(cards, r);

    if (numbers.length < 2) continue;

    const pattern = settings.patternMode === "mix"
      ? (Math.random() < 0.5 ? "rank" : "threshold")
      : settings.patternMode;

    if (pattern === "rank") {
      const dir = Math.random() < 0.5 ? "desc" : "asc";
      const k = randInt(1, Math.min(numbers.length, 5));
      const correct = dir === "desc" ? numbers[numbers.length - k] : numbers[k - 1];
      return renderRankProblem(cards, r, dir, k, correct);
    }

    const dir = Math.random() < 0.5 ? "gt" : "lt";
    const minV = numbers[0];
    const maxV = numbers[numbers.length - 1];
    let x, matchCount;
    for (let xGuard = 0; xGuard < 30; xGuard++) {
      x = randInt(minV, maxV);
      matchCount = numbers.filter(v => dir === "gt" ? v > x : v < x).length;
      if (matchCount > 0 && matchCount < numbers.length) break;
    }
    if (matchCount === 0 || matchCount === numbers.length) continue;

    return renderThresholdProblem(cards, r, dir, x, matchCount);
  }

  // フォールバック: 通常ここには到達しない想定の保険
  const cards = [1, 2, 3, 4];
  const numbers = enumeratePermutationNumbers(cards, 4);
  return renderRankProblem(cards, 4, "desc", 1, numbers[numbers.length - 1]);
}

function generateProblems() {
  const settings = {
    patternMode: document.getElementById("patternMode").value,
    randomizeAll: document.getElementById("randomizeAll").checked,
    cardCountMode: document.getElementById("cardCountMode").value,
    cardCountValue: +document.getElementById("cardCountValue").value,
    useAllMode: document.getElementById("useAllMode").value,
    useCountValue: +document.getElementById("useCountValue").value,
    zeroMode: document.getElementById("zeroMode").value,
    dupMode: document.getElementById("dupMode").value,
  };
  const count = +document.getElementById("count").value;

  const container = document.getElementById("problems");
  container.innerHTML = "";

  for (let i = 0; i < count; i++) {
    container.innerHTML += buildOneProblem(settings);
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
  document.querySelectorAll(".answer-input").forEach(field => {
    const correct = Number(field.getAttribute("data-correct"));
    const val = field.value.trim();
    markField(field, val !== "" && Number(val) === correct);
  });
}

// 「すべてランダム」時は全項目を無効化。それ以外は、値セレクトを親モードの選択に応じて無効化する
// （例: カード枚数が「ランダム」のときは「4枚」selectが無意味になるので灰色にする）
function toggleModeFields() {
  const randomizeAll = document.getElementById("randomizeAll").checked;
  const cardCountMode = document.getElementById("cardCountMode");
  const useAllMode = document.getElementById("useAllMode");

  ["cardCountMode", "useAllMode", "zeroMode", "dupMode"].forEach(id => {
    document.getElementById(id).disabled = randomizeAll;
  });

  document.getElementById("cardCountValue").disabled = randomizeAll || cardCountMode.value === "random";
  document.getElementById("useCountValue").disabled = randomizeAll || useAllMode.value !== "partial";
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("generate").addEventListener("click", generateProblems);
  document.getElementById("check").addEventListener("click", checkAnswers);
  document.getElementById("randomizeAll").addEventListener("change", toggleModeFields);
  document.getElementById("cardCountMode").addEventListener("change", toggleModeFields);
  document.getElementById("useAllMode").addEventListener("change", toggleModeFields);
  toggleModeFields();
  generateProblems();
});
