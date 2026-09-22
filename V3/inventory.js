// Reusable RPG inventory grid: drag items with mouse/touch, swap between slots,
// clamped so items can never leave the inventory container.
//
// Life Build system: items carry hidden stat modifiers (see ITEM_DATA below,
// keyed by image filename). Every item in the inventory contributes to
// #build-analysis, weighted by its SLOT POSITION — slot 0 (top-left) counts at
// full (100%) strength, the last slot counts at 10%, linearly in between. So
// dragging an item earlier in the grid raises its priority; no separate zone.

import { triggerFireworks } from './fireworks.js';

const GRID_COLUMNS = 3;
const GRID_ROWS = 3;
const SLOT_FRAME_IMAGE = 'images/item-slot-container.png';

// Weight of a slot's contribution to the build, purely by its position:
// index 0 -> 100%, last index -> 10%, linear in between.
const MAX_SLOT_WEIGHT = 1;
const MIN_SLOT_WEIGHT = 0.1;
function slotWeight(index, totalSlots) {
  if (totalSlots <= 1) return MAX_SLOT_WEIGHT;
  const t = index / (totalSlots - 1);
  return MAX_SLOT_WEIGHT - t * (MAX_SLOT_WEIGHT - MIN_SLOT_WEIGHT);
}

// 1x1 white square — stands in for a real item icon until one is set.
const PLACEHOLDER_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect width='1' height='1' fill='white'/%3E%3C/svg%3E";

// Starting items, keyed by slot index. Add real items here later, e.g.
// { 0: 'images/items/sword.png', 3: 'images/items/potion.png' }
const INITIAL_ITEMS = {
  0: "images/items/my-cat.png",
  1: "images/items/computer.png",
  2: "images/items/pizza.png",
  3: "images/items/ai.png",
  4: "images/items/anime-sketchbook.png",
  5: "images/items/coffee.png",
  6: "images/items/traveling.png",
};

// The stat categories tracked in the Build Analysis panel, in display order.
const STAT_CATEGORIES = ['Career', 'Creativity', 'Learning', 'Health', 'Adventure', 'Technology'];

// Bars fill relative to this — raise it if your items' totals routinely exceed it.
const STAT_MAX = 100;

// Item data, keyed by image FILENAME (not full path) so it survives moving
// images between folders. Add a new item by dropping its icon in
// images/items/ and adding an entry here — no other code needs to change.
// Display names are parsed from the filename itself (see titleFromFilename
// below), so there's no separate name to keep in sync — just stats.
// Stat values are the item's FULL strength (slot position then scales them
// down per slotWeight above).
//
// PUZZLE: these values are solved so that exactly one slot arrangement
// pushes every stat to 100% at once — every other arrangement leaves at
// least one stat short, since slotWeight's per-slot multipliers are all
// distinct, non-round fractions that only cancel out cleanly for this one
// combination. The solution, slot 0 through 6 in order (7 and 8 stay
// empty), my-cat.png first as required:
//   0: my-cat.png
//   1: coffee.png
//   2: computer.png
//   3: anime-sketchbook.png
//   4: pizza.png
//   5: ai.png
//   6: traveling.png
const ITEM_DATA = {
  'computer.png': { stats: { Technology: 50, Career: 42 } },
  'pizza.png': { stats: { Creativity: 30, Health: 20 } },
  'ai.png': { stats: { Technology: 140, Learning: 142 } },
  'anime-sketchbook.png': { stats: { Creativity: 40, Learning: 40 } },
  'coffee.png': { stats: { Career: 76, Health: 40 } },
  'traveling.png': { stats: { Adventure: 307, Learning: 35 } },
  'my-cat.png': { stats: { Health: 53.5, Creativity: 57 } },
};

// Filename segments that should render as an acronym rather than Title Case.
const TITLE_ACRONYMS = new Set(['ai', 'ui', 'ux', 'mcp']);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// "images/items/my-cat.png" -> "my-cat.png"
function getItemKey(iconSrc) {
  if (!iconSrc) return null;
  return iconSrc.split('/').pop().split('?')[0];
}

