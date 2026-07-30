'use client';

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { designs } from '@/data/designs';

/* ─── Validation ──────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

const validateEmail = v =>
  !v ? 'Email is required' : !EMAIL_RE.test(v) ? 'Please enter a valid email address' : '';

function validatePhone(v) {
  if (!v) return '';
  const digits = v.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return 'Phone number must be 7–15 digits';
  if (!PHONE_RE.test(v)) return 'Only digits, spaces, +, -, ( and ) are allowed';
  return '';
}

const validateName = v =>
  !v || !v.trim() ? 'Name is required' : v.trim().length < 2 ? 'Name is too short' : '';

const validateBrief = v =>
  !v || !v.trim() ? 'A short brief is required'
  : v.trim().length < 10 ? 'Please describe the project in at least 10 characters'
  : '';

/* Keep the phone field to characters a phone number can actually contain. */
function handlePhoneKeyDown(e) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (allowed.includes(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
  if (/[\d+\-() ]/.test(e.key)) return;
  e.preventDefault();
}

function handlePhonePaste(e) {
  const pasted = e.clipboardData.getData('text');
  const cleaned = pasted.replace(/[^\d+\-() ]/g, '');
  if (cleaned !== pasted) {
    e.preventDefault();
    document.execCommand('insertText', false, cleaned);
  }
}

/* ─────────────────────────────────────────────────────────────────────── */

export default function LeadForm({ variant = 'inline' }) {
  const searchParams = useSearchParams();
  const designParam = searchParams.get('design') || '';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // reCAPTCHA v3 — absent in dev when no key is configured.
  let executeRecaptcha = null;
  try {
    executeRecaptcha = useGoogleReCaptcha()?.executeRecaptcha;
  } catch {
    /* provider not mounted */
  }

  const getToken = useCallback(async action => {
    if (!executeRecaptcha) return null;
    try { return await executeRecaptcha(action); } catch { return null; }
  }, [executeRecaptcha]);

  /* ── Inline (single email field, used in the hero) ── */

  async function handleInlineSubmit(e) {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    const email = input.value.trim();

    const emailErr = validateEmail(email);
    if (emailErr) return setFieldErrors({ email: emailErr });

    setFieldErrors({});
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Quick Inquiry',
          email,
          service: 'General Inquiry',
          brief: 'Submitted via the homepage inline form — follow up needed.',
          recaptchaToken: await getToken('hero_submit'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSubmitted(true);
      e.target.reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (variant === 'inline') {
    return (
      <div>
        <form className="inlineform" onSubmit={handleInlineSubmit} noValidate>
          <div className="field">
            <label className="sr-only" htmlFor="lead-email">Your email address</label>
            <input
              id="lead-email"
              type="email"
              placeholder="you@company.com"
              className={fieldErrors.email ? 'input-error' : ''}
              disabled={submitting}
              aria-invalid={!!fieldErrors.email}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Sending' : submitted ? 'Received' : 'Start a conversation'}
            {!submitting && !submitted && <span className="btn__arrow" aria-hidden="true">→</span>}
          </button>
        </form>
        {fieldErrors.email && <p className="formerror">{fieldErrors.email}</p>}
        {error && <p className="formerror">{error}</p>}
        {submitted && <p className="formnote">Thanks — we&apos;ll reply within one business day.</p>}
      </div>
    );
  }

  /* ── Full brief ── */

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const q = id => e.target.querySelector(`#contact-${id}`);
    const name = q('name').value;
    const email = q('email').value;
    const phone = q('phone')?.value || '';
    const service = q('service').value;
    const design = q('design')?.value || '';
    const brief = q('brief').value;
    const consent = q('consent')?.checked || false;

    const errors = {};
    const nameErr = validateName(name); if (nameErr) errors.name = nameErr;
    const emailErr = validateEmail(email); if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(phone); if (phoneErr) errors.phone = phoneErr;
    if (!service) errors.service = 'Please choose a service';
    const briefErr = validateBrief(brief); if (briefErr) errors.brief = briefErr;
    if (!consent) errors.consent = 'We need your consent before we can get in touch';

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      q(Object.keys(errors)[0])?.focus();
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          service: service.trim(),
          design,
          contactConsent: consent,
          brief: brief.trim(),
          recaptchaToken: await getToken('contact_submit'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSubmitted(true);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="formsuccess">
        <div className="formsuccess__mark" aria-hidden="true">✓</div>
        <h2 className="h2" style={{ marginBottom: 'var(--s-3)' }}>Brief received</h2>
        <p className="muted" style={{ maxWidth: '38ch', margin: '0 auto' }}>
          We read every one properly. Expect a reply within one business day —
          there&apos;s a confirmation in your inbox in the meantime.
        </p>
      </div>
    );
  }

  return (
    <form className="contactform" onSubmit={handleSubmit} noValidate>
      <div className="formrow">
        <div className="field">
          <label className="label" htmlFor="contact-name">Name</label>
          <input id="contact-name" type="text" placeholder="Your name" required disabled={submitting}
                 className={fieldErrors.name ? 'input-error' : ''} aria-invalid={!!fieldErrors.name} />
          {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
        </div>
        <div className="field">
          <label className="label" htmlFor="contact-email">Email</label>
          <input id="contact-email" type="email" placeholder="you@company.com" required disabled={submitting}
                 className={fieldErrors.email ? 'input-error' : ''} aria-invalid={!!fieldErrors.email} />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>
      </div>

      <div className="formrow">
        <div className="field">
          <label className="label" htmlFor="contact-phone">Phone or WhatsApp <span className="muted">(optional)</span></label>
          <input id="contact-phone" type="tel" placeholder="+91 98765 43210" disabled={submitting} inputMode="tel"
                 onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste}
                 className={fieldErrors.phone ? 'input-error' : ''} aria-invalid={!!fieldErrors.phone} />
          {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
        </div>
        <div className="field">
          <label className="label" htmlFor="contact-service">What do you need?</label>
          <select id="contact-service" required disabled={submitting}
                  className={fieldErrors.service ? 'input-error' : ''} aria-invalid={!!fieldErrors.service}>
            <option value="">Choose one</option>
            <option>Website development</option>
            <option>Software solutions</option>
            <option>Social media management</option>
            <option>Performance marketing</option>
            <option>Product reels &amp; video</option>
            <option>Brand identity</option>
            <option>The full engagement</option>
          </select>
          {fieldErrors.service && <p className="field-error">{fieldErrors.service}</p>}
        </div>
      </div>

      {designParam && (
        <div className="field">
          <label className="label" htmlFor="contact-design">Design system you liked</label>
          <select id="contact-design" defaultValue={designParam} disabled={submitting}>
            <option value="">Choose one</option>
            {designs.map(d => (
              <option key={d.slug} value={d.slug}>{d.name} — {d.style.toLowerCase()}</option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label className="label" htmlFor="contact-brief">The brief</label>
        <textarea id="contact-brief" required disabled={submitting}
                  placeholder="What are you building, who is it for, and when does it need to be live?"
                  className={fieldErrors.brief ? 'input-error' : ''} aria-invalid={!!fieldErrors.brief} />
        {fieldErrors.brief && <p className="field-error">{fieldErrors.brief}</p>}
      </div>

      <div className={`consent-group${fieldErrors.consent ? ' consent-error' : ''}`}>
        <label className="consent-label" htmlFor="contact-consent">
          <input type="checkbox" id="contact-consent" className="consent-checkbox" disabled={submitting} />
          <span className="consent-checkmark" />
          <span className="consent-text">
            I&apos;m happy for <strong>TheBrandFriend</strong> to contact me by phone, SMS or
            WhatsApp about this enquiry.
          </span>
        </label>
        {fieldErrors.consent && <p className="field-error">{fieldErrors.consent}</p>}
      </div>

      {error && <p className="formerror">{error}</p>}

      <button type="submit" className="btn" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
        {submitting ? 'Sending' : 'Send the brief'}
        {!submitting && <span className="btn__arrow" aria-hidden="true">→</span>}
      </button>

      <p className="recaptcha-notice">
        Protected by reCAPTCHA — Google{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy</a> and{' '}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms</a> apply.
      </p>
    </form>
  );
}
