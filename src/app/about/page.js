import Link from 'next/link';
import CTABanner from '@/components/CTABanner';

export const metadata = {
  title: 'About Us — A Brutally Effective Digital Agency',
  description: 'TheBrandFriend is a results-obsessed digital agency. We combine strategy, design, development, and marketing to ship brands that dominate.',
  keywords: 'about TheBrandFriend, digital agency, branding agency, web agency India',
};

const values = [
  { num: '01', title: 'SHIP FAST, SHIP RIGHT', desc: "Speed without quality is waste. We deliver on aggressive timelines without cutting corners. Every project has a deadline — and we beat it." },
  { num: '02', title: 'DATA OVER OPINIONS', desc: "We don't guess. Every design decision, campaign strategy, and feature priority is backed by data, research, and proven frameworks." },
  { num: '03', title: 'OBSESSIVE CRAFTSMANSHIP', desc: "Every pixel matters. Every line of code matters. We're perfectionists who won't ship until it's genuinely excellent." },
  { num: '04', title: 'TRANSPARENT PARTNERSHIP', desc: "No hidden costs. No vague timelines. No corporate BS. You get honest communication, clear deliverables, and a team that actually cares." },
];

export default function AboutPage() {
  return (
    <>
      <section className="hero" style={{ minHeight: 'auto' }}>
        <div className="hero-inner">
          <div className="sticker sticker-hero" style={{ '--rot': '-2deg' }}>
            <span className="mono">WHO WE ARE</span>
          </div>
          <h1 className="hero-headline">THE<br /><span className="volt">BRAND</span><br />FRIEND</h1>
          <p className="hero-sub">
            <em>We&apos;re not just another agency. We&apos;re a team of designers, developers, strategists, and marketers who are obsessed with one thing: making your brand win.</em>
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section section-volt">
        <div className="section-header">
          <span className="mono tag tag-black">OUR MISSION</span>
          <h2 className="ranchers" style={{ fontSize: 'clamp(36px, 6vw, 80px)', color: '#000', lineHeight: 0.9 }}>
            BUILD BRANDS THAT<br />BREAK THE INTERNET
          </h2>
        </div>
        <p style={{ fontSize: '16px', maxWidth: '700px', lineHeight: 1.7, color: '#000' }}>
          Every business deserves a brand that commands attention. We combine strategy, design, development, and marketing into one relentless pipeline — taking brands from invisible to unforgettable. No fluff. No filler. Just results.
        </p>
      </section>

      {/* Values */}
      <section className="section section-dark">
        <div className="section-header">
          <span className="mono tag tag-volt">WHAT DRIVES US</span>
          <h2 className="section-title ranchers">VALUES</h2>
        </div>
        <div className="values-grid">
          {values.map((v, i) => (
            <div key={i} className="value-card">
              <span className="value-num ranchers">{v.num}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="section section-volt">
        <div className="section-header">
          <span className="mono tag tag-black">BY THE NUMBERS</span>
          <h2 className="ranchers" style={{ fontSize: 'clamp(40px, 8vw, 100px)', color: '#000', lineHeight: 0.9 }}>OUTPUT LOG</h2>
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

      <CTABanner
        headline={<>WANT TO<br />WORK<br /><span className="volt">TOGETHER?</span></>}
        sub="We're always looking for ambitious brands to partner with."
      />
    </>
  );
}
