/**
 * TheBrandFriend — Email Templates
 * Clean, professional emails optimized for deliverability.
 *
 * Anti-spam best practices applied:
 *   - No emojis in subjects
 *   - Minimal HTML — no heavy styling
 *   - Good text-to-image ratio (no images)
 *   - Short, clear content
 *   - Proper sender identity
 */

/**
 * Escape user input before interpolating into HTML to prevent XSS.
 */
function esc(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/**
 * Auto-reply email sent to the prospect immediately after form submission.
 */
export function buildAutoReplyEmail({ name, service, design }) {
  const safeName = esc(name);
  const firstName = esc((name || '').split(' ')[0]);
  const safeService = esc(service);
  const safeDesign = design ? esc(design.replace(/-/g, ' ').toUpperCase()) : '';

  const designLine = design
    ? `<p style="margin:0 0 4px;color:#666;font-size:14px;">Preferred Design: <strong style="color:#333;">${safeDesign}</strong></p>`
    : '';

  return {
    subject: `We received your brief, ${firstName} - here is what happens next`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- HEADER -->
    <div style="background:#111;padding:24px 28px;border-radius:6px 6px 0 0;">
      <p style="margin:0;color:#ccc;font-size:13px;font-weight:600;letter-spacing:0.1em;">THEBRANDFRIEND</p>
    </div>

    <!-- BODY -->
    <div style="background:#ffffff;padding:32px 28px;border-radius:0 0 6px 6px;">
      <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#111;">Hi ${firstName},</p>

      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">
        Thank you for reaching out. We have received your project brief and our team is reviewing it now.
        You will hear back from us <strong>within 3 hours</strong> during business hours (Mon-Sat, 10 AM - 7 PM IST).
      </p>

      <!-- SUBMISSION SUMMARY -->
      <div style="background:#f9f9f9;border:1px solid #eee;border-radius:6px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#888;font-size:12px;font-weight:600;letter-spacing:0.08em;">YOUR SUBMISSION</p>
        <p style="margin:0 0 4px;color:#666;font-size:14px;">Service: <strong style="color:#333;">${safeService}</strong></p>
        ${designLine}
      </div>

      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">
        In the meantime, you can browse our <a href="https://thebrandfriend.com/designs/" style="color:#2563eb;text-decoration:none;">Design Library</a> for inspiration.
      </p>

      <p style="margin:24px 0 0;font-size:14px;color:#888;">
        Best regards,<br>
        The Brand Friend Team
      </p>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;padding:20px;font-size:11px;color:#aaa;">
      <p style="margin:0;">TheBrandFriend - Premium Digital Agency</p>
      <p style="margin:4px 0 0;"><a href="https://thebrandfriend.com" style="color:#888;text-decoration:none;">thebrandfriend.com</a></p>
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
  const safeName = esc(name);
  const safeEmail = esc(email);
  const safeService = esc(service);
  const safeBrief = esc(brief);
  const safePhone = phone ? esc(phone) : '';
  const safePhoneDigits = phone ? phone.replace(/[^0-9]/g, '') : '';
  const safeDesign = design ? esc(design.replace(/-/g, ' ').toUpperCase()) : '';

  const designRow = design
    ? `<tr><td style="padding:6px 12px;color:#888;font-size:13px;">Design</td><td style="padding:6px 12px;font-size:14px;color:#333;">${safeDesign}</td></tr>`
    : '';

  const phoneRow = phone
    ? `<tr><td style="padding:6px 12px;color:#888;font-size:13px;">Phone</td><td style="padding:6px 12px;font-size:14px;"><a href="https://wa.me/${safePhoneDigits}" style="color:#2563eb;text-decoration:none;">${safePhone}</a></td></tr>`
    : '';

  return {
    subject: `New lead from ${safeName} - ${safeService}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- HEADER -->
    <div style="background:#111;padding:16px 20px;border-radius:6px 6px 0 0;">
      <p style="margin:0;color:#ccc;font-size:12px;font-weight:600;letter-spacing:0.1em;">NEW LEAD RECEIVED</p>
    </div>

    <!-- LEAD CARD -->
    <div style="background:#fff;padding:20px 0;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 6px 6px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 12px;color:#888;font-size:13px;">Name</td>
          <td style="padding:6px 12px;font-size:14px;color:#111;font-weight:600;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;color:#888;font-size:13px;">Email</td>
          <td style="padding:6px 12px;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#2563eb;text-decoration:none;">${safeEmail}</a></td>
        </tr>
        ${phoneRow}
        <tr>
          <td style="padding:6px 12px;color:#888;font-size:13px;">Service</td>
          <td style="padding:6px 12px;font-size:14px;color:#333;">${safeService}</td>
        </tr>
        ${designRow}
      </table>

      <!-- BRIEF -->
      <div style="margin:16px 12px 0;padding:12px 16px;background:#f9f9f9;border:1px solid #eee;border-radius:4px;">
        <p style="margin:0 0 6px;color:#888;font-size:12px;font-weight:600;">PROJECT BRIEF</p>
        <p style="margin:0;color:#333;font-size:14px;line-height:1.65;white-space:pre-wrap;">${safeBrief}</p>
      </div>
    </div>

    <!-- ACTION -->
    <div style="text-align:center;padding:20px;">
      <a href="mailto:${safeEmail}?subject=Re: Your project with TheBrandFriend" style="display:inline-block;background:#111;color:#fff;padding:10px 28px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;">Reply to Lead</a>
    </div>

    <p style="text-align:center;font-size:11px;color:#999;margin:0;">
      Submitted at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </p>
  </div>
</body>
</html>`,
  };
}
