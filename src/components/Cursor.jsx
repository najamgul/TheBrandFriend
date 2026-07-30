'use client';

import { useEffect } from 'react';

/**
 * Two-part cursor: a dot that tracks exactly and a ring that lags behind it.
 * The lag is the whole effect — it gives the pointer weight.
 *
 * Mouse-driven pointers only. On touch there is no cursor to replace, and
 * under prefers-reduced-motion the native one is left alone.
 */
export default function Cursor() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.append(dot, ring);
    document.documentElement.classList.add('has-cursor');

    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;
    let raf = 0;
    let visible = false;

    function onMove(e) {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        rx = mx; ry = my; // don't fly in from the middle of the screen
        dot.style.opacity = ring.style.opacity = '1';
      }
    }

    // Delegated, so it keeps working for anything React renders later.
    const INTERACTIVE = 'a, button, input, select, textarea, [role="button"], .chip, .syscard';
    function onOver(e) {
      ring.classList.toggle('is-active', Boolean(e.target.closest?.(INTERACTIVE)));
    }
    function onLeave() {
      visible = false;
      dot.style.opacity = ring.style.opacity = '0';
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    }
    raf = requestAnimationFrame(frame);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerleave', onLeave);
      dot.remove();
      ring.remove();
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return null;
}
