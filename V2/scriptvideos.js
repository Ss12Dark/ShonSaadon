document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('video');

    // ── Play / pause overlay state ─────────────────────────
    videos.forEach(video => {
        video.addEventListener('play',  () => video.setAttribute('data-playing', 'true'));
        video.addEventListener('pause', () => video.removeAttribute('data-playing'));
        video.addEventListener('ended', () => video.removeAttribute('data-playing'));
    });

    // ── Pause when scrolled out of view ───────────────────
    const viewObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && !entry.target.paused) {
                entry.target.pause();
            }
        });
    }, { threshold: 0.4 });

    videos.forEach(v => viewObserver.observe(v));

    // ── Lazy load on proximity ─────────────────────────────
    const loadObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                if (video.readyState === 0) video.load();
                loadObserver.unobserve(video);
            }
        });
    }, { rootMargin: '100px' });

    videos.forEach(v => loadObserver.observe(v));

    // ── Section scroll-reveal ──────────────────────────────
    const fadeObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.vsection').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(26px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeObserver.observe(el);
    });

    // ── Card tilt on desktop ───────────────────────────────
    if (window.innerWidth > 768) {
        document.querySelectorAll('.video-card').forEach(card => {
            let ticking = false;
            card.addEventListener('mousemove', e => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const r = card.getBoundingClientRect();
                        const rotX = (e.clientY - r.top  - r.height / 2) / 28;
                        const rotY = (r.width  / 2 - (e.clientX - r.left)) / 28;
                        card.style.transform =
                            `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
                        ticking = false;
                    });
                    ticking = true;
                }
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    }

    // ── Nav hamburger ──────────────────────────────────────
    const hamburger = document.getElementById('nav-hamburger');
    const navLinksEl = document.getElementById('nav-links');
    if (hamburger && navLinksEl) {
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
    }

    // ── Keyboard video control ─────────────────────────────
    document.addEventListener('keydown', e => {
        const active = document.querySelector('video:focus');
        if (active && e.code === 'Space') {
            e.preventDefault();
            active.paused ? active.play() : active.pause();
        }
    });

    // ── Video load-error display ───────────────────────────
    videos.forEach(video => {
        video.addEventListener('error', () => {
            const err = document.createElement('p');
            err.textContent = 'Video unavailable';
            Object.assign(err.style, {
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                color: 'var(--color-muted)', fontSize: '0.85rem',
            });
            video.parentElement.appendChild(err);
        });
    });
});
