/**
 * TheBrandFriend — Email Templates
 * Professional HTML emails for auto-reply and internal team alert.
 */

/**
 * Auto-reply email sent to the prospect immediately after form submission.
 */
export function buildAutoReplyEmail({ name, service, design }) {
  const designLine = design
    ? `<p style="margin:0 0 4px;color:#999;font-size:13px;">PREFERRED DESIGN: <strong style="color:#333;">${design.replace(/-/g, ' ').toUpperCase()}</strong></p>`
    : '';

  return {
    subject: `We got your brief — expect a reply within 3 hours`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- HEADER -->
    <div style="background:#0a0a0a;padding:32px 28px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#CDFF57;font-size:14px;font-weight:700;letter-spacing:0.15em;">THEBRANDFRIEND</h1>
    </div>

    <!-- BODY -->
    <div style="background:#ffffff;padding:36px 28px;border-radius:0 0 8px 8px;">
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111;">Hey ${name.split(' ')[0]} 👋</h2>

      <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#444;">
        We've received your project brief and our team is already reviewing it.
        You'll hear back from us <strong>within 3 hours</strong> during business hours.
      </p>

      <!-- SUBMISSION SUMMARY -->
      <div style="background:#f9f9f9;border:1px solid #eee;border-radius:6px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 4px;color:#999;font-size:11px;font-weight:700;letter-spacing:0.12em;">WHAT YOU SUBMITTED</p>
        <p style="margin:8px 0 4px;color:#999;font-size:13px;">SERVICE: <strong style="color:#333;">${service}</strong></p>
        ${designLine}
      </div>

      <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#444;">
        In the meantime, check out our <a href="https://thebrandfriend.com/designs/" style="color:#0066ff;text-decoration:none;font-weight:600;">Design Library</a> for more inspiration.
      </p>

      <p style="margin:24px 0 0;font-size:14px;color:#888;">
        — The Brand Friend Team
      </p>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;padding:20px;font-size:11px;color:#aaa;">
      <p style="margin:0;">TheBrandFriend · Premium Digital Agency</p>
      <p style="margin:4px 0 0;"><a href="https://thebrandfriend.com" style="color:#888;">thebrandfriend.com</a></p>
    </div>
  </div>
</body>
</html>`,
  };
}

/**
 * Internal alert email sent to the team when a new lead comes in.
 */
export function buildTeamAlertEmail({ name, email, phone, service, design, brief }) {
  const designRow = design
    ? `<tr><td style="padding:8px 12px;color:#999;font-size:12px;font-weight:700;letter-spacing:0.08em;white-space:nowrap;vertical-align:top;">DESIGN</td><td style="padding:8px 12px;font-size:14px;color:#fff;">${design.replace(/-/g, ' ').toUpperCase()}</td></tr>`
    : '';

  const phoneRow = phone
    ? `<tr><td style="padding:8px 12px;color:#999;font-size:12px;font-weight:700;letter-spacing:0.08em;white-space:nowrap;">PHONE</td><td style="padding:8px 12px;font-size:14px;color:#fff;"><a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="color:#CDFF57;text-decoration:none;">${phone}</a></td></tr>`
    : '';

  return {
    subject: `🔥 New Lead: ${name} — ${service}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- HEADER -->
    <div style="background:#CDFF57;padding:16px 20px;border-radius:6px 6px 0 0;">
      <h1 style="margin:0;color:#0a0a0a;font-size:13px;font-weight:700;letter-spacing:0.15em;">🔥 NEW LEAD RECEIVED</h1>
    </div>

    <!-- LEAD CARD -->
    <div style="background:#1a1a1a;padding:24px 0;border:1px solid #333;border-top:none;border-radius:0 0 6px 6px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 12px;color:#999;font-size:12px;font-weight:700;letter-spacing:0.08em;white-space:nowrap;">NAME</td>
          <td style="padding:8px 12px;font-size:14px;color:#fff;font-weight:600;">${name}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#999;font-size:12px;font-weight:700;letter-spacing:0.08em;white-space:nowrap;">EMAIL</td>
          <td style="padding:8px 12px;font-size:14px;"><a href="mailto:${email}" style="color:#CDFF57;text-decoration:none;">${email}</a></td>
        </tr>
        ${phoneRow}
        <tr>
          <td style="padding:8px 12px;color:#999;font-size:12px;font-weight:700;letter-spacing:0.08em;white-space:nowrap;">SERVICE</td>
          <td style="padding:8px 12px;font-size:14px;color:#fff;">${service}</td>
        </tr>
        ${designRow}
      </table>

      <!-- BRIEF -->
      <div style="margin:16px 12px 0;padding:16px;background:#111;border:1px solid #333;border-radius:4px;">
        <p style="margin:0 0 6px;color:#999;font-size:11px;font-weight:700;letter-spacing:0.1em;">PROJECT BRIEF</p>
        <p style="margin:0;color:#ddd;font-size:14px;line-height:1.65;white-space:pre-wrap;">${brief}</p>
      </div>
    </div>

    <!-- ACTION -->
    <div style="text-align:center;padding:24px;">
      <a href="mailto:${email}?subject=Re: Your project with TheBrandFriend" style="display:inline-block;background:#CDFF57;color:#0a0a0a;padding:12px 32px;border-radius:6px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-decoration:none;">REPLY TO LEAD →</a>
    </div>

    <p style="text-align:center;font-size:11px;color:#555;margin:0;">
      This lead was submitted at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </p>
  </div>
</body>
</html>`,
  };
}
