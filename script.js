/* ============================================================
   script.js — Global JavaScript
   Assam Limbu Mahasabha
   Karbi Anglong & Dima Hasao District Committee
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // 1. MOBILE NAVIGATION TOGGLE
    // ============================================================
    const navToggle = document.querySelector('.nav-toggle');
    const siteNav = document.querySelector('.site-nav');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            siteNav.classList.toggle('is-visible');
        });

        // Close nav when a link is clicked (optional, for better UX)
        siteNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth < 768) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    siteNav.classList.remove('is-visible');
                }
            });
        });
    }

    // ============================================================
    // 2. DROPDOWN MENUS (nested)
    // ============================================================
    const dropdownTriggers = document.querySelectorAll('.nav-dropdown-trigger');

    dropdownTriggers.forEach(function (trigger) {
        const parentLi = trigger.closest('.nav-item-has-dropdown');
        if (!parentLi) return;

        const dropdown = parentLi.querySelector('.nav-dropdown');

        // Toggle on click
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const isOpen = this.getAttribute('aria-expanded') === 'true';
            // Close all other dropdowns (optional)
            document.querySelectorAll('.nav-dropdown-trigger').forEach(function (otherTrigger) {
                if (otherTrigger !== trigger) {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                    const otherDropdown = otherTrigger.closest('.nav-item-has-dropdown').querySelector('.nav-dropdown');
                    if (otherDropdown) otherDropdown.classList.remove('is-visible');
                }
            });

            this.setAttribute('aria-expanded', !isOpen);
            dropdown.classList.toggle('is-visible');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!parentLi.contains(e.target)) {
                trigger.setAttribute('aria-expanded', 'false');
                dropdown.classList.remove('is-visible');
            }
        });

        // Handle touch devices: prevent double-tap issues
        trigger.addEventListener('touchstart', function (e) {
            // Just let click handle it
        }, { passive: true });
    });

    // For desktop: hover to open dropdown (optional, but we'll keep click only for consistency)

    // ============================================================
    // 3. HERO SLIDESHOW (auto-scroll with indicators)
    // ============================================================
    const heroTrack = document.getElementById('heroTrack');
    const indicatorsContainer = document.getElementById('heroIndicators');

    if (heroTrack && indicatorsContainer) {
        const slides = heroTrack.querySelectorAll('.hero-slide');
        const totalSlides = slides.length;
        let currentIndex = 0;
        let autoPlayInterval = null;
        const intervalTime = 5000; // 5 seconds

        // Create indicator dots if not already present
        const dots = indicatorsContainer.querySelectorAll('.indicator-dot');
        if (dots.length === 0) {
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = 'indicator-dot';
                dot.setAttribute('data-index', i);
                dot.setAttribute('aria-label', 'Slide ' + (i + 1));
                if (i === 0) dot.classList.add('active');
                indicatorsContainer.appendChild(dot);
            }
        }

        // Update dots and slide position
        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            currentIndex = index;

            // Update track transform
            heroTrack.style.transform = 'translateX(-' + (index * 100) + '%)';

            // Update dots
            const allDots = indicatorsContainer.querySelectorAll('.indicator-dot');
            allDots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        // Next slide
        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        // Start autoplay
        function startAutoPlay() {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(nextSlide, intervalTime);
        }

        // Stop autoplay
        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        // Click on indicators
        indicatorsContainer.addEventListener('click', function (e) {
            const dot = e.target.closest('.indicator-dot');
            if (!dot) return;
            const index = parseInt(dot.getAttribute('data-index'), 10);
            if (!isNaN(index)) {
                stopAutoPlay();
                goToSlide(index);
                startAutoPlay(); // restart after manual interaction
            }
        });

        // Pause on hover (optional)
        heroTrack.parentElement.addEventListener('mouseenter', stopAutoPlay);
        heroTrack.parentElement.addEventListener('mouseleave', startAutoPlay);

        // Initialize
        goToSlide(0);
        startAutoPlay();

        // Handle window resize: ensure track width is correct (no extra action needed)
        // Also handle reduced motion: stop autoplay if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            stopAutoPlay();
        }
        prefersReducedMotion.addEventListener('change', function () {
            if (this.matches) {
                stopAutoPlay();
            } else {
                startAutoPlay();
            }
        });
    }

    // ============================================================
    // 4. SCROLL REVEAL (Intersection Observer)
    // ============================================================
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optionally unobserve after reveal to improve performance
                    // observer.unobserve(entry.target);
                } else {
                    // Optional: remove class when out of view (for subtle fade-out)
                    // entry.target.classList.remove('is-visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -20px 0px'
        });

        revealElements.forEach(function (el) {
            observer.observe(el);
        });

        // For reduced motion: immediately show all
        const prefersReducedMotionReveal = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotionReveal.matches) {
            revealElements.forEach(function (el) {
                el.classList.add('is-visible');
            });
        }
        prefersReducedMotionReveal.addEventListener('change', function () {
            if (this.matches) {
                revealElements.forEach(function (el) {
                    el.classList.add('is-visible');
                });
            } else {
                // Optionally reset, but we keep them visible if already revealed
            }
        });
    }

    // ============================================================
    // 5. SEARCH FUNCTIONALITY (client-side filtering)
    // ============================================================
    const searchForms = document.querySelectorAll('.header-search');

    searchForms.forEach(function (form) {
        const input = form.querySelector('input[type="search"]');
        if (!input) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const query = input.value.trim().toLowerCase();
            if (query === '') {
                // Optionally clear filters or show all
                clearFilters();
                return;
            }
            performSearch(query);
        });

        // Optional: live search on input with debounce
        let debounceTimer;
        input.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                const query = input.value.trim().toLowerCase();
                if (query === '') {
                    clearFilters();
                } else {
                    performSearch(query);
                }
            }, 300);
        });
    });

    // Generic search function: looks for items with data-search or filters cards, list items, etc.
    function performSearch(query) {
        // Find all searchable items: we'll target .card, .update-card, .event-card, .doc-card, .gallery-item, etc.
        // We'll use a data attribute or text content.
        const searchableItems = document.querySelectorAll('.card, .update-card, .event-card, .doc-card, .gallery-item, .committee-highlight-card, .membership-item, .contact-item');
        let found = false;

        searchableItems.forEach(function (item) {
            const text = item.textContent.toLowerCase();
            const match = text.includes(query);
            // If it's a card, we also need to show/hide its parent container if needed
            // We'll simply toggle a class to hide
            if (match) {
                item.style.display = ''; // show
                found = true;
            } else {
                item.style.display = 'none';
            }
        });

        // Also handle grid containers: ensure that if all items hidden, maybe show a message
        const grids = document.querySelectorAll('.grid, .membership-info, .contact-grid');
        grids.forEach(function (grid) {
            const visibleItems = grid.querySelectorAll('.card, .update-card, .event-card, .doc-card, .gallery-item, .committee-highlight-card, .membership-item, .contact-item');
            let anyVisible = false;
            visibleItems.forEach(function (item) {
                if (item.style.display !== 'none') {
                    anyVisible = true;
                }
            });
            // Optionally show a "no results" message if none visible
            let noResultsMsg = grid.querySelector('.no-results');
            if (!anyVisible) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('p');
                    noResultsMsg.className = 'no-results';
                    noResultsMsg.textContent = 'No results found.';
                    grid.appendChild(noResultsMsg);
                }
                noResultsMsg.style.display = 'block';
            } else {
                if (noResultsMsg) {
                    noResultsMsg.style.display = 'none';
                }
            }
        });
    }

    function clearFilters() {
        const searchableItems = document.querySelectorAll('.card, .update-card, .event-card, .doc-card, .gallery-item, .committee-highlight-card, .membership-item, .contact-item');
        searchableItems.forEach(function (item) {
            item.style.display = '';
        });
        // Remove no-results messages
        document.querySelectorAll('.no-results').forEach(function (el) {
            el.style.display = 'none';
        });
    }

    // ============================================================
    // 6. PAGINATION (for updates page and others with .pagination)
    // ============================================================
    // We'll implement a simple pagination for any container with .pagination and .pagination-items
    // The structure: .pagination-container with items (e.g., cards) and .pagination-controls
    // We'll show first 6 items per page, and controls.

    function initPagination() {
        const containers = document.querySelectorAll('.pagination-container');
        containers.forEach(function (container) {
            const items = container.querySelectorAll('.pagination-item');
            if (items.length === 0) return;

            const perPage = 6;
            const totalPages = Math.ceil(items.length / perPage);
            let currentPage = 1;

            // Create controls if not present
            let controls = container.querySelector('.pagination-controls');
            if (!controls) {
                controls = document.createElement('div');
                controls.className = 'pagination-controls';
                controls.style.marginTop = '1.5rem';
                controls.style.display = 'flex';
                controls.style.justifyContent = 'center';
                controls.style.gap = '0.5rem';
                container.appendChild(controls);
            }

            // Function to render page
            function renderPage(page) {
                currentPage = page;
                const start = (page - 1) * perPage;
                const end = start + perPage;

                items.forEach(function (item, index) {
                    if (index >= start && index < end) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });

                // Update controls
                renderControls();
            }

            function renderControls() {
                controls.innerHTML = '';
                // Previous button
                const prevBtn = document.createElement('button');
                prevBtn.textContent = 'Previous';
                prevBtn.className = 'btn btn-outline';
                prevBtn.disabled = currentPage === 1;
                prevBtn.addEventListener('click', function () {
                    if (currentPage > 1) renderPage(currentPage - 1);
                });
                controls.appendChild(prevBtn);

                // Page numbers
                for (let i = 1; i <= totalPages; i++) {
                    const pageBtn = document.createElement('button');
                    pageBtn.textContent = i;
                    pageBtn.className = 'btn btn-outline';
                    if (i === currentPage) {
                        pageBtn.classList.add('btn-primary');
                    }
                    pageBtn.addEventListener('click', function () {
                        renderPage(i);
                    });
                    controls.appendChild(pageBtn);
                }

                // Next button
                const nextBtn = document.createElement('button');
                nextBtn.textContent = 'Next';
                nextBtn.className = 'btn btn-outline';
                nextBtn.disabled = currentPage === totalPages;
                nextBtn.addEventListener('click', function () {
                    if (currentPage < totalPages) renderPage(currentPage + 1);
                });
                controls.appendChild(nextBtn);
            }

            // Initial render
            renderPage(1);
        });
    }

    // Call pagination init (will work on updates page)
    initPagination();

    // ============================================================
    // 7. ADDITIONAL: Smooth anchor scrolling (if any internal links)
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 80; // header height offset
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // ============================================================
    // 8. INITIALIZATION: Show all items if search is cleared on page load
    // ============================================================
    clearFilters(); // ensure no hidden items initially

    // Also, for any cards that might have been hidden by pagination, we already handle

    console.log('Assam Limbu Mahasabha — script loaded.');
});
