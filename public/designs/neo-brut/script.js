/**
 * Neo Brut — Interactive JavaScript
 * Button push interactions, marquee duplicate, form
 */
(function () {
  'use strict';

  // Double the marquee content for seamless loop
  function initMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    const clone = track.innerHTML;
    track.innerHTML = clone + clone;
  }

  // Form interaction
  function initForm() {
    const form = document.querySelector('.final-form');
    if (!form) return;
    const btn = form.querySelector('button');
    const input = form.querySelector('input');
    if (btn && input) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (input.value && input.value.includes('@')) {
          btn.textContent = 'JOINED ✓';
          btn.style.opacity = '0.6';
          input.disabled = true;
        }
      });
    }
  }

  function init() {
    initMarquee();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
