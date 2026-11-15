// Experience screen: journey markers on the map + a plain "Quest Log" list
// beside them, both rendered from JOBS (data.js). Hovering a list row lights
// its marker and the reverse; clicking either pins that job's tooltip open
// (click anywhere else to close). Entering the screen opens the current job.
//
// Tooltips are moved to <body> and positioned with JS: #map/.main-container
// has a `transform` for its centering, which creates a stacking context that
// would otherwise cap them below #main-nav regardless of z-index.

import { JOBS, NEXT_QUEST, PROFILE, jobDates } from './data.js';
import { el, questRow, jobsInLogOrder } from './ui.js';
import { unlockAchievement } from './achievements.js';
import { goTo, onScreenChange, currentScreen } from './nav.js';

const TOOLTIP_MARGIN = 16; // gap kept from the viewport edge
const TOOLTIP_GAP = 12; // gap between the marker and its tooltip
const HIDE_DELAY = 150; // ms grace so moving onto the tooltip doesn't close it


function buildMarker(job) {
  const marker = el('div', 'map-marker');
  if (job.current) marker.classList.add('map-marker--current');
  if (job.id === 'next') marker.classList.add('map-marker--question');
  marker.style.setProperty('--marker-x', `${job.map.x}%`);
  marker.style.setProperty('--marker-y', `${job.map.y}%`);

  const hotspot = el('button', 'map-marker__hotspot');
  hotspot.type = 'button';
  hotspot.setAttribute('aria-expanded', 'false');
  hotspot.setAttribute('aria-label', job.company);
  marker.appendChild(hotspot);

  if (job.current) marker.appendChild(el('span', 'map-marker__here', 'You are here'));

  const label = el('span', 'map-marker__label', job.id === 'next' ? '?' : job.company);
  if (job.role) label.appendChild(el('span', 'map-marker__label-role', job.role));
  marker.appendChild(label);

  const tooltip = el('div', 'map-marker__tooltip');
  tooltip.setAttribute('role', 'tooltip');
  tooltip.appendChild(el('h4', 'map-marker__title', job.company));
  if (job.role) tooltip.appendChild(el('p', 'map-marker__role', job.role));
  if (job.start) tooltip.appendChild(el('p', 'map-marker__date', jobDates(job)));
  tooltip.appendChild(el('p', 'map-marker__desc', job.desc));
  if (job.id === 'next') {
    const contact = el('a', 'map-marker__contact', 'Contact Me');
    contact.href = `mailto:${PROFILE.email}`;
    tooltip.appendChild(contact);
  }
  if (job.current) tooltip.classList.add('map-marker__tooltip--current');
  document.body.appendChild(tooltip);

  return { job, marker, hotspot, tooltip };
}

const entries = [];
let openEntry = null;
let pinned = false;
let hideTimer = null;
const hovered = new Set();

function positionTooltip(entry) {
  // Anchor on the whole marker (hotspot + label + "You are here" badge) so the
  // tooltip never covers its own text.
  const rects = [entry.hotspot, ...entry.marker.querySelectorAll('.map-marker__label, .map-marker__here')]
    .map((n) => n.getBoundingClientRect());
  const hotspotRect = {
    left: Math.min(...rects.map((r) => r.left)),
    right: Math.max(...rects.map((r) => r.right)),
    top: Math.min(...rects.map((r) => r.top)),
    bottom: Math.max(...rects.map((r) => r.bottom)),
  };
  hotspotRect.width = hotspotRect.right - hotspotRect.left;
  hotspotRect.height = hotspotRect.bottom - hotspotRect.top;
  const tipRect = entry.tooltip.getBoundingClientRect();

  // Beside the marker (right, else left) so it never covers the nav or the
  // marker's own label; above/below only when neither side has room.
  const fitsRight = hotspotRect.right + TOOLTIP_GAP + tipRect.width <= window.innerWidth - TOOLTIP_MARGIN;
  const fitsLeft = hotspotRect.left - TOOLTIP_GAP - tipRect.width >= TOOLTIP_MARGIN;
  let left;
  let top;
  if (fitsRight || fitsLeft) {
    left = fitsRight ? hotspotRect.right + TOOLTIP_GAP : hotspotRect.left - TOOLTIP_GAP - tipRect.width;
    top = hotspotRect.top + hotspotRect.height / 2 - tipRect.height / 2;
  } else {
    left = hotspotRect.left + hotspotRect.width / 2 - tipRect.width / 2;
    top = hotspotRect.top - tipRect.height - TOOLTIP_GAP;
    if (top < TOOLTIP_MARGIN) top = hotspotRect.bottom + TOOLTIP_GAP;
  }
  left = Math.max(TOOLTIP_MARGIN, Math.min(left, window.innerWidth - tipRect.width - TOOLTIP_MARGIN));
  top = Math.max(TOOLTIP_MARGIN, Math.min(top, window.innerHeight - tipRect.height - TOOLTIP_MARGIN));

  entry.tooltip.style.left = `${left}px`;
  entry.tooltip.style.top = `${top}px`;
}

