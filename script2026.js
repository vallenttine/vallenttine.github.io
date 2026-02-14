// ============ GAME CONFIG ============
const GAME_DURATION = 45;       // seconds
const MAX_MISSES = 10;           // allowed missed hearts before game over
const HEART_SPAWN_INTERVAL = 800; // ms between spawns (gets faster)
const MIN_SPAWN_INTERVAL = 350;
const SPAWN_SPEEDUP = 15;       // ms faster each second
const BROKEN_HEART_CHANCE = 0.18; // 18% chance of broken heart
const CAT_SPEED = 9;            // px per frame (keyboard)

// ============ STATE ============
let canvas, ctx;
let catIdleImg, catLookUpImg;
let imagesLoaded = 0;
let gameRunning = false;
let score = 0;
let misses = 0;
let timeLeft = GAME_DURATION;
let hearts = [];
let cat = { x: 0, y: 0, width: 64, height: 64, direction: 0, sprite: null };
let keys = {};
let touchDir = 0; // -1 left, 0 none, 1 right
let spawnTimer = null;
let gameTimer = null;
let animFrameId = null;
let currentSpawnInterval = HEART_SPAWN_INTERVAL;
let canvasScale = 1;
let timerEnabled = true;
let elapsedSeconds = 0;
let lastFrameTime = 0;

// ============ HEART TYPES ============
const HEART_TYPES = [
    { emoji: '❤️', points: 1, isBad: false },
    { emoji: '💕', points: 2, isBad: false },
    { emoji: '💖', points: 3, isBad: false },
    { emoji: '💔', points: -10, isBad: true },
];

// ============ INIT ============
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    catIdleImg = new Image();
    catIdleImg.src = 'images/cat_sprite_idle.png';
    catIdleImg.onload = onImageLoaded;

    catLookUpImg = new Image();
    catLookUpImg.src = 'images/cat_sprite_looks_up.png';
    catLookUpImg.onload = onImageLoaded;

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('menuBtn').addEventListener('click', goToMenu);
    document.getElementById('envelope').addEventListener('click', openLetter);
    document.getElementById('closeLetter').addEventListener('click', closePrize);

    // Keyboard
    window.addEventListener('keydown', (e) => { keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    // Mobile controls
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    // Pointer events for mobile buttons (works for both touch & mouse)
    leftBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); touchDir = -1; });
    leftBtn.addEventListener('pointerup', () => { touchDir = 0; });
    leftBtn.addEventListener('pointerleave', () => { touchDir = 0; });
    leftBtn.addEventListener('pointercancel', () => { touchDir = 0; });

    rightBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); touchDir = 1; });
    rightBtn.addEventListener('pointerup', () => { touchDir = 0; });
    rightBtn.addEventListener('pointerleave', () => { touchDir = 0; });
    rightBtn.addEventListener('pointercancel', () => { touchDir = 0; });

    // Prevent long-press default behavior (vibration, text selection)
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });

    // Touch drag on canvas directly
    canvas.addEventListener('touchstart', onTouchCanvas, { passive: false });
    canvas.addEventListener('touchmove', onTouchCanvas, { passive: false });

    // Prevent context menu on long press
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    leftBtn.addEventListener('contextmenu', (e) => e.preventDefault());
    rightBtn.addEventListener('contextmenu', (e) => e.preventDefault());
}

function onImageLoaded() {
    imagesLoaded++;
}

// ============ CANVAS SIZING ============
function resizeCanvas() {
    const container = document.getElementById('gameArea');
    const maxW = Math.min(window.innerWidth - 20, 420);
    const maxH = Math.min(window.innerHeight - 180, 560);
    const ratio = 3 / 4; // w/h

    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
        h = maxH;
        w = h * ratio;
    }

    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    // Higher res for retina
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvasScale = dpr;

    // Recalculate cat size proportionally
    cat.width = Math.floor(w * 0.17);
    cat.height = cat.width; // square sprite
    cat.y = canvas.height / dpr - cat.height - 4;

    // Clamp cat position
    if (cat.x < 0) cat.x = 0;
    if (cat.x > w - cat.width) cat.x = w - cat.width;
}

// ============ TOUCH ON CANVAS ============
function onTouchCanvas(e) {
    if (!gameRunning) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const tx = e.touches[0].clientX - rect.left;
    const cw = rect.width;
    // Move cat center toward touch X
    const catCenter = cat.x + cat.width / 2;
    if (tx < catCenter - 5) touchDir = -1;
    else if (tx > catCenter + 5) touchDir = 1;
    else touchDir = 0;
}

