'use client';

import { useEffect, useRef, useState } from 'react';
import { OPENING_REEL, skins } from '@/data/skins';
import { useSkin } from './SkinProvider';

const SESSION_KEY = 'tbf-opened';
const HOLD_MS = 420;   // how long each design language is held
const SETTLE_MS = 900; // pause before the label clears

/**
 * The title sequence.
 *
 * On a first visit the real page — not an overlay, not a loader — flicks
 * through four design languages and settles on the house style. The content
 * is painted and readable the entire time, so this costs nothing in LCP and
 * a visitor who ignores it has simply watched the page arrive.
 *
 * It runs once per session, never for someone who has already chosen a skin,
 * never under prefers-reduced-motion, and any keypress, click or scroll
 * ends it immediately.
 */
export default function OpeningSequence() {
  const { previewSkin, hasStoredChoice } = useSkin();
  const [label, setLabel] = useState(null);
  const cancelled = useRef(false);

  useEffect(() => {
    // Respect an existing choice — the sequence must never override it.
    if (hasStoredChoice) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Storage blocked: play it, but it will replay on the next navigation.
      // Better than never showing the one moment the whole page is built on.
    }

    const timers = [];
    const finish = () => {
      if (cancelled.current) return;
      cancelled.current = true;
      timers.forEach(clearTimeout);
      previewSkin(OPENING_REEL[OPENING_REEL.length - 1]);
      setLabel(null);
      document.documentElement.removeAttribute('data-opening');
    };

    document.documentElement.setAttribute('data-opening', '');

    OPENING_REEL.forEach((id, i) => {
      timers.push(setTimeout(() => {
        if (cancelled.current) return;
        previewSkin(id);
        const meta = skins.find(s => s.id === id);
        setLabel(meta ? meta.name : null);
      }, i * HOLD_MS));
    });

    timers.push(setTimeout(finish, OPENING_REEL.length * HOLD_MS + SETTLE_MS));

    // Any intent to interact wins over the animation.
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    events.forEach(e => window.addEventListener(e, finish, { once: true, passive: true }));

    return () => {
      cancelled.current = true;
      timers.forEach(clearTimeout);
      events.forEach(e => window.removeEventListener(e, finish));
      document.documentElement.removeAttribute('data-opening');
    };
  }, [previewSkin, hasStoredChoice]);

  if (!label) return null;

  return (
    <div className="opening" aria-hidden="true">
      <span className="label opening__name">{label}</span>
    </div>
  );
}
