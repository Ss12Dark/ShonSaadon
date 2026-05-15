// ── Gate ───────────────────────────────────────────────────
(function () {
    const gate         = document.getElementById('gate');
    if (!gate) return;

    const leftDoor     = gate.querySelector('.gate-door--left');
    const rightDoor    = gate.querySelector('.gate-door--right');
    const gateSeam     = gate.querySelector('.gate-seam');
    const gateHint     = gate.querySelector('.gate-hint');
    const gateLatch    = document.getElementById('gate-latch');
    const progressFill = document.getElementById('gate-progress-fill');
    const header       = document.querySelector('.site-header');

    let targetProg  = 0;   // where the user has scrolled to (0–1)
    let currentProg = 0;   // what's currently rendered (lerped)
    let isOpen      = false;
    let touchPrev   = null;
    let rafId       = null;

    const SCROLL_DIST = 380;  // total wheel delta to reach progress = 1
    const LERP        = 0.09; // smoothing factor — lower = silkier, higher = snappier

    document.body.style.overflow = 'hidden';

    function applyProgress(p) {
        // 3-D hinge rotation: left door swings left, right door swings right
        const angle = p * 90;
        leftDoor.style.transform  = `rotateY(${-angle}deg)`;
        rightDoor.style.transform = `rotateY(${angle}deg)`;

        gateSeam.style.opacity  = String(Math.max(0, 1 - p * 3.5));
        gateHint.style.opacity  = String(Math.max(0, 1 - p * 5));
        gateLatch.style.opacity = String(Math.max(0, 1 - p * 3.2));
        gateLatch.style.transform =
            `translate(-50%, -50%) scale(${Math.max(0.3, 1 - p)})`;

        if (progressFill) progressFill.style.width = `${p * 100}%`;
    }

    function tick() {
        // Lerp toward target for buttery smoothness
        currentProg += (targetProg - currentProg) * LERP;
        applyProgress(currentProg);

        // When close enough and target is fully open, snap and finish
        if (targetProg >= 1 && currentProg >= 0.96) {
            snapOpen();
            return;
        }
        rafId = requestAnimationFrame(tick);
    }

    function startTick() {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
    }

    function snapOpen() {
        isOpen = true;
        cancelAnimationFrame(rafId);

        const ease = 'cubic-bezier(0.22, 1, 0.36, 1)'; // fast start, gentle landing
        leftDoor.style.transition  = `transform 0.65s ${ease}`;
        rightDoor.style.transition = `transform 0.65s ${ease}`;
        leftDoor.style.transform   = 'rotateY(-92deg)';
        rightDoor.style.transform  = 'rotateY(92deg)';

        gateSeam.style.transition  = 'opacity 0.2s ease';
        gateSeam.style.opacity     = '0';
        gateHint.style.opacity     = '0';
        gateLatch.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
        gateLatch.style.opacity    = '0';

        document.body.style.overflow = '';
        document.body.classList.remove('gate-active');

        if (header) {
            header.style.transition    = 'opacity 0.55s ease 0.28s';
            header.style.opacity       = '1';
            header.style.pointerEvents = '';
        }

        setTimeout(() => gate.remove(), 800);
    }

    // ── Wheel ─────────────────────────────────────────────
    window.addEventListener('wheel', (e) => {
        if (isOpen) return;
        e.preventDefault();
        targetProg = Math.max(0, Math.min(1, targetProg + e.deltaY / SCROLL_DIST));
        startTick();
    }, { passive: false });

    // ── Touch ─────────────────────────────────────────────
    window.addEventListener('touchstart', (e) => {
        if (isOpen) return;
        touchPrev = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (isOpen || touchPrev === null) return;
        e.preventDefault();
        const delta = touchPrev - e.touches[0].clientY;
        touchPrev   = e.touches[0].clientY;
        targetProg  = Math.max(0, Math.min(1, targetProg + delta / SCROLL_DIST));
        startTick();
    }, { passive: false });

    // ── Keyboard ──────────────────────────────────────────
    window.addEventListener('keydown', (e) => {
        if (isOpen) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            targetProg = 1;
            startTick();
        }
    });
})();

// ── Nav hamburger ──────────────────────────────────────────
const hamburger  = document.getElementById('nav-hamburger');
const navLinksEl = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinksEl.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
});

navLinksEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinksEl.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

// ── Active nav link on scroll ──────────────────────────────
const scrollSections = document.querySelectorAll('[id]');
const navLinks = document.querySelectorAll('.nav-link:not(.nav-link--cta)');

const activeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { threshold: 0.45 });

scrollSections.forEach(s => activeObserver.observe(s));

// ── Tabs ───────────────────────────────────────────────────
const tabBtns     = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

document.getElementById('skills').classList.add('active');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(target).classList.add('active');
    });
});

// ── Gallery — image thumbnails ─────────────────────────────
const imageThumbList = document.querySelector('.gallery-images .thumb-list');
const imageThumbEl   = imageThumbList ? imageThumbList.querySelectorAll('.thumb') : [];
const stageImg       = document.getElementById('stage-img');
const stageCaption   = document.getElementById('stage-caption');
const stageImageFig  = document.getElementById('stage-image');
const stageVideo     = document.getElementById('stage-video');

imageThumbEl.forEach(thumb => {
    thumb.addEventListener('click', () => {
        imageThumbEl.forEach(t => t.classList.remove('active-thumb'));
        thumb.classList.add('active-thumb');

        stageImg.src = thumb.src;
        stageImg.alt = thumb.alt;

        const rawCaption = thumb.dataset.caption || '';
        stageCaption.innerHTML = rawCaption
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');

        stageVideo.classList.add('stage-hidden');
        stageVideo.src = '';
        stageImageFig.style.display = '';
    });
});

// ── Gallery — video thumbnails ─────────────────────────────
const videoThumbList = document.querySelector('.gallery-videos .thumb-list');
const videoThumbEl   = videoThumbList ? videoThumbList.querySelectorAll('.thumb') : [];

videoThumbEl.forEach(thumb => {
    thumb.addEventListener('click', () => {
        const embed = thumb.dataset.embed;
        if (!embed) return;

        imageThumbEl.forEach(t => t.classList.remove('active-thumb'));

        stageVideo.src = embed;
        stageVideo.classList.remove('stage-hidden');
        stageImageFig.style.display = 'none';
    });
});

// ── Scroll-reveal for sections ─────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
});
