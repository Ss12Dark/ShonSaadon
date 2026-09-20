// Ambient effect on the Hero screen: small gold-framed project GIFs
// periodically "grow" out from behind the 3D character and drift to a
// random spot on the left or right side, then fade away.
//
// Reuses SKILL_NODES' `media` list (imported from skills-tree.js) instead
// of keeping a second copy — add a project's gif there and it automatically
// starts showing up here too. ES modules are singletons per URL, so
// skills-tree.js still only runs its own init once even though this file
// also imports from it.

import { SKILL_NODES } from './skills-tree.js';

const SPAWN_INTERVAL_MIN = 3000; // ms between spawns
const SPAWN_INTERVAL_MAX = 5500;
const DRIFT_DURATION_MIN = 5.5; // s, how long one thumbnail takes to drift out + fade
const DRIFT_DURATION_MAX = 8;

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
  if (!hero) return;
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

  function spawnOne() {
    const rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const toLeft = nextToLeft;
    nextToLeft = !nextToLeft;

    const targetXPercent = toLeft ? randomBetween(26, 40) : randomBetween(60, 74);
    // Stay level with the spawn point or drift a bit higher — never lower.
    const targetYPercent = randomBetween(SPAWN_Y_PERCENT - 14, SPAWN_Y_PERCENT);

    const driftX = ((targetXPercent - SPAWN_X_PERCENT) / 100) * rect.width;
    const driftY = ((targetYPercent - SPAWN_Y_PERCENT) / 100) * rect.height;

    const item = document.createElement('div');
    item.className = 'hero-gif-spawner__item';
    item.style.left = `${SPAWN_X_PERCENT}%`;
    item.style.top = `${SPAWN_Y_PERCENT}%`;
    item.style.setProperty('--drift-x', `${driftX}px`);
    item.style.setProperty('--drift-y', `${driftY}px`);
    item.style.animationDuration = `${randomBetween(DRIFT_DURATION_MIN, DRIFT_DURATION_MAX)}s`;

    const img = document.createElement('img');
    img.src = pickMedia();
    img.alt = '';
    img.loading = 'lazy';
    item.appendChild(img);

    spawner.appendChild(item);
    item.addEventListener('animationend', () => item.remove());
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
