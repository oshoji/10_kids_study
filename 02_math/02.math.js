function generateProblems() {
    const min = parseInt(document.getElementById('min').value);
    const max = parseInt(document.getElementById('max').value);
    const operator = document.getElementById('operator').value;
    const count = parseInt(document.getElementById('count').value);
    const column = document.getElementById('column').value;

    if (min < 1 || min >= max || count <= 0) {
        alert('数値の範囲または問題数を正しく入力してください。');
        return;
    }

    const problemsContainer = document.getElementById('problems');
    problemsContainer.innerHTML = '';

    let list = [];
    let retry = 0;
    const usedKukuPairs = new Set(); // 九九(x2)の重複防止用。1〜9の全81通りを使い切ったら重複を許容する
    for (let i = 0; i < count; i++) {
        let seed = 0;
        let A, B, C;
        C = getRandomInt(min, max);

        switch (operator) {
            case '+':
                do {
                    A = getRandomInt(min + seed, C);
                    if (C <= A) {
                        let _ = C;
                        C = A;
                        A = _;
                    }
                    B = C - A;
                    seed++;
                } while (A == 0 | B == 0);
                break;
            case '-':
                do {
                    A = getRandomInt(C - seed, max);
                    if (C >= A) {
                        let _ = C;
                        C = A;
                        A = _;
                    }
                    B = A - C;
                    seed++;
                } while (A == 0 | B == 0);
                break;
            case 'x1':
            do {
                C = getRandomInt(min, max);
                factors = [];
            
                for (let i = 2; i <= Math.floor(Math.sqrt(C)); i++) {
                  if (C % i === 0) {
                    const a = i;
                    const b = C / i;
                    if (a > 1 && b > 1) {
                      factors.push([a, b]);
                    }
                  }
                }
              } while (factors.length === 0);
            
              [A, B] = factors[Math.floor(Math.random() * factors.length)];

               break;
            case 'x2':
                do {
                    A = getRandomInt(1, 9);
                    B = getRandomInt(1, 9);
                } while (usedKukuPairs.has(A + '-' + B) && usedKukuPairs.size < 81);
                usedKukuPairs.add(A + '-' + B);
                C = A * B;
                break;
            case '÷':
                do {
                  B = getRandomInt(min, max);
                  A = B * C;
              
                } while ((A >= min && A <= max * max) == false);
              
                break;
            default:
                break;
        }

        // 計算重複は排除。ただし数値範囲が狭い場合や問題数が少ない場合は重複許容が必要
        if (list.indexOf(A + operator + B) > 0 && (retry <= 5)) {
             console.log("重複:"+ A + operator + B);
            i--;
            retry++;
            continue;
        }else {
            list.push(A + operator + B);
            retry = 0;
        }

        let problem;
        switch (column) {
            case 'ABC':
                const display = getRandomInt(1, 3);
                switch (display) {
                    case 1:
                        problem = `<input type="number" class="answer box no-border" value="${A}" data-correct="${A}"> ${operator.substring(0, 1)} <input type="number" class="answer box no-border" value="${B}" data-correct="${B}"> = <input type="number" class="answer box" data-correct="${C}">`;
                        break;
                    case 2:
                        problem = `<input type="number" class="answer box no-border" value="${A}" data-correct="${A}"> ${operator.substring(0, 1)} <input type="number" class="answer box" data-correct="${B}"> = <input type="number" class="answer box no-border" value="${C}" data-correct="${C}">`;
                        break;
                    case 3:
                        problem = `<input type="number" class="answer box" data-correct="${A}"> ${operator.substring(0, 1)} <input type="number" class="answer box no-border" value="${B}" data-correct="${B}"> = <input type="number" class="answer box no-border" value="${C}" data-correct="${C}">`;
                        break;
                }
                break;
            case 'A':
                problem = `<input type="number" class="answer box" data-correct="${A}"> ${operator.substring(0, 1)} <input type="number" class="answer box no-border" value="${B}" data-correct="${B}"> = <input type="number" class="answer box no-border" value="${C}" data-correct="${C}">`;
                break;
            case 'B':
                problem = `<input type="number" class="answer box no-border" value="${A}" data-correct="${A}"> ${operator.substring(0, 1)} <input type="number" class="answer box" data-correct="${B}"> = <input type="number" class="answer box no-border" value="${C}" data-correct="${C}">`;
                break;
            case 'C':
                problem = `<input type="number" class="answer box no-border" value="${A}" data-correct="${A}"> ${operator.substring(0, 1)} <input type="number" class="answer box no-border" value="${B}" data-correct="${B}"> = <input type="number" class="answer box" data-correct="${C}">`;
                break;
            default:
                break;
        }

        const problemElement = document.createElement('div');
        problemElement.className = 'problem';
        problemElement.innerHTML = problem;
        problemsContainer.appendChild(problemElement);
    }

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * Math.abs(max - min + 1)) + min;
}

function checkAnswers() {
    const answers = document.querySelectorAll('.answer');
    answers.forEach(answer => {
        const userAnswer = parseInt(answer.value);
        const correctAnswer = parseInt(answer.getAttribute('data-correct'));
        if (userAnswer === correctAnswer) {
            answer.style.backgroundColor = 'lightgreen';
        } else {
            answer.style.backgroundColor = 'lightcoral';
        }
    });
}
