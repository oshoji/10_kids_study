function generateClocks() {
    const container = document.getElementById('clock-container');
    const count = parseInt(document.getElementById('clock-count').value) || 8;
    const minuteUnit = parseInt(document.getElementById('minute-unit').value);
    const minutesAfterSelect = parseInt(document.getElementById('minutes-after-selection').value);

    container.innerHTML = ''; 

    for (let i = 0; i < count; i++) {
        const startHour = Math.floor(Math.random() * 12);
        const startMin = Math.floor(Math.random() * (60 / minuteUnit)) * minuteUnit;
        
        let elapsed;
        if (minutesAfterSelect === 99) {
            elapsed = (Math.floor(Math.random() * 11) + 1) * 5; 
        } else {
            elapsed = minutesAfterSelect;
        }

        const endTimeTotal = (startHour * 60) + startMin + elapsed;
        const endHour = Math.floor(endTimeTotal / 60) % 12;
        const endMin = endTimeTotal % 60;

        const row = document.createElement('div');
        row.className = 'problem-row';
        row.id = `row-${i}`;
        
        row.innerHTML = `
            <div class="clocks-group">
                <canvas id="start-${i}" width="180" height="180"></canvas>
                <div class="arrow">▶</div>
                <canvas id="end-${i}" width="180" height="180"></canvas>
            </div>
            <div class="answer-column">
                <div class="answer-input-wrapper">
                    <input type="number" class="time-input" id="input-${i}" data-correct="${elapsed}">
                    <span>分 たった</span>
                </div>
            </div>
        `;
        container.appendChild(row);

        // 第3引数(補助表示)を削除またはfalseにして呼び出し
        drawClock(`start-${i}`, startHour, startMin);
        drawClock(`end-${i}`, endHour, endMin);
    }
}

function checkAllAnswers() {
    const inputs = document.querySelectorAll('.time-input');
    
    inputs.forEach((input, index) => {
        const row = document.getElementById(`row-${index}`);
        const userAnswer = parseInt(input.value);
        const correctAnswer = parseInt(input.getAttribute('data-correct'));

        if (isNaN(userAnswer)) {
            row.classList.remove('is-correct', 'is-wrong');
            return;
        }

        if (userAnswer === correctAnswer) {
            row.classList.add('is-correct');
            row.classList.remove('is-wrong');
        } else {
            row.classList.add('is-wrong');
            row.classList.remove('is-correct');
        }
    });
}

function drawClock(canvasId, hr, min) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2;
    const r = radius * 0.85;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);

    // 時計の枠
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#333';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fill();

    // 目盛りと数字
    for (let i = 0; i < 60; i++) {
        let ang = i * Math.PI / 30;
        ctx.rotate(ang);
        if (i % 5 === 0) {
            // 太い目盛り
            ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r + 12);
            ctx.lineWidth = 2; ctx.strokeStyle = '#333'; ctx.stroke();
            
            // 1〜12の数字
            ctx.save();
            ctx.translate(0, -r + 25);
            ctx.rotate(-ang);
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = '#000';
            ctx.fillText(i === 0 ? 12 : i / 5, 0, 0);
            ctx.restore();
        } else {
            // 細い目盛り
            ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r + 6);
            ctx.lineWidth = 1; ctx.strokeStyle = '#666'; ctx.stroke();
        }
        ctx.rotate(-ang);
    }

    // 針の計算
    const hPos = (hr % 12 * Math.PI / 6) + (min * Math.PI / 360);
    drawHand(ctx, hPos, r * 0.5, 6, "#333"); // 短針
    const mPos = (min * Math.PI / 30);
    drawHand(ctx, mPos, r * 0.8, 4, "#333"); // 長針

    // 中心点
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#333"; ctx.fill();

    ctx.restore();
}

function drawHand(ctx, pos, len, wid, color) {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = wid;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.rotate(pos);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -len);
    ctx.stroke();
    ctx.restore();
}