'use client';
import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { designs } from '@/data/designs';

// ─── Validation helpers ─────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

function validateEmail(v) {
  if (!v) return 'Email is required';
  if (!EMAIL_RE.test(v)) return 'Please enter a valid email address';
  return '';
}

function validatePhone(v) {
  if (!v) return ''; // optional
  // Strip non-digit for length check
  const digits = v.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return 'Phone number must be 7–15 digits';
  if (!PHONE_RE.test(v)) return 'Only digits, spaces, +, -, (, ) allowed';
  return '';
}

function validateName(v) {
  if (!v || !v.trim()) return 'Name is required';
  if (v.trim().length < 2) return 'Name is too short';
  return '';
}

function validateBrief(v) {
  if (!v || !v.trim()) return 'Project brief is required';
  if (v.trim().length < 10) return 'Please describe your project in at least 10 characters';
  return '';
}

// ─── Phone input: digits-only keyfilter ─────────────────────
function handlePhoneKeyDown(e) {
  // Allow: backspace, delete, tab, escape, enter, arrows, home, end
  const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (allowed.includes(e.key)) return;
  // Allow Ctrl/Cmd + A/C/V/X
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
  // Allow: digits, +, -, (, ), space
  if (/[\d+\-() ]/.test(e.key)) return;
  // Block everything else
  e.preventDefault();
}

function handlePhonePaste(e) {
  const pasted = e.clipboardData.getData('text');
  // Strip anything that's not a digit, +, -, (, ), space
  const cleaned = pasted.replace(/[^\d+\-() ]/g, '');
  if (cleaned !== pasted) {
    e.preventDefault();
    document.execCommand('insertText', false, cleaned);
  }
}

