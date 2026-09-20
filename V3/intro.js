// One-time game-style title screen shown on first load: "Shon Saadon /
// A True Gamer" fades in over a dark screen, holds briefly, then the whole
// thing fades out to reveal the site. The entrance/hold/exit timing here
// must stay roughly in sync with the CSS animation durations in style.css
// (.intro-splash__title/__subtitle entrance, .intro-splash.is-leaving exit).

const HOLD_MS = 2600; // how long the text stays fully visible before fading out
const FADE_OUT_MS = 1400; // must match .intro-splash.is-leaving's transition duration in CSS

function initIntro() {
  const splash = document.getElementById('intro-splash');
  if (!splash) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function remove() {
    splash.remove();
  }

  if (reducedMotion) {
    splash.classList.add('intro-splash--static');
    setTimeout(remove, 900);
    return;
  }

  setTimeout(() => {
    splash.classList.add('is-leaving');
    setTimeout(remove, FADE_OUT_MS);
  }, HOLD_MS);
}

initIntro();
