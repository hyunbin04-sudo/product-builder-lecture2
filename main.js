const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

let score = 0;
let gameOver = false;

// 키보드 입력 상태 관리
const keys = {
    ArrowRight: false,
    ArrowLeft: false,
    ArrowUp: false,
    Space: false
};

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
    if (e.code === 'Space') keys.ArrowUp = true;
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
    if (e.code === 'Space') keys.ArrowUp = false;
});

// 플레이어 (마리오 역할)
const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    speed: 5,
    dx: 0,
    dy: 0,
    gravity: 0.6,
    jumpPower: -12,
    grounded: false
};

// 지형 (발판 및 바닥)
const platforms = [
    { x: 0, y: 350, width: 800, height: 50 }, // 메인 바닥
    { x: 200, y: 250, width: 120, height: 20 },
    { x: 400, y: 150, width: 120, height: 20 },
    { x: 600, y: 250, width: 120, height: 20 }
];

// 코인 (점수 아이템)
let coins = [
    { x: 250, y: 210, width: 20, height: 20, collected: false },
    { x: 450, y: 110, width: 20, height: 20, collected: false },
    { x: 650, y: 210, width: 20, height: 20, collected: false },
    { x: 700, y: 310, width: 20, height: 20, collected: false }
];

// 게임 초기화
function resetGame() {
    player.x = 50;
    player.y = 300;
    player.dx = 0;
    player.dy = 0;
    score = 0;
    scoreEl.textContent = score;
    coins.forEach(c => c.collected = false);
    gameOver = false;
}

// 로직 업데이트
function update() {
    if (gameOver) return;

    // 좌우 이동
    if (keys.ArrowRight) {
        player.dx = player.speed;
    } else if (keys.ArrowLeft) {
        player.dx = -player.speed;
    } else {
        player.dx = 0;
    }

    // 점프
    if (keys.ArrowUp && player.grounded) {
        player.dy = player.jumpPower;
        player.grounded = false;
    }

    // 중력 적용
    player.dy += player.gravity;
    player.x += player.dx;
    player.y += player.dy;

    // 화면 경계 제한
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    player.grounded = false;

    // 플랫폼(지형) 충돌 처리
    platforms.forEach(p => {
        // 플레이어가 떨어지는 중이고, 플랫폼 위로 겹칠 때만 착지 판정
        if (player.y + player.height <= p.y + player.dy && 
            player.x + player.width > p.x && 
            player.x < p.x + p.width) {
            
            if (player.y + player.height + player.dy >= p.y) {
                player.grounded = true;
                player.dy = 0;
                player.y = p.y - player.height;
            }
        }
    });

    // 코인 획득 검사
    coins.forEach(c => {
        if (!c.collected &&
            player.x < c.x + c.width &&
            player.x + player.width > c.x &&
            player.y < c.y + c.height &&
            player.y + player.height > c.y) {
            
            c.collected = true;
            score += 100;
            scoreEl.textContent = score;
        }
    });

    // 낙사(게임 오버) 검사
    if (player.y > canvas.height) {
        gameOver = true;
        setTimeout(() => {
            alert(`게임 오버! 🍄\n최종 점수: ${score}점\n확인을 누르면 다시 시작합니다.`);
            resetGame();
        }, 100);
    }
}

// 화면 그리기
function draw() {
    // 배경 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 지형 그리기
    platforms.forEach(p => {
        ctx.fillStyle = '#8B4513'; // 땅(갈색)
        ctx.fillRect(p.x, p.y, p.width, p.height);
        
        ctx.fillStyle = '#228B22'; // 잔디(초록색)
        ctx.fillRect(p.x, p.y, p.width, 6);
    });

    // 코인 그리기
    ctx.fillStyle = '#FFD700'; // 금화
    coins.forEach(c => {
        if (!c.collected) {
            ctx.beginPath();
            ctx.arc(c.x + c.width/2, c.y + c.height/2, c.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
    });

    // 플레이어 그리기 (빨간색 캐릭터)
    ctx.fillStyle = '#E52521';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 캐릭터 눈동자 (방향에 따라)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(player.x + (player.dx >= 0 ? 18 : 4), player.y + 5, 8, 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + (player.dx >= 0 ? 22 : 4), player.y + 7, 4, 4);
}

// 메인 게임 루프
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 게임 시작
resetGame();
gameLoop();
