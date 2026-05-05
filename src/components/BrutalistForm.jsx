'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { designs } from '@/data/designs';

export default function BrutalistForm({ variant = 'hero' }) {
  const searchParams = useSearchParams();
  const designParam = searchParams.get('design') || '';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // ── Hero variant (email-only quick form) ──
  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
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
          brief: 'Submitted via hero quick form — follow up needed.',
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
    setSubmitting(true);
    setError('');

    const formData = {
      name: e.target.querySelector('#contact-name').value,
      email: e.target.querySelector('#contact-email').value,
      phone: e.target.querySelector('#contact-phone')?.value || '',
      service: e.target.querySelector('#contact-service').value,
      design: e.target.querySelector('#contact-design')?.value || '',
      brief: e.target.querySelector('#contact-brief').value,
    };

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
      <form className="brutalist-form" onSubmit={handleHeroSubmit}>
        <input
          type="email"
          placeholder="YOUR@EMAIL.COM"
          className="brutal-input"
          required
          disabled={submitting}
          aria-label="Email address"
        />
        <button type="submit" className="brutal-submit" disabled={submitting}>
          {submitting ? 'SENDING...' : submitted ? 'SENT ✓' : 'LET\u0027S GO →'}
        </button>
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
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="mono" htmlFor="contact-name">YOUR NAME</label>
          <input type="text" id="contact-name" placeholder="JOHN DOE" required disabled={submitting} />
        </div>
        <div className="form-group">
          <label className="mono" htmlFor="contact-email">EMAIL</label>
          <input type="email" id="contact-email" placeholder="JOHN@COMPANY.COM" required disabled={submitting} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="mono" htmlFor="contact-phone">PHONE / WHATSAPP <span style={{ opacity: 0.4 }}>(OPTIONAL)</span></label>
          <input type="tel" id="contact-phone" placeholder="+91 98765 43210" disabled={submitting} />
        </div>
        <div className="form-group">
          <label className="mono" htmlFor="contact-service">SERVICE NEEDED</label>
          <select id="contact-service" required disabled={submitting}>
            <option value="">SELECT A SERVICE</option>
            <option>WEBSITE DEVELOPMENT</option>
            <option>SOFTWARE SOLUTIONS</option>
            <option>SOCIAL MEDIA MANAGEMENT</option>
            <option>PERFORMANCE MARKETING</option>
            <option>PRODUCT REELS</option>
            <option>BRAND IDENTITY</option>
            <option>FULL DIGITAL PACKAGE</option>
          </select>
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
        <textarea id="contact-brief" placeholder="TELL US ABOUT YOUR PROJECT, GOALS, AND TIMELINE..." required disabled={submitting}></textarea>
      </div>
      {error && <p className="form-error mono">{error}</p>}
      <button type="submit" className="btn-submit" disabled={submitting}>
        {submitting ? 'SENDING...' : 'SEND IT →'}
      </button>
    </form>
  );
}
