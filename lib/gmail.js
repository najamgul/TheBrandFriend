import { getAccessToken } from './google-jwt.js';

/**
 * Gmail API client for TheBrandFriend.
 * Uses a Google Service Account with domain-wide delegation
 * to send emails as operations@thebrandfriend.in.
 *
 * No refresh tokens. No expiry. Ever.
 *
 * Talks to the REST endpoint directly rather than through `googleapis` —
 * see lib/google-jwt.js for why that package cannot ship in a Worker.
 *
 * Required env vars:
 *   GOOGLE_SA_CLIENT_EMAIL  — Service account email (xxx@project.iam.gserviceaccount.com)
 *   GOOGLE_SA_PRIVATE_KEY   — Service account private key (PEM, escaped newlines OK)
 *   GMAIL_SENDER_EMAIL      — Email to send as (e.g. operations@thebrandfriend.in)
 *
 * Setup (one-time):
 *   1. Google Cloud Console → IAM → Service Accounts → Create
 *   2. Enable domain-wide delegation on the service account
 *   3. Google Admin Console → Security → API Controls → Domain-wide Delegation
 *      → Add the service account client ID with scope:
 *      https://www.googleapis.com/auth/gmail.send
 *   4. Enable Gmail API in the Google Cloud project
 */

const SEND_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

function getCredentials() {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY;
  const senderEmail = (process.env.GMAIL_SENDER_EMAIL || '').replace(/^.*<|>.*$/g, '').trim();

  if (!clientEmail || !privateKey || !senderEmail) {
    throw new Error(
      'Missing service account credentials. Set GOOGLE_SA_CLIENT_EMAIL, GOOGLE_SA_PRIVATE_KEY, and GMAIL_SENDER_EMAIL.'
    );
  }

  return { clientEmail, privateKey, senderEmail };
}

/**
 * Strip HTML tags to generate a plain-text version.
 * Improves deliverability — spam filters penalize HTML-only emails.
 */
function htmlToPlainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, '  ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Build an RFC 2822 MIME message with both text/plain and text/html parts.
 * Multipart/alternative with plain text improves spam score significantly.
 */
function buildMimeMessage({ from, to, replyTo, subject, html }) {
  const boundary = '----=_Part_' + Date.now().toString(36);
  const plainText = htmlToPlainText(html);

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    // Plain text part (MUST come first per RFC 2046)
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(plainText).toString('base64'),
    '',
    // HTML part
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html).toString('base64'),
    '',
    `--${boundary}--`,
  ];

  return headers.join('\r\n');
}

/**
 * Send an email via Gmail API using the service account.
 *
 * @param {object} opts
 * @param {string} opts.to       — Recipient email
 * @param {string} opts.subject  — Email subject
 * @param {string} opts.html     — HTML body
 * @param {string} [opts.replyTo] — Reply-To address
 * @param {string} [opts.from]   — From display (defaults to GMAIL_SENDER_EMAIL)
 */
export async function sendGmail({ to, subject, html, replyTo, from }) {
  const { clientEmail, privateKey, senderEmail } = getCredentials();
  const sender = from || senderEmail;

  const raw = buildMimeMessage({ from: sender, to, replyTo, subject, html });

  // Gmail API expects URL-safe base64
  const encodedMessage = Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Domain-wide delegation: the token is minted *as* the sender, so `me`
  // resolves to their mailbox and not the service account's.
  const token = await getAccessToken({
    clientEmail,
    privateKey,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    subject: senderEmail,
  });

  const res = await fetch(SEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Gmail send failed (${res.status}): ${data.error?.message || 'unknown error'}`
    );
  }

  return data;
}
