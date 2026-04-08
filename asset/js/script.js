const freedomScripts = () => {

    const body = document.body;
    const mainHeader = document.querySelector('.main-header');
    const mainHeaderTopBar = document.querySelector('.main-header__top-bar');
    const mainHeaderMainBar = document.querySelector('.main-header__main-bar');
    const menuDrawer = document.getElementById('menu-drawer');
    const userBar = document.getElementById('user-bar');

    // Resize Events

    let userBarHeight = 0;
    let timeout = false;
    const delay = 250;

    onResize();

    function onResize() {
        getUserBarHeight();
        refreshBodyPaddingTop();
    }

    window.addEventListener('resize', function() {
        clearTimeout(timeout);
        timeout = setTimeout(onResize, delay);
    });

    function refreshBodyPaddingTop() {
        body.style.paddingTop = mainHeader.offsetHeight + 'px';
        document.documentElement.style.scrollPaddingTop = (mainHeaderMainBar.offsetHeight + 20) + 'px';
    }

    function getUserBarHeight() {
        if (userBar) {
            userBarHeight = userBar.offsetHeight;
        }
    }

    // Scrolling Events

    let lastKnownScrollPosition = 0;
    let ticking = false;
    let scrollDirection = 'up';

    onScroll();

    function onScroll(scrollPos) {
        if(scrollPos > 60 && scrollDirection == 'down') {
            mainHeader.style.top = - (userBarHeight + mainHeaderTopBar.offsetHeight) + 'px';
            menuDrawer.style.top = mainHeaderMainBar.offsetHeight + 'px';
            menuDrawer.style.height = 'calc(100% - ' + mainHeaderMainBar.offsetHeight + 'px)';
        } else {
            mainHeader.style.top = 0;
            menuDrawer.style.top = mainHeader.offsetHeight + 'px';
            menuDrawer.style.height = 'calc(100% - ' + mainHeader.offsetHeight + 'px)';
        }
    }

    document.addEventListener('scroll', (event) => {
        scrollDirection = Math.max(lastKnownScrollPosition, window.scrollY) == lastKnownScrollPosition ? 'up': 'down';
        lastKnownScrollPosition = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                onScroll(lastKnownScrollPosition);
                ticking = false;
            });

            ticking = true;
        }
    });

    // Annotations tooltip position

    const annotationBtns = document.querySelectorAll('.annotation-btn');

    annotationBtns.forEach((annotationBtn) => {
        const annotationTooltip = annotationBtn.querySelector('.annotation-tooltip');
        const annotationTooltipWrapper = annotationTooltip.querySelector('.annotation-tooltip__wrapper');

        const eventList = ['click', 'mouseover'];
        eventList.forEach((event) => {
            annotationBtn.addEventListener(event, setAnnotationTooltipPos);
        });

        function setAnnotationTooltipPos() {
            const annotationBtnOffset = annotationBtn.getBoundingClientRect();
            const { top, left } = annotationBtnOffset;
            const distanceToRightEdge = window.innerWidth - (left + annotationBtn.offsetWidth);

            if (distanceToRightEdge < (annotationTooltipWrapper.offsetWidth + 15)) {
                annotationTooltip.style.left = (distanceToRightEdge - annotationTooltipWrapper.offsetWidth - 15) + 'px';
            } else {
                annotationTooltip.style.left = '0px';
            }

            if ((top - mainHeader.offsetHeight - mainHeader.offsetTop) < (annotationTooltipWrapper.offsetHeight + 15)) {
                annotationTooltip.style.bottom = (- annotationTooltipWrapper.offsetHeight - 20) + 'px';
                annotationTooltipWrapper.classList.add('below-button');
            } else {
                annotationTooltip.style.bottom = '10px';
                annotationTooltipWrapper.classList.remove('below-button');

                if (annotationTooltip.style.left == '0px') {
                    annotationTooltip.style.bottom = '5px';
                }
            }
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', freedomScripts);
} else {
    freedomScripts();
}

// Mobile Navigation Overlay
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        var toggle = document.querySelector('.mobile-menu-toggle');
        var overlay = document.getElementById('mobile-nav-overlay');
        if (!toggle || !overlay) return;

        // Clone the elementor nav into the overlay
        var sourceNav = document.querySelector('.elementor-nav-menu--main .elementor-nav-menu');
        if (!sourceNav) return;

        var navClone = sourceNav.cloneNode(true);
        navClone.className = 'mobile-nav-menu';
        // Remove inline styles from cloned sub-menus
        navClone.querySelectorAll('.sub-menu').forEach(function(sub) {
            sub.removeAttribute('style');
        });
        // Remove IDs to avoid duplicates
        navClone.querySelectorAll('[id]').forEach(function(el) {
            el.removeAttribute('id');
        });

        // Add submenu toggle buttons for items with children
        navClone.querySelectorAll('.menu-item-has-children').forEach(function(li) {
            var link = li.querySelector(':scope > a');
            var subMenu = li.querySelector(':scope > .sub-menu');
            if (!link || !subMenu) return;

            var btn = document.createElement('button');
            btn.className = 'mobile-submenu-toggle';
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Toggle submenu for ' + link.textContent.trim());
            btn.innerHTML = '<span class="mobile-submenu-icon">+</span>';
            // Insert toggle button after the link
            link.parentNode.insertBefore(btn, link.nextSibling);

            subMenu.style.display = 'none';

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var expanded = btn.getAttribute('aria-expanded') === 'true';
                btn.setAttribute('aria-expanded', String(!expanded));
                btn.querySelector('.mobile-submenu-icon').textContent = expanded ? '+' : '\u2212';
                subMenu.style.display = expanded ? 'none' : 'block';
            });
        });

        overlay.appendChild(navClone);

        function openOverlay() {
            toggle.classList.add('is-active');
            toggle.setAttribute('aria-expanded', 'true');
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('mobile-nav-open');
        }

        function closeOverlay() {
            toggle.classList.remove('is-active');
            toggle.setAttribute('aria-expanded', 'false');
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('mobile-nav-open');
        }

        toggle.addEventListener('click', function() {
            if (overlay.classList.contains('is-open')) {
                closeOverlay();
            } else {
                openOverlay();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
                closeOverlay();
                toggle.focus();
            }
        });

        // Close overlay on resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1024 && overlay.classList.contains('is-open')) {
                closeOverlay();
            }
        });
    });
})();

// Footer Accordion on Mobile
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        var toggles = document.querySelectorAll('.footer-accordion-toggle');
        if (!toggles.length) return;

        toggles.forEach(function(btn) {
            var list = btn.nextElementSibling;
            if (!list || !list.classList.contains('footer-nav-list')) return;

            btn.addEventListener('click', function() {
                // Only act on mobile
                if (window.innerWidth > 767) return;

                var expanded = btn.getAttribute('aria-expanded') === 'true';
                btn.setAttribute('aria-expanded', String(!expanded));
                var icon = btn.querySelector('.footer-toggle-icon');
                if (icon) {
                    icon.textContent = expanded ? '+' : '\u2212';
                }
                list.classList.toggle('is-open');
            });
        });

        // Reset state when resizing to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 767) {
                toggles.forEach(function(btn) {
                    btn.setAttribute('aria-expanded', 'false');
                    var icon = btn.querySelector('.footer-toggle-icon');
                    if (icon) icon.textContent = '+';
                    var list = btn.nextElementSibling;
                    if (list) list.classList.remove('is-open');
                });
            }
        });
    });
})();
