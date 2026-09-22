// Ambient effect on the Hero screen: small gold-framed project GIFs
// periodically "grow" out from behind the 3D character and drift to a
// random spot on the left or right side (same as always) — then, instead
// of just fading there, get pulled the rest of the way toward the "Skills"
// nav button, shrinking as they go, and give it a brief glow the instant
// each one arrives.
//
// Reuses SKILL_NODES' `media` list (imported from skills-tree.js) instead
// of keeping a second copy — add a project's gif there and it automatically
// starts showing up here too. ES modules are singletons per URL, so
// skills-tree.js still only runs its own init once even though this file
// also imports from it.

import { SKILL_NODES } from './skills-tree.js';

const SPAWN_INTERVAL_MIN = 3000; // ms between spawns
const SPAWN_INTERVAL_MAX = 5500;
const DRIFT_DURATION_MIN = 5.5; // s, how long one thumbnail takes to reach the side, then the nav
const DRIFT_DURATION_MAX = 8;
const NAV_GLOW_MS = 700; // must match .main-nav__link--arrival-glow's animation duration in style.css

// Spawn point, as a percent of #hero — roughly the character's torso, so
// thumbnails visually emerge from behind them (character-viewer's canvas
// sits at a higher z-index than the spawner, so the character's opaque
// pixels occlude anything behind them; the mostly-transparent rest of the
// canvas lets the spawner show through).
const SPAWN_X_PERCENT = 50;
const SPAWN_Y_PERCENT = 30;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function initHeroGifs() {
  const hero = document.getElementById('hero');
  const navTarget = document.querySelector('.main-nav__link[data-target="skills"]');
  if (!hero || !navTarget) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const mediaList = SKILL_NODES.map((node) => node.media).filter(Boolean);
  if (!mediaList.length) return;

  const spawner = document.createElement('div');
  spawner.className = 'hero-gif-spawner';
  spawner.setAttribute('aria-hidden', 'true');
  hero.appendChild(spawner);

  let lastMedia = null;
  let nextToLeft = Math.random() < 0.5; // alternates every spawn: left, right, left, right...

  function pickMedia() {
    if (mediaList.length === 1) return mediaList[0];
    const choices = mediaList.filter((src) => src !== lastMedia);
    const pick = choices[Math.floor(Math.random() * choices.length)];
    lastMedia = pick;
    return pick;
  }

  function glowNavTarget() {
    navTarget.classList.remove('main-nav__link--arrival-glow');
    // Force a reflow so re-adding the class restarts the animation even if
    // a previous glow (from an earlier arrival) hasn't finished yet.
    void navTarget.offsetWidth;
    navTarget.classList.add('main-nav__link--arrival-glow');
    setTimeout(() => navTarget.classList.remove('main-nav__link--arrival-glow'), NAV_GLOW_MS);
  }

  function spawnOne() {
    const heroRect = hero.getBoundingClientRect();
    if (!heroRect.width || !heroRect.height) return;

    const navRect = navTarget.getBoundingClientRect();
    if (!navRect.width || !navRect.height) return;

    const spawnX = (SPAWN_X_PERCENT / 100) * heroRect.width;
    const spawnY = (SPAWN_Y_PERCENT / 100) * heroRect.height;

    // First leg: same random left/right side spot as always.
    const toLeft = nextToLeft;
    nextToLeft = !nextToLeft;
    const sideXPercent = toLeft ? randomBetween(26, 40) : randomBetween(60, 74);
    // Stay level with the spawn point or drift a bit higher — never lower.
    const sideYPercent = randomBetween(SPAWN_Y_PERCENT - 14, SPAWN_Y_PERCENT);
    const sideX = (sideXPercent / 100) * heroRect.width;
    const sideY = (sideYPercent / 100) * heroRect.height;

    // Second leg: from that side spot on to the nav button's on-screen
    // center, converted into the same "px relative to #hero's own box"
    // space that left/top (percentages of #hero) already use.
    const navX = navRect.left + navRect.width / 2 - heroRect.left;
    const navY = navRect.top + navRect.height / 2 - heroRect.top;

    const item = document.createElement('div');
    item.className = 'hero-gif-spawner__item';
    item.style.left = `${SPAWN_X_PERCENT}%`;
    item.style.top = `${SPAWN_Y_PERCENT}%`;
    item.style.setProperty('--drift-x', `${sideX - spawnX}px`);
    item.style.setProperty('--drift-y', `${sideY - spawnY}px`);
    item.style.setProperty('--nav-x', `${navX - spawnX}px`);
    item.style.setProperty('--nav-y', `${navY - spawnY}px`);
    item.style.animationDuration = `${randomBetween(DRIFT_DURATION_MIN, DRIFT_DURATION_MAX)}s`;

    const img = document.createElement('img');
    img.src = pickMedia();
    img.alt = '';
    img.loading = 'lazy';
    item.appendChild(img);

    spawner.appendChild(item);
    item.addEventListener('animationend', () => {
      item.remove();
      glowNavTarget();
    });
  }

  function scheduleNext() {
    setTimeout(() => {
      spawnOne();
      scheduleNext();
    }, randomBetween(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX));
  }

  scheduleNext();
}

initHeroGifs();
