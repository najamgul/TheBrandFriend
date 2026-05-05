/**
 * Cinematic Folio — Interactive JavaScript
 * Custom cursor crosshair, orb parallax, nav blend mode
 */
(function () {
  'use strict';

  // Orb parallax on mouse move
  function initOrbParallax() {
    const orbs = document.querySelectorAll('.hero-orb');
    if (!orbs.length) return;

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 8;
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    });
  }

  function init() {
    initOrbParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
