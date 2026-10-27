/* ============ CONFIG — customize this per person ============ */
const CONFIG = {
  correctPin: "1028",     // the 4-digit PIN e.g. DDMM (11th July)
  recipientName: "Mica",
  senderName: "Gabriel",
  autoplayMusic: true
};

function applyDynamicNames() {
  document.querySelectorAll('.recipient-name-fill').forEach(el => {
    el.textContent = CONFIG.recipientName;
  });
  const nameFill = document.getElementById('name-fill');
  if (nameFill) nameFill.textContent = CONFIG.recipientName;

  document.querySelectorAll('.sender-name-fill').forEach(el => {
    el.textContent = CONFIG.senderName;
  });
}

document.addEventListener('DOMContentLoaded', applyDynamicNames);
applyDynamicNames();

/* ============ SCREEN NAVIGATION ============ */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
  window.scrollTo(0,0);
}

document.querySelectorAll('[data-next]').forEach(btn=>{
  btn.addEventListener('click', ()=> showScreen(btn.dataset.next));
});

/* ============ SCREEN 1: PIN LOCK ============ */
let enteredPin = "";
const dots = document.querySelectorAll('.dot');
const errorMsg = document.getElementById('error-msg');

function updateDots(){
  dots.forEach((d,i)=>{
    d.classList.toggle('filled', i < enteredPin.length);
  });
}

function checkPin(){
  if(enteredPin === CONFIG.correctPin){
    fireConfetti();
    setTimeout(()=> showScreen('screen-reveal'), 600);
  } else {
    errorMsg.classList.add('show');
    dots.forEach(d=> d.classList.add('shake'));
    setTimeout(()=>{
      dots.forEach(d=> d.classList.remove('shake'));
      enteredPin = "";
      updateDots();
    }, 450);
  }
}

document.querySelectorAll('#numpad button[data-num]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    if(enteredPin.length >= 4) return;
    errorMsg.classList.remove('show');
    enteredPin += btn.dataset.num;
    updateDots();
    if(enteredPin.length === 4){
      setTimeout(checkPin, 200);
    }
  });
});

document.getElementById('backspace').addEventListener('click', ()=>{
  enteredPin = enteredPin.slice(0,-1);
  updateDots();
});

/* ============ NAME FILL ============ */
document.getElementById('name-fill').textContent = CONFIG.recipientName;

/* ============ SCREEN 4: PHOTO REVEAL ============ */
const cameraBtn = document.getElementById('camera-click');
const polaroids = document.querySelectorAll('#polaroid-row .polaroid');
const photoCounter = document.getElementById('photo-counter');
const photosContinue = document.getElementById('photos-continue');
let revealedCount = 0;

cameraBtn.addEventListener('click', ()=>{
  if(revealedCount >= polaroids.length) return;
  polaroids[revealedCount].classList.remove('hidden');
  revealedCount++;
  photoCounter.textContent = `${revealedCount} / ${polaroids.length} fotos`;
  cameraBtn.style.transform = "scale(0.8) rotate(-8deg)";
  setTimeout(()=> cameraBtn.style.transform = "", 200);
  if(revealedCount === polaroids.length){
    photoCounter.textContent = ` <3 ${revealedCount}/${polaroids.length}`;
    photosContinue.classList.remove('hidden');
    const hint = document.getElementById('camera-hint');
    if (hint) hint.classList.add('hidden');
  }
});

/* ============ SCREEN 6: CAKE CUTTING (drag) ============ */
const cake = document.getElementById('cake');
const cakeResult = document.getElementById('cake-result');
const cakeContinue = document.getElementById('cake-continue');
const cakeHint = document.getElementById('cake-hint');
let dragStartX = null;
let cakeCut = false;

function handleDragStart(x){
  if(cakeCut) return;
  dragStartX = x;
}
function handleDragMove(x){
  if(cakeCut || dragStartX === null) return;
  const dist = Math.abs(x - dragStartX);
  if(dist > 60){
    triggerCut();
  }
}
function handleDragEnd(){
  dragStartX = null;
}
function triggerCut(){
  cakeCut = true;
  if (cake) cake.classList.add('cut');
  if (cakeHint) cakeHint.classList.add('hidden');
  if (cakeResult) cakeResult.classList.remove('hidden');
  if (cakeContinue) cakeContinue.classList.remove('hidden');
  smallConfettiBurst();
}

if (cake) {
  cake.addEventListener('mousedown', e=> handleDragStart(e.clientX));
  window.addEventListener('mousemove', e=> handleDragMove(e.clientX));
  window.addEventListener('mouseup', handleDragEnd);

  cake.addEventListener('touchstart', e=> handleDragStart(e.touches[0].clientX));
  cake.addEventListener('touchmove', e=> handleDragMove(e.touches[0].clientX));
  cake.addEventListener('touchend', handleDragEnd);
}

/* ============ CONFETTI ============ */
function fireConfetti(){
  if(typeof confetti !== 'function') return;
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.5 },
    colors: ['#a3001e','#ffccd5','#ffd3db']
  });
}
function smallConfettiBurst(){
  if(typeof confetti !== 'function') return;
  confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
}

