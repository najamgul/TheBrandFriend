'use client';

import { useRef } from 'react';
import { skins, skinSwatch } from '@/data/skins';
import { useSkin } from './SkinProvider';

/**
 * The live skin switcher.
 *
 * Each chip carries a miniature of the design system it applies — that skin's
 * paper, ink and accent, drawn in its own colours rather than the current
 * ones. The swatch is the affordance; the label is a convenience that drops
 * away on narrow screens.
 *
 * Arrow keys move between chips (roving focus) so it behaves like the toolbar
 * it visually is, rather than eight loose buttons.
 */
export default function SkinSwitcher() {
  const { skinId, setSkin } = useSkin();
  const shellRef = useRef(null);

  function onKeyDown(e) {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();

    const chips = Array.from(shellRef.current?.querySelectorAll('[data-chip]') || []);
    const from = chips.indexOf(document.activeElement);
    if (from === -1) return;

    const to =
      e.key === 'Home' ? 0
      : e.key === 'End' ? chips.length - 1
      : e.key === 'ArrowRight' ? (from + 1) % chips.length
      : (from - 1 + chips.length) % chips.length;

    chips[to].focus();
  }

  return (
    <div className="switcher">
      <div
        className="switcher__shell"
        role="group"
        aria-label="Preview this site in a different design system"
        ref={shellRef}
        onKeyDown={onKeyDown}
      >
        <span className="label switcher__label" aria-hidden="true">Skin</span>

        {skins.map(s => {
          const sw = skinSwatch(s);
          const active = s.id === skinId;
          return (
            <button
              key={s.id}
              data-chip
              type="button"
              className="chip"
              aria-pressed={active}
              title={`${s.name} — ${s.note}`}
              onClick={() => setSkin(s.id)}
            >
              <span className="chip__swatch" style={{ background: sw.bg }} aria-hidden="true">
                <i style={{ background: sw.fg }} />
                <i style={{ background: sw.accent }} />
                <i style={{ background: sw.signal }} />
              </span>
              <span className="chip__name">{s.name}</span>
              <span className="sr-only">
                {active ? ' (currently applied)' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
