/**
 * Google service-account auth, without the `googleapis` SDK.
 *
 * `googleapis` unpacks to 195 MB. It defines a getter for every Google API on
 * a single `google` object, so a bundler cannot tree-shake it down to the two
 * calls this site actually makes — the Worker would blow past Cloudflare's
 * 10 MiB compressed limit before it shipped a single page.
 *
 * Both of those calls (Gmail send, Indexing API) are one REST request behind a
 * signed JWT, so we mint the token here with Web Crypto. That runs unchanged on
 * Workers and on Node 22 — both expose `globalThis.crypto.subtle`.
 *
 * See lib/gmail.js and lib/blog/indexing.js for the callers.
 */

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

/** Google's tokens last an hour. Stop trusting one a minute before it expires. */
const EXPIRY_SKEW_MS = 60_000;

/**
 * Process-local token cache. A Worker isolate is reused across requests, so
 * this saves a round trip on most calls; losing it on eviction costs nothing.
 */
const tokenCache = new Map();

function base64url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function encodeJson(value) {
  return base64url(new TextEncoder().encode(JSON.stringify(value)));
}

/**
 * Turn a PEM private key into a signing key.
 *
 * Env stores store the key with literal `\n` two-character sequences rather
 * than real newlines, so unescape before parsing.
 */
async function importPrivateKey(pem) {
  const der = pem
    .replace(/\n/g, '\n')
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');

  const binary = atob(der);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return crypto.subtle.importKey(
    'pkcs8',
    bytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/**
 * Exchange a service-account key for an OAuth2 access token.
 *
 * @param {object} opts
 * @param {string} opts.clientEmail — service account address
 * @param {string} opts.privateKey  — PEM private key, escaped newlines tolerated
 * @param {string} opts.scope       — single OAuth scope
 * @param {string} [opts.subject]   — Workspace user to impersonate, for
 *                                    domain-wide delegation (Gmail needs this;
 *                                    the Indexing API does not)
 * @returns {Promise<string>} bearer token
 */
export async function getAccessToken({ clientEmail, privateKey, scope, subject }) {
  const cacheKey = `${clientEmail}|${scope}|${subject || ''}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt - EXPIRY_SKEW_MS > Date.now()) return cached.token;

  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: 'RS256', typ: 'JWT' });
  const claims = encodeJson({
    iss: clientEmail,
    scope,
    aud: TOKEN_ENDPOINT,
    iat: now,
    exp: now + 3600,
    ...(subject ? { sub: subject } : {}),
  });

  const key = await importPrivateKey(privateKey);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${header}.${claims}`)
  );
  const assertion = `${header}.${claims}.${base64url(new Uint8Array(signature))}`;

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    // Google puts the useful part in `error_description` — "Invalid JWT
    // Signature", "unauthorized_client" when delegation is not granted.
    throw new Error(
      `Google token exchange failed (${res.status}): ${body.error_description || body.error || 'unknown'}`
    );
  }

  tokenCache.set(cacheKey, {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  });

  return body.access_token;
}