// "anime-sketchbook.png" -> "Anime Sketchbook", "ai.png" -> "AI"
function titleFromFilename(filename) {
  const base = filename.replace(/\.[a-z0-9]+$/i, '');
  return base
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) =>
      TITLE_ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
}

class Inventory {
  constructor(root, options = {}) {
    this.root = root;
    this.buildAnalysisRoot = options.buildAnalysisRoot || null;
    this.slots = [];
    this.drag = null;
    this.wasSolved = false; // tracks the rising edge for the fireworks trigger

    this.root.style.setProperty('--inventory-cols', String(GRID_COLUMNS));
    this.root.style.setProperty('--inventory-rows', String(GRID_ROWS));

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'inventory-tooltip';
    this.tooltip.hidden = true;
    document.body.appendChild(this.tooltip);

    this._build();
    this._bindEvents();
    this._refreshBuild();
  }

  _build() {
    const totalSlots = GRID_COLUMNS * GRID_ROWS;
    for (let i = 0; i < totalSlots; i++) {
      const slot = this._createSlot(i);
      this.root.appendChild(slot);
      this.slots.push(slot);
    }

    Object.entries(INITIAL_ITEMS).forEach(([slotIndex, icon]) => {
      const slot = this.slots[Number(slotIndex)];
      if (slot) slot.appendChild(this._createItem(icon));
    });
  }

  _createSlot(index) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.dataset.slotIndex = String(index);

    const frame = document.createElement('img');
    frame.className = 'inventory-slot__frame';
    frame.src = SLOT_FRAME_IMAGE;
    frame.alt = '';
    frame.draggable = false;
    slot.appendChild(frame);

