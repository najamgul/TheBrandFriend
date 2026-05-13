import { NextResponse } from 'next/server';
import { sendGmail } from '../../../../lib/gmail';

/**
 * GET /api/test-email
 * Temporary diagnostic — sends a test email to verify Gmail API setup.
 * DELETE THIS FILE after confirming emails work.
 */
export async function GET() {
  try {
    const fromEmail = process.env.GMAIL_SENDER_EMAIL;
    const teamEmail = process.env.TEAM_EMAIL || 'care@thebrandfriend.com';

    // Log env var presence (not values) for debugging
    const envCheck = {
      GOOGLE_SA_CLIENT_EMAIL: !!process.env.GOOGLE_SA_CLIENT_EMAIL,
      GOOGLE_SA_PRIVATE_KEY: !!process.env.GOOGLE_SA_PRIVATE_KEY,
      GOOGLE_SA_PRIVATE_KEY_LENGTH: (process.env.GOOGLE_SA_PRIVATE_KEY || '').length,
      GOOGLE_SA_PRIVATE_KEY_START: (process.env.GOOGLE_SA_PRIVATE_KEY || '').substring(0, 30),
      GMAIL_SENDER_EMAIL: process.env.GMAIL_SENDER_EMAIL || 'NOT SET',
      TEAM_EMAIL: teamEmail,
    };

    console.log('[Test Email] Env check:', JSON.stringify(envCheck));

    if (!fromEmail) {
      return NextResponse.json({ error: 'GMAIL_SENDER_EMAIL not set', envCheck }, { status: 500 });
    }

    await sendGmail({
      from: fromEmail,
      to: teamEmail,
      subject: '✅ TheBrandFriend Gmail API Test — IT WORKS!',
      html: `
        <div style="font-family:system-ui;padding:40px;background:#0a0a0a;color:#fff;border-radius:8px;">
          <h1 style="color:#CDFF57;">✅ Gmail API is working!</h1>
          <p>This test email was sent via the service account at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.</p>
          <p style="color:#888;">You can delete <code>/api/test-email</code> now.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Test email sent to ' + teamEmail });

  } catch (err) {
    console.error('[Test Email] FAILED:', err.message, err.stack);
    return NextResponse.json({
      error: err.message,
      stack: err.stack?.split('\n').slice(0, 5),
    }, { status: 500 });
  }
}
