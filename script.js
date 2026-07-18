const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const menuScreen = document.getElementById('menuScreen');
const shopScreen = document.getElementById('shopScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreBoard = document.getElementById('scoreBoard');
const controls = document.getElementById('controls');
const abilityWrap = document.getElementById('abilityWrap');
const abilityBtn = document.getElementById('abilityBtn');
const abilityIcon = document.getElementById('abilityIcon');
const abilityCountdown = document.getElementById('abilityCountdown');
const envToastEl = document.getElementById('envToast');

const playBtn = document.getElementById('playBtn');
const shopBtn = document.getElementById('shopBtn');
const shopBackBtn = document.getElementById('shopBackBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn2 = document.getElementById('menuBtn2');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

const menuHighScoreEl = document.getElementById('menuHighScore');
const shopBalanceEl = document.getElementById('shopBalance');
const scoreValueEl = document.getElementById('scoreValue');
const liveHighScoreEl = document.getElementById('liveHighScore');
const finalScoreEl = document.getElementById('finalScore');
const gameOverHighScoreEl = document.getElementById('gameOverHighScore');
const newRecordText = document.getElementById('newRecordText');
const carListEl = document.getElementById('carList');

// ============ YADDAŞ ============
const STORAGE_KEYS = {
  highScore: 'carGame_highScore',
  owned: 'carGame_owned',
  selected: 'carGame_selected'
};
function getHighScore() { return parseInt(localStorage.getItem(STORAGE_KEYS.highScore) || '0', 10); }
function setHighScore(val) { localStorage.setItem(STORAGE_KEYS.highScore, Math.floor(val)); }
function getOwnedCars() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.owned)) || [0]; }
  catch { return [0]; }
}
function setOwnedCars(arr) { localStorage.setItem(STORAGE_KEYS.owned, JSON.stringify(arr)); }
function getSelectedCar() { return parseInt(localStorage.getItem(STORAGE_KEYS.selected) || '0', 10); }
function setSelectedCar(id) { localStorage.setItem(STORAGE_KEYS.selected, id); }

// ============ MAĞAZA MAŞINLARI ============
const ABILITY_INFO = {
  none:    { icon: '',   label: '—' },
  shield:  { icon: '🛡️', label: 'Qalxan — 5s toxunulmazlıq' },
  slowmo:  { icon: '🐢', label: 'Yavaşlatma — 5s rəqiblər yavaşıyır' },
  score2x: { icon: '⭐', label: '2x Xal — 5s ikiqat bal' },
  nitro:   { icon: '⚡', label: 'Nitro — 5s ani reaksiya' },
  emp:     { icon: '💥', label: 'EMP — bütün rəqibləri təmizlə' },
  ghost:   { icon: '👻', label: 'Xəyal — 10s toxunulmazlıq' },
  freeze:  { icon: '⏱️', label: 'Zaman Dayan — 5s rəqiblər donur' },
  ultimate:{ icon: '🌟', label: 'Ultimate — qalxan+2x+yavaşlatma' }
};

const CARS = [
  { id: 0, name: 'Klassik Qırmızı',   price: 0,    color: '#ff2e63', accent: '#ffffff', shape: 'sedan',   ability: 'none' },
  { id: 1, name: 'Okean Mavisi',      price: 300,  color: '#2196f3', accent: '#dff5ff', shape: 'suv',     ability: 'shield' },
  { id: 2, name: 'Meşə Yaşılı',       price: 500,  color: '#2ecc71', accent: '#eafff0', shape: 'truck',   ability: 'slowmo' },
  { id: 3, name: 'Qızıl Sarı',        price: 750,  color: '#f1c40f', accent: '#fff8dc', shape: 'sport',   ability: 'score2x' },
  { id: 4, name: 'Bənövşəyi İldırım', price: 1000, color: '#9b59b6', accent: '#f3e5f5', shape: 'racer',   ability: 'nitro' },
  { id: 5, name: 'Qara Qartal',       price: 1500, color: '#1c1c1c', accent: '#ff2e63', shape: 'muscle',  ability: 'emp' },
  { id: 6, name: 'Gizli Kölgə',       price: 2000, color: '#546e7a', accent: '#cfd8dc', shape: 'stealth', ability: 'ghost' },
  { id: 7, name: 'Formula Ağ',        price: 2500, color: '#ecf0f1', accent: '#3498db', shape: 'formula', ability: 'freeze' },
  { id: 8, name: 'Hiper Xrom',        price: 3000, color: '#00e5ff', accent: '#ffffff', shape: 'hyper',   ability: 'ultimate' },
];

