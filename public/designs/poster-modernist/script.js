/**
 * Poster Modernist — Interactive JavaScript
 * List item hover effects, sidebar sticky
 */
(function () {
  'use strict';

  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.style.boxShadow = '0 1px 12px rgba(0,0,0,0.04)';
      } else {
        nav.style.boxShadow = 'none';
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
