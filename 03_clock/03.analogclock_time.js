const createHand = (color, width, height, top, left) => {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.background = color;
    el.style.width = width;
    el.style.height = height;
    el.style.top = top;
    el.style.left = left;
    el.style.transformOrigin = 'bottom';
    el.style.borderRadius = '2px';
    return el;
}

const generateClocks = () => {
    const container = document.getElementById('clock-container');
    container.innerHTML = '';

    const count = parseInt(document.getElementById('clock-count').value);
    const useSecond = document.getElementById('show-seconds').checked;
    const minuteUnit = parseInt(document.getElementById('minute-unit').value);
    const imageUnit = document.getElementById('image-unit').value;
    const afterSelection = parseInt(document.getElementById('minutes-after-selection').value);

    for (let i = 0; i < count; i++) {
        const h = Math.floor(Math.random() * 12) + 1;
        const m = Math.floor(Math.random() * (60 / minuteUnit)) * minuteUnit;
        const waitTime = (afterSelection === 99) ? (Math.floor(Math.random() * 9) + 1) * 10 : afterSelection;

        // カード生成
        const card = document.createElement('div');
        card.className = 'clock-card';

        // 時計盤
        const face = document.createElement('div');
        face.className = `clock${imageUnit}`;

        // 針の計算
        const hDeg = (h % 12) * 30 + m * 0.5;
        const mDeg = m * 6;

        // 短針（青）
        const hourHand = createHand('#0000ff', '4px', '30%', '20%', '48%');
        hourHand.style.transform = `rotate(${hDeg}deg)`;
        
        // 長針（赤）
        const minHand = createHand('#ff0000', '2px', '42%', '8%', '49.2%');
        minHand.style.transform = `rotate(${mDeg}deg)`;

        face.appendChild(hourHand);
        face.appendChild(minHand);
        card.appendChild(face);

        // 正解
        let totalM = m + waitTime;
        let ansH = (h + Math.floor(totalM / 60)) % 12 || 12;
        let ansM = totalM % 60;

        // 下部テキストエリア
        const info = document.createElement('div');
        info.className = 'clock-input';
        info.innerHTML = `
            <div class="input-row">いま：<input type="text"> じ <input type="text"> ふん</div>
            <div class="target-text">★ ${waitTime} 分後 は？</div>
            <div class="input-row"><input type="text"> じ <input type="text"> ふん</div>
            <div class="ans-hint">答え：${ansH}時${ansM.toString().padStart(2, '0')}分</div>
        `;

        card.appendChild(info);
        container.appendChild(card);
    }
}

const toggleAnswers = () => {
    const hints = document.querySelectorAll('.ans-hint');
    hints.forEach(h => {
        h.style.visibility = (h.style.visibility === 'visible') ? 'hidden' : 'visible';
    });
}