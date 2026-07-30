'use client';

import { skins } from '@/data/skins';
import { useSkin } from './SkinProvider';

/**
 * Names the design system currently being applied. Small, but it's the line
 * that makes the switcher legible — without it a visitor sees the page change
 * and doesn't know they're looking at a named, shippable system.
 */
export default function SkinReadout() {
  const { skin } = useSkin();

  return (
    <p className="readout" aria-live="polite">
      <span className="label muted">Now showing</span>
      <span className="readout__name">{skin.name}</span>
      <span className="readout__note muted">{skin.note}</span>
      <span className="readout__count muted">
        {skins.findIndex(s => s.id === skin.id) + 1} of {skins.length}
      </span>
    </p>
  );
}
