// Journey markers on the Map screen. Each marker's tooltip is authored in
// index.html nested under its .map-marker, but at init we move it to
// <body> and switch it to position:fixed, positioned here with JS. It has
// to live outside #map/.main-container: that element has a `transform` for
// its centering trick, and any transform creates a stacking context
// regardless of z-index — so a tooltip left nested inside it could never
// render above a body-level sibling like #main-nav, no matter its own
// z-index. Moving it out is what actually escapes that.

const TOOLTIP_MARGIN = 16; // gap kept from the viewport edge and from the marker
const TOOLTIP_GAP = 12; // gap between the marker and its tooltip
const HIDE_DELAY = 150; // ms grace period so moving the pointer onto the tooltip doesn't close it

function initMapMarkers() {
  const markers = Array.from(document.querySelectorAll('.map-marker'));
  if (!markers.length) return;

  const entries = markers.map((marker) => {
    const hotspot = marker.querySelector('.map-marker__hotspot');
    const tooltip = marker.querySelector('.map-marker__tooltip');
    if (tooltip) document.body.appendChild(tooltip);
    return { marker, hotspot, tooltip };
  });

  let openTooltip = null;
  let hideTimer = null;

  function positionTooltip(entry) {
    const { hotspot, tooltip } = entry;
    if (!hotspot || !tooltip) return;

    const hotspotRect = hotspot.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();

    let left = hotspotRect.left + hotspotRect.width / 2 - tipRect.width / 2;
    left = Math.max(TOOLTIP_MARGIN, Math.min(left, window.innerWidth - tipRect.width - TOOLTIP_MARGIN));

    let top = hotspotRect.top - tipRect.height - TOOLTIP_GAP;
    if (top < TOOLTIP_MARGIN) {
      top = hotspotRect.bottom + TOOLTIP_GAP; // not enough room above — flip below
    }
    top = Math.max(TOOLTIP_MARGIN, Math.min(top, window.innerHeight - tipRect.height - TOOLTIP_MARGIN));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function show(entry) {
    if (!entry.tooltip) return;
    clearTimeout(hideTimer);
    if (openTooltip && openTooltip !== entry) {
      openTooltip.tooltip?.classList.remove('is-visible');
      openTooltip.marker.classList.remove('is-open');
      openTooltip.hotspot?.setAttribute('aria-expanded', 'false');
    }
    openTooltip = entry;
    positionTooltip(entry);
    entry.tooltip.classList.add('is-visible');
    entry.marker.classList.add('is-open');
    entry.hotspot?.setAttribute('aria-expanded', 'true');
  }

  function hide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!openTooltip) return;
      openTooltip.tooltip?.classList.remove('is-visible');
      openTooltip.marker.classList.remove('is-open');
      openTooltip.hotspot?.setAttribute('aria-expanded', 'false');
      openTooltip = null;
    }, HIDE_DELAY);
  }

  function cancelHide() {
    clearTimeout(hideTimer);
  }

  entries.forEach((entry) => {
    const { hotspot, tooltip } = entry;
    if (!hotspot) return;

    hotspot.addEventListener('pointerenter', () => show(entry));
    hotspot.addEventListener('pointerleave', hide);
    hotspot.addEventListener('focus', () => show(entry));
    hotspot.addEventListener('blur', hide);

    tooltip?.addEventListener('pointerenter', cancelHide);
    tooltip?.addEventListener('pointerleave', hide);

    // Touch: tap toggles this marker's tooltip open/closed (hover doesn't
    // apply on touch, so pointerenter above won't have fired first).
    hotspot.addEventListener('click', (event) => {
      event.stopPropagation();
      if (openTooltip === entry && tooltip?.classList.contains('is-visible')) {
        cancelHide();
        tooltip.classList.remove('is-visible');
        entry.marker.classList.remove('is-open');
        hotspot.setAttribute('aria-expanded', 'false');
        openTooltip = null;
      } else {
        show(entry);
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (openTooltip?.tooltip?.contains(event.target)) return;
    hide();
  });

  window.addEventListener('resize', () => {
    if (openTooltip) positionTooltip(openTooltip);
  });
}

initMapMarkers();