/* ============ FINALE screen extra confetti + replay ============ */
const finaleScreen = document.getElementById('screen-finale');
document.querySelector('[data-next="screen-finale"]').addEventListener('click', ()=>{
  setTimeout(fireConfetti, 400);
});

document.getElementById('replay-btn').addEventListener('click', ()=>{
  enteredPin = "";
  updateDots();
  revealedCount = 0;
  polaroids.forEach(p=> p.classList.add('hidden'));
  photoCounter.textContent = `0 / ${polaroids.length} fotos`;
  const hint = document.getElementById('camera-hint');
  if (hint) hint.classList.remove('hidden');
  photosContinue.classList.add('hidden');
  cakeCut = false;
  if (cake) cake.classList.remove('cut');
  if (cakeHint) cakeHint.classList.remove('hidden');
  if (cakeResult) cakeResult.classList.add('hidden');
  if (cakeContinue) cakeContinue.classList.add('hidden');
  
  // Reset interactive gifts
  visitedGifts.clear();
  document.querySelectorAll('.gift-option-box').forEach(box => box.classList.remove('unpacked'));
  const hubBtn = document.getElementById('gift-hub-continue-btn');
  if (hubBtn) hubBtn.classList.remove('unlocked');
  resetGiftGame();
  
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
  musicPlaying = false;
  updateMusicUI();
  
  showScreen('screen-lock');
});

/* ============ MUSIC & VINYL SYNCHRONIZATION ============ */
const musicBtn = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');
const spotifyPlayBtn = document.getElementById('spotify-play-btn');
const vinylRecord = document.getElementById('vinyl-record');
const tonearm = document.getElementById('tonearm');
let musicPlaying = false;

function updateMusicUI() {
  if (musicPlaying) {
    if (musicBtn) {
      musicBtn.classList.remove('hidden');
      musicBtn.textContent = "🔊";
    }
    if (spotifyPlayBtn) spotifyPlayBtn.textContent = "⏸";
    if (vinylRecord) vinylRecord.classList.add('spinning');
    if (tonearm) tonearm.classList.add('active');
  } else {
    if (musicBtn) musicBtn.textContent = "🔈";
    if (spotifyPlayBtn) spotifyPlayBtn.textContent = "▶";
    if (vinylRecord) vinylRecord.classList.remove('spinning');
    if (tonearm) tonearm.classList.remove('active');
  }
}

function tryAutoplay(){
  bgMusic.volume = 0.5;
  bgMusic.play().then(()=>{
    musicPlaying = true;
    updateMusicUI();
  }).catch(()=>{
    if (musicBtn) musicBtn.classList.remove('hidden');
    updateMusicUI();
  });
}

document.getElementById('numpad').addEventListener('click', ()=>{
  if(!musicPlaying && CONFIG.autoplayMusic){
    tryAutoplay();
  }
}, { once:true });

if (musicBtn) {
  musicBtn.addEventListener('click', ()=>{
    if(musicPlaying){
      bgMusic.pause();
    } else {
      bgMusic.play().catch(e => console.log("Reproducción de música bloqueada", e));
    }
    musicPlaying = !musicPlaying;
    updateMusicUI();
  });
}

if (spotifyPlayBtn) {
  spotifyPlayBtn.addEventListener('click', ()=>{
    if(musicPlaying){
      bgMusic.pause();
    } else {
      bgMusic.play().catch(e => console.log("Reproducción de música bloqueada", e));
    }
    musicPlaying = !musicPlaying;
    updateMusicUI();
  });
}

/* ============ DYNAMIC SCRAPBOOK FLOATING STICKERS SYSTEM ============ */
function createPetals() {
  const container = document.getElementById('bg-flowers');
  if (!container) return;

  const stickerEmojis = ['🌹', '💙', '🌼', '🐱', '🍫', '🌿', '✨'];
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  const stickerCount = 10;

  for (let i = 0; i < stickerCount; i++) {
    spawnSticker(container, stickerEmojis, true);
  }

  setInterval(() => {
    const currentStickers = container.querySelectorAll('.petal');
    if (currentStickers.length < stickerCount) {
      spawnSticker(container, stickerEmojis, false);
    }
  }, 1000);
}

function spawnSticker(container, emojis, initialLoad = false) {
  const sticker = document.createElement('div');
  sticker.className = 'petal';
  sticker.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  const leftPos = Math.random() * 100;
  const duration = 9 + Math.random() * 8;
  const delay = initialLoad ? -(Math.random() * duration) : 0;
  const size = 18 + Math.random() * 20;
  const swayDuration = 4 + Math.random() * 3;

  sticker.style.left = `${leftPos}vw`;
  sticker.style.fontSize = `${size}px`;
  sticker.style.animationDuration = `${duration}s, ${swayDuration}s`;
  sticker.style.animationDelay = `${delay}s, 0s`;

  container.appendChild(sticker);

  setTimeout(() => {
    sticker.remove();
  }, (duration + (initialLoad ? 0 : delay)) * 1000);
}

