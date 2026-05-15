// ── Gate ───────────────────────────────────────────────────
(function () {
    const gate         = document.getElementById('gate');
    if (!gate) return;

    const leftDoor     = gate.querySelector('.gate-door--left');
    const rightDoor    = gate.querySelector('.gate-door--right');
    const gateSeam     = gate.querySelector('.gate-seam');
    const gateHint     = gate.querySelector('.gate-hint');
    const gateSeal     = document.getElementById('gate-seal');
    const sparksEl     = document.getElementById('gate-sparks');
    const progressFill = document.getElementById('gate-progress-fill');
    const header       = document.querySelector('.site-header');

    let targetProg   = 0;
    let currentProg  = 0;
    let isOpen       = false;
    let sparksFired  = false;
    let touchPrev    = null;
    let rafId        = null;

    const SCROLL_DIST = 360;
    const LERP        = 0.09;

    document.body.style.overflow = 'hidden';

    // ── Sparks ────────────────────────────────────────────
    function fireSparks() {
        if (sparksFired || !sparksEl) return;
        sparksFired = true;

        // Crack the seal
        if (gateSeal) gateSeal.classList.add('cracking');

        // Central flash bloom
        const flash = document.createElement('div');
        flash.className = 'gate-flash';
        sparksEl.appendChild(flash);
        flash.addEventListener('animationend', () => flash.remove(), { once: true });

        // Radial spark streaks
        const COUNT = 22;
        for (let i = 0; i < COUNT; i++) {
            const spark  = document.createElement('div');
            spark.className = 'gate-spark';

            const angle  = (i / COUNT) * 360 + (Math.random() - 0.5) * (360 / COUNT);
            const dist   = 65 + Math.random() * 115;
            const width  = 14 + Math.random() * 32;
            const dur    = (0.32 + Math.random() * 0.36).toFixed(3);
            const delay  = (Math.random() * 0.07).toFixed(3);
            const isCyan = Math.random() > 0.38;

            spark.style.cssText = [
                `width:${width}px`,
                `background:linear-gradient(90deg,#fff,${isCyan ? '#00e5cc' : '#4f7cff'},transparent)`,
                `--a:${angle.toFixed(1)}deg`,
                `--d:${dist.toFixed(0)}px`,
                `--dur:${dur}s`,
                `--delay:${delay}s`,
            ].join(';');

            sparksEl.appendChild(spark);
            spark.addEventListener('animationend', () => spark.remove(), { once: true });
        }
    }

    // ── Progress → DOM ────────────────────────────────────
    function applyProgress(p) {
        leftDoor.style.transform  = `translateX(${-p * 100}%)`;
        rightDoor.style.transform = `translateX(${p * 100}%)`;

        gateSeam.style.opacity = String(Math.max(0, 1 - p * 4.5));
        gateHint.style.opacity = String(Math.max(0, 1 - p * 7));

        if (progressFill) progressFill.style.width = `${p * 100}%`;
    }

    function tick() {
        currentProg += (targetProg - currentProg) * LERP;
        applyProgress(currentProg);

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

        // Snap panels apart with fast ease-out (feels like a burst)
        const ease = 'cubic-bezier(0.2, 0, 0.0, 1)';
        leftDoor.style.transition  = `transform 0.5s ${ease}`;
        rightDoor.style.transition = `transform 0.5s ${ease}`;
        leftDoor.style.transform   = 'translateX(-100%)';
        rightDoor.style.transform  = 'translateX(100%)';

        gateSeam.style.transition = 'opacity 0.15s ease';
        gateSeam.style.opacity    = '0';
        gateHint.style.opacity    = '0';

        document.body.style.overflow = '';
        document.body.classList.remove('gate-active');

        if (header) {
            header.style.transition    = 'opacity 0.5s ease 0.22s';
            header.style.opacity       = '1';
            header.style.pointerEvents = '';
        }

        setTimeout(() => gate.remove(), 700);
    }

    // ── Input handlers ─────────────────────────────────────
    window.addEventListener('wheel', (e) => {
        if (isOpen) return;
        e.preventDefault();
        fireSparks();
        targetProg = Math.max(0, Math.min(1, targetProg + e.deltaY / SCROLL_DIST));
        startTick();
    }, { passive: false });

    window.addEventListener('touchstart', (e) => {
        if (isOpen) return;
        touchPrev = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (isOpen || touchPrev === null) return;
        e.preventDefault();
        const delta = touchPrev - e.touches[0].clientY;
        touchPrev   = e.touches[0].clientY;
        fireSparks();
        targetProg = Math.max(0, Math.min(1, targetProg + delta / SCROLL_DIST));
        startTick();
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
        if (isOpen) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            fireSparks();
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
