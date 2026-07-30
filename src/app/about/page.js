import CTABanner from '@/components/CTABanner';

export const metadata = {
  title: 'Studio — How we think and who we are',
  description:
    'TheBrandFriend is an independent design and engineering studio. We build brand systems, websites and the campaigns that carry them — and we keep a library of design systems rather than one house style.',
  keywords: 'about TheBrandFriend, design studio India, branding agency, web design studio',
  alternates: { canonical: '/about/' },
};

const principles = [
  {
    num: '01',
    title: 'A system, not a page',
    desc: 'Anyone can make one screen look good. The work is the rules underneath it — the type scale, the grid, the spacing, the states — so the twentieth page looks as considered as the first, whoever builds it.',
  },
  {
    num: '02',
    title: 'A library, not a house style',
    desc: 'We keep twelve complete design systems and start from whichever genuinely fits the business. A skincare brand and a logistics platform should not come out of the same studio looking like siblings.',
  },
  {
    num: '03',
    title: 'Code we would inherit',
    desc: 'Hand-written Next.js, semantic markup, measured against Core Web Vitals rather than a screenshot. You get the repository and the design files. Nothing is held hostage.',
  },
  {
    num: '04',
    title: 'Say the inconvenient thing',
    desc: 'If the timeline is wrong, or the brief is solving the wrong problem, or we are not the right studio for it — you hear that early, when it is still cheap to act on.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <span className="label pagehead__label" data-reveal>Studio</span>
          <h1 className="display pagehead__title" data-reveal style={{ '--reveal-delay': '60ms' }}>
            We build the
            <br />
            thing underneath.
          </h1>
          <p className="lede pagehead__lede" data-reveal style={{ '--reveal-delay': '120ms' }}>
            An independent team of designers, engineers and strategists. We make brand
            systems and the products that carry them — for companies that intend to be
            around in ten years.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <header className="sec-head" data-reveal>
            <h2 className="h2">How we work</h2>
            <span className="label sec-head__index">(01) Principles</span>
          </header>

          <div className="cardgrid">
            {principles.map((p, i) => (
              <div className="card" key={p.num} data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                <span className="label card__num">{p.num}</span>
                <h3 className="h3">{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="wrap">
          <header className="sec-head" data-reveal>
            <h2 className="h2">Where we came out</h2>
            <span className="label sec-head__index">(02) Record</span>
          </header>

          <dl className="facts">
            {[
              { k: '50+', v: 'Projects shipped' },
              { k: '35+', v: 'Clients' },
              { k: '3×', v: 'Average return on ad spend' },
              { k: '6', v: 'Capabilities under one roof' },
            ].map(f => (
              <div className="fact" key={f.v} data-reveal>
                <dt className="fact__num">{f.k}</dt>
                <dd className="label fact__label">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CTABanner
        title={<>Want to work<br />together?</>}
        sub="We take on a small number of engagements at a time so that each one gets the studio's actual attention."
      />
    </>
  );
}
