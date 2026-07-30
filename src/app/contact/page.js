import Link from 'next/link';
import { Suspense } from 'react';
import LeadForm from '@/components/LeadForm';

export const metadata = {
  title: 'Contact — Send us the brief',
  description:
    'Tell us what you are building and when it needs to be live. We reply within one business day with an honest read on whether we are the right studio for it.',
  keywords: 'contact design studio, project brief, hire web developer, hire branding agency',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <span className="label pagehead__label" data-reveal>Contact</span>
          <h1 className="display pagehead__title" data-reveal style={{ '--reveal-delay': '60ms' }}>
            Send us
            <br />
            the brief.
          </h1>
          <p className="lede pagehead__lede" data-reveal style={{ '--reveal-delay': '120ms' }}>
            Describe the problem rather than the deliverable — it tells us far more. We
            read every enquiry properly and reply within one business day.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap contactlayout">
          <div data-reveal>
            <Suspense fallback={null}>
              <LeadForm variant="full" />
            </Suspense>
          </div>

          <aside className="contactaside" data-reveal style={{ '--reveal-delay': '100ms' }}>
            <div>
              <h2 className="label muted">Email</h2>
              <a href="mailto:care@thebrandfriend.com" className="ulink contactaside__big">
                care@thebrandfriend.com
              </a>
            </div>

            <div>
              <h2 className="label muted">Response time</h2>
              <p>Within one business day, every time.</p>
            </div>

            <div>
              <h2 className="label muted">Before you write</h2>
              <div className="contactaside__links">
                <Link href="/process/" className="ulink">How a project runs</Link>
                <Link href="/services/" className="ulink">What we do</Link>
                <Link href="/designs/" className="ulink">The design library</Link>
              </div>
            </div>

            <div>
              <h2 className="label muted">Elsewhere</h2>
              <div className="contactaside__links">
                <a href="https://www.instagram.com/thebrandfriend.com_/" target="_blank" rel="noopener noreferrer" className="ulink">Instagram</a>
                <a href="https://www.linkedin.com/company/the-brand-friend" target="_blank" rel="noopener noreferrer" className="ulink">LinkedIn</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