function renderShop() {
  const balance = getHighScore();
  const owned = getOwnedCars();
  const selected = getSelectedCar();
  shopBalanceEl.textContent = balance;

  carListEl.innerHTML = '';
  CARS.forEach(car => {
    const isOwned = owned.includes(car.id);
    const isSelected = selected === car.id;
    const canAfford = balance >= car.price;

    const card = document.createElement('div');
    card.className = 'car-card' + (isSelected ? ' selected' : '');

    const previewCanvas = document.createElement('canvas');
    previewCanvas.className = 'car-preview';
    previewCanvas.width = 42;
    previewCanvas.height = 70;
    card.appendChild(previewCanvas);
    const pctx = previewCanvas.getContext('2d');
    drawCarByShape(car.shape, 2, 2, 38, 66, car.color, car.accent, pctx);

    const info = document.createElement('div');
    info.className = 'car-info';
    info.innerHTML = `<div class="car-name">${car.name}</div>
      <div class="car-price">${car.price === 0 ? 'Pulsuz' : car.price + ' 💰'}</div>
      <div class="car-ability">${ABILITY_INFO[car.ability].icon} ${ABILITY_INFO[car.ability].label}</div>`;
    card.appendChild(info);

    const btn = document.createElement('button');
    btn.className = 'car-buy-btn';
    if (isSelected) {
      btn.textContent = 'Seçilib';
      btn.classList.add('selected');
    } else if (isOwned) {
      btn.textContent = 'Seç';
      btn.classList.add('select');
      btn.onclick = () => { setSelectedCar(car.id); renderShop(); };
    } else if (canAfford) {
      btn.textContent = 'Al';
      btn.classList.add('buy');
      btn.onclick = () => {
        setHighScore(getHighScore() - car.price);
        const ownedArr = getOwnedCars();
        ownedArr.push(car.id);
        setOwnedCars(ownedArr);
        setSelectedCar(car.id);
        renderShop();
      };
    } else {
      btn.textContent = 'Bağlı';
      btn.classList.add('locked');
    }
    card.appendChild(btn);
    carListEl.appendChild(card);
  });
}

function getSelectedCarData() {
  return CARS.find(c => c.id === getSelectedCar()) || CARS[0];
}

// ============ MENYU ULDUZ FONU ============
const menuStarCanvas = document.getElementById('menuStarCanvas');
const mctx = menuStarCanvas.getContext('2d');
let stars = [];
let starAnimId = null;

