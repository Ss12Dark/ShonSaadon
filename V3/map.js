// Journey markers on the Map screen. Hover/focus already reveals a marker's
// tooltip via CSS (:hover/:focus-within). This adds tap-to-toggle for touch
// devices, where hover doesn't apply: tapping a marker pins its tooltip open
// (.is-open) until another marker or the page background is tapped.

function initMapMarkers() {
  const markers = document.querySelectorAll('.map-marker');
  if (!markers.length) return;

  function closeAll(except) {
    markers.forEach((marker) => {
      if (marker === except) return;
      marker.classList.remove('is-open');
      marker.querySelector('.map-marker__hotspot')?.setAttribute('aria-expanded', 'false');
    });
  }

  markers.forEach((marker) => {
    const hotspot = marker.querySelector('.map-marker__hotspot');
    if (!hotspot) return;

    hotspot.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = marker.classList.toggle('is-open');
      hotspot.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) closeAll(marker);
    });
  });

  document.addEventListener('click', () => closeAll(null));
}

initMapMarkers();
