const kana = [
    "あ", "い", "う", "え", "お"
    , "か", "き", "く", "け", "こ"
    , "さ", "し", "す", "せ", "そ"
    , "た", "ち", "つ", "て", "と"
    , "な", "に", "ぬ", "ね", "の"
    , "は", "ひ", "ふ", "へ", "ほ"
    , "ま", "み", "む", "め", "も"
    , "や", "ゆ", "よ"
    , "ら", "り", "る", "れ", "ろ"
    , "わ", "ん"];

const pokemonNames = {
    "あ": "torchic", "い": "eevee", "う": "sudowoodo", "え": "espeon", "お": "glalie",
    "か": "kyogre", "き": "kyurem", "く": "mawile", "け": "froakie", "こ": "magikarp",
    "さ": "gardevoir", "し": "seadra", "す": "scyther", "せ": "celebi", "そ": "wynaut",
    "た": "exeggcute", "ち": "chikorita", "つ": "stakataka", "て": "terapagos", "と": "togepi",
    "な": "oddish", "に": "meowth", "ぬ": "quagsire", "ね": "natu", "の": "toedscool",
    "は": "dragonair", "ひ": "fletchinder", "ふ": "moltres", "へ": "heracross", "ほ": "wailord",
    "ま": "marill", "み": "mewtwo", "む": "misdreavus", "め": "carbink", "も": "drilbur",
    "や": "sableye", "ゆ": "snorunt", "よ": "noctowl",
    "ら": "raikou", "り": "charizard", "る": "ludicolo", "れ": "magneton", "ろ": "conkeldurr",
    "わ": "krookodile", "ん": "wynaut"
};
const kanaElement = document.getElementById("kana");
const pokemonElement = document.getElementById("pokemon");
const pokemonImage = pokemonElement.querySelector("img");


async function fetchPokemonImage(pokemon) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        const data = await response.json();
        return data.sprites.front_default;
    } catch (error) {
        console.error("Failed to fetch Pokemon image:", error);
        return "";
    }
}

function showElement(element) {
    element.style.display = "block";
}

function hideElement(element) {
    element.style.display = "none";
}

async function showRandomKana() {
    // index random
    const randomKana = kana[Math.floor(Math.random() * kana.length)];
    kanaElement.textContent = randomKana;
    console.log(randomKana)

    if (pokemonNames[randomKana]) {
        const pokemonImageUrl = await fetchPokemonImage(pokemonNames[randomKana]);
        pokemonElement.src = pokemonImageUrl;
        pokemonElement.alt = randomKana + "のポケモン";
    } else {
        pokemonElement.src = "";
        pokemonElement.alt = "画像なし";
    }

    // hideElement(pokemonElement); // ポケモン非表示
    // 10秒後に画像を表示
    setTimeout(() => {
        showElement(pokemonElement);
    }, 5000);

    // // 15秒後にひらがなとポケモンを即時非表示
    // setTimeout(() => {
    //     hideElement(kanaElement); // ひらがな非表示
    //     hideElement(pokemonElement); // ポケモン非表示
    // }, 4000);
}

let intervalId;
let running = false;

document.getElementById("toggleButton").addEventListener("click", () => {
    if (running) {
        clearInterval(intervalId);
        console.log("停止しました");
        document.getElementById("toggleButton").textContent = "スタート";
    } else {
        intervalId = setInterval(function(){hideElement(pokemonElement);showRandomKana(); }, 10000);
        console.log("開始しました");
        document.getElementById("toggleButton").textContent = "ストップ";
    }
    running = !running;
});

// // 初回表示
// showRandomKana();

// // 16秒ごとに新しいひらがなとポケモンを表示
// setInterval(showRandomKana, 7000);
