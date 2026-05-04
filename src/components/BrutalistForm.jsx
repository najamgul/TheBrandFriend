'use client';
import { useSearchParams } from 'next/navigation';
import { designs } from '@/data/designs';

export default function BrutalistForm({ variant = 'hero' }) {
  const searchParams = useSearchParams();
  const designParam = searchParams.get('design') || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const origText = btn.textContent;
    btn.textContent = 'SENT ✓';
    btn.style.background = '#CCFF00';
    btn.style.color = '#000';
    setTimeout(() => {
      btn.textContent = origText;
      btn.style.background = '';
      btn.style.color = '';
      e.target.reset();
    }, 3000);
  };

  if (variant === 'hero') {
    return (
      <form className="brutalist-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="YOUR@EMAIL.COM"
          className="brutal-input"
          required
          aria-label="Email address"
        />
        <button type="submit" className="brutal-submit">LET&apos;S GO →</button>
      </form>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="mono" htmlFor="contact-name">YOUR NAME</label>
          <input type="text" id="contact-name" placeholder="JOHN DOE" required />
        </div>
        <div className="form-group">
          <label className="mono" htmlFor="contact-email">EMAIL</label>
          <input type="email" id="contact-email" placeholder="JOHN@COMPANY.COM" required />
        </div>
      </div>
      <div className="form-group">
        <label className="mono" htmlFor="contact-service">SERVICE NEEDED</label>
        <select id="contact-service" required>
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
      {designParam && (
        <div className="form-group">
          <label className="mono" htmlFor="contact-design">PREFERRED DESIGN</label>
          <select id="contact-design" defaultValue={designParam}>
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
        <textarea id="contact-brief" placeholder="TELL US ABOUT YOUR PROJECT, GOALS, AND TIMELINE..." required></textarea>
      </div>
      <button type="submit" className="btn-submit">SEND IT →</button>
    </form>
  );
}
