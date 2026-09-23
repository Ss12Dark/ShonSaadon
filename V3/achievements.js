// Steam-style achievement popups. NOT persisted for now — in-memory only,
// per page load, so every fresh visit (including a reload) can earn every
// achievement again. Easy to add localStorage back later if that changes:
// swap `unlocked` for a load/save pair keyed on a storage key, same shape
// as the in-memory Set used here.
//
// Usage from any other module: `import { unlockAchievement } from
// './achievements.js'; unlockAchievement('hover_stats');` — that's the
// entire API. Everything else (toast UI, queueing, the three time-based
// achievements) lives here.

const TOAST_HOLD_MS = 4500; // how long a toast stays fully visible
const TOAST_TRANSITION_MS = 400; // must match the slide/fade duration in style.css

const ACHIEVEMENTS = {
  motivation_puzzle: { icon: '🧩', title: 'Perfectly Balanced' },
  hover_stats: { icon: '📊', title: 'Know Thyself' },
  hover_skills: { icon: '🌳', title: 'Full Tree' },
  hover_map: { icon: '🗺️', title: 'Cartographer' },
  visit_containers: { icon: '🚪', title: 'Grand Tour' },
  time_2min: { icon: '⏱️', title: 'Getting Comfortable' },
  time_5min: { icon: '⏳', title: 'Making Yourself at Home' },
  time_10min: { icon: '🏆', title: 'True Adventurer' },
};

const unlocked = new Set();
const queue = [];
let showing = false;

function ensureToastHost() {
  let host = document.getElementById('achievement-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'achievement-toast-host';
    host.className = 'achievement-toast-host';
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  return host;
}

function processQueue() {
  if (showing || !queue.length) return;
  showing = true;

  const { icon, title } = queue.shift();
  const host = ensureToastHost();

  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <span class="achievement-toast__icon">${icon}</span>
    <span class="achievement-toast__body">
      <span class="achievement-toast__eyebrow">Achievement Unlocked</span>
      <span class="achievement-toast__title"></span>
    </span>
  `;
  toast.querySelector('.achievement-toast__title').textContent = title;
  host.appendChild(toast);

  // Next frame, so the initial (off-screen) state is committed before the
  // transition to .is-visible runs — otherwise it'd just appear, not slide.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('is-visible'));
  });

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => {
      toast.remove();
      showing = false;
      processQueue();
    }, TOAST_TRANSITION_MS);
  }, TOAST_HOLD_MS);
}

export function unlockAchievement(id) {
  const def = ACHIEVEMENTS[id];
  if (!def || unlocked.has(id)) return;

  unlocked.add(id);
  queue.push(def);
  processQueue();
}

// Time-based achievements — scheduled unconditionally on load;
// unlockAchievement() itself is the no-op guard for ones already earned.
[
  [2 * 60 * 1000, 'time_2min'],
  [5 * 60 * 1000, 'time_5min'],
  [10 * 60 * 1000, 'time_10min'],
].forEach(([delay, id]) => setTimeout(() => unlockAchievement(id), delay));
