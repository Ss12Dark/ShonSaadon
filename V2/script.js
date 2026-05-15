// ── Nav hamburger ──────────────────────────────────────────
const hamburger = document.getElementById('nav-hamburger');
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

// Init: skills visible, experience hidden
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

        // Parse caption — stored as HTML-escaped string in data-caption
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
