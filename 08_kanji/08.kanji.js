const MARK_RE = /\[([^|\]]+)\|([^\]]+)\]/g;
const isKanji = ch => /\p{Script=Han}/u.test(ch);

// かん字 → 行 の対応表
const KANJI_TO_GROUP = {};
Object.entries(GRADE2_GROUPS).forEach(([group, chars]) => {
  for (const ch of chars) KANJI_TO_GROUP[ch] = group;
});

// 文を「ふつうの文字列」と「出題部分」に分ける
function parseSentence(text) {
  const parts = [];
  let last = 0;
  let m;
  MARK_RE.lastIndex = 0;
  while ((m = MARK_RE.exec(text))) {
    if (m.index > last) parts.push({ type: "text", text: text.slice(last, m.index) });
    parts.push({ type: "mark", word: m[1], reading: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts;
}

function sentenceGroups(text) {
  const groups = new Set();
  parseSentence(text).forEach(p => {
    if (p.type !== "mark") return;
    for (const ch of p.word) if (KANJI_TO_GROUP[ch]) groups.add(KANJI_TO_GROUP[ch]);
  });
  return groups;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function renderMark(part, showAnswer) {
  const word = escapeHTML(part.word);
  const reading = escapeHTML(part.reading);

  if (part.kind === "yomi") {
    // かん字を見せて、よみがなを書かせる
    const width = (part.reading.length * 1.2 + 0.6).toFixed(2);
    const box = showAnswer
      ? `<span class="yomi-box answer" style="width:${width}em">${reading}</span>`
      : `<span class="yomi-box" style="width:${width}em"></span>`;
    return `<ruby class="q-yomi"><span class="base">${word}</span><rt>${box}</rt></ruby>`;
  }

  // よみがなを見せて、かん字を書かせる（送りがなはそのまま見せる）
  const base = [...part.word]
    .map(ch => {
      if (!isKanji(ch)) return escapeHTML(ch);
      return showAnswer
        ? `<span class="kanji-box answer">${escapeHTML(ch)}</span>`
        : `<span class="kanji-box"></span>`;
    })
    .join("");
  return `<ruby class="q-kaki">${base}<rt>${reading}</rt></ruby>`;
}

function renderSheet(problems, showAnswer, extraClass = "") {
  const rows = problems
    .map((parts, i) => {
      const body = parts
        .map(p => (p.type === "text" ? escapeHTML(p.text) : renderMark(p, showAnswer)))
        .join("");
      return `<div class="problem"><div class="problem-no">(${i + 1})</div><div class="problem-text">${body}</div></div>`;
    })
    .join("");

  const title = showAnswer ? "かん字の読み書き（こたえ）" : "かん字の読み書き";
  return `
    <section class="sheet ${extraClass}">
      <div class="sheet-header">
        <div class="sheet-title">${title}</div>
        <div class="sheet-fields">
          <span><span class="field-line"></span>月<span class="field-line"></span>日</span>
          <span>なまえ <span class="field-line name"></span></span>
        </div>
      </div>
      <p class="sheet-note">□には かん字を、上の わくには よみがなを 書きましょう。</p>
      ${rows}
    </section>`;
}

let currentProblems = [];
let answerVisible = false;

function render() {
  const sheets = document.getElementById("sheets");
  sheets.innerHTML =
    renderSheet(currentProblems, answerVisible) +
    (answerVisible ? "" : renderSheet(currentProblems, true, "answer-sheet print-only"));
  document.getElementById("toggleAnswer").textContent = answerVisible ? "こたえをかくす" : "こたえを見る";
}

function generate() {
  const count = Math.max(1, +document.getElementById("count").value || 10);
  const mode = document.getElementById("mode").value;
  const selected = new Set(
    [...document.querySelectorAll("#groups input:checked")].map(el => el.value)
  );
  if (selected.size === 0) {
    alert("かん字のはんいを1つ以上えらんでください。");
    return;
  }

  const pool = KANJI_SENTENCES.filter(s => [...sentenceGroups(s)].some(g => selected.has(g)));
  const picked = shuffle(pool).slice(0, count);
  const problems = picked.map(parseSentence);

  // 出題部分ごとに「読み」か「書き」を決める。まぜる場合は半分ずつにしてシャッフル
  const marks = problems.flat().filter(p => p.type === "mark");
  let kinds;
  if (mode === "mix") {
    kinds = shuffle(marks.map((_, i) => (i % 2 === 0 ? "yomi" : "kaki")));
  } else {
    kinds = marks.map(() => mode);
  }
  marks.forEach((m, i) => (m.kind = kinds[i]));

  currentProblems = problems;
  answerVisible = false;
  render();
}

function setupGroups() {
  const container = document.getElementById("groups");
  container.innerHTML = Object.keys(GRADE2_GROUPS)
    .map(
      g => `<label class="flex items-center gap-1"><input type="checkbox" value="${g}" checked />${g}</label>`
    )
    .join("");
}

function updatePrintClass() {
  document.body.classList.toggle("no-answer-print", !document.getElementById("answerPage").checked);
}

setupGroups();
updatePrintClass();
document.getElementById("generate").addEventListener("click", generate);
document.getElementById("toggleAnswer").addEventListener("click", () => {
  answerVisible = !answerVisible;
  render();
});
document.getElementById("print").addEventListener("click", () => window.print());
document.getElementById("answerPage").addEventListener("change", updatePrintClass);
generate();
