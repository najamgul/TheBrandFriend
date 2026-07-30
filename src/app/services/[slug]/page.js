import Link from 'next/link';
import { services, getServiceBySlug, getRelatedServices } from '@/data/services';
import CTABanner from '@/components/CTABanner';
import { SITE_URL as SITE } from '../../../../lib/site';

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
    alternates: { canonical: `/services/${slug}/` },
    openGraph: {
      type: 'website',
      url: `/services/${slug}/`,
      title: service.metaTitle,
      description: service.metaDesc,
    },
  };
}

function buildServiceSchema(service) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${SITE}/services/${service.slug}/#service`,
        name: service.name,
        description: service.longDesc || service.shortDesc,
        serviceType: service.name,
        url: `${SITE}/services/${service.slug}/`,
        provider: { '@id': `${SITE}/#organization` },
        areaServed: { '@type': 'Country', name: 'India' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${service.name} deliverables`,
          itemListElement: (service.deliverables || []).map(item => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: item },
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Services',
            item: `${SITE}/services/`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: service.name,
            item: `${SITE}/services/${service.slug}/`,
          },
        ],
      },
    ],
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return <div>Service not found</div>;

  const related = getRelatedServices(slug, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildServiceSchema(service)),
        }}
      />

      <section className="pagehead">
        <div className="wrap">
          <span className="label pagehead__label" data-reveal>
            Service {service.num} — <Link href="/services/" className="ulink">all services</Link>
          </span>
          <h1 className="display pagehead__title" data-reveal style={{ '--reveal-delay': '60ms' }}>
            {service.name}
          </h1>
          <p className="lede pagehead__lede" data-reveal style={{ '--reveal-delay': '120ms' }}>
            {service.longDesc}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="phase">
            <div>
              <span className="label phase__num" data-reveal>What you get</span>
              <h2 className="h1 phase__name" data-reveal style={{ '--reveal-delay': '60ms' }}>
                Deliverables
              </h2>
              <p className="prose muted" data-reveal style={{ '--reveal-delay': '120ms' }}>
                Every line below is scoped and priced up front. If something here is not
                relevant to you, we take it out rather than charge for it.
              </p>
            </div>
            <div className="checklist" data-reveal style={{ '--reveal-delay': '180ms' }}>
              {service.deliverables.map(item => (
                <div className="checkitem" key={item}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="wrap">
          <header className="sec-head" data-reveal>
            <h2 className="h2">Often paired with</h2>
            <span className="label sec-head__index">Related</span>
          </header>

          <div className="cardgrid cardgrid--3">
            {related.map((r, i) => (
              <Link key={r.slug} href={`/services/${r.slug}/`} className="card" data-reveal
                    style={{ '--reveal-delay': `${i * 80}ms` }}>
                <span className="label card__num">{r.num}</span>
                <h3 className="h3">{r.name}</h3>
                <p>{r.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        title={<>Need help with<br />{service.name.toLowerCase()}?</>}
        sub={`Tell us what you're trying to achieve. We'll come back with a shape, a timeline and a number.`}
      />
    </>
  );
}
