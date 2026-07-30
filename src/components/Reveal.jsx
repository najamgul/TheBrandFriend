'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scroll behaviour, in two idioms and no more:
 *
 *   [data-reveal]              fade and rise once on entry
 *   [data-parallax="0.15"]     drift against the scroll at that fraction
 *
 * Parallax uses a plain scroll listener writing inside rAF rather than
 * GSAP ScrollTrigger — for a handful of translate-only elements that is a
 * fraction of the cost and one less thing on the critical path.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Reveal ── */
    const targets = document.querySelectorAll('[data-reveal]:not(.is-in)');
    let io;

    if (targets.length) {
      if (reduced) {
        targets.forEach(el => el.classList.add('is-in'));
      } else {
        io = new IntersectionObserver(
          entries => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              entry.target.classList.add('is-in');
              io.unobserve(entry.target);
            }
          },
          { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
        );
        targets.forEach(el => io.observe(el));
      }
    }

    /* ── Parallax ── */
    const layers = reduced ? [] : Array.from(document.querySelectorAll('[data-parallax]'));
    let raf = 0;
    let queued = false;

    function apply() {
      queued = false;
      const vh = window.innerHeight;
      for (const el of layers) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > vh * 2) continue;
        const depth = parseFloat(el.dataset.parallax) || 0.12;
        // 0 when the element is centred, ± as it travels away from centre.
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        el.style.setProperty('--py', `${(-progress * depth * 100).toFixed(2)}px`);
      }
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(apply);
    }

    if (layers.length) {
      apply();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    }

    return () => {
      io?.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  return null;
}
