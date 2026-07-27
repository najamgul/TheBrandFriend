import { google } from 'googleapis';
import { SITE_URL, SITE_HOST } from '../site.js';

/**
 * Instant-indexing pings. Both are best-effort: a failure here must never
 * roll back a publish, so every function resolves rather than throws.
 *
 * Host correctness is load-bearing here, not cosmetic: IndexNow rejects a
 * submission whose `host` does not serve the key file, and the Google
 * Indexing API 403s on URLs outside the verified Search Console property.
 * Both come from lib/site.js so they cannot drift apart.
 */

export { SITE_URL };
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/* ------------------------------------------------------------------ */
/* IndexNow — Bing, Yandex, Seznam, Naver                              */
/* ------------------------------------------------------------------ */

/**
 * Requires a key file served at https://www.thebrandfriend.com/<key>.txt whose
 * only content is the key itself. See public/ for the committed file.
 */
export async function pingIndexNow(urls) {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return { ok: false, status: 'skipped', message: 'INDEXNOW_KEY not set' };
  }
  if (!urls?.length) {
    return { ok: true, status: 'skipped', message: 'no URLs' };
  }

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: SITE_HOST,
        key,
        keyLocation: `${SITE_URL}/${key}.txt`,
        urlList: urls,
      }),
    });

    // 200 = accepted, 202 = accepted but key still being validated.
    if (res.ok || res.status === 202) {
      return { ok: true, status: 'sent', httpStatus: res.status, count: urls.length };
    }

    const body = await res.text().catch(() => '');
    return {
      ok: false,
      status: 'failed',
      httpStatus: res.status,
      message: body.slice(0, 300),
    };
  } catch (err) {
    return { ok: false, status: 'failed', message: err.message };
  }
}

/* ------------------------------------------------------------------ */
/* Google Indexing API                                                 */
/* ------------------------------------------------------------------ */

/**
 * Reuses the same service account already configured for Gmail. The account
 * must also be added as an owner of the property in Google Search Console,
 * and the "Web Search Indexing API" must be enabled on the Cloud project.
 *
 * Quota is 200 URL notifications per day by default — far above 2 posts/week.
 */
export async function pingGoogleIndexing(urls) {
  const clientEmail =
    process.env.GOOGLE_INDEXING_CLIENT_EMAIL || process.env.GOOGLE_SA_CLIENT_EMAIL;
  const privateKey = (
    process.env.GOOGLE_INDEXING_PRIVATE_KEY || process.env.GOOGLE_SA_PRIVATE_KEY || ''
  ).replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return {
      ok: false,
      status: 'skipped',
      message: 'Google indexing service account not configured',
    };
  }
  if (!urls?.length) {
    return { ok: true, status: 'skipped', message: 'no URLs' };
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
    await auth.authorize();

    const indexing = google.indexing({ version: 'v3', auth });

    const results = await Promise.allSettled(
      urls.map(url =>
        indexing.urlNotifications.publish({
          requestBody: { url, type: 'URL_UPDATED' },
        })
      )
    );

    const failed = results
      .map((r, i) => ({ r, url: urls[i] }))
      .filter(({ r }) => r.status === 'rejected')
      .map(({ r, url }) => `${url}: ${r.reason?.message || 'unknown'}`);

    if (failed.length) {
      return {
        ok: false,
        status: results.length === failed.length ? 'failed' : 'partial',
        message: failed.slice(0, 3).join('; '),
        // Which identity to authorise in Search Console. This is the account's
        // public email, not a credential — the private key is the secret.
        account: clientEmail,
        succeeded: results.length - failed.length,
      };
    }

    return { ok: true, status: 'sent', count: urls.length, account: clientEmail };
  } catch (err) {
    return { ok: false, status: 'failed', message: err.message };
  }
}

/**
 * Fire both notifications for a set of URLs.
 *
 * Keeps the failure message, not just the status. A bare "failed" tells you
 * nothing when the cause is almost always one of two fixable setup problems:
 * the service account is not an owner of the Search Console property, or the
 * Web Search Indexing API is not enabled on its Cloud project. Persisting the
 * message means you can diagnose from the database instead of hunting through
 * serverless logs after the fact.
 */
export async function notifySearchEngines(urls) {
  const [indexnow, googleResult] = await Promise.all([
    pingIndexNow(urls),
    pingGoogleIndexing(urls),
  ]);

  console.log('[blog] IndexNow:', JSON.stringify(indexnow));
  console.log('[blog] Google Indexing:', JSON.stringify(googleResult));

  return {
    indexnow: indexnow.status,
    google: googleResult.status,
    ...(indexnow.message ? { indexnowMessage: indexnow.message.slice(0, 500) } : {}),
    ...(googleResult.message ? { googleMessage: googleResult.message.slice(0, 500) } : {}),
    ...(googleResult.account ? { googleAccount: googleResult.account } : {}),
  };
}

export function blogUrl(slug) {
  return `${SITE_URL}/blog/${slug}/`;
}