// ═════════════════════════════════════════════════════════════
export default function BrutalistForm({ variant = 'hero' }) {
  const searchParams = useSearchParams();
  const designParam = searchParams.get('design') || '';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // reCAPTCHA v3 — returns null if provider not available (dev mode)
  let executeRecaptcha = null;
  try {
    const rc = useGoogleReCaptcha();
    executeRecaptcha = rc?.executeRecaptcha;
  } catch {
    // Provider not mounted (dev mode without key)
  }

  // ─── Get reCAPTCHA token ────────────────────────────────
  const getRecaptchaToken = useCallback(async (action) => {
    if (!executeRecaptcha) return null; // dev mode: skip
    try {
      return await executeRecaptcha(action);
    } catch {
      return null;
    }
  }, [executeRecaptcha]);

  // ── Hero variant (email-only quick form) ──
  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value.trim();

    // Validate
    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setError('');

    try {
      const token = await getRecaptchaToken('hero_submit');

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Quick Inquiry',
          email,
          service: 'General Inquiry',
          brief: 'Submitted via hero quick form — follow up needed.',
          recaptchaToken: token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSubmitted(true);
      e.target.reset();
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Full contact form ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Gather values
    const name = e.target.querySelector('#contact-name').value;
    const email = e.target.querySelector('#contact-email').value;
    const phone = e.target.querySelector('#contact-phone')?.value || '';
    const service = e.target.querySelector('#contact-service').value;
    const design = e.target.querySelector('#contact-design')?.value || '';
    const brief = e.target.querySelector('#contact-brief').value;
    const consent = e.target.querySelector('#contact-consent')?.checked || false;

    // Validate all fields
    const errors = {};
    const nameErr = validateName(name);
    if (nameErr) errors.name = nameErr;
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(phone);
    if (phoneErr) errors.phone = phoneErr;
    if (!service) errors.service = 'Please select a service';
    const briefErr = validateBrief(brief);
    if (briefErr) errors.brief = briefErr;
    if (!consent) errors.consent = 'You must agree to be contacted';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error
      const firstKey = Object.keys(errors)[0];
      document.getElementById(`contact-${firstKey}`)?.focus();
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const token = await getRecaptchaToken('contact_submit');

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
          recaptchaToken: token,
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
  };

  // ── Hero variant ──
  if (variant === 'hero') {
    return (
      <form className="brutalist-form" onSubmit={handleHeroSubmit} noValidate>
        <input
          type="email"
          placeholder="YOUR@EMAIL.COM"
          className={`brutal-input ${fieldErrors.email ? 'input-error' : ''}`}
          required
          disabled={submitting}
          aria-label="Email address"
          aria-invalid={!!fieldErrors.email}
        />
        <button type="submit" className="brutal-submit" disabled={submitting}>
          {submitting ? 'SENDING...' : submitted ? 'SENT ✓' : 'LET\'S GO →'}
        </button>
        {fieldErrors.email && <p className="field-error mono">{fieldErrors.email}</p>}
        {error && <p className="form-error mono">{error}</p>}
      </form>
    );
  }

  // ── Success state ──
  if (submitted) {
    return (
      <div className="form-success">
        <div className="form-success-icon">✓</div>
        <h3 className="ranchers">BRIEF RECEIVED!</h3>
        <p className="mono">We&apos;ll get back to you within 3 hours during business hours. Check your email for a confirmation.</p>
      </div>
    );
  }

  // ── Full form ──
  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label className="mono" htmlFor="contact-name">YOUR NAME</label>
          <input
            type="text"
            id="contact-name"
            placeholder="JOHN DOE"
            required
            disabled={submitting}
            className={fieldErrors.name ? 'input-error' : ''}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && <p className="field-error mono">{fieldErrors.name}</p>}
        </div>
        <div className="form-group">
          <label className="mono" htmlFor="contact-email">EMAIL</label>
          <input
            type="email"
            id="contact-email"
            placeholder="JOHN@COMPANY.COM"
            required
            disabled={submitting}
            className={fieldErrors.email ? 'input-error' : ''}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && <p className="field-error mono">{fieldErrors.email}</p>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="mono" htmlFor="contact-phone">PHONE / WHATSAPP <span style={{ opacity: 0.4 }}>(OPTIONAL)</span></label>
          <input
            type="tel"
            id="contact-phone"
            placeholder="+91 98765 43210"
            disabled={submitting}
            inputMode="tel"
            onKeyDown={handlePhoneKeyDown}
            onPaste={handlePhonePaste}
            className={fieldErrors.phone ? 'input-error' : ''}
            aria-invalid={!!fieldErrors.phone}
          />
          {fieldErrors.phone && <p className="field-error mono">{fieldErrors.phone}</p>}
        </div>
        <div className="form-group">
          <label className="mono" htmlFor="contact-service">SERVICE NEEDED</label>
          <select
            id="contact-service"
            required
            disabled={submitting}
            className={fieldErrors.service ? 'input-error' : ''}
            aria-invalid={!!fieldErrors.service}
          >
            <option value="">SELECT A SERVICE</option>
            <option>WEBSITE DEVELOPMENT</option>
            <option>SOFTWARE SOLUTIONS</option>
            <option>SOCIAL MEDIA MANAGEMENT</option>
            <option>PERFORMANCE MARKETING</option>
            <option>PRODUCT REELS</option>
            <option>BRAND IDENTITY</option>
            <option>FULL DIGITAL PACKAGE</option>
          </select>
          {fieldErrors.service && <p className="field-error mono">{fieldErrors.service}</p>}
        </div>
      </div>
      {designParam && (
        <div className="form-group">
          <label className="mono" htmlFor="contact-design">PREFERRED DESIGN</label>
          <select id="contact-design" defaultValue={designParam} disabled={submitting}>
            <option value="">SELECT A DESIGN</option>
            {designs.map(d => (
              <option key={d.slug} value={d.slug}>
                {d.name.toUpperCase()} — {d.style}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="form-group">
        <label className="mono" htmlFor="contact-brief">PROJECT BRIEF</label>
        <textarea
          id="contact-brief"
          placeholder="TELL US ABOUT YOUR PROJECT, GOALS, AND TIMELINE..."
          required
          disabled={submitting}
          className={fieldErrors.brief ? 'input-error' : ''}
          aria-invalid={!!fieldErrors.brief}
        ></textarea>
        {fieldErrors.brief && <p className="field-error mono">{fieldErrors.brief}</p>}
      </div>
      <div className={`consent-group ${fieldErrors.consent ? 'consent-error' : ''}`}>
        <label className="consent-label" htmlFor="contact-consent">
          <input
            type="checkbox"
            id="contact-consent"
            disabled={submitting}
            className="consent-checkbox"
          />
          <span className="consent-checkmark"></span>
          <span className="consent-text mono">
            I consent to being contacted by <strong>The Brand Friend</strong> via phone call, SMS, or WhatsApp for follow-up regarding my inquiry.
          </span>
        </label>
        {fieldErrors.consent && <p className="field-error mono">{fieldErrors.consent}</p>}
      </div>
      {error && <p className="form-error mono">{error}</p>}
      <button type="submit" className="btn-submit" disabled={submitting}>
        {submitting ? 'SENDING...' : 'SEND IT →'}
      </button>
      <p className="recaptcha-notice mono">
        Protected by reCAPTCHA. Google{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy</a> &{' '}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms</a>.
      </p>
    </form>
  );
}
