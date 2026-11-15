// Projects screen: RPG skill tree + a "Journal" card view of the same
// projects, both rendered from PROJECTS (data.js). Legendary projects get a
// bigger gold node with their tags always visible. Filter runes dim
// non-matching nodes / hide non-matching cards.
//
// The detail panel is ONE shared element on <body>, positioned with JS:
// #skills/.main-container has a `transform` for its centering, which creates
// a stacking context that would otherwise cap it below #main-nav.

import { PROJECTS, PROJECT_FILTERS, PROJECTS_NOTE, ASSET, projectLabel } from './data.js';
import { unlockAchievement } from './achievements.js';
import { el, chips } from './ui.js';
import { goTo, onScreenChange } from './nav.js';

const PANEL_MARGIN = 16; // gap kept from the viewport edge and from the node
const HIDE_DELAY = 150; // ms grace so moving onto the panel doesn't close it
const ALL = 'All';


function createNodeElement(node) {
  const wrap = el('div', 'skill-node');
  if (node.legendary) wrap.classList.add('skill-node--legendary');
  wrap.dataset.nodeId = node.id;
  wrap.style.setProperty('--node-x', `${node.x}%`);
  wrap.style.setProperty('--node-y', `${node.y}%`);

  const hotspot = el('button', 'skill-node__hotspot');
  hotspot.type = 'button';
  hotspot.setAttribute('aria-expanded', 'false');
  hotspot.setAttribute('aria-label', projectLabel(node));

  const frame = el('img', 'skill-node__frame');
  frame.src = `${ASSET}images/item-slot-container.png`;
  frame.alt = '';
  frame.draggable = false;
  hotspot.appendChild(frame);

  const icon = el('span', 'skill-node__icon', node.icon || '✦');
  icon.setAttribute('aria-hidden', 'true');
  hotspot.appendChild(icon);

  const particles = el('span', 'skill-node__particles');
  particles.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i++) particles.appendChild(el('span', 'skill-node__particle'));
  hotspot.appendChild(particles);
  wrap.appendChild(hotspot);

  const label = el('span', 'skill-node__label');
  if (node.legendary) label.appendChild(el('span', 'skill-node__rarity', 'Legendary'));
  // Legendary: name and years on separate lines so the wide labels fit side by side.
  label.appendChild(el('span', 'skill-node__name', node.legendary ? node.title : projectLabel(node)));
  if (node.legendary) label.appendChild(el('span', 'skill-node__years', node.years));
  if (node.legendary) label.appendChild(chips(node.tags.slice(0, 2), 'tag-chips tag-chips--node'));
  wrap.appendChild(label);

  return wrap;
}

function createSharedPanel() {
  const panel = el('div', 'skill-panel');
  panel.setAttribute('role', 'dialog');
  const title = el('h3', 'skill-panel__title');
  const tags = el('div', 'skill-panel__tags');
  const desc = el('p', 'skill-panel__desc');
  const bullets = el('ul', 'skill-panel__bullets');
  const media = el('div', 'skill-panel__media');
  const mediaImg = el('img', 'skill-panel__media-img');
  media.appendChild(mediaImg);
  panel.append(title, tags, desc, bullets, media);
  document.body.appendChild(panel);
  return { panel, title, tags, desc, bullets, media, mediaImg };
}

function createJournalCard(node, onOpen) {
  const card = el('button', 'journal-card');
  card.type = 'button';
  if (node.legendary) card.classList.add('journal-card--legendary');
  card.dataset.nodeId = node.id;

  if (node.media) {
    const img = el('img', 'journal-card__media');
    img.src = `${ASSET}${node.media}`;
    img.alt = '';
    img.loading = 'lazy';
    card.appendChild(img);
  }
  const body = el('span', 'journal-card__body');
  if (node.legendary) body.appendChild(el('span', 'skill-node__rarity', 'Legendary'));
  body.appendChild(el('span', 'journal-card__title', node.title));
  body.appendChild(el('span', 'journal-card__years', node.years));
  body.appendChild(el('span', 'journal-card__desc', node.description));
  body.appendChild(chips(node.tags));
  card.appendChild(body);
  card.addEventListener('click', (event) => {
    event.stopPropagation();
    onOpen(card);
  });
  return card;
}

let api = null;

// Opens the Projects screen with this project's panel pinned open.
export function openProject(id) {
  goTo('skills');
  // After the click that called this has finished bubbling (the document
  // click handler below would otherwise close it straight away).
  setTimeout(() => api?.openPinned(id), 0);
}

