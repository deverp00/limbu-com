/* ============================================================
   carousel.js — Full-width image carousel
   Auto-scrolling with manual controls and indicators
   ============================================================ */

(function() {
    'use strict';

    // ---------- DOM READY ----------
    document.addEventListener('DOMContentLoaded', function() {

        const carousel = document.querySelector('.hero-carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        const indicatorsContainer = carousel.querySelector('.carousel-indicators');

        if (!track || slides.length === 0) return;

        let currentIndex = 0;
        let totalSlides = slides.length;
        let autoPlayInterval = null;
        const AUTO_PLAY_DELAY = 5000; // 5 seconds

        // ---------- Create indicators if they don't exist ----------
        if (!indicatorsContainer) {
            const newContainer = document.createElement('div');
            newContainer.className = 'carousel-indicators';
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Slide ' + (i + 1));
                dot.dataset.index = i;
                newContainer.appendChild(dot);
            }
            carousel.appendChild(newContainer);
        }

        // Get indicators (either existing or newly created)
        const dots = carousel.querySelectorAll('.carousel-dot');

        // ---------- Update carousel position ----------
        function goToSlide(index) {
            // Clamp index
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;

            currentIndex = index;

            // Move track
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

            // Update dots
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === currentIndex);
            });

            // Update ARIA labels on slides for accessibility
            slides.forEach(function(slide, i) {
                slide.setAttribute('aria-hidden', i !== currentIndex);
            });
        }

        // ---------- Next / Previous ----------
        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        // ---------- Auto-play ----------
        function startAutoPlay() {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        // ---------- Event listeners ----------
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                prevSlide();
                resetAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                nextSlide();
                resetAutoPlay();
            });
        }

        // Dot clicks
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                const index = parseInt(this.dataset.index, 10);
                if (!isNaN(index) && index !== currentIndex) {
                    goToSlide(index);
                    resetAutoPlay();
                }
            });
        });

        // Keyboard navigation
        carousel.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
                resetAutoPlay();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
                resetAutoPlay();
            }
        });

        // Pause on hover (for accessibility and user control)
        carousel.addEventListener('mouseenter', function() {
            stopAutoPlay();
        });

        carousel.addEventListener('mouseleave', function() {
            startAutoPlay();
        });

        // Pause on touch interaction (mobile)
        carousel.addEventListener('touchstart', function() {
            stopAutoPlay();
        }, { passive: true });

        carousel.addEventListener('touchend', function() {
            // Restart after a brief delay to avoid accidental restarts
            setTimeout(startAutoPlay, 3000);
        }, { passive: true });

        // ---------- Initialize ----------
        // Set initial state
        goToSlide(0);

        // Start auto-play (respect reduced motion preference)
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            startAutoPlay();
        }

        // Also stop auto-play if page is hidden (for performance)
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                stopAutoPlay();
            } else {
                if (!prefersReducedMotion) {
                    startAutoPlay();
                }
            }
        });

        // ---------- Handle window resize: ensure track is positioned correctly ----------
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                // Re-apply the transform to prevent any layout shift
                track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
            }, 150);
        });

        // ---------- Handle image loading: ensure carousel is positioned correctly ----------
        // Watch for images loading that might affect layout
        const images = carousel.querySelectorAll('img');
        if (images.length > 0) {
            let imagesLoaded = 0;
            images.forEach(function(img) {
                if (img.complete) {
                    imagesLoaded++;
                } else {
                    img.addEventListener('load', function() {
                        imagesLoaded++;
                        if (imagesLoaded === images.length) {
                            // All images loaded, re-apply transform
                            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
                        }
                    });
                    img.addEventListener('error', function() {
                        imagesLoaded++;
                        if (imagesLoaded === images.length) {
                            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
                        }
                    });
                }
            });
        }

        console.log('Carousel initialized with ' + totalSlides + ' slides.');

    });

})();
