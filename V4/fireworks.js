// Full-screen canvas firework celebration. Nothing on this page triggers it
// on its own — call triggerFireworks() from wherever a "you did it" moment
// happens (currently: inventory.js, when the Life Build puzzle is solved).
// Runs for FIREWORKS_MS then cleans itself up; safe to call again any time,
// including while a previous run is still playing (it restarts cleanly).

const FIREWORKS_MS = 3000;
const BURST_COUNT = 6; // bursts spread across the duration
const PARTICLES_PER_BURST = 60;
const GRAVITY = 0.045;
const COLORS = ['#ffd76a', '#ff8a5c', '#8ee6a0', '#7ec8ff', '#ffffff', '#e77ee0'];

let canvas = null;
let ctx = null;
let particles = [];
let rafId = null;
let burstTimers = [];
let stopTimer = null;

function resize() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'fireworks-canvas';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function spawnBurst() {
  if (!ctx) return;
  const x = window.innerWidth * (0.2 + Math.random() * 0.6);
  const y = window.innerHeight * (0.15 + Math.random() * 0.4);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  for (let i = 0; i < PARTICLES_PER_BURST; i++) {
    const angle = (Math.PI * 2 * i) / PARTICLES_PER_BURST + Math.random() * 0.2;
    const speed = 2 + Math.random() * 3.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.012 + Math.random() * 0.012,
      color,
      size: 2 + Math.random() * 2,
    });
  }
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.vy += GRAVITY;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
  });
  particles = particles.filter((p) => p.life > 0);

  particles.forEach((p) => {
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  rafId = requestAnimationFrame(tick);
}

function stop() {
  cancelAnimationFrame(rafId);
  rafId = null;
  clearTimeout(stopTimer);
  burstTimers.forEach(clearTimeout);
  burstTimers = [];
  particles = [];
  if (canvas) {
    canvas.remove();
    window.removeEventListener('resize', resize);
    canvas = null;
    ctx = null;
  }
}

export function triggerFireworks() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  stop(); // restart cleanly if it's already mid-run
  ensureCanvas();

  for (let i = 0; i < BURST_COUNT; i++) {
    burstTimers.push(setTimeout(spawnBurst, (i * FIREWORKS_MS) / BURST_COUNT));
  }
  rafId = requestAnimationFrame(tick);
  // A little past FIREWORKS_MS so the final burst's particles finish fading.
  stopTimer = setTimeout(stop, FIREWORKS_MS + 500);
}
