/**
 * THE CHAMELEON — skin definitions
 *
 * Every skin is a complete design language, not a colour swap. A skin owns its
 * palette, its typefaces, its letterform treatment (case / tracking / weight /
 * optical scale), its geometry (radius, stroke weight, shadow) and its motion
 * character. Swap one and the whole site changes its mind about what it is.
 *
 * These are not invented — each one is a real system from designs-src/, which
 * is the point: the switcher is a live demo of work we've already shipped.
 *
 * Single source of truth. `skinsToCSS()` renders these to a stylesheet that
 * layout.js inlines server-side, so there is no runtime cost and no flash.
 * Adding a skin means adding an entry here and nothing else.
 */

/* Font stack variables come from next/font in layout.js. */
const F = {
  archivo: 'var(--f-archivo)',
  dm: 'var(--f-dm)',
  mono: 'var(--f-mono)',
  instrument: 'var(--f-instrument)',
  anton: 'var(--f-anton)',
  grotesk: 'var(--f-grotesk)',
  syne: 'var(--f-syne)',
  fraunces: 'var(--f-fraunces)',
};

export const skins = [
  {
    /* The house style. Everything else in this list is a system we can build
       for a client; this is the one we build for ourselves. Near-black so the
       WebGL field and the work imagery both have somewhere to sit, with a
       single hot ember accent doing all the pointing. */
    id: 'noir',
    name: 'Noir',
    note: 'House style',
    kind: 'dark',
    tokens: {
      '--bg': '#0B0B0C',
      '--bg-alt': '#121215',
      '--fg': '#F2EFE9',
      '--muted': '#847F76',
      '--surface': '#141417',
      '--line': 'rgba(242, 239, 233, 0.14)',
      '--accent': '#FF4D2E',
      '--accent-fg': '#0B0B0C',
      '--signal': '#FF4D2E',
      '--font-display': F.archivo,
      '--font-body': F.dm,
      '--font-label': F.mono,
      '--display-weight': '760',
      '--display-tracking': '-0.055em',
      '--display-leading': '0.82',
      '--display-case': 'uppercase',
      '--display-scale': '1.1',
      '--label-case': 'uppercase',
      '--label-tracking': '0.2em',
      '--radius': '2px',
      '--radius-lg': '4px',
      '--stroke': '1px',
      '--shadow': 'none',
      '--grain': '0.055',
      '--logo-invert': '1',
      '--ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
      '--dur': '900ms',
    },
  },

  {
    id: 'atelier',
    name: 'Atelier',
    note: 'House style',
    kind: 'light',
    tokens: {
      /* colour */
      '--bg': '#F3F1EC',
      '--bg-alt': '#E9E6DF',
      '--fg': '#14130F',
      '--muted': '#6E6A61',
      '--surface': '#FBFAF7',
      '--line': 'rgba(20, 19, 15, 0.14)',
      '--accent': '#C3502E',
      '--accent-fg': '#FCFBF8',
      '--signal': '#C3502E',
      /* type */
      '--font-display': F.archivo,
      '--font-body': F.dm,
      '--font-label': F.mono,
      '--display-weight': '640',
      '--display-tracking': '-0.035em',
      '--display-leading': '0.92',
      '--display-case': 'none',
      '--display-scale': '1',
      '--label-case': 'uppercase',
      '--label-tracking': '0.14em',
      /* geometry */
      '--radius': '2px',
      '--radius-lg': '4px',
      '--stroke': '1px',
      '--shadow': 'none',
      '--grain': '0.035',
      '--logo-invert': '0',
      /* motion */
      '--ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
      '--dur': '640ms',
    },
  },

  {
    id: 'swiss',
    name: 'Swiss Echo',
    note: 'Studio · Architecture',
    kind: 'light',
    tokens: {
      '--bg': '#F2F2F2',
      '--bg-alt': '#E4E4E4',
      '--fg': '#111111',
      '--muted': '#8A8A8A',
      '--surface': '#FFFFFF',
      '--line': 'rgba(17, 17, 17, 0.18)',
      '--accent': '#E2231A',
      '--accent-fg': '#FFFFFF',
      '--signal': '#E2231A',
      '--font-display': F.archivo,
      '--font-body': F.dm,
      '--font-label': F.mono,
      '--display-weight': '800',
      '--display-tracking': '-0.055em',
      '--display-leading': '0.84',
      '--display-case': 'uppercase',
      '--display-scale': '1.06',
      '--label-case': 'uppercase',
      '--label-tracking': '0.2em',
      '--radius': '0px',
      '--radius-lg': '0px',
      '--stroke': '1px',
      '--shadow': 'none',
      '--grain': '0',
      '--logo-invert': '0',
      '--ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
      '--dur': '560ms',
    },
  },

  {
    id: 'season',
    name: 'Season 04',
    note: 'Fashion · Editorial',
    kind: 'light',
    tokens: {
      '--bg': '#E3E2DE',
      '--bg-alt': '#D5D4CF',
      '--fg': '#1B0E0D',
      '--muted': '#6F625F',
      '--surface': '#EFEEEB',
      '--line': 'rgba(27, 14, 13, 0.2)',
      '--accent': '#C72A09',
      '--accent-fg': '#FFFFFF',
      '--signal': '#31EF07',
      '--font-display': F.anton,
      '--font-body': F.dm,
      '--font-label': F.mono,
      '--display-weight': '400',
      '--display-tracking': '-0.02em',
      '--display-leading': '0.82',
      '--display-case': 'uppercase',
      '--display-scale': '1.18',
      '--label-case': 'uppercase',
      '--label-tracking': '0.18em',
      '--radius': '0px',
      '--radius-lg': '0px',
      '--stroke': '2px',
      '--shadow': 'none',
      '--grain': '0.09',
      '--logo-invert': '0',
      '--ease': 'cubic-bezier(0.7, 0, 0.2, 1)',
      '--dur': '520ms',
    },
  },

  {
    id: 'protocol',
    name: 'Dark Protocol',
    note: 'Cinematic · Launch',
    kind: 'dark',
    tokens: {
      '--bg': '#181818',
      '--bg-alt': '#111111',
      '--fg': '#EBDCC4',
      '--muted': '#8A7768',
      '--surface': '#1F1E1D',
      '--line': 'rgba(235, 220, 196, 0.16)',
      '--accent': '#DC9F85',
      '--accent-fg': '#181818',
      '--signal': '#DC9F85',
      '--font-display': F.instrument,
      '--font-body': F.dm,
      '--font-label': F.mono,
      '--display-weight': '400',
      '--display-tracking': '-0.02em',
      '--display-leading': '0.9',
      '--display-case': 'none',
      '--display-scale': '1.12',
      '--label-case': 'uppercase',
      '--label-tracking': '0.22em',
      '--radius': '2px',
      '--radius-lg': '3px',
      '--stroke': '1px',
      '--shadow': 'none',
      '--grain': '0.07',
      '--logo-invert': '1',
      '--ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
      '--dur': '760ms',
    },
  },

  {
    id: 'poster',
    name: 'Poster Modernist',
    note: 'SaaS · Tech',
    kind: 'light',
    tokens: {
      '--bg': '#E3E2DE',
      '--bg-alt': '#D3D2CE',
      '--fg': '#141414',
      '--muted': '#7A7A7A',
      '--surface': '#F2F1EE',
      '--line': 'rgba(20, 20, 20, 0.22)',
      '--accent': '#1351AA',
      '--accent-fg': '#FFFFFF',
      '--signal': '#1351AA',
      '--font-display': F.grotesk,
      '--font-body': F.dm,
      '--font-label': F.mono,
      '--display-weight': '700',
      '--display-tracking': '-0.04em',
      '--display-leading': '0.88',
      '--display-case': 'uppercase',
      '--display-scale': '0.98',
      '--label-case': 'uppercase',
      '--label-tracking': '0.16em',
      '--radius': '0px',
      '--radius-lg': '0px',
      '--stroke': '2px',
      '--shadow': 'none',
      '--grain': '0',
      '--logo-invert': '0',
      '--ease': 'cubic-bezier(0.33, 1, 0.68, 1)',
      '--dur': '480ms',
    },
  },

  {
    id: 'rawform',
    name: 'Raw Form',
    note: 'Retail · Commerce',
    kind: 'light',
    tokens: {
      '--bg': '#E4E2DD',
      '--bg-alt': '#D6D3CC',
      '--fg': '#1E1E1E',
      '--muted': '#736F68',
      '--surface': '#EFEDE9',
      '--line': 'rgba(30, 30, 30, 0.2)',
      '--accent': '#DB4A2B',
      '--accent-fg': '#FFFFFF',
      '--signal': '#F8A348',
      '--font-display': F.syne,
      '--font-body': F.dm,
      '--font-label': F.mono,
      '--display-weight': '800',
      '--display-tracking': '-0.03em',
      '--display-leading': '0.9',
      '--display-case': 'uppercase',
      '--display-scale': '1.02',
      '--label-case': 'uppercase',
      '--label-tracking': '0.15em',
      '--radius': '0px',
      '--radius-lg': '0px',
      '--stroke': '2px',
      '--shadow': 'none',
      '--grain': '0.06',
      '--logo-invert': '0',
      '--ease': 'cubic-bezier(0.65, 0, 0.35, 1)',
      '--dur': '600ms',
    },
  },

  {
    id: 'quiet',
    name: 'Quiet Object',
    note: 'Interiors · Catalog',
    kind: 'light',
    tokens: {
      '--bg': '#FDFBF9',
      '--bg-alt': '#F1EEEA',
      '--fg': '#1A1A1A',
      '--muted': '#8C877F',
      '--surface': '#FFFFFF',
      '--line': 'rgba(26, 26, 26, 0.12)',
      '--accent': '#9A7B57',
      '--accent-fg': '#FDFBF9',
      '--signal': '#9A7B57',
      '--font-display': F.fraunces,
      '--font-body': F.dm,
      '--font-label': F.mono,
      '--display-weight': '400',
      '--display-tracking': '-0.025em',
      '--display-leading': '0.95',
      '--display-case': 'none',
      '--display-scale': '0.94',
      '--label-case': 'uppercase',
      '--label-tracking': '0.2em',
      '--radius': '1px',
      '--radius-lg': '2px',
      '--stroke': '1px',
      '--shadow': 'none',
      '--grain': '0.03',
      '--logo-invert': '0',
      '--ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
      '--dur': '820ms',
    },
  },

  {
    id: 'acid',
    name: 'Acid Youth',
    note: 'Creator · Gen-Z',
    kind: 'dark',
    tokens: {
      '--bg': '#0A0A0A',
      '--bg-alt': '#141414',
      '--fg': '#FFFFFF',
      '--muted': '#8B8B8B',
      '--surface': '#141414',
      '--line': 'rgba(255, 255, 255, 0.18)',
      '--accent': '#CCFF00',
      '--accent-fg': '#0A0A0A',
      '--signal': '#7000FF',
      '--font-display': F.grotesk,
      '--font-body': F.mono,
      '--font-label': F.mono,
      '--display-weight': '700',
      '--display-tracking': '-0.05em',
      '--display-leading': '0.85',
      '--display-case': 'uppercase',
      '--display-scale': '1.08',
      '--label-case': 'uppercase',
      '--label-tracking': '0.16em',
      '--radius': '0px',
      '--radius-lg': '0px',
      '--stroke': '3px',
      '--shadow': '6px 6px 0 var(--fg)',
      '--grain': '0',
      '--logo-invert': '1',
      '--ease': 'cubic-bezier(0.34, 1.4, 0.64, 1)',
      '--dur': '420ms',
    },
  },
];

export const DEFAULT_SKIN = 'noir';

/**
 * The title sequence. On a first visit the page flicks through these before
 * settling on the house style — the site demonstrating what it can be, rather
 * than asking the visitor to click something to find out.
 */
export const OPENING_REEL = ['season', 'acid', 'swiss', 'protocol', DEFAULT_SKIN];

/** Skin ids, for the inline no-flash script's allow-list. */
export const skinIds = skins.map(s => s.id);

/** Swatches for the switcher chips — fg / accent / signal on the skin's own bg. */
export function skinSwatch(skin) {
  const t = skin.tokens;
  return { bg: t['--bg'], fg: t['--fg'], accent: t['--accent'], signal: t['--signal'] };
}

/**
 * Render every skin to CSS. The default skin is emitted on :root as well as on
 * its own attribute selector, so the page is correctly painted before any
 * JavaScript runs — including for users who never touch the switcher.
 */
export function skinsToCSS() {
  const block = tokens =>
    Object.entries(tokens)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');

  const fallback = skins.find(s => s.id === DEFAULT_SKIN) || skins[0];

  return [
    `:root{${block(fallback.tokens)}}`,
    ...skins.map(s => `[data-skin="${s.id}"]{${block(s.tokens)}}`),
  ].join('');
}
