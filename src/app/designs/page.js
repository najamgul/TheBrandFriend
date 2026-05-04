import Link from 'next/link';
import { designs } from '@/data/designs';
import CreattieEmbed from '@/components/CreattieEmbed';

export const metadata = {
  title: 'Design Library — Pick Your Website Style',
  description: 'Browse 10 handcrafted website designs. Pick a style you love, and we\'ll build your brand around it — delivered in 3 days.',
  keywords: 'website design templates, website styles, design picker, website inspiration, TheBrandFriend designs',
};

export default function DesignsPage() {
  return (
    <>
      <section className="hero" style={{ minHeight: 'auto' }}>
        <div className="hero-layout">
          <div className="hero-inner">
            <div className="sticker sticker-hero" style={{ '--rot': '-2deg' }}>
              <span className="mono">🎨 PICK YOUR VIBE</span>
            </div>
            <h1 className="hero-headline">DESIGN<br /><span className="volt">LIBRARY</span></h1>
            <p className="hero-sub">
              <em>10 handcrafted design styles. Find the one that speaks to your brand. Click &ldquo;I Want This&rdquo; and we&apos;ll build it — in 3 days.</em>
            </p>
          </div>
          <div className="hero-anim">
            <CreattieEmbed src="https://ik.imagekit.io/creattie/main/saved_colors/145118/fOmq6VjhbpevoY1i.json" />
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="section-header">
          <span className="mono tag tag-volt">BROWSE STYLES</span>
          <h2 className="section-title ranchers">CHOOSE YOUR WEAPON</h2>
        </div>
        <div className="designs-grid">
          {designs.map((d, i) => (
            <div key={d.slug} className="design-card" id={`design-${d.slug}`}>
              <div className="design-preview">
                <iframe
                  src={`/designs/${d.slug}.html`}
                  title={`${d.name} — Design Preview`}
                  loading="lazy"
                  sandbox="allow-scripts"
                />
                <div className="design-preview-overlay">
                  <a
                    href={`/designs/${d.slug}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="design-view-btn mono"
                  >
                    VIEW FULL DEMO →
                  </a>
                </div>
              </div>
              <div className="design-info">
                <div className="design-meta">
                  <span className="design-num ranchers">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mono tag tag-volt design-style-tag">{d.style}</span>
                </div>
                <h3 className="design-name ranchers">{d.name}</h3>
                <p className="design-desc">{d.description}</p>
                <div className="design-colors">
                  {d.colors.map((c, j) => (
                    <span
                      key={j}
                      className="design-swatch"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
                <div className="design-fonts mono">
                  {d.fonts.join(' • ')}
                </div>
                <Link
                  href={`/contact/?design=${d.slug}`}
                  className="design-cta"
                >
                  I WANT THIS →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