    return slot;
  }

  _createItem(icon = PLACEHOLDER_ICON) {
    const item = document.createElement('div');
    item.className = 'inventory-item';

    const img = document.createElement('img');
    img.className = 'inventory-item__icon';
    img.src = icon;
    img.alt = titleFromFilename(getItemKey(icon) || '') || 'Item';
    img.draggable = false;
    item.appendChild(img);

    item.addEventListener('pointerenter', () => this._showTooltip(item));
    item.addEventListener('pointerleave', () => this._hideTooltip());

    return item;
  }

  _bindEvents() {
    this.root.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp);
  }

  _onPointerDown(event) {
    const item = event.target.closest('.inventory-item');
    if (!item) return;

    this._hideTooltip();

    const rect = item.getBoundingClientRect();
    const fromSlot = item.parentElement;

    this.drag = {
      item,
      fromSlot,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };

    document.body.appendChild(item);
    item.style.position = 'fixed';
    item.style.width = `${rect.width}px`;
    item.style.height = `${rect.height}px`;
    item.style.left = `${rect.left}px`;
    item.style.top = `${rect.top}px`;
    item.style.zIndex = '1000';
    item.classList.add('inventory-item--dragging');
    item.setPointerCapture?.(event.pointerId);

    event.preventDefault();
  }

  _onPointerMove(event) {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;

    const containerRect = this.root.getBoundingClientRect();
    const maxLeft = Math.max(containerRect.left, containerRect.right - drag.width);
    const maxTop = Math.max(containerRect.top, containerRect.bottom - drag.height);
    const left = clamp(event.clientX - drag.offsetX, containerRect.left, maxLeft);
    const top = clamp(event.clientY - drag.offsetY, containerRect.top, maxTop);

    drag.item.style.left = `${left}px`;
    drag.item.style.top = `${top}px`;
  }

  _onPointerUp(event) {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    this.drag = null;

    const targetSlot = this._resolveDropSlot(drag.item, event.clientX, event.clientY);
    const existing = targetSlot.querySelector('.inventory-item');
    if (existing && existing !== drag.item) {
      drag.fromSlot.appendChild(existing);
    }
    targetSlot.appendChild(drag.item);

    drag.item.style.position = '';
    drag.item.style.width = '';
    drag.item.style.height = '';
    drag.item.style.left = '';
    drag.item.style.top = '';
    drag.item.style.zIndex = '';
    drag.item.classList.remove('inventory-item--dragging');

    this._refreshBuild();
  }

  _resolveDropSlot(item, clientX, clientY) {
    // Hide the dragged item so elementFromPoint sees what's underneath it,
    // not the item itself (it's the topmost thing at that point otherwise).
    const previousPointerEvents = item.style.pointerEvents;
    item.style.pointerEvents = 'none';
    const elementAtPoint = document.elementFromPoint(clientX, clientY);
    item.style.pointerEvents = previousPointerEvents;

    const hitSlot = elementAtPoint ? elementAtPoint.closest('.inventory-slot') : null;
    return hitSlot || this._nearestSlot(item);
  }

  _nearestSlot(item) {
    const itemRect = item.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const itemCenterY = itemRect.top + itemRect.height / 2;

    let closest = this.slots[0];
    let closestDist = Infinity;

    for (const slot of this.slots) {
      const rect = slot.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - itemCenterX;
      const dy = rect.top + rect.height / 2 - itemCenterY;
      const dist = dx * dx + dy * dy;
      if (dist < closestDist) {
        closestDist = dist;
        closest = slot;
      }
    }

    return closest;
  }

  _getItemData(itemEl) {
    const img = itemEl.querySelector('.inventory-item__icon');
    const key = getItemKey(img?.getAttribute('src'));
    const entry = key && ITEM_DATA[key];
    if (!entry) return null;
    return { name: titleFromFilename(key), stats: entry.stats };
  }

  _showTooltip(item) {
    if (this.drag) return;

    const data = this._getItemData(item);
    const slot = item.parentElement;
    const index = slot ? Number(slot.dataset.slotIndex) : null;
    const weight = index !== null ? slotWeight(index, this.slots.length) : null;

    this.tooltip.replaceChildren();

    const title = document.createElement('div');
    title.className = 'inventory-tooltip__title';
    title.textContent = data ? data.name : 'Unknown item';
    this.tooltip.appendChild(title);

    if (data) {
      const stats = document.createElement('div');
      stats.className = 'inventory-tooltip__stats';
      stats.textContent = Object.entries(data.stats)
        .map(([stat, value]) => `${stat} +${value}`)
        .join(' · ');
      this.tooltip.appendChild(stats);
    }

    if (weight !== null) {
      const priority = document.createElement('div');
      priority.className = 'inventory-tooltip__zone';
      priority.textContent = `Priority: ${Math.round(weight * 100)}% (slot ${index + 1} of ${this.slots.length})`;
      this.tooltip.appendChild(priority);
    }

    const rect = item.getBoundingClientRect();
    this.tooltip.style.left = `${rect.left + rect.width / 2}px`;
    this.tooltip.style.top = `${rect.top}px`;
    this.tooltip.hidden = false;
  }

  _hideTooltip() {
    this.tooltip.hidden = true;
  }

  _refreshBuild() {
    if (!this.buildAnalysisRoot) return;

    const totals = {};
    STAT_CATEGORIES.forEach((stat) => {
      totals[stat] = 0;
    });

    const totalSlots = this.slots.length;
    const activeItems = [];

    this.slots.forEach((slot) => {
      const itemEl = slot.querySelector('.inventory-item');
      if (!itemEl) return;
      const data = this._getItemData(itemEl);
      if (!data) return;

      const index = Number(slot.dataset.slotIndex);
      const weight = slotWeight(index, totalSlots);
      const contribution = {};
      Object.entries(data.stats).forEach(([stat, value]) => {
        const amount = value * weight;
        contribution[stat] = amount;
        if (stat in totals) totals[stat] += amount;
      });

      activeItems.push({ name: data.name, weight, contribution });
    });

    STAT_CATEGORIES.forEach((stat) => {
      totals[stat] = Math.round(totals[stat]);
    });

    // Fireworks on the rising edge only — the moment every stat first hits
    // 100%, not on every refresh while it stays solved (e.g. dragging an
    // item between the two empty slots, which changes nothing). Breaking
    // the solution and re-solving it fires again.
    const isSolved = STAT_CATEGORIES.every((stat) => totals[stat] >= STAT_MAX);
    if (isSolved && !this.wasSolved) triggerFireworks();
    this.wasSolved = isSolved;

    this._renderBuildAnalysis(totals, activeItems);
  }

  _renderBuildAnalysis(totals, activeItems) {
    this.buildAnalysisRoot.replaceChildren();

    const heading = document.createElement('h3');
    heading.className = 'hero-heading';
    heading.textContent = 'Build Analysis';
    this.buildAnalysisRoot.appendChild(heading);

    const hint = document.createElement('p');
    hint.className = 'build-hint';
    hint.textContent = 'try to balance by changing motivation order!';
    this.buildAnalysisRoot.appendChild(hint);

    const bars = document.createElement('div');
    bars.className = 'build-bars';
    STAT_CATEGORIES.forEach((stat) => {
      const value = totals[stat];
      const row = document.createElement('div');
      row.className = 'build-bar';

      const head = document.createElement('div');
      head.className = 'build-bar__head';
      const label = document.createElement('span');
      label.textContent = stat;
      const amount = document.createElement('span');
      amount.textContent = String(value);
      head.append(label, amount);

      const track = document.createElement('div');
      track.className = 'build-bar__track';
      const fill = document.createElement('div');
      fill.className = 'build-bar__fill';
      fill.style.width = `${clamp((value / STAT_MAX) * 100, 0, 100)}%`;
      track.appendChild(fill);

      row.append(head, track);
      bars.appendChild(row);
    });
    this.buildAnalysisRoot.appendChild(bars);

    const description = document.createElement('p');
    description.className = 'build-description';
    description.textContent = this._buildDescription(totals, activeItems);
    this.buildAnalysisRoot.appendChild(description);

    if (activeItems.length > 0) {
      const bonusHeading = document.createElement('h3');
      bonusHeading.className = 'hero-heading';
      bonusHeading.textContent = 'Bonus Stats';
      this.buildAnalysisRoot.appendChild(bonusHeading);

      const list = document.createElement('ul');
      list.className = 'build-bonus-list';
      activeItems.forEach(({ name, weight, contribution }) => {
        const li = document.createElement('li');
        const nameEl = document.createElement('span');
        nameEl.className = 'build-bonus-list__name';
        nameEl.textContent = `${name} (${Math.round(weight * 100)}%)`;
        const stats = document.createElement('span');
        stats.className = 'build-bonus-list__stats';
        stats.textContent = Object.entries(contribution)
          .map(([stat, value]) => `+${Math.round(value)} ${stat}`)
          .join(', ');
        li.append(nameEl, stats);
        list.appendChild(li);
      });
      this.buildAnalysisRoot.appendChild(list);
    }
  }

  _buildDescription(totals, activeItems) {
    if (activeItems.length === 0) {
      return 'Your inventory is empty — add items to shape your build.';
    }

    const ranked = Object.entries(totals)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]);

    if (ranked.length === 0) {
      return 'Your active items have no measurable effect yet.';
    }

    const top = ranked.slice(0, 2).map(([stat]) => stat);
    const focus = top.length === 2 ? `${top[0]} and ${top[1]}` : top[0];
    return `Your current build focuses on ${focus}.`;
  }
}

const inventoryRoot = document.getElementById('inventory');
if (inventoryRoot) {
  new Inventory(inventoryRoot, {
    buildAnalysisRoot: document.getElementById('build-analysis'),
  });
}
