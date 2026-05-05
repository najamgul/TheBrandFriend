/**
 * Dark Protocol — Interactive JavaScript
 * Pulsing status dot, rotating badge, email form interaction
 */
(function () {
  'use strict';

  // Email form interaction
  function initForm() {
    const form = document.querySelector('.hero-form');
    if (!form) return;
    const btn = form.querySelector('button');
    const input = form.querySelector('input');
    if (btn && input) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (input.value && input.value.includes('@')) {
          btn.textContent = 'REQUESTED ✓';
          btn.style.background = '#66473B';
          input.disabled = true;
        } else {
          input.style.borderBottomColor = '#DC9F85';
          input.focus();
        }
      });
    }
  }

  function init() {
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
