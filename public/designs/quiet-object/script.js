/**
 * Quiet Object — Interactive JavaScript
 * Subtle nav shadow, index hover italics, newsletter form
 */
(function () {
  'use strict';

  function initNavScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.style.boxShadow = '0 1px 8px rgba(0,0,0,0.03)';
      } else {
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  function initNewsletter() {
    const btn = document.querySelector('.footer-newsletter button');
    const input = document.querySelector('.footer-newsletter input');
    if (btn && input) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (input.value && input.value.includes('@')) {
          btn.textContent = 'SUBSCRIBED ✓';
          input.disabled = true;
        } else {
          input.focus();
        }
      });
    }
  }

  function init() {
    initNavScroll();
    initNewsletter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
