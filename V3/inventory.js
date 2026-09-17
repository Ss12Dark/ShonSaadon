// Reusable RPG inventory grid: drag items with mouse/touch, swap between slots,
// clamped so items can never leave the inventory container.

const GRID_COLUMNS = 4;
const GRID_ROWS = 4;
const SLOT_FRAME_IMAGE = 'images/item-slot-container.png';

// 1x1 white square — stands in for a real item icon until one is set.
const PLACEHOLDER_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect width='1' height='1' fill='white'/%3E%3C/svg%3E";

// Starting items, keyed by slot index. Add real items here later, e.g.
// { 0: 'images/items/sword.png', 3: 'images/items/potion.png' }
const INITIAL_ITEMS = {
  0: PLACEHOLDER_ICON,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

class Inventory {
  constructor(root) {
    this.root = root;
    this.slots = [];
    this.drag = null;

    this.root.style.setProperty('--inventory-cols', String(GRID_COLUMNS));
    this.root.style.setProperty('--inventory-rows', String(GRID_ROWS));

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    this._build();
    this._bindEvents();
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
    img.alt = 'Item';
    img.draggable = false;
    item.appendChild(img);

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
    const left = clamp(
      event.clientX - drag.offsetX,
      containerRect.left,
      containerRect.right - drag.width
    );
    const top = clamp(
      event.clientY - drag.offsetY,
      containerRect.top,
      containerRect.bottom - drag.height
    );

    drag.item.style.left = `${left}px`;
    drag.item.style.top = `${top}px`;
  }

  _onPointerUp(event) {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    this.drag = null;

    const targetSlot = this._nearestSlot(drag.item);
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
}

const inventoryRoot = document.getElementById('inventory');
if (inventoryRoot) {
  new Inventory(inventoryRoot);
}
