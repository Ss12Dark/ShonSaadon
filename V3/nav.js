// Switches between the Hero/Skills/Map screens (each a <div class="main-container">)
// by toggling .is-active — the CSS transition on .main-container handles the
// cross-fade. Add a new screen by giving it an id and adding a matching
// <button data-target="that-id"> in #main-nav; no other wiring needed.

// How far below the active screen's own top edge #main-nav sits, as a
// percentage of that screen's rendered height. Since each .main-container
// shrink-wraps its background image and is centered on the viewport, its
// on-screen size changes with the window — so the nav is positioned from the
// container's live bounding box (not a fixed px guess) and stays correctly
// placed at any window size. Tune these percentages, not pixels.
const NAV_TOP_OFFSET_PERCENT = {
  hero: 5,
  skills: 20,
  map: 16,
};

// #main-nav's font-size as a fraction of the active screen's rendered width,
// clamped so it never gets unreadably small or comically large. Internal
// elements (.main-nav__link, .main-nav__divider) are sized in em against
// this, so setting one value scales the whole bar's text together.
const NAV_FONT_SCALE = 0.013;
const NAV_FONT_MIN = 12;
const NAV_FONT_MAX = 20;

function initNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll('.main-nav__link'));
  const screens = links
    .map((link) => document.getElementById(link.dataset.target))
    .filter(Boolean);

  let currentTarget = null;

  function positionNav() {
    const screen = document.getElementById(currentTarget);
    if (!screen) return;
    const rect = screen.getBoundingClientRect();

    const percent = NAV_TOP_OFFSET_PERCENT[currentTarget] ?? 5;
    nav.style.top = `${rect.top + rect.height * (percent / 100)}px`;

    const fontSize = Math.min(NAV_FONT_MAX, Math.max(NAV_FONT_MIN, rect.width * NAV_FONT_SCALE));
    nav.style.fontSize = `${fontSize}px`;
  }

  function setActive(targetId) {
    currentTarget = targetId;
    screens.forEach((screen) => {
      screen.classList.toggle('is-active', screen.id === targetId);
    });
    links.forEach((link) => {
      link.classList.toggle('is-current', link.dataset.target === targetId);
    });
    document.body.dataset.activeScreen = targetId;
    positionNav();
  }

  links.forEach((link) => {
    link.addEventListener('click', () => {
      if (link.dataset.target) setActive(link.dataset.target);
    });
  });

  window.addEventListener('resize', positionNav);
  // Images may still be loading when this first runs, which would make the
  // container's rect (and so the nav's position) wrong until they finish.
  window.addEventListener('load', positionNav);

  const initiallyActive = screens.find((screen) => screen.classList.contains('is-active'));
  setActive(initiallyActive ? initiallyActive.id : screens[0]?.id);
}

initNav();
