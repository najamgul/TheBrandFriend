import Link from 'next/link';
import { services, getServiceBySlug, getRelatedServices } from '@/data/services';
import CTABanner from '@/components/CTABanner';
import CreattieEmbed from '@/components/CreattieEmbed';

export function generateStaticParams() {
  return services.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDesc,
    keywords: service.keywords,
    openGraph: {
      title: service.metaTitle,
      description: service.metaDesc,
    },
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return <div>Service not found</div>;

  const related = getRelatedServices(slug, 3);

  return (
    <>
      {/* Service Hero */}
      <section className="service-hero">
        <div className="hero-layout">
          <div className="service-hero-inner">
            <div className="sticker sticker-hero" style={{ '--rot': '-2deg' }}>
              <span className="mono">SERVICE {service.num}</span>
            </div>
            <h1 className="service-hero-title">{service.name.toUpperCase()}</h1>
            <p className="service-hero-desc">{service.longDesc}</p>
          </div>
          <div className="hero-anim">
            <CreattieEmbed src="https://ik.imagekit.io/creattie/main/saved_colors/145118/fOmq6VjhbpevoY1i.json" />
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="deliverables-section">
        <div className="deliverables-grid">
          <span className="mono tag tag-volt">WHAT YOU GET</span>
          <h2 className="ranchers" style={{ fontSize: 'clamp(32px, 5vw, 64px)', marginBottom: '32px', color: '#000' }}>
            DELIVERABLES
          </h2>
          {service.deliverables.map((item, i) => (
            <div key={i} className="deliverable-item">
              <span className="deliverable-check">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Related Services */}
      <section className="related-services">
        <span className="mono tag tag-white">EXPLORE MORE</span>
        <h2 className="ranchers" style={{ fontSize: 'clamp(32px, 5vw, 64px)', margin: '12px 0 32px' }}>
          RELATED SERVICES
        </h2>
        <div className="related-grid">
          {related.map(r => (
            <Link key={r.slug} href={`/services/${r.slug}/`} className="related-card">
              <h3>{r.name.toUpperCase()}</h3>
              <p>{r.shortDesc}</p>
              <span className="service-arrow" style={{ color: '#CCFF00', marginTop: '12px' }}>VIEW SERVICE →</span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: '32px' }}>
          <Link href="/services/" className="mono" style={{ color: '#CCFF00', fontSize: '11px' }}>← BACK TO ALL SERVICES</Link>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        headline={<>NEED<br />{service.name.split(' ')[0].toUpperCase()}<br /><span className="volt">HELP?</span></>}
        sub={`Let's talk about your ${service.name.toLowerCase()} needs. Free consultation.`}
        buttonText="GET A FREE CONSULTATION →"
      />
    </>
  );
}
