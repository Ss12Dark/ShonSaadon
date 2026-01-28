// Video play/pause handling
document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Track playing state
        video.addEventListener('play', () => {
            video.setAttribute('data-playing', 'true');
            const overlay = video.parentElement.querySelector('.video-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
        });
        
        video.addEventListener('pause', () => {
            video.removeAttribute('data-playing');
            const overlay = video.parentElement.querySelector('.video-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
            }
        });
        
        video.addEventListener('ended', () => {
            video.removeAttribute('data-playing');
            const overlay = video.parentElement.querySelector('.video-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
            }
        });
        
        // Pause video when scrolled out of view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting && !video.paused) {
                    video.pause();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(video);
    });
    
    // Add fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const sections = document.querySelectorAll('.video-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(section);
    });
    
    // Smooth scroll for any anchor links (if added later)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add optimized parallax effect to hero section with throttling
    const hero = document.querySelector('.hero');
    if (hero) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    if (scrolled < window.innerHeight * 1.5) {
                        const parallax = scrolled * 0.3;
                        hero.style.transform = `translateY(${parallax}px)`;
                        hero.style.opacity = 1 - (scrolled / window.innerHeight);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
    
    // Add optimized mouse move effect for cards (desktop only)
    if (window.innerWidth > 768) {
        const videoCards = document.querySelectorAll('.video-card');
        videoCards.forEach(card => {
            let cardTicking = false;
            card.addEventListener('mousemove', (e) => {
                if (!cardTicking) {
                    window.requestAnimationFrame(() => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        
                        const rotateX = (y - centerY) / 30;
                        const rotateY = (centerX - x) / 30;
                        
                        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
                        cardTicking = false;
                    });
                    cardTicking = true;
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
    
    // Loading animation for video thumbnails
    videos.forEach(video => {
        video.addEventListener('loadeddata', () => {
            video.parentElement.classList.add('loaded');
        });
    });
    
    // Keyboard navigation for videos
    document.addEventListener('keydown', (e) => {
        const activeVideo = document.querySelector('video:focus');
        if (activeVideo) {
            if (e.code === 'Space') {
                e.preventDefault();
                if (activeVideo.paused) {
                    activeVideo.play();
                } else {
                    activeVideo.pause();
                }
            }
        }
    });
    
    // Add video error handling
    videos.forEach(video => {
        video.addEventListener('error', (e) => {
            console.error('Video loading error:', video.src);
            const wrapper = video.parentElement;
            const errorMsg = document.createElement('div');
            errorMsg.className = 'video-error';
            errorMsg.textContent = 'Video unavailable';
            errorMsg.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: var(--text-gray);
                font-size: 0.9rem;
                text-align: center;
            `;
            wrapper.appendChild(errorMsg);
        });
    });
    
    // Performance optimization: Lazy load videos
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.load();
                    videoObserver.unobserve(video);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        videos.forEach(video => {
            videoObserver.observe(video);
        });
    }
});

// Console message for developers
console.log('%c✨ Shon Saadon - AI Video Creator ✨', 'font-size: 20px; color: #00ffff; font-weight: bold;');
console.log('%cCrafted with AI • Powered by Imagination', 'font-size: 12px; color: #00ff88; font-style: italic;');
