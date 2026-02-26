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
            alert('최대 6개까지만 선택할 수 있습니다.');
            return;
        }
        selectedNumbers.push(num);
        btn.classList.add('selected');
    }
    updateSelection();
}

function updateSelection() {
    selectedNumbers.sort((a, b) => a - b);
    selectionDisplay.textContent = selectedNumbers.length > 0 ? selectedNumbers.join(', ') : '번호를 선택해주세요.';
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
        case 6: return { rank: 1, prize: 2000000000, msg: '1등 당첨' };
        case 5: return { rank: 3, prize: 1500000, msg: '3등 당첨' };
        case 4: return { rank: 4, prize: 50000, msg: '4등 당첨' };
        case 3: return { rank: 5, prize: 5000, msg: '5등 당첨' };
        default: return { rank: 0, prize: 0, msg: '낙첨' };
    }
}

async function playLotto() {
    if (balance < 1000) {
        alert('잔액이 부족합니다.');
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
    
    resultMessage.textContent = `${result.msg} (일치: ${matches}개)`;
    resultMessage.classList.remove('hidden');
    
    // 고급스러운 색상 적용
    if (result.rank > 0) {
        resultMessage.style.backgroundColor = 'rgba(46, 204, 113, 0.15)';
        resultMessage.style.borderColor = 'rgba(46, 204, 113, 0.4)';
        resultMessage.style.color = '#2ecc71';
    } else {
        resultMessage.style.backgroundColor = 'rgba(231, 76, 60, 0.15)';
        resultMessage.style.borderColor = 'rgba(231, 76, 60, 0.4)';
        resultMessage.style.color = '#e74c3c';
    }

    updateStats();
    addToHistory(winNumbers, matches, result.rank);
    drawBtn.disabled = false;
}

function updateStats() {
    balanceEl.textContent = balance.toLocaleString() + '원';
    const roi = totalSpent === 0 ? 0 : ((totalWon - totalSpent) / totalSpent * 100).toFixed(1);
    roiEl.textContent = roi + '%';
    roiEl.style.color = roi > 0 ? '#2ecc71' : roi < 0 ? '#e74c3c' : 'var(--text-color)';
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

    li.innerHTML = `<span>${time} <span style="margin-left:8px; color:${rank>0?'#2ecc71':'var(--text-muted)'}">${rank > 0 ? rank+'등' : '낙첨'}</span></span>${ballsHtml}`;
    historyList.prepend(li);
    if (historyList.children.length > 5) historyList.lastChild.remove();
}

drawBtn.addEventListener('click', playLotto);
initTheme(); // 테마 초기화
initPicker();
updateStats();

function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
        });
    }
}
