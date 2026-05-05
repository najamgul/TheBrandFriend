/**
 * Season 04 — Interactive JavaScript
 * Nav scroll backdrop, product quick-view hover
 */
(function () {
  'use strict';

  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.style.background = 'rgba(227,226,222,0.92)';
        nav.style.backdropFilter = 'blur(12px)';
      } else {
        nav.style.background = 'transparent';
        nav.style.backdropFilter = 'none';
      }
    }, { passive: true });
  }

  function init() {
    initNavScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
