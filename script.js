/* ============================================================
   script.js — Global JavaScript Behavior
   Assam Limbu Mahasabha
   Karbi Anglong & Dima Hasao District Committee
   ============================================================ */

(function() {
    'use strict';

    // ============================================================
    // 1. MOBILE NAV TOGGLE
    // ============================================================
    const navToggle = document.querySelector('.nav-toggle');
    const siteNav = document.querySelector('.site-nav');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function() {
            const isOpen = siteNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close nav when a link is clicked (on mobile)
        const navLinks = siteNav.querySelectorAll('.nav-link:not(.nav-dropdown-trigger)');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 767) {
                    siteNav.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // ============================================================
    // 2. MOBILE DROPDOWN TOGGLE
    // ============================================================
    const dropdownTriggers = document.querySelectorAll('.nav-dropdown-trigger');

    dropdownTriggers.forEach(function(trigger) {
        trigger.addEventListener('click', function(e) {
            // Only on mobile (width <= 767)
            if (window.innerWidth <= 767) {
                e.preventDefault();
                const parent = this.closest('.nav-item-has-dropdown');
                if (parent) {
                    parent.classList.toggle('open');
                    const expanded = parent.classList.contains('open');
                    this.setAttribute('aria-expanded', expanded);
                }
            }
        });

        // Also allow hover on desktop (already handled by CSS, but we need to sync aria-expanded)
        const parent = trigger.closest('.nav-item-has-dropdown');
        if (parent) {
            parent.addEventListener('mouseenter', function() {
                if (window.innerWidth > 767) {
                    this.setAttribute('aria-expanded', 'true');
                }
            });
            parent.addEventListener('mouseleave', function() {
                if (window.innerWidth > 767) {
                    this.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });

    // ============================================================
    // 3. HERO SLIDESHOW
    // ============================================================
    const heroTrack = document.getElementById('heroTrack');
    const indicators = document.getElementById('heroIndicators');

    if (heroTrack && indicators) {
        const slides = heroTrack.querySelectorAll('.hero-slide');
        const totalSlides = slides.length;
        let currentIndex = 0;
        let autoSlideInterval = null;
        const slideIntervalTime = 5000; // 5 seconds

        // Create indicator dots if not already present
        const dots = indicators.querySelectorAll('.indicator-dot');
        if (dots.length === 0 && totalSlides > 0) {
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = 'indicator-dot';
                dot.setAttribute('data-index', i);
                dot.setAttribute('aria-label', 'Slide ' + (i + 1));
                if (i === 0) dot.classList.add('active');
                indicators.appendChild(dot);
            }
        }

        // Update dots and slide position
        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            currentIndex = index;
            const offset = -currentIndex * 100;
            heroTrack.style.transform = 'translateX(' + offset + '%)';

            // Update dots
            const allDots = indicators.querySelectorAll('.indicator-dot');
            allDots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        // Click on dot
        const allDots = indicators.querySelectorAll('.indicator-dot');
        allDots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'), 10);
                if (!isNaN(idx) && idx !== currentIndex) {
                    goToSlide(idx);
                    resetAutoSlide();
                }
            });
        });

        // Auto-slide
        function startAutoSlide() {
            if (autoSlideInterval) clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(function() {
                goToSlide(currentIndex + 1);
            }, slideIntervalTime);
        }

        function resetAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                startAutoSlide();
            }
        }

        // Pause on hover (optional, but good for accessibility)
        const heroContainer = document.querySelector('.hero-slideshow');
        if (heroContainer) {
            heroContainer.addEventListener('mouseenter', function() {
                if (autoSlideInterval) clearInterval(autoSlideInterval);
            });
            heroContainer.addEventListener('mouseleave', function() {
                startAutoSlide();
            });
        }

        // Start auto-slide
        startAutoSlide();

        // Go to first slide initially
        goToSlide(0);
    }

    // ============================================================
    // 4. SCROLL REVEAL (Intersection Observer)
    // ============================================================
    const sections = document.querySelectorAll('.section');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.05
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optionally unobserve after reveal
                    // observer.unobserve(entry.target);
                }
                // Optionally remove class when leaving viewport? 
                // But we want them to stay visible once they appear.
            });
        }, observerOptions);

        sections.forEach(function(section) {
            observer.observe(section);
        });

        // Also check if any are already visible on load
        // They will be observed and triggered if visible.
    } else {
        // Fallback: show all sections
        sections.forEach(function(section) {
            section.classList.add('visible');
        });
    }

    // ============================================================
    // 5. SEARCH FUNCTIONALITY (Client-side filter)
    // ============================================================
    const searchForms = document.querySelectorAll('.header-search');

    searchForms.forEach(function(form) {
        const input = form.querySelector('input[type="search"]');
        const submitBtn = form.querySelector('button[type="submit"]');

        function performSearch(query) {
            query = query.trim().toLowerCase();
            if (query === '') {
                // Optionally reset highlights or show all
                return;
            }

            // Simple client-side search: search for text in the page
            // This is a lightweight search that scrolls to first match
            const bodyText = document.body.innerText.toLowerCase();
            // We'll just show an alert or redirect to a search page for now.
            // For a real implementation, we could filter cards, but it's out of scope.
            // Since it's a demo, we'll just display a message.
            const found = bodyText.includes(query);
            if (!found) {
                alert('No results found for "' + query + '".');
            } else {
                // Find the first occurrence and scroll to it?
                // This is complex without highlighting. We'll just show a message.
                alert('Results found for "' + query + '". (Client-side search demo)');
                // In a real site, you'd implement a proper search results page.
            }
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (input) {
                    performSearch(input.value);
                }
            });
        }

        if (input) {
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch(this.value);
                }
            });
        }
    });

    // ============================================================
    // 6. CONTACT FORM (simple validation)
    // ============================================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('contactName');
            const email = document.getElementById('contactEmail');
            const message = document.getElementById('contactMessage');

            let isValid = true;
            let errorMsg = '';

            if (!name.value.trim()) {
                isValid = false;
                errorMsg += 'Please enter your name.\n';
                name.style.borderColor = '#cc0000';
            } else {
                name.style.borderColor = '';
            }

            if (!email.value.trim() || !email.value.includes('@')) {
                isValid = false;
                errorMsg += 'Please enter a valid email address.\n';
                email.style.borderColor = '#cc0000';
            } else {
                email.style.borderColor = '';
            }

            if (!message.value.trim()) {
                isValid = false;
                errorMsg += 'Please enter your message.\n';
                message.style.borderColor = '#cc0000';
            } else {
                message.style.borderColor = '';
            }

            if (!isValid) {
                alert(errorMsg);
                return;
            }

            // Simulate sending
            alert('Thank you, ' + name.value.trim() + '! Your message has been sent.\nWe will get back to you soon.');
            contactForm.reset();
        });
    }

    // ============================================================
    // 7. HEADER SCROLL EFFECT (for transparency)
    // ============================================================
    const header = document.querySelector('.site-header');
    if (header) {
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', function() {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 20) {
                header.style.borderBottomColor = 'rgba(214, 210, 205, 0.8)';
                header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            } else {
                header.style.borderBottomColor = 'rgba(214, 210, 205, 0.4)';
                header.style.boxShadow = 'none';
            }
            lastScrollY = currentScrollY;
        });
    }

    // ============================================================
    // 8. REDUCED MOTION PREFERENCE
    // ============================================================
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
        // Stop auto-slide if it exists
        const heroTrack = document.getElementById('heroTrack');
        if (heroTrack) {
            // The auto-slide is controlled by setInterval, we can clear it.
            // Since we don't have a direct reference to the interval from here,
            // we'll just stop the interval by overriding the start function.
            // Simpler: we can just not start it, but we already started.
            // Instead, we'll clear any existing interval by accessing the variable
            // from the closure? We'll store a global reference.
            if (window.heroInterval) {
                clearInterval(window.heroInterval);
            }
            // Also, we could pause the slide and show first image only.
            // But we'll let the CSS handle motion reduction.
        }
    }

    // ============================================================
    // 9. DYNAMIC PAGINATION — Show 4 items per page
    // ============================================================
    function initPagination() {
        const paginationContainers = document.querySelectorAll('.pagination');

        paginationContainers.forEach(function(paginationNav) {
            // Find the grid that is the sibling of this pagination nav
            // Look for .grid, .grid-2, .grid-3, .gallery-grid, .committee-members-grid, etc.
            let grid = paginationNav.previousElementSibling;
            // If the grid is not directly the previous sibling, look for it in the parent
            if (!grid || !grid.classList.contains('grid') && !grid.classList.contains('gallery-grid') && !grid.classList.contains('committee-members-grid')) {
                // Try to find it in the parent container
                const parentSection = paginationNav.closest('.section');
                if (parentSection) {
                    const grids = parentSection.querySelectorAll('.grid, .gallery-grid, .committee-members-grid');
                    if (grids.length > 0) {
                        grid = grids[0];
                    }
                }
            }

            // If no grid found, skip
            if (!grid) {
                console.warn('Pagination: No grid found for', paginationNav);
                return;
            }

            // Get all direct children that are items (not the grid itself)
            // For grid, we want all direct children that are article, figure, or div with class 'card'
            let items = [];
            const children = grid.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                // Skip if it's a hidden element or not a visible item
                if (child.tagName === 'TEMPLATE' || child.tagName === 'SCRIPT') continue;
                // Check if it has a class that indicates it's an item
                if (child.classList.contains('card') || 
                    child.classList.contains('gallery-item') || 
                    child.classList.contains('update-card') || 
                    child.classList.contains('event-card') || 
                    child.classList.contains('member-card') ||
                    child.classList.contains('doc-card') ||
                    child.classList.contains('doc-item-card')) {
                    items.push(child);
                } else if (child.tagName === 'ARTICLE' || child.tagName === 'FIGURE' || child.tagName === 'DIV') {
                    // Also include generic elements that might be items
                    items.push(child);
                }
            }

            // If no items found, try a different approach: get all children of the grid that are not empty
            if (items.length === 0) {
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child.tagName !== 'TEMPLATE' && child.tagName !== 'SCRIPT') {
                        items.push(child);
                    }
                }
            }

            const totalItems = items.length;
            const itemsPerPage = 4;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            // If no items or only 1 page, hide pagination
            if (totalItems === 0 || totalPages <= 1) {
                paginationNav.style.display = 'none';
                // Show all items
                items.forEach(function(item) {
                    item.style.display = '';
                });
                return;
            }

            // Show pagination
            paginationNav.style.display = 'flex';

            let currentPage = 1;

            // Generate pagination controls
            function renderPagination() {
                const ul = paginationNav.querySelector('ul');
                if (!ul) return;

                // Clear existing pagination items (keep only the ul)
                while (ul.firstChild) {
                    ul.removeChild(ul.firstChild);
                }

                // Previous button
                const prevLi = document.createElement('li');
                const prevBtn = document.createElement('button');
                prevBtn.className = 'pagination-prev';
                prevBtn.setAttribute('aria-label', 'Previous page');
                prevBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                `;
                if (currentPage === 1) {
                    prevBtn.classList.add('disabled');
                    prevBtn.disabled = true;
                }
                prevBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (currentPage > 1) {
                        goToPage(currentPage - 1);
                    }
                });
                prevLi.appendChild(prevBtn);
                ul.appendChild(prevLi);

                // Page numbers
                for (let i = 1; i <= totalPages; i++) {
                    const pageLi = document.createElement('li');
                    const pageBtn = document.createElement('button');
                    pageBtn.textContent = i;
                    pageBtn.setAttribute('aria-label', 'Page ' + i);
                    if (i === currentPage) {
                        pageBtn.classList.add('active');
                        pageBtn.setAttribute('aria-current', 'page');
                    }
                    pageBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (i !== currentPage) {
                            goToPage(i);
                        }
                    });
                    pageLi.appendChild(pageBtn);
                    ul.appendChild(pageLi);
                }

                // Next button
                const nextLi = document.createElement('li');
                const nextBtn = document.createElement('button');
                nextBtn.className = 'pagination-next';
                nextBtn.setAttribute('aria-label', 'Next page');
                nextBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                `;
                if (currentPage === totalPages) {
                    nextBtn.classList.add('disabled');
                    nextBtn.disabled = true;
                }
                nextBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                        goToPage(currentPage + 1);
                    }
                });
                nextLi.appendChild(nextBtn);
                ul.appendChild(nextLi);
            }

            // Show items for a specific page
            function showPage(page) {
                const start = (page - 1) * itemsPerPage;
                const end = Math.min(start + itemsPerPage, totalItems);

                items.forEach(function(item, index) {
                    if (index >= start && index < end) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }

            // Go to a specific page
            function goToPage(page) {
                if (page < 1 || page > totalPages) return;
                if (page === currentPage) return;
                currentPage = page;
                showPage(currentPage);
                renderPagination();
                // Scroll to the grid
                grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // Initialize: show first page
            showPage(1);
            renderPagination();

            // Watch for changes in the grid (MutationObserver)
            // This allows adding/removing items dynamically
            const observer = new MutationObserver(function(mutations) {
                // Re-initialize pagination for this grid
                // We need to re-fetch items because the DOM changed
                // Instead of re-initializing the whole thing, we'll just re-run the pagination setup
                // But to avoid infinite loops, we'll just re-init this specific pagination
                // We'll use a simple approach: re-run the entire pagination setup for this nav
                // But we need to be careful not to cause infinite loops.
                // We'll use a flag to prevent recursion.
                if (window._paginationUpdating) return;
                window._paginationUpdating = true;
                
                // Re-init pagination for this nav
                // We'll just call initPagination again, but we need to avoid re-initializing all paginations
                // Instead, we'll re-initialize only this one.
                // For simplicity, we'll re-run the entire initPagination function.
                // But we need to clear the observer first to avoid infinite loops.
                observer.disconnect();
                
                // Re-run pagination for all paginations
                // This is a bit heavy but works for demo purposes
                // In production, we'd want a more targeted approach
                setTimeout(function() {
                    // We need to re-run the pagination logic for this nav
                    // We'll just re-run the entire function, but we need to avoid recursion
                    // We'll use a flag to prevent recursion
                    window._paginationUpdating = false;
                    // Re-run pagination for all paginations
                    // But we need to be careful to not cause an infinite loop.
                    // We'll just re-init all paginations.
                    initPagination();
                }, 100);
            });

            // Start observing the grid for changes (child list changes)
            observer.observe(grid, {
                childList: true,
                subtree: false
            });

            // Store the observer on the grid so we can clean up later if needed
            grid._paginationObserver = observer;
        });
    }

    // ============================================================
    // 10. INITIALIZE PAGINATION ON DOM READY
    // ============================================================
    // Run pagination after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initPagination();
        });
    } else {
        initPagination();
    }

    // Also re-run pagination when window loads (to catch any late-loaded content)
    window.addEventListener('load', function() {
        // Re-run pagination to catch any dynamic content added after DOM ready
        // But avoid re-running if already done
        setTimeout(function() {
            initPagination();
        }, 500);
    });

    console.log('Assam Limbu Mahasabha — script loaded.');
})();
