'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * The site's only scroll behaviour: elements marked [data-reveal] fade and
 * rise once, when they first come into view. One idiom, applied everywhere,
 * instead of five competing ones.
 *
 * Stagger is expressed in the markup as --reveal-delay so the choreography
 * lives next to the content it belongs to.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = document.querySelectorAll('[data-reveal]:not(.is-in)');
    if (!targets.length) return;

    // Honour the OS setting by simply showing everything.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
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
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
