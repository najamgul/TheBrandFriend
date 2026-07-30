import Link from 'next/link';
import { Suspense } from 'react';

import { services } from '@/data/services';
import { designs } from '@/data/designs';
import { getSupabase } from '../../lib/supabase';
import LeadForm from '@/components/LeadForm';
/* Server-renders to the gradient div that doubles as the no-WebGL fallback;
   three.js itself is imported inside the effect, so it never touches the
   initial bundle or the critical path. */
import HeroCanvas from '@/components/HeroCanvas';

export const revalidate = 60;

const PROCESS = [
  {
    step: '01',
    name: 'Read the room',
    desc: 'Before anything is drawn we work out what the business actually needs to be true — who is buying, what they already believe, and what this has to change about that.',
  },
  {
    step: '02',
    name: 'Design the system',
    desc: 'Not a page: a system. Type scale, palette, grid, motion, and the rules that hold when you add the twentieth page. You sign it off before production code exists.',
  },
  {
    step: '03',
    name: 'Build and hand over',
    desc: 'Hand-written Next.js, measured against Core Web Vitals rather than a screenshot. You get the code, the design files, and documentation you could hand to another studio.',
  },
];

async function getWork() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('is_visible', true)
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .limit(4);

    if (error) {
      console.error('[Home] Supabase error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[Home] Failed to fetch work:', err.message);
    return [];
  }
}