function initSkillTree() {
  const root = document.getElementById('skill-tree');
  const toolbar = document.getElementById('skills-toolbar');
  const journal = document.getElementById('skills-journal');
  if (!root) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'skill-tree__lines');
  svg.setAttribute('aria-hidden', 'true');
  root.appendChild(svg);

  const nodeEls = new Map();
  PROJECTS.forEach((node) => {
    const wrap = createNodeElement(node);
    root.appendChild(wrap);
    nodeEls.set(node.id, wrap);
  });

  const ui = createSharedPanel();
  let openNodeId = null;
  let pinned = false;
  let hideTimer = null;
  const hoveredNodes = new Set();

  function fillPanel(node) {
    ui.title.textContent = projectLabel(node);
    ui.tags.replaceChildren(chips(node.tags));
    ui.desc.textContent = node.description;
    ui.bullets.replaceChildren(...node.bullets.map((b) => el('li', null, b)));
    ui.media.hidden = !node.media;
    if (node.media) {
      ui.mediaImg.src = `${ASSET}${node.media}`;
      ui.mediaImg.alt = `${node.title} preview`;
    }
  }

  function positionPanelNear(anchor) {
    const a = anchor.getBoundingClientRect();
    const p = ui.panel.getBoundingClientRect();
    let left = a.right + PANEL_MARGIN;
    if (left + p.width > window.innerWidth - PANEL_MARGIN) left = a.left - PANEL_MARGIN - p.width;
    left = Math.max(PANEL_MARGIN, Math.min(left, window.innerWidth - p.width - PANEL_MARGIN));
    let top = a.top + a.height / 2 - p.height / 2;
    top = Math.max(PANEL_MARGIN, Math.min(top, window.innerHeight - p.height - PANEL_MARGIN));
    ui.panel.style.left = `${left}px`;
    ui.panel.style.top = `${top}px`;
  }

  function setLinesLit(nodeId, lit) {
    svg.querySelectorAll(`[data-a="${nodeId}"], [data-b="${nodeId}"]`).forEach((line) => line.classList.toggle('is-lit', lit));
  }

  function markOpen(id, open) {
    const wrap = nodeEls.get(id);
    wrap?.classList.toggle('is-open', open);
    wrap?.querySelector('.skill-node__hotspot')?.setAttribute('aria-expanded', String(open));
    setLinesLit(id, open);
  }

  function showPanel(node, anchor, pin = false) {
    clearTimeout(hideTimer);
    if (openNodeId && openNodeId !== node.id) markOpen(openNodeId, false);
    openNodeId = node.id;
    pinned = pin || pinned;
    fillPanel(node);
    positionPanelNear(anchor);
    ui.panel.classList.add('is-visible');
    markOpen(node.id, true);

    hoveredNodes.add(node.id);
    if (hoveredNodes.size === PROJECTS.length) unlockAchievement('hover_skills');
  }

  function closeNow() {
    clearTimeout(hideTimer);
    ui.panel.classList.remove('is-visible');
    if (openNodeId) markOpen(openNodeId, false);
    openNodeId = null;
    pinned = false;
  }

  function hideSoon() {
    if (pinned) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(closeNow, HIDE_DELAY);
  }

  function togglePinned(node, anchor) {
    if (openNodeId === node.id && pinned) {
      closeNow();
    } else {
      pinned = false;
      showPanel(node, anchor, true);
    }
  }

  ui.panel.addEventListener('pointerenter', () => clearTimeout(hideTimer));
  ui.panel.addEventListener('pointerleave', hideSoon);

  function drawLines() {
    const rootRect = root.getBoundingClientRect();
    if (!rootRect.width || !rootRect.height) return;
    svg.setAttribute('width', rootRect.width);
    svg.setAttribute('height', rootRect.height);
    svg.setAttribute('viewBox', `0 0 ${rootRect.width} ${rootRect.height}`);
    svg.replaceChildren();

    let edgeIndex = 0;
    PROJECTS.forEach((node) => {
      node.parents.forEach((parentId) => {
        const a = nodeEls.get(node.id)?.querySelector('.skill-node__hotspot');
        const b = nodeEls.get(parentId)?.querySelector('.skill-node__hotspot');
        if (!a || !b) return;
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const coords = {
          x1: aRect.left + aRect.width / 2 - rootRect.left,
          y1: aRect.top + aRect.height / 2 - rootRect.top,
          x2: bRect.left + bRect.width / 2 - rootRect.left,
          y2: bRect.top + bRect.height / 2 - rootRect.top,
        };
        // Base line plus a shimmer dash travelling along it (pathLength=100
        // so one CSS animation fits every line length).
        ['skill-tree__line', 'skill-tree__line-shimmer'].forEach((cls) => {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          Object.entries(coords).forEach(([k, v]) => line.setAttribute(k, v));
          line.setAttribute('class', cls);
          if (cls.endsWith('shimmer')) {
            line.setAttribute('pathLength', '100');
            line.style.animationDelay = `${-(edgeIndex * 0.6).toFixed(2)}s`;
          }
          line.dataset.a = node.id;
          line.dataset.b = parentId;
          svg.appendChild(line);
        });
        edgeIndex += 1;
      });
    });
  }

  nodeEls.forEach((wrap, id) => {
    const hotspot = wrap.querySelector('.skill-node__hotspot');
    const node = PROJECTS.find((n) => n.id === id);
    hotspot.addEventListener('pointerenter', () => showPanel(node, hotspot));
    hotspot.addEventListener('pointerleave', hideSoon);
    hotspot.addEventListener('focus', () => showPanel(node, hotspot));
    hotspot.addEventListener('blur', hideSoon);
    hotspot.addEventListener('click', (event) => {
      event.stopPropagation();
      togglePinned(node, hotspot);
    });
  });

  document.addEventListener('click', (event) => {
    if (ui.panel.contains(event.target)) return;
    closeNow();
  });

  // ---- Journal (card view) ----
  const cards = new Map();
  if (journal) {
    const grid = el('div', 'journal-grid');
    const ordered = [...PROJECTS.filter((p) => p.legendary), ...PROJECTS.filter((p) => !p.legendary)];
    ordered.forEach((node) => {
      const card = createJournalCard(node, (cardEl) => togglePinned(node, cardEl));
      grid.appendChild(card);
      cards.set(node.id, card);
    });
    journal.appendChild(grid);
  }

  // ---- Toolbar: filter runes + Tree/Journal toggle ----
  let view = 'tree';
  let filter = ALL;

  function applyFilter() {
    PROJECTS.forEach((node) => {
      const match = filter === ALL || node.tags.includes(filter);
      nodeEls.get(node.id)?.classList.toggle('is-dimmed', !match);
      cards.get(node.id)?.toggleAttribute('hidden', !match);
    });
  }

  function setView(next) {
    view = next;
    closeNow();
    root.hidden = view !== 'tree';
    if (journal) journal.hidden = view !== 'journal';
    toolbar?.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('is-current', b.dataset.view === view));
    if (view === 'tree') requestAnimationFrame(drawLines);
  }

  if (toolbar) {
    const filters = el('div', 'skills-toolbar__group');
    [ALL, ...PROJECT_FILTERS].forEach((name) => {
      const b = el('button', 'rune', name);
      b.type = 'button';
      b.dataset.filter = name;
      b.classList.toggle('is-current', name === ALL);
      b.addEventListener('click', (event) => {
        event.stopPropagation();
        filter = name;
        filters.querySelectorAll('.rune').forEach((r) => r.classList.toggle('is-current', r === b));
        closeNow();
        applyFilter();
      });
      filters.appendChild(b);
    });

    const views = el('div', 'skills-toolbar__group');
    [['tree', '🌳 Tree'], ['journal', '📖 Journal']].forEach(([id, text]) => {
      const b = el('button', 'rune rune--view', text);
      b.type = 'button';
      b.dataset.view = id;
      b.addEventListener('click', (event) => {
        event.stopPropagation();
        setView(id);
      });
      views.appendChild(b);
    });
    toolbar.append(filters, views, el('span', 'skills-toolbar__note', PROJECTS_NOTE));
  }
  setView('tree');

  api = {
    openPinned(id) {
      const node = PROJECTS.find((n) => n.id === id);
      if (!node) return;
      const anchor = view === 'journal' ? cards.get(id) : nodeEls.get(id)?.querySelector('.skill-node__hotspot');
      if (!anchor) return;
      if (view === 'journal') anchor.scrollIntoView({ block: 'nearest' });
      pinned = false;
      showPanel(node, anchor, true);
    },
  };

  window.addEventListener('resize', () => {
    drawLines();
    if (openNodeId) closeNow();
  });
  drawLines();
  window.addEventListener('load', drawLines);
  // Hidden screens still lay out (opacity only), but redraw once visible in case fonts shifted things.
  onScreenChange((screen) => {
    if (screen === 'skills') requestAnimationFrame(drawLines);
    else closeNow();
  });
}

initSkillTree();
