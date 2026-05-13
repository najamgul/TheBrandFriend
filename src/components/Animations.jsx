'use client';
import { useEffect, useRef } from 'react';
import {
  animate,
  stagger,
  createTimeline,
  onScroll,
  createSpring,
  utils,
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
   1. HERO — Cinematic Entrance Sequence
   ═══════════════════════════════════════════════ */

function heroEntrance() {
  const headline = document.querySelector('.hero-headline');
  const stickerHero = document.querySelector('.sticker-hero');
  const deliveryBadge = document.querySelector('.delivery-badge');
  const heroSub = document.querySelector('.hero-sub');
  const heroForm = document.querySelector('.brutalist-form');
  const techLabel = document.querySelector('.tech-label');

  if (!headline) return;

  // Wrap each child text node's words in spans, preserve existing HTML elements
  const fragment = document.createDocumentFragment();
  const childNodes = Array.from(headline.childNodes);

  childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Split text into words, wrap each
      const text = node.textContent;
      const words = text.split(/\s+/).filter(Boolean);
      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'hero-word';
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.textContent = word;
        fragment.appendChild(span);
        if (i < words.length - 1) fragment.appendChild(document.createTextNode(' '));
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        fragment.appendChild(node.cloneNode());
      } else {
        // Wrap the entire element (e.g. <span class="volt">DOMINATE</span>)
        const wrapper = document.createElement('span');
        wrapper.className = 'hero-word';
        wrapper.style.display = 'inline-block';
        wrapper.style.opacity = '0';
        wrapper.appendChild(node.cloneNode(true));
        fragment.appendChild(wrapper);
      }
    }
  });

  headline.innerHTML = '';
  headline.appendChild(fragment);

  const heroWords = headline.querySelectorAll('.hero-word');
  const voltSpan = headline.querySelector('.volt');

  // Initial states
  const hiddenEls = [stickerHero, deliveryBadge, heroSub, heroForm, techLabel].filter(Boolean);
  hiddenEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
  });

  const tl = createTimeline({ defaults: { ease: 'out(3)' } });

  // Sticker drops in
  if (stickerHero) {
    tl.add(stickerHero, {
      opacity: [0, 1],
      translateY: [-30, 0],
      rotate: ['-8deg', '-2deg'],
      duration: 600,
    }, 0);
  }

  // Words cascade in with spring
  if (heroWords.length > 0) {
    tl.add(heroWords, {
      opacity: [0, 1],
      translateY: [60, 0],
      duration: 800,
      delay: stagger(80),
    }, 100);
  }

  // Volt text pulse
  if (voltSpan) {
    tl.add(voltSpan, {
      scale: [1, 1.08, 1],
      duration: 500,
      ease: 'inOut(2)',
    }, 900);
  }

  // Delivery badge bounces in
  if (deliveryBadge) {
    tl.add(deliveryBadge, {
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.9, 1],
      duration: 500,
      ease: 'out(4)',
    }, 700);
  }

  // Sub text fades in
  if (heroSub) {
    tl.add(heroSub, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
    }, 900);
  }

  // Form slides up
  if (heroForm) {
    tl.add(heroForm, {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
    }, 1000);
  }

  // Tech label fades in
  if (techLabel) {
    tl.add(techLabel, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
    }, 1200);
  }
}

/* ═══════════════════════════════════════════════
   2. SCROLL REVEALS — IntersectionObserver + Anime.js
   ═══════════════════════════════════════════════ */

function setupScrollReveals() {
  const revealTargets = [
    { selector: '.service-card', y: 50, staggerDelay: 80, ease: 'out(3)' },
    { selector: '.process-card', y: 60, staggerDelay: 120, ease: 'out(4)' },
    { selector: '.sticker-card', y: 30, staggerDelay: 100, ease: 'out(3)', rotate: true },
    { selector: '.compare-row', y: 0, staggerDelay: 0, ease: 'out(3)', custom: true },
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
      el.style.willChange = 'transform, opacity';
    });

    // Observe with IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // For compare rows, do custom wipe
        if (config.custom && config.selector === '.compare-row') {
          animateCompareRow(entry.target);
        } else {
          // Find all same-type siblings that are now visible
          const siblings = Array.from(entry.target.parentElement?.querySelectorAll(config.selector) || [])
            .filter(el => el.style.opacity === '0');

          if (siblings.length > 0) {
            animate(siblings, {
              opacity: [0, 1],
              translateY: [config.y || 0, 0],
              translateX: [config.x || 0, 0],
              ...(config.rotate ? { rotate: [(i) => [-3, 2, -2, 3][i % 4] + 'deg', (i) => [-2, 1.5, -1, 2][i % 4] + 'deg'] } : {}),
              duration: 700,
              ease: config.ease,
              delay: stagger(config.staggerDelay),
            });
          }
        }

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
  });
}

/* ═══════════════════════════════════════════════
   3. COMPARE ROWS — Dramatic Wipe Reveal
   ═══════════════════════════════════════════════ */

function animateCompareRow(row) {
  const old = row.querySelector('.compare-old');
  const nw = row.querySelector('.compare-new');

  if (old) {
    old.style.opacity = '0';
    animate(old, {
      opacity: [0, 0.7],
      translateX: [-40, 0],
      duration: 600,
      ease: 'out(2)',
    });
  }

  if (nw) {
    nw.style.opacity = '0';
    animate(nw, {
      opacity: [0, 1],
      translateX: [60, 0],
      scale: [0.95, 1],
      duration: 700,
      ease: 'out(4)',
      delay: 200,
    });
  }
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
        // Animate with elastic overshoot
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

  // Clone items for seamless loop
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
    // Add float animation class
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