function initStars() {
  menuStarCanvas.width = window.innerWidth;
  menuStarCanvas.height = window.innerHeight;
  stars = [];
  for (let i = 0; i < 90; i++) {
    stars.push({
      x: (Math.random() - 0.5) * menuStarCanvas.width,
      y: (Math.random() - 0.5) * menuStarCanvas.height,
      z: Math.random() * menuStarCanvas.width
    });
  }
}
function drawStars() {
  const w = menuStarCanvas.width, h = menuStarCanvas.height;
  const cx = w / 2, cy = h / 2;
  mctx.fillStyle = 'rgba(11,11,26,0.35)';
  mctx.fillRect(0, 0, w, h);
  const speed = 2.2;
  for (const s of stars) {
    s.z -= speed;
    if (s.z <= 1) {
      s.x = (Math.random() - 0.5) * w;
      s.y = (Math.random() - 0.5) * h;
      s.z = w;
    }
    const k = 128 / s.z;
    const px = cx + s.x * k, py = cy + s.y * k;
    if (px < 0 || px > w || py < 0 || py > h) continue;
    const size = Math.max(0.5, (1 - s.z / w) * 2.6);
    const alpha = Math.min(1, (1 - s.z / w) * 1.3);
    mctx.beginPath();
    mctx.fillStyle = `rgba(255,255,255,${alpha})`;
    mctx.arc(px, py, size, 0, Math.PI * 2);
    mctx.fill();
  }
}
function starLoop() { drawStars(); starAnimId = requestAnimationFrame(starLoop); }
function startStarField() { initStars(); if (starAnimId) cancelAnimationFrame(starAnimId); starLoop(); }
function stopStarField() { if (starAnimId) cancelAnimationFrame(starAnimId); starAnimId = null; }
window.addEventListener('resize', () => { if (!menuScreen.classList.contains('hidden')) initStars(); });

// ============ EKRAN KEÇİDLƏRİ ============
function showMenu() {
  exitFullscreenIfActive();
  menuScreen.classList.remove('hidden');
  shopScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  scoreBoard.classList.add('hidden');
  controls.classList.add('hidden');
  abilityWrap.classList.add('hidden');
  menuHighScoreEl.textContent = getHighScore();
  running = false;
  startStarField();
}
function showShop() {
  menuScreen.classList.add('hidden');
  shopScreen.classList.remove('hidden');
  stopStarField();
  renderShop();
}
playBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); menuScreen.classList.add('hidden'); stopStarField(); startGame(); });
shopBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); showShop(); });
shopBackBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); showMenu(); });
menuBtn2.addEventListener('pointerdown', (e) => { e.preventDefault(); showMenu(); });
restartBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); stopStarField(); startGame(); });

// ============ TAM EKRAN + ÜFÜQİ QIFILLAMA ============
const gameContainerEl = document.getElementById('gameContainer');

function enterFullscreenLandscape() {
  const el = gameContainerEl;
  const reqFS = el.requestFullscreen || el.webkitRequestFullscreen ||
                el.mozRequestFullScreen || el.msRequestFullscreen;
  if (reqFS) {
    reqFS.call(el).catch(() => {});
  }
  // Yalnız Android Chrome/Firefox kimi brauzerlər dəstəkləyir (iOS Safari dəstəkləmir,
  // ona görə "rotateOverlay" xəbərdarlığı bütün cihazlar üçün ehtiyat plan kimi qalır)
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {});
  }
}

function exitFullscreenIfActive() {
  const isFs = document.fullscreenElement || document.webkitFullscreenElement;
  if (isFs) {
    const exitFS = document.exitFullscreen || document.webkitExitFullscreen;
    if (exitFS) exitFS.call(document).catch(() => {});
  }
  if (screen.orientation && screen.orientation.unlock) {
    try { screen.orientation.unlock(); } catch (e) {}
  }
}

// ============ CANVAS ÖLÇÜLƏRİ ============
let width, height;
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  calcRoad();
  setupPlayer();
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => { setTimeout(resize, 300); });

const LANES = 3;
let roadWidth, laneWidth, roadLeft;
function calcRoad() {
  roadWidth = Math.min(width * 0.8, 420);
  roadLeft = (width - roadWidth) / 2;
  laneWidth = roadWidth / LANES;
}
function laneCenterX(laneIndex) { return roadLeft + laneWidth * laneIndex + laneWidth / 2; }

// ============ OYUNÇU ============
const player = { lane: 1, x: 0, y: 0, w: 0, h: 0, targetX: 0 };
function setupPlayer() {
  player.w = laneWidth * 0.55;
  player.h = player.w * 1.7;
  player.y = height - player.h - 40;
  player.x = laneCenterX(player.lane) - player.w / 2;
  player.targetX = player.x;
}

