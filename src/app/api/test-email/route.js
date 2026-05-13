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

    if (!fromEmail) {
      return NextResponse.json({ error: 'GMAIL_SENDER_EMAIL not set' }, { status: 500 });
    }

    await sendGmail({
      from: fromEmail,
      to: teamEmail,
      subject: 'Test email from TheBrandFriend - Gmail API verified',
      html: `
        <div style="font-family:system-ui;padding:32px;max-width:500px;">
          <h2 style="color:#111;margin:0 0 12px;">Gmail API is working</h2>
          <p style="color:#444;font-size:15px;line-height:1.6;">
            This test email was sent via the service account at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.
          </p>
          <p style="color:#888;font-size:13px;">You can delete the /api/test-email endpoint now.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Test email sent to ' + teamEmail });

  } catch (err) {
    console.error('[Test Email] FAILED:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