function setOpenState(entry, open) {
  entry.tooltip.classList.toggle('is-visible', open);
  entry.marker.classList.toggle('is-open', open);
  entry.row?.classList.toggle('is-open', open);
  entry.hotspot.setAttribute('aria-expanded', String(open));
}

function show(entry, pin = false) {
  clearTimeout(hideTimer);
  if (openEntry && openEntry !== entry) setOpenState(openEntry, false);
  openEntry = entry;
  pinned = pin || pinned;
  positionTooltip(entry);
  setOpenState(entry, true);

  hovered.add(entry);
  if (hovered.size === entries.length) unlockAchievement('hover_map');
}

function closeNow() {
  clearTimeout(hideTimer);
  if (openEntry) setOpenState(openEntry, false);
  openEntry = null;
  pinned = false;
}

function hideSoon() {
  if (pinned) return;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(closeNow, HIDE_DELAY);
}

function pinOpen(entry) {
  pinned = false;
  show(entry, true);
}

// Opens the Experience screen with this job's tooltip pinned open.
export function openJob(id) {
  const entry = entries.find((e) => e.job.id === id);
  goTo('map');
  // After the click that called this has finished bubbling (the document
  // click handler below would otherwise close it straight away).
  if (entry) setTimeout(() => pinOpen(entry), 0);
}

function initMap() {
  const markerHost = document.getElementById('map-markers');
  const logHost = document.getElementById('map-log-list');
  if (!markerHost) return;

  const stops = [...JOBS, { id: 'next', company: NEXT_QUEST.title, desc: NEXT_QUEST.desc, map: NEXT_QUEST.map }];

  stops.forEach((job) => {
    const entry = buildMarker(job);
    markerHost.appendChild(entry.marker);
    entries.push(entry);
  });

  jobsInLogOrder().forEach((job) => {
    const entry = entries.find((e) => e.job === job);
    entry.row = questRow(job, () => pinOpen(entry));
    entry.row.addEventListener('pointerenter', () => entry.marker.classList.add('is-lit'));
    entry.row.addEventListener('pointerleave', () => entry.marker.classList.remove('is-lit'));
    logHost?.appendChild(entry.row);
  });

  entries.forEach((entry) => {
    const { hotspot, tooltip } = entry;
    hotspot.addEventListener('pointerenter', () => {
      show(entry);
      entry.row?.classList.add('is-lit');
    });
    hotspot.addEventListener('pointerleave', () => {
      hideSoon();
      entry.row?.classList.remove('is-lit');
    });
    hotspot.addEventListener('focus', () => show(entry));
    hotspot.addEventListener('blur', hideSoon);
    tooltip.addEventListener('pointerenter', () => clearTimeout(hideTimer));
    tooltip.addEventListener('pointerleave', hideSoon);

    hotspot.addEventListener('click', (event) => {
      event.stopPropagation();
      if (openEntry === entry && pinned) closeNow();
      else pinOpen(entry);
    });
  });

  document.addEventListener('click', (event) => {
    if (openEntry?.tooltip.contains(event.target)) return;
    closeNow();
  });

  window.addEventListener('resize', () => {
    if (openEntry) positionTooltip(openEntry);
  });

  // Entering the Experience screen opens the current job; leaving closes any tooltip.
  const current = entries.find((e) => e.job.current);
  onScreenChange((screen) => {
    if (screen !== 'map') closeNow();
    else if (current) setTimeout(() => !openEntry && currentScreen() === 'map' && pinOpen(current), 350);
  });
  if (currentScreen() === 'map' && current) window.addEventListener('load', () => pinOpen(current));
}

initMap();