// ============ RƏQİB MAŞINLAR ============
let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = 90;
const ENEMY_SHAPES = ['sedan', 'suv', 'sport', 'truck', 'racer', 'muscle'];
const ENEMY_COLORS = ['#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22', '#e74c3c', '#1abc9c'];

function spawnObstacle() {
  const lane = Math.floor(Math.random() * LANES);
  const shape = ENEMY_SHAPES[Math.floor(Math.random() * ENEMY_SHAPES.length)];
  const w = laneWidth * (shape === 'truck' ? 0.62 : 0.55);
  const h = w * (shape === 'truck' ? 1.9 : (shape === 'sport' || shape === 'racer') ? 1.5 : 1.7);
  obstacles.push({
    lane, x: laneCenterX(lane) - w / 2, y: -h, w, h,
    color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)],
    shape
  });
}

// ============ OYUN VƏZİYYƏTİ ============
let running = false;
let score = 0;
let speed = 6;
let roadLineOffset = 0;

// ---- Super güc vəziyyəti ----
let abilityType = 'none';
let abilityHasAbility = false;
let abilityActiveUntil = 0;
let abilityCooldownUntil = 0;

function setupAbilityForRun() {
  const car = getSelectedCarData();
  abilityType = car.ability;
  abilityHasAbility = abilityType !== 'none';
  abilityActiveUntil = 0;
  abilityCooldownUntil = 0;
  abilityBtn.classList.remove('active', 'cooldown');
  abilityCountdown.classList.add('hidden');
  if (abilityHasAbility) {
    abilityIcon.textContent = ABILITY_INFO[abilityType].icon;
    abilityWrap.classList.remove('hidden');
    abilityBtn.classList.remove('hidden'); // DÜZƏLİŞ: düymənin özü də görünməlidir
  } else {
    abilityWrap.classList.add('hidden');
    abilityBtn.classList.add('hidden');
  }
}

function activateAbility() {
  if (!abilityHasAbility || !running) return;
  const now = performance.now();
  if (now < abilityCooldownUntil) return;
  
  const duration = (abilityType === 'ghost') ? 10000 : 5000;
  
  abilityActiveUntil = now + duration;
  abilityCooldownUntil = now + duration + 20000;
  if (abilityType === 'emp') {
    obstacles = [];
    obstacleTimer = 0;
  }
}
abilityBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); activateAbility(); });

function updateAbilityUI() {
  if (!abilityHasAbility) return;
  const now = performance.now();
  if (now < abilityActiveUntil) {
    abilityBtn.classList.add('active');
    abilityBtn.classList.remove('cooldown');
    abilityCountdown.classList.remove('hidden');
    abilityCountdown.textContent = Math.ceil((abilityActiveUntil - now) / 1000);
  } else if (now < abilityCooldownUntil) {
    abilityBtn.classList.remove('active');
    abilityBtn.classList.add('cooldown');
    abilityCountdown.classList.remove('hidden');
    abilityCountdown.textContent = Math.ceil((abilityCooldownUntil - now) / 1000);
  } else {
    abilityBtn.classList.remove('active', 'cooldown');
    abilityCountdown.classList.add('hidden');
  }
}

