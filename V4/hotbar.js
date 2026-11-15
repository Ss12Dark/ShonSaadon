// Hotbar: an RPG action bar fixed to the bottom of every screen, built from
// LINKS (data.js). Number keys 1-5 trigger the matching slot.

import { LINKS } from './data.js';
import { el } from './ui.js';
import { openCv } from './quick-cv.js';

// Single-colour line icons (inherit the slot's text colour), keyed by LINKS id.
// A link without one here falls back to its `icon` text from data.js.
const ICONS = {
  cv: '<path d="M6 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6"/><path d="M6 3a2 2 0 0 0-2 2v1h4V5a2 2 0 0 0-2-2z"/><path d="M6 21a2 2 0 0 1-2-2v-1h4v1a2 2 0 0 1-2 2"/><path d="M10 8h5M10 12h5M10 16h3"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  github: '<path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5a3 3 0 0 0-.9-2.4c3-.3 6-1.5 6-6.6a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.4 0C6.1 1 5 1.3 5 1.3a4.8 4.8 0 0 0-.1 3.6A5.2 5.2 0 0 0 3.5 8.5c0 5.1 3 6.3 6 6.6a3 3 0 0 0-.9 2.4V21"/>',
  youtube: '<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
};

function iconNode(link) {
  const span = el('span', 'hotbar__icon');
  span.setAttribute('aria-hidden', 'true');
  if (ICONS[link.id]) {
    span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[link.id]}</svg>`;
  } else {
    span.textContent = link.icon ?? '';
  }
  return span;
}

function slot(link) {
  const isAction = link.id === 'cv';
  const node = isAction ? el('button', 'hotbar__slot') : el('a', 'hotbar__slot');
  if (isAction) {
    node.type = 'button';
    node.classList.add('hotbar__slot--primary');
    node.addEventListener('click', openCv);
  } else {
    node.href = link.href;
    if (!link.href.startsWith('mailto:')) {
      node.target = '_blank';
      node.rel = 'noopener';
    }
  }
  node.appendChild(el('span', 'hotbar__key', link.key));
  node.appendChild(iconNode(link));
  node.appendChild(el('span', 'hotbar__label', link.label));
  return node;
}

function initHotbar() {
  const bar = document.getElementById('hotbar');
  if (!bar) return;
  const slots = new Map();
  LINKS.filter((l) => l.id === 'cv' || l.href).forEach((link) => {
    const node = slot(link);
    slots.set(link.key, node);
    bar.appendChild(node);
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.target.closest?.('input, textarea, [contenteditable]')) return;
    slots.get(e.key)?.click();
  });
}

initHotbar();
