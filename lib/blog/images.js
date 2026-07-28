/**
 * Cover images from Pexels.
 *
 * Entirely optional: with no PEXELS_API_KEY the pipeline still runs and the
 * blog renders a branded gradient placeholder card instead. Image lookup must
 * never be able to fail a generation that otherwise passed the quality gate,
 * so every path here resolves rather than throws.
 *
 * Attribution is not optional. The Pexels API guidelines require a visible
 * link back to Pexels and a photographer credit, which is why the credit is
 * persisted alongside the URL rather than discarded — an image without its
 * credit is unusable.
 */

const PEXELS_ENDPOINT = 'https://api.pexels.com/v1/search';

/** Nothing found, or no key configured. */
const EMPTY = { url: null, alt: null, credit: null };

/**
 * @param {string} query  Short visual phrase, e.g. "modern office laptop".
 *                        Long article titles return poor stock results, so the
 *                        model supplies a dedicated imageQuery for this.
 */
export async function fetchCoverImage(query) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return EMPTY;

  const cleaned = String(query || '').trim().slice(0, 100);
  if (!cleaned) return EMPTY;

  try {
    const url =
      `${PEXELS_ENDPOINT}?query=${encodeURIComponent(cleaned)}` +
      `&per_page=1&orientation=landscape&size=large`;

    const res = await fetch(url, {
      // Pexels takes the raw key. There is no "Bearer" prefix here.
      headers: { Authorization: key },
    });

    if (!res.ok) {
      console.warn(`[blog] Pexels HTTP ${res.status} for "${cleaned}"`);
      return EMPTY;
    }

    const data = await res.json();
    const photo = data?.photos?.[0];
    if (!photo) {
      console.warn(`[blog] Pexels returned no photo for "${cleaned}"`);
      return EMPTY;
    }

    return {
      // `landscape` is pre-cropped to 1200x627, which suits both the card and
      // the Open Graph image without further processing.
      url: photo.src?.landscape || photo.src?.large || photo.src?.original || null,
      alt: photo.alt || null,
      credit: {
        photographer: photo.photographer || 'Unknown',
        photographerUrl: photo.photographer_url || null,
        photoUrl: photo.url || null,
        source: 'Pexels',
      },
    };
  } catch (err) {
    console.warn('[blog] Pexels lookup failed:', err.message);
    return EMPTY;
  }
}
