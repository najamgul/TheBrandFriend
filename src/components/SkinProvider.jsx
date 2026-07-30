'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_SKIN, skinIds, skins } from '@/data/skins';

const STORAGE_KEY = 'tbf-skin';

const SkinContext = createContext(null);

/**
 * Owns the active skin.
 *
 * The `data-skin` attribute on <html> is the single source of truth for
 * appearance — it is set by the blocking script in layout.js before first
 * paint, so React never causes a flash of the default skin. This provider
 * mirrors that attribute into state and is the only thing allowed to change it.
 *
 * Two ways to change it:
 *   setSkin      — a deliberate choice by the visitor. Persisted, animated.
 *   previewSkin  — a transient change (the title sequence). Never persisted,
 *                  never animated, so it cannot overwrite a real preference
 *                  or queue up view transitions faster than they can run.
 */
export function SkinProvider({ children }) {
  const [skinId, setSkinId] = useState(DEFAULT_SKIN);
  const [hasStoredChoice, setHasStoredChoice] = useState(true); // assume yes until proven otherwise

  useEffect(() => {
    const applied = document.documentElement.dataset.skin;
    if (applied && skinIds.includes(applied)) setSkinId(applied);

    try {
      setHasStoredChoice(Boolean(localStorage.getItem(STORAGE_KEY)));
    } catch {
      setHasStoredChoice(false);
    }
  }, []);

  const previewSkin = useCallback(id => {
    if (!skinIds.includes(id)) return;
    document.documentElement.dataset.skin = id;
    setSkinId(id);
  }, []);

  const setSkin = useCallback(id => {
    if (!skinIds.includes(id)) return;

    const commit = () => {
      document.documentElement.dataset.skin = id;
      setSkinId(id);
    };

    try {
      localStorage.setItem(STORAGE_KEY, id);
      setHasStoredChoice(true);
    } catch {
      // Private mode / storage disabled — the switch still works, it just
      // won't survive a reload. Not worth surfacing to the user.
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduced) {
      document.startViewTransition(commit);
    } else {
      commit();
    }
  }, []);

  const skin = skins.find(s => s.id === skinId) || skins[0];

  return (
    <SkinContext.Provider value={{ skin, skinId, setSkin, previewSkin, hasStoredChoice }}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin() {
  const ctx = useContext(SkinContext);
  if (!ctx) throw new Error('useSkin must be used inside <SkinProvider>');
  return ctx;
}

/**
 * Runs before first paint to avoid a flash of the default skin. Kept as a
 * string because it has to be inlined into <head> ahead of the bundle.
 */
export const skinBootScript = `(function(){try{var s=localStorage.getItem('${STORAGE_KEY}');var ok=${JSON.stringify(skinIds)};if(s&&ok.indexOf(s)>-1){document.documentElement.dataset.skin=s;return}}catch(e){}document.documentElement.dataset.skin='${DEFAULT_SKIN}';})();`;
