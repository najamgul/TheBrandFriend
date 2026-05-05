/**
 * Super Travel — Interactive JavaScript
 * Nav scroll state, portfolio filter, grayscale reveal
 */
(function () {
  'use strict';

  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.04)';
      } else {
        nav.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  // Portfolio filter tabs
  function initFilter() {
    const links = document.querySelectorAll('.portfolio-filter a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  function init() {
    initNavScroll();
    initFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
