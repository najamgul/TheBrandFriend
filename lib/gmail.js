import { google } from 'googleapis';

/**
 * Gmail API client for TheBrandFriend.
 * Uses a Google Service Account with domain-wide delegation
 * to send emails as operations@thebrandfriend.in.
 *
 * No refresh tokens. No expiry. Ever.
 *
 * Required env vars:
 *   GOOGLE_SA_CLIENT_EMAIL  — Service account email (xxx@project.iam.gserviceaccount.com)
 *   GOOGLE_SA_PRIVATE_KEY   — Service account private key (PEM format, with \n escaped)
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

let _gmail = null;

function getGmailClient() {
  if (_gmail) return _gmail;

  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY;
  const senderEmail = (process.env.GMAIL_SENDER_EMAIL || '').replace(/^.*<|>.*$/g, '').trim();

  if (!clientEmail || !privateKey || !senderEmail) {
    throw new Error(
      'Missing service account credentials. Set GOOGLE_SA_CLIENT_EMAIL, GOOGLE_SA_PRIVATE_KEY, and GMAIL_SENDER_EMAIL.'
    );
  }

  // JWT auth with domain-wide delegation — impersonates the sender
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'), // Vercel stores \n as literal
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: senderEmail, // Impersonate this Workspace user
  });

  _gmail = google.gmail({ version: 'v1', auth });
  return _gmail;
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
  const gmail = getGmailClient();
  const sender = from || process.env.GMAIL_SENDER_EMAIL || 'operations@thebrandfriend.in';

  const raw = buildMimeMessage({ from: sender, to, replyTo, subject, html });

  // Gmail API expects URL-safe base64
  const encodedMessage = Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  return result.data;
}
