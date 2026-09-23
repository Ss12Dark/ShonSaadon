// Hero Overview "Stats" list: hovering/tapping a stat row shows its
// description in a floating popup (title top-left, score top-right,
// description in the middle) — visually and mechanically the same pattern
// as the map marker tooltips and skill panel.
//
// The popup is ONE shared element appended to document.body and positioned
// with JS, not CSS nested under the row. It has to live outside
// #hero-details/.main-container: that element has a `transform` for its
// centering trick, and any transform creates a stacking context regardless
// of z-index — so a popup left nested inside it could never render above a
// body-level sibling like #main-nav. Moving it to <body> is what escapes
// that (same fix already applied to the map tooltips and skill panel).

import { unlockAchievement } from './achievements.js';

const POPUP_MARGIN = 16; // gap kept from the viewport edge and from the row
const HIDE_DELAY = 150; // ms grace period so moving the pointer onto the popup doesn't close it

function initHeroStats() {
  const rows = Array.from(document.querySelectorAll('.hero-stat__row'));
  if (!rows.length) return;

  const hovered = new Set();

  const popup = document.createElement('div');
  popup.className = 'hero-stat-popup';
  popup.setAttribute('role', 'tooltip');

  const header = document.createElement('div');
  header.className = 'hero-stat-popup__header';
  const title = document.createElement('span');
  title.className = 'hero-stat-popup__title';
  const score = document.createElement('span');
  score.className = 'hero-stat-popup__score';
  header.append(title, score);

  const desc = document.createElement('p');
  desc.className = 'hero-stat-popup__desc';

  popup.append(header, desc);
  document.body.appendChild(popup);

  let openRow = null;
  let hideTimer = null;

  function fill(row) {
    title.textContent = row.querySelector('.hero-stat__name')?.textContent ?? '';

    const gradeEl = row.querySelector('.hero-stat__grade');
    score.textContent = gradeEl?.textContent ?? '';
    score.className = 'hero-stat-popup__score';
    gradeEl?.classList.forEach((cls) => {
      if (cls.startsWith('hero-stat__grade--')) {
        score.classList.add(`hero-stat-popup__score--${cls.slice('hero-stat__grade--'.length)}`);
      }
    });

    desc.textContent = row.dataset.desc || '';
  }

  function position(row) {
    const rowRect = row.getBoundingClientRect();
    // Popup is already in the DOM (opacity 0, not display:none), so it has
    // real, measurable dimensions before we decide where to put it.
    const popupRect = popup.getBoundingClientRect();

    let left = rowRect.right + POPUP_MARGIN;
    if (left + popupRect.width > window.innerWidth - POPUP_MARGIN) {
      left = rowRect.left - POPUP_MARGIN - popupRect.width;
    }
    left = Math.max(POPUP_MARGIN, Math.min(left, window.innerWidth - popupRect.width - POPUP_MARGIN));

    let top = rowRect.top + rowRect.height / 2 - popupRect.height / 2;
    top = Math.max(POPUP_MARGIN, Math.min(top, window.innerHeight - popupRect.height - POPUP_MARGIN));

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  }

  function show(row) {
    clearTimeout(hideTimer);
    if (openRow && openRow !== row) openRow.classList.remove('is-open');
    openRow = row;
    fill(row);
    position(row);
    popup.classList.add('is-visible');
    row.classList.add('is-open');

    hovered.add(row);
    if (hovered.size === rows.length) unlockAchievement('hover_stats');
  }

  function hide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      popup.classList.remove('is-visible');
      openRow?.classList.remove('is-open');
      openRow = null;
    }, HIDE_DELAY);
  }

  function cancelHide() {
    clearTimeout(hideTimer);
  }

  popup.addEventListener('pointerenter', cancelHide);
  popup.addEventListener('pointerleave', hide);

  rows.forEach((row) => {
    row.addEventListener('pointerenter', () => show(row));
    row.addEventListener('pointerleave', hide);
    row.addEventListener('focus', () => show(row));
    row.addEventListener('blur', hide);

    // Touch: tap toggles this row's popup open/closed (hover doesn't apply
    // on touch, so pointerenter above won't have fired first).
    row.addEventListener('click', (event) => {
      event.stopPropagation();
      if (openRow === row && popup.classList.contains('is-visible')) {
        cancelHide();
        popup.classList.remove('is-visible');
        row.classList.remove('is-open');
        openRow = null;
      } else {
        show(row);
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (popup.contains(event.target)) return;
    hide();
  });

  window.addEventListener('resize', () => {
    if (openRow) position(openRow);
  });
}

initHeroStats();