// ---- Mühit ----
const ENVIRONMENTS = {
  day:    { threshold: 0,    sky1: '#3a3a55', sky2: '#1c1c2e', road: '#222222', line: '#ffffff', glow: false, name: 'Gündüz' },
  sunset: { threshold: 600,  sky1: '#ff9966', sky2: '#4a2545', road: '#2a1f33', line: '#ffd27f', glow: false, name: 'Gün Batımı' },
  night:  { threshold: 1500, sky1: '#0a0a20', sky2: '#000005', road: '#141428', line: '#8ecbff', glow: true,  name: 'Gecə', stars: true },
  neon:   { threshold: 2000, sky1: '#1a0033', sky2: '#000010', road: '#170b3a', line: '#ff2ee0', glow: true,  name: 'Neon Şəhər', neonEdge: true }
};
function currentEnvironment() {
  if (score >= 2000) return ENVIRONMENTS.neon;
  if (score >= 1500) return ENVIRONMENTS.night;
  if (score >= 600) return ENVIRONMENTS.sunset;
  return ENVIRONMENTS.day;
}
let lastEnvName = null;
let nightStars = [];
let envToastTimer = null;
function showEnvToast(name) {
  envToastEl.textContent = '🌆 ' + name;
  envToastEl.classList.remove('hidden');
  envToastEl.classList.add('show');
  clearTimeout(envToastTimer);
  envToastTimer = setTimeout(() => envToastEl.classList.remove('show'), 2200);
}
function drawNightStars() {
  if (nightStars.length === 0) {
    for (let i = 0; i < 40; i++) {
      nightStars.push({ x: Math.random() * width, y: Math.random() * height * 0.6, r: Math.random() * 1.5 + 0.5, s: Math.random() * 2 });
    }
  }
  const t = performance.now() / 500;
  ctx.fillStyle = '#fff';
  nightStars.forEach(st => {
    ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t + st.s);
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function resetGame() {
  score = 0;
  speed = 6;
  obstacles = [];
  obstacleTimer = 0;
  obstacleInterval = 90;
  player.lane = 1;
  setupPlayer();
  scoreValueEl.textContent = '0';
  liveHighScoreEl.textContent = getHighScore();
  lastEnvName = null;
  nightStars = [];
  setupAbilityForRun();
}

function startGame() {
  enterFullscreenLandscape();
  resize();
  resetGame();
  shopScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  scoreBoard.classList.remove('hidden');
  controls.classList.remove('hidden');
  running = true;
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  const finalScore = Math.floor(score);
  const prevHigh = getHighScore();
  const isNewRecord = finalScore > prevHigh;
  if (isNewRecord) setHighScore(finalScore);

  finalScoreEl.textContent = finalScore;
  gameOverHighScoreEl.textContent = getHighScore();
  newRecordText.classList.toggle('hidden', !isNewRecord);

  scoreBoard.classList.add('hidden');
  controls.classList.add('hidden');
  abilityWrap.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');
}

// ============ İDARƏETMƏ ============
function moveLeft() {
  if (player.lane > 0) {
    player.lane--;
    player.targetX = laneCenterX(player.lane) - player.w / 2;
  }
}
function moveRight() {
  if (player.lane < LANES - 1) {
    player.lane++;
    player.targetX = laneCenterX(player.lane) - player.w / 2;
  }
}
leftBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); moveLeft(); });
rightBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); moveRight(); });

let touchStartX = null;
canvas.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
canvas.addEventListener('touchend', (e) => {
  if (touchStartX === null) return;
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diff) > 30) diff > 0 ? moveRight() : moveLeft();
  touchStartX = null;
}, { passive: true });
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') moveLeft();
  if (e.key === 'ArrowRight') moveRight();
});

