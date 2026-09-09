// 時計の要素を作成する関数
const createClockElement = (id, color, width, height, top, left) => {
  const element = document.createElement('div');
  element.id = id;
  element.style.position = 'absolute';
  element.style.background = color;
  element.style.borderRadius = '50%';
  element.style.width = width;
  element.style.height = height;
  element.style.top = top;
  element.style.left = left;
  element.style.transformOrigin = 'bottom';
  return element;
}

// ランダムなIDを生成する関数
const getRandomId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ランダムな時刻を生成する関数
const getRandomTime = (minuteUnit) => {
  const hours = Math.floor(Math.random() * 24); // 0〜23の時間
  const minutes = Math.floor(Math.random() * (60 / minuteUnit)) * minuteUnit; // 5分、10分、15分の単位に丸める
  const second = Math.floor(Math.random() * 60); // 0〜59の秒
  return { hours, minutes, second };
}

// 時計の要素を生成する関数
const createClock = (clockContainer, useSecond, minuteUnit, imageUnit) => {
  const clock = document.createElement('div');
  clock.classList.add('clock' + imageUnit);

  const hourId = 'hour-' + getRandomId();
  const minuteId = 'minute-' + getRandomId();
  const secondId = useSecond ? 'second-' + getRandomId() : null;

  const hour = createClockElement(hourId, '#0000ff', '3%', '20%', '30%', '48.5%');
  const minute = createClockElement(minuteId, '#ff0000', '1%', '30%', '20%', '49%');
  const second = useSecond ? createClockElement(secondId, '#777777', '1.2%', '35%', '15%', '49.4%') : null;

  clock.appendChild(hour);
  clock.appendChild(minute);
  if (useSecond) clock.appendChild(second);

  // 入力フィールド（時・分）を作成
  const inputContainer = document.createElement('div');
  inputContainer.classList.add('clock-input');

  const randomTime = getRandomTime(minuteUnit);

  const hourInput = document.createElement('input');
  // hourInput.value = randomTime.hours;

  const minuteInput = document.createElement('input');
  // minuteInput.value = randomTime.minutes;

  const secondInput = useSecond ? document.createElement('input') : null;
  // if (secondInput) {
  //   secondInput.value = randomTime.second;
  // }

  inputContainer.appendChild(hourInput);
  let _s = document.createElement('p');
  _s.textContent = 'じ';
  inputContainer.append(_s);
  inputContainer.appendChild(minuteInput);
  inputContainer.append(document.createElement('span').textContent = 'ふん');
  if (secondInput) {
    inputContainer.appendChild(secondInput);
    inputContainer.append(document.createElement('span').textContent = 'びょう');
  } 

  clock.appendChild(inputContainer);
  clockContainer.appendChild(clock);

  // ランダムな時間を生成し、時計の針を設定
  updateClock(hourId, minuteId, secondId, useSecond, randomTime);
}

// 時計の針を動かす関数
const updateClock = (hourId, minuteId, secondId, useSecond, randomTime) => {
  const h = randomTime.hours;
  const m = randomTime.minutes;
  const s = useSecond ? randomTime.second : 0;

  const hourDeg = h * 30 + m * 0.5 + s * 0.008333;
  const minuteDeg = m * 6 + s * 0.1;

  document.getElementById(hourId).style.transform = `rotate(${hourDeg}deg)`;
  document.getElementById(minuteId).style.transform = `rotate(${minuteDeg}deg)`;

  if (useSecond) {
    const secondDeg = s * 6;
    document.getElementById(secondId).style.transform = `rotate(${secondDeg}deg)`;
  }
}

// 時計を複数個生成する関数
const generateClocks = () => {
  const clockContainer = document.getElementById('clock-container');
  clockContainer.innerHTML = ''; // 既存の時計をクリア

  const clockCount = parseInt(document.getElementById('clock-count').value);
  const useSecond = document.getElementById('show-seconds').checked;
  const minuteUnit = parseInt(document.getElementById('minute-unit').value);
  const imageUnit = parseInt(document.getElementById('image-unit').value);

  for (let i = 0; i < clockCount; i++) {
    createClock(clockContainer, useSecond, minuteUnit, imageUnit);
  }
}
