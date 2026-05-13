'use client';
import { useEffect, useRef } from 'react';
import {
  animate,
  stagger,
  createTimeline,
} from 'animejs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Animations() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Wait a tick for DOM to settle
    requestAnimationFrame(() => {
      heroEntrance();
      setupScrollReveals();
      setupStatCounters();
      setupMarquee();
      setupMagneticButtons();
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return null;
}

/* ═══════════════════════════════════════════════
   1. HERO — Clean Block Entrance (no word splitting)
   ═══════════════════════════════════════════════ */

function heroEntrance() {
  const headline = document.querySelector('.hero-headline');
  const stickerHero = document.querySelector('.sticker-hero');
  const deliveryBadge = document.querySelector('.delivery-badge');
  const heroSub = document.querySelector('.hero-sub');
  const heroForm = document.querySelector('.brutalist-form');
  const techLabel = document.querySelector('.tech-label');

  if (!headline) return;

  // Animate blocks — no DOM rewriting, no word splitting
  const elements = [stickerHero, headline, deliveryBadge, heroSub, heroForm, techLabel].filter(Boolean);
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
  });

  const tl = createTimeline({ defaults: { ease: 'out(3)' } });

  // Sticker drops in with rotation
  if (stickerHero) {
    tl.add(stickerHero, {
      opacity: [0, 1],
      translateY: [-20, 0],
      rotate: ['-6deg', '-2deg'],
      duration: 500,
    }, 0);
  }

  // Headline slides up
  if (headline) {
    tl.add(headline, {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 700,
    }, 100);
  }

  // Delivery badge
  if (deliveryBadge) {
    tl.add(deliveryBadge, {
      opacity: [0, 1],
      translateY: [16, 0],
      scale: [0.95, 1],
      duration: 450,
    }, 500);
  }

  // Sub text
  if (heroSub) {
    tl.add(heroSub, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 500,
    }, 650);
  }

  // Form
  if (heroForm) {
    tl.add(heroForm, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
    }, 800);
  }

  // Tech label
  if (techLabel) {
    tl.add(techLabel, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 350,
    }, 950);
  }
}

/* ═══════════════════════════════════════════════
   2. SCROLL REVEALS — IntersectionObserver + Anime.js
   ═══════════════════════════════════════════════ */

function setupScrollReveals() {
  const revealTargets = [
    { selector: '.service-card', y: 50, staggerDelay: 80, ease: 'out(3)' },
    { selector: '.process-card', y: 60, staggerDelay: 120, ease: 'out(4)' },
    { selector: '.sticker-card', y: 30, staggerDelay: 100, ease: 'out(3)' },
    { selector: '.stat-box', y: 30, staggerDelay: 100, ease: 'out(3)' },
    { selector: '.value-card', y: 40, staggerDelay: 100, ease: 'out(3)' },
    { selector: '.deliverable-item', y: 0, x: -20, staggerDelay: 50, ease: 'out(2)' },
    { selector: '.cta-headline', y: 50, staggerDelay: 0, ease: 'out(3)' },
    { selector: '.section-header', y: 30, staggerDelay: 0, ease: 'out(2)' },
    { selector: '.design-card', y: 40, staggerDelay: 100, ease: 'out(3)' },
  ];

  revealTargets.forEach(config => {
    const elements = document.querySelectorAll(config.selector);
    if (!elements.length) return;

    // Set initial state
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = `translate(${config.x || 0}px, ${config.y || 0}px)`;
    });

    // Observe with IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // Find all same-type siblings that are still hidden
        const siblings = Array.from(entry.target.parentElement?.querySelectorAll(config.selector) || [])
          .filter(el => el.style.opacity === '0');

        if (siblings.length > 0) {
          animate(siblings, {
            opacity: [0, 1],
            translateY: [config.y || 0, 0],
            translateX: [config.x || 0, 0],
            duration: 700,
            ease: config.ease,
            delay: stagger(config.staggerDelay),
          });
        }

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
  });

  // Compare rows — handle separately with child animations
  setupCompareReveals();
}

/* ═══════════════════════════════════════════════
   3. COMPARE ROWS — Proper Wipe Reveal
   ═══════════════════════════════════════════════ */

function setupCompareReveals() {
  const rows = document.querySelectorAll('.compare-row');
  if (!rows.length) return;

  // Hide the children, NOT the row itself
  rows.forEach(row => {
    const old = row.querySelector('.compare-old');
    const nw = row.querySelector('.compare-new');
    if (old) {
      old.style.opacity = '0';
      old.style.transform = 'translateX(-40px)';
    }
    if (nw) {
      nw.style.opacity = '0';
      nw.style.transform = 'translateX(60px)';
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const row = entry.target;

      const old = row.querySelector('.compare-old');
      const nw = row.querySelector('.compare-new');

      if (old) {
        animate(old, {
          opacity: [0, 1],
          translateX: [-40, 0],
          duration: 600,
          ease: 'out(3)',
        });
      }

      if (nw) {
        animate(nw, {
          opacity: [0, 1],
          translateX: [60, 0],
          scale: [0.95, 1],
          duration: 700,
          ease: 'out(4)',
          delay: 200,
        });
      }

      observer.unobserve(row);
    });
  }, { threshold: 0.2 });

  rows.forEach(row => observer.observe(row));
}

/* ═══════════════════════════════════════════════
   4. STAT COUNTERS — Elastic Overshoot
   ═══════════════════════════════════════════════ */

function setupStatCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        animate(obj, {
          val: target,
          duration: 2000,
          ease: 'out(4)',
          onUpdate: () => {
            el.textContent = Math.round(obj.val) + suffix;
          },
        });

        // Scale bounce on the stat box
        const box = el.closest('.stat-box');
        if (box) {
          animate(box, {
            scale: [1, 1.05, 1],
            duration: 400,
            delay: 1800,
            ease: 'inOut(2)',
          });
        }
      },
    });
  });
}

/* ═══════════════════════════════════════════════
   5. STICKER MARQUEE — Infinite Auto-Scroll
   ═══════════════════════════════════════════════ */

function setupMarquee() {
  const track = document.querySelector('.sticker-bar-inner');
  if (!track) return;

  const items = track.querySelectorAll('.sticker-card');
  if (items.length < 2) return;

  // Only clone if not already cloned
  if (!track.dataset.cloned) {
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    track.dataset.cloned = 'true';
  }

  // CSS handles the infinite scroll via animation
  track.classList.add('marquee-track');
}

/* ═══════════════════════════════════════════════
   6. MAGNETIC BUTTONS — Hover Pull Effect
   ═══════════════════════════════════════════════ */

function setupMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-submit, .btn-nav');

  buttons.forEach(btn => {
    if (btn.classList.contains('btn-submit')) {
      btn.classList.add('btn-float');
    }

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      animate(btn, {
        translateX: x * 0.3,
        translateY: y * 0.3,
        duration: 300,
        ease: 'out(2)',
      });
    });

    btn.addEventListener('mouseleave', () => {
      animate(btn, {
        translateX: 0,
        translateY: 0,
        duration: 600,
        ease: 'out(4)',
      });
    });
  });
}