// ============ ÇİZİM ============
function drawRoad() {
  const env = currentEnvironment();
  if (env.name !== lastEnvName) {
    if (lastEnvName !== null) showEnvToast(env.name);
    lastEnvName = env.name;
  }

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, env.sky1);
  grad.addColorStop(1, env.sky2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  if (env.stars) drawNightStars();

  ctx.fillStyle = env.road;
  ctx.fillRect(roadLeft, 0, roadWidth, height);

  ctx.strokeStyle = env.line;
  ctx.lineWidth = 4;
  ctx.setLineDash([25, 20]);
  ctx.lineDashOffset = -roadLineOffset;
  if (env.glow) { ctx.shadowColor = env.line; ctx.shadowBlur = 12; } else { ctx.shadowBlur = 0; }
  for (let i = 1; i < LANES; i++) {
    const x = roadLeft + laneWidth * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  if (env.neonEdge) {
    ctx.strokeStyle = '#00eaff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00eaff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(roadLeft, 0); ctx.lineTo(roadLeft, height);
    ctx.moveTo(roadLeft + roadWidth, 0); ctx.lineTo(roadLeft + roadWidth, height);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawSedan(x, y, w, h, color, accent, c) {
  c.fillStyle = color; c.beginPath(); c.roundRect(x, y, w, h, 10); c.fill();
  c.fillStyle = accent; c.globalAlpha = 0.55;
  c.beginPath(); c.roundRect(x + w * 0.15, y + h * 0.14, w * 0.7, h * 0.22, 5); c.fill();
  c.globalAlpha = 1;
  c.fillStyle = '#fff';
  c.fillRect(x + w * 0.1, y + 2, w * 0.18, 6);
  c.fillRect(x + w * 0.72, y + 2, w * 0.18, 6);
}
function drawSUV(x, y, w, h, color, accent, c) {
  c.fillStyle = color; c.beginPath(); c.roundRect(x - w * 0.04, y, w * 1.08, h, 8); c.fill();
  c.fillStyle = accent; c.globalAlpha = 0.5;
  c.beginPath(); c.roundRect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.32, 4); c.fill();
  c.globalAlpha = 1;
  c.fillStyle = '#222'; c.fillRect(x, y + h * 0.55, w, h * 0.12);
  c.fillStyle = '#fff';
  c.fillRect(x + w * 0.05, y + 2, w * 0.2, 6);
  c.fillRect(x + w * 0.75, y + 2, w * 0.2, 6);
}
function drawSport(x, y, w, h, color, accent, c) {
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x + w * 0.5, y);
  c.lineTo(x + w, y + h * 0.25);
  c.lineTo(x + w * 0.92, y + h);
  c.lineTo(x + w * 0.08, y + h);
  c.lineTo(x, y + h * 0.25);
  c.closePath(); c.fill();
  c.fillStyle = accent; c.globalAlpha = 0.6;
  c.beginPath();
  c.moveTo(x + w * 0.5, y + h * 0.12);
  c.lineTo(x + w * 0.78, y + h * 0.32);
  c.lineTo(x + w * 0.22, y + h * 0.32);
  c.closePath(); c.fill();
  c.globalAlpha = 1;
  c.fillStyle = '#fff';
  c.fillRect(x + w * 0.15, y + h * 0.28, w * 0.15, 5);
  c.fillRect(x + w * 0.7, y + h * 0.28, w * 0.15, 5);
}
function drawTruck(x, y, w, h, color, accent, c) {
  c.fillStyle = color; c.beginPath(); c.roundRect(x, y + h * 0.28, w, h * 0.72, 6); c.fill();
  c.fillStyle = '#444'; c.beginPath(); c.roundRect(x + w * 0.08, y, w * 0.84, h * 0.34, 6); c.fill();
  c.fillStyle = accent; c.globalAlpha = 0.55;
  c.beginPath(); c.roundRect(x + w * 0.16, y + h * 0.05, w * 0.68, h * 0.16, 4); c.fill();
  c.globalAlpha = 1;
  c.fillStyle = '#fff';
  c.fillRect(x + w * 0.1, y + h * 0.02, w * 0.15, 5);
  c.fillRect(x + w * 0.75, y + h * 0.02, w * 0.15, 5);
}
function drawRacer(x, y, w, h, color, accent, c) {
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x + w * 0.5, y);
  c.quadraticCurveTo(x + w * 1.05, y + h * 0.35, x + w * 0.85, y + h * 0.95);
  c.lineTo(x + w * 0.15, y + h * 0.95);
  c.quadraticCurveTo(x - w * 0.05, y + h * 0.35, x + w * 0.5, y);
  c.closePath(); c.fill();
  c.fillStyle = '#222';
  c.fillRect(x + w * 0.05, y + h * 0.92, w * 0.9, h * 0.06);
  c.fillRect(x + w * 0.15, y + h * 0.8, w * 0.08, h * 0.14);
  c.fillRect(x + w * 0.77, y + h * 0.8, w * 0.08, h * 0.14);
  c.fillStyle = accent; c.globalAlpha = 0.6;
  c.beginPath();
  c.moveTo(x + w * 0.5, y + h * 0.1);
  c.lineTo(x + w * 0.75, y + h * 0.35);
  c.lineTo(x + w * 0.25, y + h * 0.35);
  c.closePath(); c.fill();
  c.globalAlpha = 1;
  c.fillStyle = '#fff';
  c.fillRect(x + w * 0.18, y + h * 0.02, w * 0.14, 5);
  c.fillRect(x + w * 0.68, y + h * 0.02, w * 0.14, 5);
}
function drawMuscle(x, y, w, h, color, accent, c) {
  c.fillStyle = color;
  c.beginPath(); c.roundRect(x - w * 0.03, y + h * 0.03, w * 1.06, h * 0.94, 12); c.fill();
  c.fillStyle = accent; c.globalAlpha = 0.8;
  c.fillRect(x + w * 0.38, y + h * 0.05, w * 0.09, h * 0.35);
  c.fillRect(x + w * 0.53, y + h * 0.05, w * 0.09, h * 0.35);
  c.globalAlpha = 1;
  c.fillStyle = '#111'; c.globalAlpha = 0.55;
  c.beginPath(); c.roundRect(x + w * 0.15, y + h * 0.42, w * 0.7, h * 0.24, 4); c.fill();
  c.globalAlpha = 1;
  c.fillStyle = '#fff';
  c.fillRect(x + w * 0.06, y + 3, w * 0.2, 6);
  c.fillRect(x + w * 0.74, y + 3, w * 0.2, 6);
}
function drawStealth(x, y, w, h, color, accent, c) {
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x + w * 0.5, y + h * 0.05);
  c.lineTo(x + w * 0.95, y + h * 0.4);
  c.lineTo(x + w * 0.85, y + h * 0.95);
  c.lineTo(x + w * 0.15, y + h * 0.95);
  c.lineTo(x + w * 0.05, y + h * 0.4);
  c.closePath(); c.fill();
  c.fillStyle = accent; c.globalAlpha = 0.5;
  c.fillRect(x + w * 0.4, y + h * 0.15, w * 0.2, h * 0.6);
  c.globalAlpha = 1;
  c.fillStyle = '#fff';
  c.fillRect(x + w * 0.12, y + 2, w * 0.16, 5);
  c.fillRect(x + w * 0.72, y + 2, w * 0.16, 5);
}
function drawFormula(x, y, w, h, color, accent, c) {
  c.fillStyle = color;
  c.beginPath(); c.roundRect(x + w * 0.32, y, w * 0.36, h * 0.85, 6); c.fill();
  c.beginPath();
  c.moveTo(x + w * 0.5, y - h * 0.05);
  c.lineTo(x + w * 0.62, y + h * 0.15);
  c.lineTo(x + w * 0.38, y + h * 0.15);
  c.closePath(); c.fill();
  c.fillStyle = '#111';
  c.fillRect(x, y + h * 0.15, w * 0.22, h * 0.28);
  c.fillRect(x + w * 0.78, y + h * 0.15, w * 0.22, h * 0.28);
  c.fillRect(x, y + h * 0.6, w * 0.22, h * 0.28);
  c.fillRect(x + w * 0.78, y + h * 0.6, w * 0.22, h * 0.28);
  c.fillStyle = accent;
  c.fillRect(x + w * 0.15, y + h * 0.88, w * 0.7, h * 0.08);
  c.fillStyle = '#fff';
  c.fillRect(x + w * 0.38, y + 2, w * 0.24, 5);
}
function drawHyper(x, y, w, h, color, accent, c) {
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x + w * 0.5, y);
  c.lineTo(x + w * 1.02, y + h * 0.3);
  c.lineTo(x + w * 0.9, y + h * 0.85);
  c.lineTo(x + w * 0.1, y + h * 0.85);
  c.lineTo(x - w * 0.02, y + h * 0.3);
  c.closePath(); c.fill();
  c.fillStyle = '#111';
  c.fillRect(x - w * 0.05, y + h * 0.82, w * 1.1, h * 0.07);
  c.fillRect(x + w * 0.05, y + h * 0.7, w * 0.06, h * 0.15);
  c.fillRect(x + w * 0.89, y + h * 0.7, w * 0.06, h * 0.15);
  c.fillStyle = accent; c.globalAlpha = 0.7;
  c.fillRect(x + w * 0.42, y + h * 0.05, w * 0.16, h * 0.6);
  c.globalAlpha = 1;
  c.fillStyle = '#fff';
  c.fillRect(x + w * 0.18, y + 2, w * 0.16, 5);
  c.fillRect(x + w * 0.66, y + 2, w * 0.16, 5);
}

