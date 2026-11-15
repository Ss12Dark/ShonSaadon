// One-time game-style title screen shown on first load: "Shon Saadon /
// A True Gamer" fades in, holds briefly, then fades out to reveal the site.
// Any click or key skips it, and it's skipped entirely when the Quick CV
// opened on load (#cv link or a phone). Timing must stay roughly in sync with
// the CSS durations in style.css (.intro-splash__title/__subtitle, .is-leaving).

const HOLD_MS = 2600; // how long the text stays fully visible before fading out
const FADE_OUT_MS = 1400; // must match .intro-splash.is-leaving's transition duration in CSS
const SKIP_FADE_MS = 300;

function initIntro() {
  const splash = document.getElementById('intro-splash');
  if (!splash) return;

  if (document.body.classList.contains('cv-open')) {
    splash.remove();
    return;
  }

  let leaving = false;
  function leave(fadeMs) {
    if (leaving) return;
    leaving = true;
    splash.style.transitionDuration = `${fadeMs}ms`;
    splash.classList.add('is-leaving');
    setTimeout(() => splash.remove(), fadeMs);
  }

  const skip = () => leave(SKIP_FADE_MS);
  splash.addEventListener('click', skip);
  document.addEventListener('keydown', skip, { once: true });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    splash.classList.add('intro-splash--static');
    setTimeout(() => leave(FADE_OUT_MS), 900);
    return;
  }
  setTimeout(() => leave(FADE_OUT_MS), HOLD_MS);
}

initIntro();
