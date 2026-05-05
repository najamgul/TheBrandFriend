/**
 * TheBrandFriend — Shared Animation Library
 * Common scroll-triggered animations, counters, and interactive effects
 * used across all design previews.
 *
 * Usage: <script src="../_shared/animations.js"></script>
 */

(function () {
  'use strict';

  // ===== SCROLL REVEAL =====
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => observer.observe(el));
  }

  // ===== ANIMATED COUNTERS =====
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          const duration = 1800;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = prefix + Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  // ===== SMOOTH NAV SHADOW =====
  function initNavShadow() {
    const nav = document.querySelector('.nav, nav, header');
    if (!nav) return;

    let last = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 50 && last <= 50) {
        nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.05)';
      } else if (y <= 50 && last > 50) {
        nav.style.boxShadow = 'none';
      }
      last = y;
    }, { passive: true });
  }

  // ===== STAGGER CHILDREN =====
  // Apply staggered reveal to direct children of elements with [data-stagger]
  function initStagger() {
    const containers = document.querySelectorAll('[data-stagger]');
    containers.forEach(container => {
      const children = container.children;
      Array.from(children).forEach((child, i) => {
        child.style.transitionDelay = (i * 0.08) + 's';
        child.classList.add('reveal');
      });
    });
  }

  // ===== INIT =====
  function init() {
    initStagger();
    initReveal();
    initCounters();
    initNavShadow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
