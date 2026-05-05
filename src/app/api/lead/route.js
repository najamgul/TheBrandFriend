import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { buildAutoReplyEmail, buildTeamAlertEmail } from '@/lib/email-templates';

/**
 * POST /api/lead
 * Handles contact form submissions:
 *  1. Validates input
 *  2. Stores lead in Supabase
 *  3. Sends auto-reply email to prospect
 *  4. Sends internal alert email to team
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // ── 1. Validate ──
    const { name, email, service, design, brief, phone } = body;

    if (!name || !email || !service || !brief) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, service, brief' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
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
      phone: phone ? phone.trim().slice(0, 20) : null,
      source: 'contact-form',
      status: 'new',
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

    // ── 3. Send Emails via Resend ──
    let emailError = null;
    try {
      const resendKey = process.env.RESEND_API_KEY;
      const teamEmail = process.env.TEAM_EMAIL || 'hello@thebrandfriend.com';
      const fromEmail = process.env.FROM_EMAIL || 'TheBrandFriend <noreply@thebrandfriend.com>';

      if (!resendKey) {
        throw new Error('Missing RESEND_API_KEY');
      }

      const resend = new Resend(resendKey);

      // Auto-reply to prospect
      const autoReply = buildAutoReplyEmail(lead);
      await resend.emails.send({
        from: fromEmail,
        to: [lead.email],
        subject: autoReply.subject,
        html: autoReply.html,
      });

      // Internal alert to team
      const teamAlert = buildTeamAlertEmail(lead);
      await resend.emails.send({
        from: fromEmail,
        to: [teamEmail],
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