function drawCarByShape(shape, x, y, w, h, color, accent, targetCtx) {
  const c = targetCtx || ctx;
  switch (shape) {
    case 'suv': return drawSUV(x, y, w, h, color, accent, c);
    case 'sport': return drawSport(x, y, w, h, color, accent, c);
    case 'truck': return drawTruck(x, y, w, h, color, accent, c);
    case 'racer': return drawRacer(x, y, w, h, color, accent, c);
    case 'muscle': return drawMuscle(x, y, w, h, color, accent, c);
    case 'stealth': return drawStealth(x, y, w, h, color, accent, c);
    case 'formula': return drawFormula(x, y, w, h, color, accent, c);
    case 'hyper': return drawHyper(x, y, w, h, color, accent, c);
    default: return drawSedan(x, y, w, h, color, accent, c);
  }
}

function rectsCollide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ============ ƏSAS DÖVR ============
function loop() {
  if (!running) return;
  const now = performance.now();
  const abilityActive = abilityHasAbility && now < abilityActiveUntil;

  let invincible = false, scoreMult = 1, enemySpeedMult = 1, freezeEnemies = false, lerpFactor = 0.28;
  if (abilityActive) {
    switch (abilityType) {
      case 'shield': invincible = true; break;
      case 'ghost': invincible = true; break;
      case 'slowmo': enemySpeedMult = 0.5; break;
      case 'score2x': scoreMult = 2; break;
      case 'nitro': lerpFactor = 0.5; break;
      case 'freeze': freezeEnemies = true; break;
      case 'ultimate': invincible = true; scoreMult = 2; enemySpeedMult = 0.5; break;
    }
  }

  ctx.clearRect(0, 0, width, height);
  drawRoad();

  roadLineOffset += speed;
  if (roadLineOffset > 10000) roadLineOffset = 0;

  player.x += (player.targetX - player.x) * lerpFactor;
  const carData = getSelectedCarData();
  if (invincible) ctx.globalAlpha = 0.6;
  drawCarByShape(carData.shape, player.x, player.y, player.w, player.h, carData.color, carData.accent);
  ctx.globalAlpha = 1;

  if (!freezeEnemies) {
    obstacleTimer++;
    if (obstacleTimer >= obstacleInterval) {
      spawnObstacle();
      obstacleTimer = 0;
    }
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const ob = obstacles[i];
    if (!freezeEnemies) ob.y += speed * enemySpeedMult;
    drawCarByShape(ob.shape, ob.x, ob.y, ob.w, ob.h, ob.color, '#ffffff');

    if (rectsCollide(player, ob)) {
      if (invincible) {
        obstacles.splice(i, 1);
        score += 10 * scoreMult;
        continue;
      }
      endGame();
      return;
    }
    if (ob.y > height) {
      obstacles.splice(i, 1);
      score += 10 * scoreMult;
    }
  }

  score += 0.05 * scoreMult;
  speed += 0.0018;
  if (obstacleInterval > 38) obstacleInterval -= 0.02;

  scoreValueEl.textContent = Math.floor(score);
  liveHighScoreEl.textContent = Math.max(getHighScore(), Math.floor(score));

  updateAbilityUI();

  requestAnimationFrame(loop);
}

// ============ BAŞLANĞIC ============
resize();
showMenu();