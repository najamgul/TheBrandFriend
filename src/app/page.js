import Link from 'next/link';
import { services } from '@/data/services';
import BrutalistForm from '@/components/BrutalistForm';
import CTABanner from '@/components/CTABanner';
import CreattieEmbed from '@/components/CreattieEmbed';

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-layout">
          <div className="hero-inner">
            <div className="sticker sticker-hero" style={{ '--rot': '-2deg' }}>
              <span className="mono">⚡ NOW ACCEPTING CLIENTS — Q2 2026</span>
            </div>
            <h1 className="hero-headline">
              WE SHIP<br />BRANDS THAT<br /><span className="volt">DOMINATE</span>
            </h1>
            <div className="delivery-badge">
              <span className="delivery-dot"></span>
              <span className="delivery-text">🚀 YOUR BRAND, LIVE IN <strong>3 DAYS</strong>. GUARANTEED.</span>
            </div>
            <p className="hero-sub">
              <em>Strategy. Design. Development. Marketing.<br />Everything your brand needs to break the internet.</em>
            </p>
            <BrutalistForm variant="hero" />
            <p className="tech-label">// 50+ BRANDS SHIPPED &bull; 3-DAY DELIVERY &bull; 24/7 SUPPORT</p>
          </div>
          <div className="hero-anim">
            <CreattieEmbed src="https://ik.imagekit.io/creattie/main/saved_colors/145118/wCSJQov3DLRpg8sp.json" />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="sticker-bar">
        <div className="sticker-bar-inner">
          {[
            { init: 'RS', quote: '"3X REVENUE IN 6 MONTHS. THESE GUYS DON\'T PLAY."', author: '— RAHUL S. / CEO, TECHVENTURES', rot: '-2deg' },
            { init: 'PM', quote: '"EVERY PIXEL, EVERY CAMPAIGN — PERFECTION."', author: '— PRIYA M. / FOUNDER, GLOWSKIN', rot: '1.5deg' },
            { init: 'AK', quote: '"ZERO TO DOMINANT IN UNDER A YEAR. REAL DEAL."', author: '— ARJUN K. / DIRECTOR, KAPOOR REALTY', rot: '-1deg' },
            { init: 'NJ', quote: '"FINALLY AN AGENCY THAT ACTUALLY SHIPS."', author: '— NEHA J. / CMO, FRESHBITE D2C', rot: '2deg' },
          ].map((t, i) => (
            <div key={i} className="sticker-card" style={{ '--rot': t.rot }}>
              <div className="sticker-avatar">{t.init}</div>
              <p className="mono sticker-quote">{t.quote}</p>
              <p className="mono sticker-author">{t.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="section section-dark" id="services">
        <div className="section-header">
          <span className="mono tag tag-volt">WHAT WE BUILD</span>
          <h2 className="section-title ranchers">SERVICES</h2>
        </div>
        <div className="services-grid">
          {services.map(s => (
            <Link key={s.slug} href={`/services/${s.slug}/`} className="service-card">
              <span className="service-num ranchers">{s.num}</span>
              <h3 className="mono service-name">{s.name.toUpperCase()}</h3>
              <p>{s.shortDesc}</p>
              <span className="service-arrow">LEARN MORE →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="section section-compare" id="compare">
        <div className="section-header">
          <span className="mono tag tag-white">THE DIFFERENCE</span>
          <h2 className="section-title ranchers" style={{ color: '#fff' }}>OLD VS NEW</h2>
        </div>
        {[
          { old: 'GENERIC\nTEMPLATES', better: 'CUSTOM\nBUILT' },
          { old: 'VANITY\nMETRICS', better: 'REAL\nROI' },
          { old: 'SLOW\nDELIVERY', better: 'RAPID\nSHIPPING' },
        ].map((row, i) => (
          <div key={i} className="compare-row">
            <div className="compare-old">
              <span className="mono compare-label">// THE OLD WAY</span>
              <h3 className="ranchers compare-title">{row.old.split('\n').map((l, j) => <span key={j}>{l}<br /></span>)}</h3>
            </div>
            <div className="compare-new">
              <span className="mono compare-label">// THE BETTER WAY</span>
              <h3 className="ranchers compare-title">{row.better.split('\n').map((l, j) => <span key={j}>{l}<br /></span>)}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* PROCESS PREVIEW */}
      <section className="section section-dark" id="process">
        <div className="section-header">
          <span className="mono tag tag-volt">HOW WE WORK</span>
          <h2 className="section-title ranchers">THE BLUEPRINT</h2>
        </div>
        <div className="process-grid">
          {[
            { step: '01', name: 'DISCOVER', desc: "Deep dive into your brand, audience, and goals. We don't assume — we research, analyze, and strategize.", rot: '-3deg' },
            { step: '02', name: 'DESIGN & BUILD', desc: 'Pixel-perfect mockups → clean code → blazing-fast performance. You see it before we ship it.', rot: '2deg' },
            { step: '03', name: 'LAUNCH & SCALE', desc: "Deploy, monitor, optimize, repeat. We don't disappear after delivery — we grow with you.", rot: '-2deg' },
          ].map((p, i) => (
            <div key={i} className="process-card">
              <div className="step-tag sticker" style={{ '--rot': p.rot }}><span className="mono">STEP {p.step}</span></div>
              <div className="process-watermark ranchers">{p.step}</div>
              <h3 className="mono process-name">{p.name}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <Link href="/process/" className="btn-submit">SEE FULL PROCESS →</Link>
        </div>
      </section>

      {/* STATS */}
      <section className="section section-volt">
        <div className="section-header">
          <span className="mono tag tag-black">BY THE NUMBERS</span>
          <h2 className="section-title ranchers" style={{ color: '#000' }}>OUTPUT LOG</h2>
        </div>
        <div className="stats-row">
          {[
            { target: 50, suffix: '+', label: 'PROJECTS SHIPPED' },
            { target: 35, suffix: '+', label: 'HAPPY CLIENTS' },
            { target: 3, suffix: 'X', label: 'AVG. ROAS' },
            { target: 24, suffix: '/7', label: 'SUPPORT' },
          ].map((s, i) => (
            <div key={i} className="stat-box">
              <span className="stat-num" data-target={s.target} data-suffix={s.suffix}>0</span>
              <span className="mono stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <CTABanner />
    </>
  );
}
