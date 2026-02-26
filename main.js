const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI 요소
const hpBar = document.getElementById('hp-bar');
const expBar = document.getElementById('exp-bar');
const hpVal = document.getElementById('hp-val');
const expPercent = document.getElementById('exp-percent');
const levelEl = document.getElementById('level');
const goldEl = document.getElementById('gold');

// 게임 데이터
let gameState = {
    level: 1,
    hp: 100,
    maxHp: 100,
    exp: 0,
    maxExp: 1000,
    gold: 0,
    gameOver: false
};

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// 플레이어 설정 (기사 캐릭터)
const player = {
    x: 400,
    y: 250,
    width: 32,
    height: 32,
    speed: 3,
    color: '#3498db', // 기사 느낌의 파란색
    isAttacking: false,
    attackRange: 40,
    lastAttackTime: 0
};

// 몬스터 (오크/해골 느낌)
let monsters = [];
function spawnMonster() {
    if (monsters.length >= 5) return;
    
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * canvas.width; y = -50; }
    else if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; }
    else { x = -50; y = Math.random() * canvas.height; }

    monsters.push({
        x, y,
        width: 30,
        height: 30,
        speed: 1 + Math.random() * 0.8,
        hp: 3,
        maxHp: 3,
        color: '#e67e22', // 오크 주황색
        type: 'Orc'
    });
}

// 입력 리스너
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// 로직 업데이트
function update() {
    if (gameState.gameOver) return;

    // 플레이어 이동 (8방향)
    let dx = 0, dy = 0;
    if (keys.ArrowUp) dy -= player.speed;
    if (keys.ArrowDown) dy += player.speed;
    if (keys.ArrowLeft) dx -= player.speed;
    if (keys.ArrowRight) dx += player.speed;
    
    player.x += dx;
    player.y += dy;

    // 화면 경계 제한
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

    // 몬스터 AI 및 충돌
    monsters.forEach((m, idx) => {
        // 플레이어 추격
        const angle = Math.atan2(player.y - m.y, player.x - m.x);
        m.x += Math.cos(angle) * m.speed;
        m.y += Math.sin(angle) * m.speed;

        // 플레이어와 충돌 시 데미지
        const dist = Math.hypot(player.x - m.x, player.y - m.y);
        if (dist < 25) {
            gameState.hp -= 0.2; // 초당 약 12 데미지
            if (gameState.hp <= 0) {
                gameState.hp = 0;
                gameOver();
            }
            updateUI();
        }
    });

    // 공격 처리 (스페이스바)
    const now = Date.now();
    if (keys.Space && now - player.lastAttackTime > 500) {
        player.isAttacking = true;
        player.lastAttackTime = now;
        
        // 근접 몬스터 타격
        monsters.forEach((m, idx) => {
            const dist = Math.hypot(player.x - m.x, player.y - m.y);
            if (dist < player.attackRange + 10) {
                m.hp -= 1;
                if (m.hp <= 0) {
                    // 처치 성공
                    gameState.exp += 250;
                    gameState.gold += Math.floor(Math.random() * 50) + 10;
                    monsters.splice(idx, 1);
                    checkLevelUp();
                }
            }
        });

        setTimeout(() => { player.isAttacking = false; }, 150);
    }

    // 몬스터 스폰 주기 관리
    if (Math.random() < 0.01) spawnMonster();
}

function checkLevelUp() {
    if (gameState.exp >= gameState.maxExp) {
        gameState.level++;
        gameState.exp = 0;
        gameState.maxExp += 500;
        gameState.maxHp += 20;
        gameState.hp = gameState.maxHp;
        alert(`레벨업! 현재 레벨: ${gameState.level}`);
    }
    updateUI();
}

function updateUI() {
    hpBar.style.width = (gameState.hp / gameState.maxHp * 100) + '%';
    expBar.style.width = (gameState.exp / gameState.maxExp * 100) + '%';
    hpVal.textContent = Math.ceil(gameState.hp);
    expPercent.textContent = Math.floor(gameState.exp / gameState.maxExp * 100);
    levelEl.textContent = gameState.level;
    goldEl.textContent = gameState.gold.toLocaleString();
}

function gameOver() {
    gameState.gameOver = true;
    alert(`캐릭터가 사망했습니다.\n최종 레벨: ${gameState.level}\n획득 골드: ${gameState.gold}`);
    location.reload();
}

// 화면 그리기
function draw() {
    // 배경 (어두운 돌바닥 느낌)
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 격자 무늬 (바닥 타일 느낌)
    ctx.strokeStyle = '#1a1a1d';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let j=0; j<canvas.height; j+=40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }

    // 몬스터 그리기
    monsters.forEach(m => {
        ctx.fillStyle = m.color;
        ctx.fillRect(m.x, m.y, m.width, m.height);
        
        // 몬스터 체력바
        ctx.fillStyle = '#000';
        ctx.fillRect(m.x, m.y - 10, m.width, 4);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(m.x, m.y - 10, (m.hp/m.maxHp) * m.width, 4);
    });

    // 플레이어 그리기
    if (player.isAttacking) {
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y + player.height/2, player.attackRange, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
    }
    
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 기사 투구/망토 표현 (단순 박스 위 장식)
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 8, player.y + 8, 16, 4); // 투구 슬릿
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 시작
updateUI();
gameLoop();