export default async function HomePage() {
  const work = await getWork();

  return (
    <>
      {/* ── STAGE ────────────────────────────────────────────────────── */}
      <section className="stage">
        <HeroCanvas />

        <div className="wrap stage__top">
          <p className="label stage__eyebrow">
            <span className="hero__dot" aria-hidden="true" />
            Independent design &amp; engineering studio
          </p>
        </div>

        <div className="wrap">
          {/* Plain server-rendered text. The shader sits behind it, so the
              headline is readable with JavaScript disabled or still loading. */}
          <h1 className="display stage__title">
            We build the
            <br />
            <em>unmissable</em>.
          </h1>

          <div className="stage__foot">
            <p className="lede">
              Brand systems, websites and film for companies that intend to be around
              in ten years. Everything you just watched this page do, we can do for you.
            </p>

            <p className="formnote">
              Twelve design systems in the library.
              <br />
              <Link href="/designs/" className="ulink">See all of them →</Link>
            </p>

            <div className="scrollcue label">
              <span className="scrollcue__rail" aria-hidden="true" />
              Scroll
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map(dup => (
            <div className="marquee__item" key={dup}>
              {['Brand identity', 'Websites', 'Design systems', 'Software', 'Campaigns', 'Film']
                .map(w => <span key={w}>{w}</span>)}
            </div>
          ))}
        </div>
      </div>

      {/* ── WORK ─────────────────────────────────────────────────────── */}
      {work.length > 0 && (
        <section className="section">
          <div className="wrap">
            <header className="sec-head" data-reveal>
              <h2 className="h2">Selected work</h2>
              <span className="label sec-head__index">(01) Projects</span>
            </header>

            <div className="work">
              {work.map((item, i) => (
                <article className="workitem" key={item.id} data-reveal>
                  <div className="workitem__media" data-parallax={i % 2 ? '0.1' : '0.16'}>
                    {item.media_type === 'video' ? (
                      <video src={item.media_url} poster={item.thumbnail_url || undefined}
                             muted playsInline loop preload="metadata" />
                    ) : item.media_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.media_url} alt={item.title} loading="lazy" />
                    ) : (
                      <div className="workitem__ph"><span>{item.title?.slice(0, 2)}</span></div>
                    )}
                  </div>

                  <div>
                    <span className="label workitem__index">
                      {String(i + 1).padStart(2, '0')}
                      {item.client_name ? ` — ${item.client_name}` : ''}
                    </span>
                    <h3 className="h2 workitem__title">{item.title}</h3>
                    {item.description && <p className="workitem__desc">{item.description}</p>}
                    {item.category && (
                      <div className="workitem__tags">
                        <span className="tagpill">{item.category.replace(/-/g, ' ')}</span>
                      </div>
                    )}
                    <Link href="/portfolio/" className="ulink label">View project</Link>
                  </div>
                </article>
              ))}
            </div>

            <p style={{ marginTop: 'var(--s-8)' }} data-reveal>
              <Link href="/portfolio/" className="btn btn--ghost">
                All work
                <span className="btn__arrow" aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* ── CAPABILITIES ─────────────────────────────────────────────── */}
      <section className="section section--alt">
        <div className="wrap">
          <header className="sec-head" data-reveal>
            <h2 className="h2">What we do</h2>
            <span className="label sec-head__index">
              ({work.length > 0 ? '02' : '01'}) Capabilities
            </span>
          </header>

          <div className="caps">
            {services.map(s => (
              <Link key={s.slug} href={`/services/${s.slug}/`} className="cap" data-reveal>
                <span className="label cap__num">{s.num}</span>
                <h3 className="h3">{s.name}</h3>
                <p className="cap__desc">{s.shortDesc}</p>
                <span className="label cap__go" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SYSTEMS ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <header className="sec-head" data-reveal>
            <h2 className="h2">The library</h2>
            <span className="label sec-head__index">
              ({work.length > 0 ? '03' : '02'}) Design systems
            </span>
          </header>

          <p className="prose muted" data-reveal style={{ marginBottom: 'var(--s-8)' }}>
            Most studios have one house style and bend every client into it. We keep
            twelve, each a complete working system. The switcher at the bottom of this
            page runs the site through eight of them — that is not a demo, it is the
            same code we ship.
          </p>

          <div className="syslist">
            {designs.map((d, i) => (
              <Link key={d.slug} href="/designs/" className="syscard" data-reveal
                    style={{
                      '--reveal-delay': `${Math.min(i, 8) * 45}ms`,
                      background: d.colors[0],
                      color: d.colors[1],
                    }}>
                {/* Drawn in its own system's colours, not the page's. */}
                <span className="label syscard__style" style={{ color: d.colors[2] }}>{d.style}</span>
                <span className="syscard__name">{d.name}</span>
                <span className="syscard__swatches" aria-hidden="true">
                  {d.colors.map(c => <i key={c} style={{ background: c }} />)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────────────── */}
      <section className="section section--alt">
        <div className="wrap">
          <header className="sec-head" data-reveal>
            <h2 className="h2">How it goes</h2>
            <span className="label sec-head__index">
              ({work.length > 0 ? '04' : '03'}) Process
            </span>
          </header>

          <div className="cardgrid cardgrid--3">
            {PROCESS.map((p, i) => (
              <div className="card" key={p.step} data-reveal style={{ '--reveal-delay': `${i * 90}ms` }}>
                <span className="label card__num">{p.step}</span>
                <h3 className="h3">{p.name}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 'var(--s-8)' }} data-reveal>
            <Link href="/process/" className="btn btn--ghost">
              The long version
              <span className="btn__arrow" aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="cta">
        <div className="wrap">
          <h2 className="display cta__title" data-reveal>
            Let&apos;s build
            <br />
            something durable.
          </h2>
          <p className="cta__sub" data-reveal style={{ '--reveal-delay': '80ms' }}>
            Tell us what you&apos;re making and when it needs to be live. We&apos;ll tell
            you honestly whether we&apos;re the right studio for it.
          </p>
          <div data-reveal style={{ '--reveal-delay': '140ms', maxWidth: '34rem', margin: '0 auto' }}>
            <Suspense fallback={null}>
              <LeadForm variant="inline" />
            </Suspense>
          </div>
          <p className="cta__mail" data-reveal>
            or write to{' '}
            <a href="mailto:care@thebrandfriend.com" className="ulink">care@thebrandfriend.com</a>
          </p>
        </div>
      </section>
    </>
  );
}
