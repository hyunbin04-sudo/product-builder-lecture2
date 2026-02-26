const lottoDisplay = document.getElementById('lotto-display');
const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
const historyList = document.getElementById('history-list');

function getRandomNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(n)) {
            numbers.push(n);
        }
    }
    return numbers.sort((a, b) => a - b);
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'grey';
    return 'green';
}

function clearDisplay() {
    lottoDisplay.innerHTML = '';
}

function addToHistory(numbers) {
    const li = document.createElement('li');
    li.className = 'history-item';
    
    const time = new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let ballsHtml = '<div class="history-balls">';
    numbers.forEach(num => {
        const color = getBallColorClass(num);
        ballsHtml += `<div class="small-ball ${color}">${num}</div>`;
    });
    ballsHtml += '</div>';

    li.innerHTML = `<span>${time}</span>${ballsHtml}`;
    
    if (historyList.firstChild) {
        historyList.insertBefore(li, historyList.firstChild);
    } else {
        historyList.appendChild(li);
    }

    // 최대 5개 이력만 유지
    if (historyList.children.length > 5) {
        historyList.removeChild(historyList.lastChild);
    }
}

async function drawLotto() {
    drawBtn.disabled = true;
    clearDisplay();

    const numbers = getRandomNumbers();
    
    for (let i = 0; i < numbers.length; i++) {
        const num = numbers[i];
        const colorClass = getBallColorClass(num);
        
        const ball = document.createElement('div');
        ball.className = `ball ${colorClass}`;
        ball.textContent = num;
        
        lottoDisplay.appendChild(ball);
        
        // 순차적으로 나타나는 효과를 위해 대기
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    addToHistory(numbers);
    drawBtn.disabled = false;
}

drawBtn.addEventListener('click', drawLotto);

resetBtn.addEventListener('click', () => {
    clearDisplay();
    lottoDisplay.innerHTML = '<div class="placeholder">추첨 버튼을 눌러주세요</div>';
    historyList.innerHTML = '';
});
