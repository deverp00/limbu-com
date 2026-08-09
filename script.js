/* ============================================================
   script.js — Global JavaScript for Assam Limbu Mahasabha
   Shared across all pages.
   Includes: mobile toggle, dropdown navigation, search, scroll reveal,
             active link highlighting, smooth scroll anchors.
   ============================================================ */

(function() {
    'use strict';

    // ---------- DOM READY ----------
    document.addEventListener('DOMContentLoaded', function() {

        // ============================================================
        // 1. MOBILE NAVIGATION TOGGLE
        // ============================================================
        const toggleBtn = document.querySelector('.mobile-toggle');
        const mobileNav = document.querySelector('.mobile-nav');

        if (toggleBtn && mobileNav) {
            toggleBtn.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
                this.setAttribute('aria-expanded', expanded);
                mobileNav.classList.toggle('open');
                mobileNav.setAttribute('aria-hidden', !expanded);
            });

            // Close mobile nav on link click (better UX)
            const mobileLinks = mobileNav.querySelectorAll('.mobile-nav-link');
            mobileLinks.forEach(function(link) {
                link.addEventListener('click', function() {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    mobileNav.classList.remove('open');
                    mobileNav.setAttribute('aria-hidden', 'true');
                });
            });

            // Close on outside click
            document.addEventListener('click', function(e) {
                const header = document.querySelector('.site-header');
                if (header && !header.contains(e.target) && mobileNav.classList.contains('open')) {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    mobileNav.classList.remove('open');
                    mobileNav.setAttribute('aria-hidden', 'true');
                }
            });
        }

        // ============================================================
        // 2. DROPDOWN NAVIGATION
        //    Desktop: hover to open
        //    Mobile: click/tap to toggle
        // ============================================================
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

        // Detect touch device
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        dropdownToggles.forEach(function(toggle) {
            const parentLi = toggle.closest('.dropdown');
            if (!parentLi) return;

            // For desktop: hover handling (only if not touch device)
            if (!isTouchDevice) {
                parentLi.addEventListener('mouseenter', function() {
                    const menu = this.querySelector('.dropdown-menu');
                    if (menu) {
                        menu.style.display = 'block';
                        menu.setAttribute('aria-hidden', 'false');
                    }
                });

                parentLi.addEventListener('mouseleave', function() {
                    const menu = this.querySelector('.dropdown-menu');
                    if (menu) {
                        menu.style.display = 'none';
                        menu.setAttribute('aria-hidden', 'true');
                    }
                });
            }

            // For all devices: click/tap handling (mobile + desktop touch)
            toggle.addEventListener('click', function(e) {
                // Prevent default link behavior only if we are on mobile or touch device
                if (isTouchDevice || window.innerWidth <= 768) {
                    e.preventDefault();
                    const menu = parentLi.querySelector('.dropdown-menu');
                    if (menu) {
                        const isOpen = menu.style.display === 'block';
                        // Close all other dropdowns in the same nav
                        const allMenus = parentLi.closest('.nav-list, .mobile-nav-list').querySelectorAll('.dropdown-menu');
                        allMenus.forEach(function(m) {
                            if (m !== menu) {
                                m.style.display = 'none';
                                m.setAttribute('aria-hidden', 'true');
                            }
                        });
                        if (isOpen) {
                            menu.style.display = 'none';
                            menu.setAttribute('aria-hidden', 'true');
                        } else {
                            menu.style.display = 'block';
                            menu.setAttribute('aria-hidden', 'false');
                        }
                    }
                }
            });

            // Accessibility: close dropdowns on Escape key
            toggle.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    const menu = parentLi.querySelector('.dropdown-menu');
                    if (menu && menu.style.display === 'block') {
                        menu.style.display = 'none';
                        menu.setAttribute('aria-hidden', 'true');
                        toggle.focus();
                    }
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu').forEach(function(menu) {
                    menu.style.display = 'none';
                    menu.setAttribute('aria-hidden', 'true');
                });
            }
        });

        // On window resize, reset dropdown display for desktop if needed
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768) {
                    document.querySelectorAll('.dropdown-menu').forEach(function(menu) {
                        if (!isTouchDevice) {
                            menu.style.display = 'none';
                            menu.setAttribute('aria-hidden', 'true');
                        }
                    });
                }
            }, 200);
        });

        // ============================================================
        // 3. SEARCH / FILTER SYSTEM
        // ============================================================
        const searchInputs = document.querySelectorAll('.search-input');
        const SEARCH_DELAY = 300;
        let searchTimeout = null;

        function getSearchableItems() {
            const main = document.querySelector('main');
            if (!main) return [];

            const selectors = [
                '.update-card', '.event-card', '.committee-highlight-card',
                '.document-card', '.contact-info-card', '.stat-card',
                '.intro-text p', '.hero-description', '.section-subtitle',
                '.update-title', '.event-title', '.highlight-name', '.highlight-desc',
                '.document-title', '.document-desc', '.contact-value', '.cta-description'
            ];
            let items = [];
            selectors.forEach(function(sel) {
                document.querySelectorAll(sel).forEach(function(el) {
                    items.push(el);
                });
            });
            document.querySelectorAll('.section, .hero-section, .membership-cta-section').forEach(function(el) {
                items.push(el);
            });
            return items;
        }

        function performSearch(query) {
            const trimmed = query.trim().toLowerCase();
            const items = getSearchableItems();

            if (trimmed === '') {
                items.forEach(function(item) {
                    item.style.display = '';
                    if (item.classList.contains('section') || item.classList.contains('hero-section') || item.classList.contains('membership-cta-section')) {
                        const children = item.querySelectorAll('.update-card, .event-card, .committee-highlight-card, .document-card, .contact-info-card, .stat-card');
                        children.forEach(function(child) {
                            child.style.display = '';
                        });
                    }
                });
                return;
            }

            const containers = [];
            document.querySelectorAll('.update-card, .event-card, .committee-highlight-card, .document-card, .contact-info-card, .stat-card').forEach(function(el) {
                containers.push(el);
            });
            document.querySelectorAll('.section, .hero-section, .membership-cta-section').forEach(function(el) {
                containers.push(el);
            });

            const matchingItems = new Set();

            containers.forEach(function(container) {
                const text = container.textContent.toLowerCase();
                if (text.includes(trimmed)) {
                    matchingItems.add(container);
                }
            });

            containers.forEach(function(container) {
                if (matchingItems.has(container)) {
                    container.style.display = '';
                } else {
                    container.style.display = 'none';
                }
            });

            document.querySelectorAll('.update-card, .event-card, .committee-highlight-card, .document-card, .contact-info-card, .stat-card').forEach(function(card) {
                const parent = card.closest('.section') || card.closest('.hero-section') || card.closest('.membership-cta-section');
                if (parent) {
                    card.style.display = '';
                } else {
                    card.style.display = '';
                }
            });
        }

        searchInputs.forEach(function(input) {
            input.addEventListener('input', function(e) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(function() {
                    performSearch(e.target.value);
                }, SEARCH_DELAY);
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    clearTimeout(searchTimeout);
                    performSearch(e.target.value);
                }
            });
        });

        // ============================================================
        // 4. SCROLL REVEAL (Intersection Observer)
        // ============================================================
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
            const revealElements = document.querySelectorAll(
                '.section, .hero-section, .membership-cta-section, ' +
                '.update-card, .event-card, .committee-highlight-card, ' +
                '.document-card, .contact-info-card, .stat-card, ' +
                '.intro-grid, .gallery-preview-item, .gallery-item'
            );

            revealElements.forEach(function(el) {
                if (!el.classList.contains('reveal')) {
                    el.classList.add('reveal');
                }
            });

            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.10,
                rootMargin: '0px 0px -30px 0px'
            });

            document.querySelectorAll('.reveal').forEach(function(el) {
                observer.observe(el);
            });
        } else {
            const style = document.createElement('style');
            style.textContent = '.reveal { opacity: 1 !important; transform: translateY(0) !important; transition: none !important; }';
            document.head.appendChild(style);
        }

        // ============================================================
        // 5. ACTIVE NAV LINK HIGHLIGHTING
        //    (relative path support, without leading slash)
        // ============================================================
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

        navLinks.forEach(function(link) {
            const href = link.getAttribute('href');
            if (!href) return;

            // Normalize current path: remove leading slash if present
            let current = currentPath;
            if (current.startsWith('/')) {
                current = current.substring(1);
            }
            if (current === '') current = 'index.html';

            // For root index.html
            if (href === 'index.html' || href === '') {
                if (current === 'index.html' || current === '') {
                    link.classList.add('active');
                }
            } else {
                // Check if current path ends with the href
                if (current.endsWith(href) || current === href) {
                    link.classList.add('active');
                }
                // Also handle case where href is like 'about/about.html' and current is 'about/about.html'
                const lastPart = current.split('/').pop();
                if (lastPart && href.endsWith(lastPart)) {
                    link.classList.add('active');
                }
                // If href is a directory path (e.g., 'about/'), check if current starts with it
                if (href.endsWith('/') && current.startsWith(href)) {
                    link.classList.add('active');
                }
            }
        });

        // ============================================================
        // 6. SMOOTH SCROLL FOR ANCHOR LINKS
        // ============================================================
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = targetEl.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        console.log('Assam Limbu Mahasabha — global script initialized.');

    }); // end DOMContentLoaded

})();
