import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { sendGmail } from '../../../../lib/gmail';
import { buildAutoReplyEmail, buildTeamAlertEmail } from '../../../../lib/email-templates';

// ─── reCAPTCHA v3 verification ──────────────────────────────
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_THRESHOLD = 0.5; // score below this = likely bot

async function verifyRecaptcha(token) {
  if (!RECAPTCHA_SECRET) {
    // No secret configured — skip verification (dev mode)
    return { success: true, score: 1.0, action: 'dev' };
  }

  if (!token) {
    return { success: false, score: 0, error: 'Missing reCAPTCHA token' };
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`,
    });

    const data = await res.json();

    return {
      success: data.success && (data.score ?? 1.0) >= RECAPTCHA_THRESHOLD,
      score: data.score ?? 0,
      action: data.action,
      error: data['error-codes']?.join(', '),
    };
  } catch (err) {
    console.error('[Lead API] reCAPTCHA verification error:', err.message);
    // Fail open — don't block legitimate users due to Google API issues
    return { success: true, score: 0.5, error: 'verification_failed' };
  }
}

// ─── Input validation ───────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

function validateInput({ name, email, phone, service, brief }) {
  const errors = [];

  if (!name || !name.trim()) errors.push('Name is required');
  if (!email) {
    errors.push('Email is required');
  } else if (!EMAIL_RE.test(email)) {
    errors.push('Invalid email address');
  }
  if (phone && phone.trim()) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) errors.push('Phone number must be 7–15 digits');
    if (!PHONE_RE.test(phone.trim())) errors.push('Phone contains invalid characters');
  }
  if (!service || !service.trim()) errors.push('Service is required');
  if (!brief || !brief.trim()) errors.push('Project brief is required');

  return errors;
}

/**
 * POST /api/lead
 * Handles contact form submissions:
 *  1. Verifies reCAPTCHA v3 token
 *  2. Validates input
 *  3. Stores lead in Supabase
 *  4. Sends auto-reply email to prospect via Gmail API
 *  5. Sends internal alert email to team via Gmail API
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // ── 0. Verify reCAPTCHA ──
    const captcha = await verifyRecaptcha(body.recaptchaToken);
    if (!captcha.success) {
      console.warn('[Lead API] reCAPTCHA failed:', { score: captcha.score, error: captcha.error });
      return NextResponse.json(
        { error: 'Bot detection failed. Please refresh and try again.' },
        { status: 403 }
      );
    }

    // ── 1. Validate ──
    const { name, email, service, design, brief, phone } = body;

    const validationErrors = validateInput({ name, email, phone, service, brief });
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join('; ') },
        { status: 400 }
      );
    }

    // Sanitize
    const lead = {
      name: name.trim().slice(0, 200),
      email: email.trim().toLowerCase().slice(0, 320),
      service: service.trim().slice(0, 200),
      design: design ? design.trim().slice(0, 100) : null,
      brief: brief.trim().slice(0, 5000),
      phone: phone ? phone.trim().replace(/[^\d+\-() ]/g, '').slice(0, 20) : null,
      source: 'contact-form',
      status: 'new',
      recaptcha_score: captcha.score,
    };

    // ── 2. Store in Supabase ──
    let supabaseError = null;
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('leads').insert(lead);
      if (error) {
        console.error('[Lead API] Supabase insert error:', error.message);
        supabaseError = error.message;
      }
    } catch (err) {
      console.error('[Lead API] Supabase connection error:', err.message);
      supabaseError = err.message;
      // Don't fail the request — still send emails
    }

    // ── 3. Send Emails via Gmail API ──
    let emailError = null;
    try {
      const teamEmail = process.env.TEAM_EMAIL || 'care@thebrandfriend.com';
      const fromEmail = process.env.GMAIL_SENDER_EMAIL;

      if (!fromEmail) {
        throw new Error('Missing GMAIL_SENDER_EMAIL');
      }

      // Auto-reply to prospect
      const autoReply = buildAutoReplyEmail(lead);
      await sendGmail({
        from: fromEmail,
        to: lead.email,
        subject: autoReply.subject,
        html: autoReply.html,
      });

      // Internal alert to team
      const teamAlert = buildTeamAlertEmail(lead);
      await sendGmail({
        from: fromEmail,
        to: teamEmail,
        replyTo: lead.email, // Reply goes directly to the lead
        subject: teamAlert.subject,
        html: teamAlert.html,
      });
    } catch (err) {
      console.error('[Lead API] Email error:', err.message);
      emailError = err.message;
      // Don't fail the request — lead is already stored
    }

    // ── 4. Respond ──
    return NextResponse.json({
      success: true,
      message: 'Lead received successfully.',
      ...(supabaseError && { warning: 'Database write failed — emails were still sent.' }),
      ...(emailError && { warning: 'Email delivery failed — lead was still stored.' }),
    });

  } catch (err) {
    console.error('[Lead API] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