/* ============ INTERACTIVE CHOOSE YOUR GIFTS SYSTEM ============ */
let visitedGifts = new Set();

function registerVisitedGift(giftId) {
  visitedGifts.add(giftId);
  
  // Mark item option box as visual unpacked
  const boxOption = document.getElementById(`gift-${giftId}-box`);
  if (boxOption) {
    boxOption.classList.add('unpacked');
  }
  
  // If explored all 3, unlock done continue button
  if (visitedGifts.size === 3) {
    const continueBtn = document.getElementById('gift-hub-continue-btn');
    if (continueBtn) {
      continueBtn.classList.add('unlocked');
    }
  }
}

// Bind gift cards clicks
const envelopeGift = document.getElementById('gift-envelope-box');
if (envelopeGift) {
  envelopeGift.addEventListener('click', () => {
    registerVisitedGift('envelope');
    showScreen('screen-letter');
  });
}

const bouquetGift = document.getElementById('gift-bouquet-box');
if (bouquetGift) {
  bouquetGift.addEventListener('click', () => {
    registerVisitedGift('bouquet');
    showScreen('screen-gift-flowers');
  });
}

const boxGift = document.getElementById('gift-box-box');
if (boxGift) {
  boxGift.addEventListener('click', () => {
    registerVisitedGift('box');
    showScreen('screen-gift-accept');
  });
}

// Back to gifts buttons routing
document.querySelectorAll('.back-to-gifts-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showScreen('screen-choose-gift');
  });
});

/* ============ YES/NO DODGE GAME logic ============ */
const noBtn = document.getElementById('gift-no-btn');
const yesBtn = document.getElementById('gift-yes-btn');
const gameBackBtn = document.getElementById('gift-game-back-btn');
const acceptTitleText = document.getElementById('accept-title-text');

function moveNoButton() {
  if (!noBtn) return;
  const card = noBtn.closest('.scrapbook-page');
  if (!card) return;
  
  const cardRect = card.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  
  // Calculate relative bounds inside the card
  const maxX = cardRect.width - btnRect.width - 30;
  const maxY = cardRect.height - btnRect.height - 80;
  
  const randomX = Math.max(15, Math.floor(Math.random() * maxX));
  const randomY = Math.max(15, Math.floor(Math.random() * maxY));
  
  noBtn.style.position = 'absolute';
  noBtn.style.left = `${randomX}px`;
  noBtn.style.top = `${randomY}px`;
}

if (noBtn) {
  noBtn.addEventListener('mouseenter', moveNoButton);
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButton();
  });
}

if (yesBtn) {
  yesBtn.addEventListener('click', () => {
    fireConfetti();
    if (acceptTitleText) acceptTitleText.textContent = "Yo sabia k ibas a aceptar dea";
    
    // Hide creature, show polaroid
    const creature = document.getElementById('accept-game-creature');
    const polaroid = document.getElementById('accept-reveal-polaroid');
    if (creature) creature.classList.add('hidden');
    if (polaroid) polaroid.classList.remove('hidden');
    
    // Hide buttons, show Back to Gifts continue trigger
    if (yesBtn) yesBtn.classList.add('hidden');
    if (noBtn) noBtn.classList.add('hidden');
    if (gameBackBtn) gameBackBtn.classList.remove('hidden');
  });
}

function resetGiftGame() {
  if (acceptTitleText) acceptTitleText.textContent = "Te estoy vigilando acepta, pone k si JAJAJA";
  
  const creature = document.getElementById('accept-game-creature');
  const polaroid = document.getElementById('accept-reveal-polaroid');
  if (creature) creature.classList.remove('hidden');
  if (polaroid) polaroid.classList.add('hidden');
  
  if (yesBtn) yesBtn.classList.remove('hidden');
  if (noBtn) {
    noBtn.classList.remove('hidden');
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';
  }
  if (gameBackBtn) gameBackBtn.classList.add('hidden');
}

/* ============ EASTER EGG SECRET ENVELOPE ============ */
// Accesibilidad: abrir el sobre también con teclado
const _secretEnv = document.getElementById('secret-envelope-btn');
if (_secretEnv) _secretEnv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _secretEnv.click(); } });
const secretEnvelopeBtn = document.getElementById('secret-envelope-btn');
const secretMessagePopup = document.getElementById('secret-message-popup');
const closeSecretBtn = document.getElementById('close-secret-btn');

if (secretEnvelopeBtn && secretMessagePopup) {
  secretEnvelopeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    secretMessagePopup.classList.remove('hidden');
    fireConfetti();
  });
}

if (closeSecretBtn && secretMessagePopup) {
  closeSecretBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    secretMessagePopup.classList.add('hidden');
  });
}

// Initialize floating elements on page load
document.addEventListener('DOMContentLoaded', createPetals);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  createPetals();
}

/* Accesibilidad: activar tarjetas de regalo con teclado */
document.querySelectorAll('.gift-option-box').forEach(b => b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); } }));
