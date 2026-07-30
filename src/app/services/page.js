import Link from 'next/link';
import { services } from '@/data/services';
import CTABanner from '@/components/CTABanner';

export const metadata = {
  title: 'Services — Identity, websites, software and campaigns',
  description:
    'Six capabilities, one studio: brand identity, website development, software solutions, social media, performance marketing, and film. Explore what we do and how we work.',
  keywords: 'design studio services, web development, brand identity design, performance marketing, social media management',
  alternates: { canonical: '/services/' },
};

export default function ServicesPage() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <span className="label pagehead__label" data-reveal>Services</span>
          <h1 className="display pagehead__title" data-reveal style={{ '--reveal-delay': '60ms' }}>
            Six things,
            <br />
            done properly.
          </h1>
          <p className="lede pagehead__lede" data-reveal style={{ '--reveal-delay': '120ms' }}>
            We would rather be genuinely good at a short list than passable at a long one.
            Most engagements use two or three of these together.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="caps">
            {services.map(s => (
              <Link key={s.slug} href={`/services/${s.slug}/`} className="cap" data-reveal>
                <span className="label cap__num">{s.num}</span>
                <h2 className="h3">{s.name}</h2>
                <p className="cap__desc">{s.shortDesc}</p>
                <span className="label cap__go" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        title={<>Not sure which<br />you need?</>}
        sub="Describe the problem rather than the deliverable. Working out the right shape of the engagement is part of the job."
        cta="Send us the problem"
      />
    </>
  );
}
