const lottoDisplay = document.getElementById('lotto-display');
const drawBtn = document.getElementById('draw-btn');
const balanceEl = document.getElementById('balance');
const roiEl = document.getElementById('roi');
const numberPicker = document.getElementById('number-picker');
const selectionDisplay = document.getElementById('my-selection');
const autoPickBtn = document.getElementById('auto-pick');
const clearPickBtn = document.getElementById('clear-pick');
const resultMessage = document.getElementById('result-message');
const historyList = document.getElementById('history-list');

let balance = 10000;
let totalSpent = 0;
let totalWon = 0;
let selectedNumbers = [];

// 1. 번호 선택판 생성
function initPicker() {
    numberPicker.innerHTML = '';
    for (let i = 1; i <= 45; i++) {
        const btn = document.createElement('button');
        btn.className = 'num-btn';
        btn.textContent = i;
        btn.addEventListener('click', () => toggleNumber(i, btn));
        numberPicker.appendChild(btn);
    }
}

function toggleNumber(num, btn) {
    if (selectedNumbers.includes(num)) {
        selectedNumbers = selectedNumbers.filter(n => n !== num);
        btn.classList.remove('selected');
    } else {
        if (selectedNumbers.length >= 6) {
            alert('최대 6개까지만 선택할 수 있어요!');
            return;
        }
        selectedNumbers.push(num);
        btn.classList.add('selected');
    }
    updateSelection();
}

function updateSelection() {
    selectedNumbers.sort((a, b) => a - b);
    selectionDisplay.textContent = selectedNumbers.length > 0 ? selectedNumbers.join(', ') : '선택된 번호가 없습니다.';
    drawBtn.disabled = selectedNumbers.length !== 6;
}

// 자동 선택
autoPickBtn.addEventListener('click', () => {
    selectedNumbers = [];
    while (selectedNumbers.length < 6) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!selectedNumbers.includes(n)) selectedNumbers.push(n);
    }
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.classList.toggle('selected', selectedNumbers.includes(parseInt(btn.textContent)));
    });
    updateSelection();
});

// 초기화
clearPickBtn.addEventListener('click', () => {
    selectedNumbers = [];
    document.querySelectorAll('.num-btn').forEach(btn => btn.classList.remove('selected'));
    updateSelection();
});

// 당첨 판정
function checkRank(matches) {
    switch(matches) {
        case 6: return { rank: 1, prize: 2000000000, msg: '대박!! 1등 당첨! 🎉' };
        case 5: return { rank: 3, prize: 1500000, msg: '축하해요! 3등 당첨! 🥉' };
        case 4: return { rank: 4, prize: 50000, msg: '와우! 4등 당첨! 😊' };
        case 3: return { rank: 5, prize: 5000, msg: '5등 당첨! 본전은 뽑았네요! 👍' };
        default: return { rank: 0, prize: 0, msg: '꽝... 다음 기회에! 😭' };
    }
}

async function playLotto() {
    if (balance < 1000) {
        alert('잔액이 부족합니다! 초기화 버튼을 만들어 드릴게요.');
        return;
    }

    drawBtn.disabled = true;
    balance -= 1000;
    totalSpent += 1000;
    updateStats();

    lottoDisplay.innerHTML = '';
    resultMessage.classList.add('hidden');

    const winNumbers = [];
    while (winNumbers.length < 6) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!winNumbers.includes(n)) winNumbers.push(n);
    }
    winNumbers.sort((a, b) => a - b);

    for (const num of winNumbers) {
        const ball = document.createElement('div');
        const colorClass = num <= 10 ? 'yellow' : num <= 20 ? 'blue' : num <= 30 ? 'red' : num <= 40 ? 'grey' : 'green';
        ball.className = `ball ${colorClass}`;
        ball.textContent = num;
        lottoDisplay.appendChild(ball);
        await new Promise(r => setTimeout(r, 200));
    }

    const matches = selectedNumbers.filter(n => winNumbers.includes(n)).length;
    const result = checkRank(matches);
    
    totalWon += result.prize;
    balance += result.prize;
    
    resultMessage.textContent = `${result.msg} (일치 개수: ${matches}개)`;
    resultMessage.classList.remove('hidden');
    resultMessage.style.backgroundColor = result.rank > 0 ? '#4cd137' : '#ff6b6b';

    updateStats();
    addToHistory(winNumbers, matches, result.rank);
    drawBtn.disabled = false;
}

function updateStats() {
    balanceEl.textContent = balance.toLocaleString() + '원';
    const roi = totalSpent === 0 ? 0 : ((totalWon - totalSpent) / totalSpent * 100).toFixed(1);
    roiEl.textContent = roi + '%';
    roiEl.style.color = roi > 0 ? '#ff6b6b' : roi < 0 ? '#00a8ff' : '#576574';
}

function addToHistory(numbers, matches, rank) {
    const li = document.createElement('li');
    li.className = 'history-item';
    const time = new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    let ballsHtml = '<div class="history-balls">';
    numbers.forEach(num => {
        const color = num <= 10 ? 'yellow' : num <= 20 ? 'blue' : num <= 30 ? 'red' : num <= 40 ? 'grey' : 'green';
        ballsHtml += `<div class="small-ball ${color}">${num}</div>`;
    });
    ballsHtml += '</div>';

    li.innerHTML = `<span>${time} [${rank > 0 ? rank+'등' : '꽝'}]</span>${ballsHtml}`;
    historyList.prepend(li);
    if (historyList.children.length > 5) historyList.lastChild.remove();
}

drawBtn.addEventListener('click', playLotto);
initTheme(); // 테마 초기화 (기존 함수 유지)
initPicker();
updateStats();

// 기존 테마 전환 함수 유지 (단순화)
function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });
}
