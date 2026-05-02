import Link from 'next/link';
import { services } from '@/data/services';
import CTABanner from '@/components/CTABanner';

export const metadata = {
  title: 'Digital Marketing & Web Development Services',
  description: 'Explore our full range of digital services — website development, software solutions, social media, performance marketing, product reels, and brand identity.',
  keywords: 'digital marketing services, web development services, social media management, brand identity design',
};

export default function ServicesPage() {
  return (
    <>
      <section className="hero" style={{ minHeight: 'auto' }}>
        <div className="hero-inner">
          <div className="sticker sticker-hero" style={{ '--rot': '-2deg' }}>
            <span className="mono">WHAT WE DO</span>
          </div>
          <h1 className="hero-headline">OUR<br /><span className="volt">SERVICES</span></h1>
          <p className="hero-sub">
            <em>Six core capabilities. One obsessive team. Every service engineered to make your brand dominate.</em>
          </p>
        </div>
      </section>

      <section className="section section-dark">
        <div className="services-grid">
          {services.map(s => (
            <Link key={s.slug} href={`/services/${s.slug}/`} className="service-card">
              <span className="service-num ranchers">{s.num}</span>
              <h2 className="mono service-name">{s.name.toUpperCase()}</h2>
              <p>{s.shortDesc}</p>
              <span className="service-arrow">{s.name.toUpperCase()} DETAILS →</span>
            </Link>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
