/**
 * Flux Grid — Interactive JavaScript
 * Form validation, step number hover, sticky how-it-works
 */
(function () {
  'use strict';

  function initForm() {
    document.querySelectorAll('.hero-form, .final-form').forEach(form => {
      const btn = form.querySelector('button');
      const input = form.querySelector('input');
      if (btn && input) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (input.value && input.value.includes('@')) {
            btn.textContent = 'JOINED ✓';
            input.disabled = true;
          } else {
            input.focus();
            input.style.borderColor = '#ffe17c';
          }
        });
      }
    });
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