// ============ GAME FLOW ============
function startGame() {
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('endMenu').style.display = 'none';
    document.getElementById('gameArea').style.display = 'flex';

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    timerEnabled = document.getElementById('timerCheckbox').checked;
    score = 0;
    misses = 0;
    timeLeft = GAME_DURATION;
    elapsedSeconds = 0;
    hearts = [];
    keys = {};
    touchDir = 0;
    currentSpawnInterval = HEART_SPAWN_INTERVAL;
    gameRunning = true;

    // Show/hide timer in HUD
    document.getElementById('timerHUD').style.display = timerEnabled ? '' : 'none';

    const displayW = canvas.width / canvasScale;
    cat.x = displayW / 2 - cat.width / 2;
    cat.sprite = catLookUpImg;

    updateHUD();
    spawnHeart();
    scheduleSpawn();

    lastFrameTime = performance.now();
    animFrameId = requestAnimationFrame(gameLoop);

    gameTimer = setInterval(() => {
        elapsedSeconds++;
        if (timerEnabled) {
            timeLeft--;
        }
        // Speed up spawning
        currentSpawnInterval = Math.max(MIN_SPAWN_INTERVAL, currentSpawnInterval - SPAWN_SPEEDUP);
        updateHUD();
        if (timerEnabled && timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function scheduleSpawn() {
    spawnTimer = setTimeout(() => {
        if (!gameRunning) return;
        spawnHeart();
        scheduleSpawn();
    }, currentSpawnInterval);
}

function restartGame() {
    document.getElementById('endMenu').style.display = 'none';
    startGame();
}

function goToMenu() {
    document.getElementById('endMenu').style.display = 'none';
    document.getElementById('startMenu').style.display = 'flex';
}

function endGame(missedOut) {
    gameRunning = false;
    clearInterval(gameTimer);
    clearTimeout(spawnTimer);
    cancelAnimationFrame(animFrameId);
    window.removeEventListener('resize', resizeCanvas);

    // Prize: 100+ with timer ON
    if (!missedOut && timerEnabled && score >= 100) {
        showPrize();
        return;
    }

    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('endMenu').style.display = 'flex';

    const endTitle = document.getElementById('endTitle');
    const endMessage = document.getElementById('endMessage');
    const endScore = document.getElementById('endScore');

    endScore.textContent = `Серденьок зібрано: ${score}`;

    if (!timerEnabled) {
        // No timer — success based on score
        if (score >= 40) {
            endTitle.textContent = 'Неймовірно! 🥰';
            endMessage.textContent = 'Ти — справжня майстриня кохання!';
        } else if (score >= 25) {
            endTitle.textContent = 'Чудово! 😻';
            endMessage.textContent = 'Кицюня зібрала багато любові!';
        } else if (score >= 10) {
            endTitle.textContent = 'Непогано! 😺';
            endMessage.textContent = 'Кицюня задоволена, але може краще!';
        } else {
            endTitle.textContent = 'Гарна спроба! 🐱';
            endMessage.textContent = 'Кицюня вірить у тебе!';
        }
    } else if (missedOut) {
        endTitle.textContent = 'Ой лишенько! 😿';
        endMessage.textContent = 'Занадто багато серденьок пропущено… Спробуй ще!';
    } else if (score >= 40) {
        endTitle.textContent = 'Неймовірно! 🥰';
        endMessage.textContent = 'Ти — справжня майстриня кохання!';
    } else if (score >= 25) {
        endTitle.textContent = 'Чудово! 😻';
        endMessage.textContent = 'Кицюня зібрала багато любові!';
    } else if (score >= 10) {
        endTitle.textContent = 'Непогано! 😺';
        endMessage.textContent = 'Кицюня задоволена, але може краще!';
    } else {
        endTitle.textContent = 'Спробуй ще! 🐱';
        endMessage.textContent = 'Кицюня вірить у тебе!';
    }
}

// ============ PRIZE SCENE ============
let prizeHeartInterval = null;

function showPrize() {
    document.getElementById('gameArea').style.display = 'none';
    const overlay = document.getElementById('prizeOverlay');
    overlay.style.display = 'flex';
    document.getElementById('letter').style.display = 'none';
    document.getElementById('envelope').style.display = 'flex';

    // Spawn falling hearts in the background
    const bg = document.getElementById('prizeHeartsBg');
    bg.innerHTML = '';
    prizeHeartInterval = setInterval(() => {
        const span = document.createElement('span');
        span.className = 'prize-falling-heart';
        span.textContent = ['❤️', '💕', '💖', '💗', '💓'][Math.floor(Math.random() * 5)];
        span.style.left = Math.random() * 100 + '%';
        span.style.animationDuration = (3 + Math.random() * 3) + 's';
        span.style.fontSize = (18 + Math.random() * 20) + 'px';
        bg.appendChild(span);
        // Remove after animation
        span.addEventListener('animationend', () => span.remove());
    }, 300);
}

function openLetter() {
    document.getElementById('envelope').style.display = 'none';
    document.getElementById('letter').style.display = 'flex';
}

function closePrize() {
    clearInterval(prizeHeartInterval);
    document.getElementById('prizeOverlay').style.display = 'none';
    document.getElementById('prizeHeartsBg').innerHTML = '';
    document.getElementById('endMenu').style.display = 'flex';

    const endTitle = document.getElementById('endTitle');
    const endMessage = document.getElementById('endMessage');
    const endScore = document.getElementById('endScore');
    endTitle.textContent = 'Неймовірно! 🥰';
    endMessage.textContent = 'Ти — справжня майстриня кохання!';
    endScore.textContent = `Серденьок зібрано: ${score}`;
}

// ============ HUD ============
function updateHUD() {
    document.getElementById('score').textContent = score;
    document.getElementById('timeLeft').textContent = timeLeft;
    document.getElementById('misses').textContent = misses;
}

// ============ HEART SPAWNING ============
function spawnHeart() {
    if (!gameRunning) return;
    const displayW = canvas.width / canvasScale;
    const isBad = Math.random() < BROKEN_HEART_CHANCE;
    const type = isBad
        ? HEART_TYPES[3]
        : HEART_TYPES[Math.floor(Math.random() * 3)];

    const isMobile = window.innerWidth < 768;
    const size = isMobile ? (22 + Math.random() * 8) : (28 + Math.random() * 10);
    const speed = 2.5 + elapsedSeconds * 0.08;
    const x = Math.random() * (displayW - size);

    hearts.push({
        x, y: -size,
        size, speed,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
    });
}

// ============ GAME LOOP ============
function gameLoop(timestamp) {
    if (!gameRunning) return;
    const dt = Math.min((timestamp - lastFrameTime) / 16.667, 3); // normalize to 60fps, cap at 3x
    lastFrameTime = timestamp;
    update(dt);
    draw();
    animFrameId = requestAnimationFrame(gameLoop);
}

function update(dt) {
    const displayW = canvas.width / canvasScale;
    const displayH = canvas.height / canvasScale;

    // ---- Move cat ----
    let dx = 0;
    if (keys['ArrowLeft'] || keys['a'] || keys['A'] || keys['а'] || keys['А']) dx = -1;
    if (keys['ArrowRight'] || keys['d'] || keys['D'] || keys['д'] || keys['Д']) dx = 1;
    if (touchDir !== 0) dx = touchDir;

    const speed = (window.innerWidth < 768 ? CAT_SPEED * 1.15 : CAT_SPEED);
    cat.x += dx * speed * dt;
    if (cat.x < 0) cat.x = 0;
    if (cat.x > displayW - cat.width) cat.x = displayW - cat.width;

    // ---- Update hearts ----
    for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.y += h.speed * dt;
        h.rotation += h.rotSpeed * dt;

        // Check collision with cat
        const hCx = h.x + h.size / 2;
        const hCy = h.y + h.size / 2;
        const catCx = cat.x + cat.width / 2;
        const catCy = cat.y + cat.height / 2;
        const dist = Math.hypot(hCx - catCx, hCy - catCy);

        if (dist < (cat.width / 2 + h.size / 2) * 0.75) {
            // Caught!
            score += h.type.points;
            if (score < 0) score = 0;
            if (h.type.isBad) {
                flashCanvas('rgba(100,0,0,0.25)');
            } else {
                spawnParticles(hCx, hCy);
            }
            hearts.splice(i, 1);
            updateHUD();
            continue;
        }

        // Missed (fell below screen)
        if (h.y > displayH + h.size) {
            hearts.splice(i, 1);
            if (!h.type.isBad) {
                misses++;
                updateHUD();
                if (misses >= MAX_MISSES) {
                    endGame(true);
                    return;
                }
            }
        }
    }

    // ---- Update particles ----
    updateParticles(dt);
}

// ============ PARTICLES ============
let particles = [];

function spawnParticles(x, y) {
    for (let i = 0; i < 6; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3 - 1,
            life: 1,
            size: 6 + Math.random() * 6,
            emoji: ['✨', '💗', '💛'][Math.floor(Math.random() * 3)],
        });
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.08 * dt;
        p.life -= 0.025 * dt;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

// ============ FLASH EFFECT ============
let flashColor = null;
let flashAlpha = 0;

function flashCanvas(color) {
    flashColor = color;
    flashAlpha = 1;
}

// ============ DRAW ============
function draw() {
    const dpr = canvasScale;
    const w = canvas.width;
    const h = canvas.height;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const displayW = w / dpr;
    const displayH = h / dpr;

    // Clear
    ctx.clearRect(0, 0, displayW, displayH);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, displayH);
    grad.addColorStop(0, '#fce4ec');
    grad.addColorStop(1, '#f8bbd0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, displayW, displayH);

    // Draw falling hearts
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const h of hearts) {
        ctx.save();
        ctx.translate(h.x + h.size / 2, h.y + h.size / 2);
        ctx.rotate(h.rotation);
        ctx.font = `${h.size}px serif`;
        ctx.fillText(h.type.emoji, 0, 0);
        ctx.restore();
    }

    // Draw particles
    for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.emoji, p.x, p.y);
        ctx.restore();
    }

    // Draw cat
    if (cat.sprite && cat.sprite.complete) {
        ctx.drawImage(cat.sprite, cat.x, cat.y, cat.width, cat.height);
    }

    // Flash overlay
    if (flashAlpha > 0) {
        ctx.fillStyle = flashColor;
        ctx.globalAlpha = flashAlpha;
        ctx.fillRect(0, 0, displayW, displayH);
        ctx.globalAlpha = 1;
        flashAlpha -= 0.03;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ============ KICK OFF ============
window.addEventListener('DOMContentLoaded', init);
