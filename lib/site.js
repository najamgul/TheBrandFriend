/**
 * Canonical origin for the site — the single source of truth.
 *
 * The apex (thebrandfriend.com) 307-redirects to www, so www is the canonical
 * host. This matters beyond tidiness:
 *   - a canonical tag pointing at a redirect can be ignored by search engines
 *   - IndexNow rejects a submission whose `host` does not serve the key file
 *   - the Google Indexing API 403s on URLs outside the verified property
 *
 * If you ever flip the apex→www redirect to prefer the apex, change it here
 * and nowhere else.
 */
export const SITE_URL = 'https://www.thebrandfriend.com';

/** Bare host, no scheme — required by the IndexNow payload. */
export const SITE_HOST = 'www.thebrandfriend.com';
