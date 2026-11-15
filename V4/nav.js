// Switches between screens (each a <div class="main-container">) by toggling
// .is-active — the CSS transition on .main-container handles the cross-fade.
// Add a screen: give it an id, add a <button data-target="that-id"
// data-hash="..."> in #main-nav, and a NAV_TOP_OFFSET_PERCENT entry.
//
// Deep links: each nav button's data-hash (#overview, #projects, #experience,
// #about) opens that tab; #cv opens the Quick CV (quick-cv.js). The URL hash
// follows the active tab so a link can be copied straight from the address bar.

import { unlockAchievement } from './achievements.js';

// How far below the active screen's own top edge #main-nav sits, as a
// percentage of that screen's rendered height (positioned from the screen's
// live bounding box, so it holds at any window size).
const NAV_TOP_OFFSET_PERCENT = {
  hero: 5,
  skills: 20,
  map: 16,
  about: 5,
};

// #main-nav's font-size as a fraction of the active screen's rendered width, clamped.
const NAV_FONT_SCALE = 0.013;
const NAV_FONT_MIN = 14;
const NAV_FONT_MAX = 20;

// Screens that show the 3D character in their centre. There is one viewer;
// it's moved into whichever of these is active.
const CHARACTER_SCREENS = ['hero', 'about'];

const nav = document.getElementById('main-nav');
const links = Array.from(nav?.querySelectorAll('.main-nav__link') ?? []);
const screens = links.map((link) => document.getElementById(link.dataset.target)).filter(Boolean);
const listeners = [];
const visited = new Set();
let currentTarget = null;

function positionNav() {
  const screen = document.getElementById(currentTarget);
  if (!screen || !nav) return;
  const rect = screen.getBoundingClientRect();
  const percent = NAV_TOP_OFFSET_PERCENT[currentTarget] ?? 5;
  nav.style.top = `${rect.top + rect.height * (percent / 100)}px`;
  const fontSize = Math.min(NAV_FONT_MAX, Math.max(NAV_FONT_MIN, rect.width * NAV_FONT_SCALE));
  nav.style.fontSize = `${fontSize}px`;
}

function moveCharacterTo(targetId) {
  if (!CHARACTER_SCREENS.includes(targetId)) return;
  const viewer = document.getElementById('character-viewer');
  const screen = document.getElementById(targetId);
  if (viewer && screen && viewer.parentElement !== screen) {
    screen.querySelector('.background-image')?.after(viewer);
  }
}

export function currentScreen() {
  return currentTarget;
}

// Called with the new screen id after every switch.
export function onScreenChange(fn) {
  listeners.push(fn);
}

export function goTo(targetId, { updateHash = true } = {}) {
  if (!screens.some((s) => s.id === targetId)) return;
  currentTarget = targetId;
  moveCharacterTo(targetId);
  screens.forEach((screen) => screen.classList.toggle('is-active', screen.id === targetId));
  links.forEach((link) => link.classList.toggle('is-current', link.dataset.target === targetId));
  document.body.dataset.activeScreen = targetId;
  positionNav();

  if (updateHash) {
    const hash = links.find((l) => l.dataset.target === targetId)?.dataset.hash;
    if (hash) history.replaceState(null, '', `#${hash}`);
  }

  visited.add(targetId);
  if (visited.size === screens.length) unlockAchievement('visit_containers');
  listeners.forEach((fn) => fn(targetId));
}

function screenFromHash() {
  const hash = location.hash.slice(1).toLowerCase();
  return links.find((l) => l.dataset.hash === hash)?.dataset.target;
}

links.forEach((link) => link.addEventListener('click', () => goTo(link.dataset.target)));

window.addEventListener('resize', positionNav);
// Images may still be loading on first run, which would put the nav in the wrong place until they finish.
window.addEventListener('load', positionNav);
window.addEventListener('hashchange', () => {
  const target = screenFromHash();
  if (target && target !== currentTarget) goTo(target, { updateHash: false });
});

goTo(screenFromHash() ?? screens[0]?.id, { updateHash: false });
