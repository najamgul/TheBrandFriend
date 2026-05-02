import Link from 'next/link';
import CTABanner from '@/components/CTABanner';
import CreattieEmbed from '@/components/CreattieEmbed';

export const metadata = {
  title: 'Our Process — How We Ship Winning Brands',
  description: 'Our 3-step process: Discover, Design & Build, Launch & Scale. See how TheBrandFriend takes brands from concept to domination.',
  keywords: 'agency process, web development process, branding process, project workflow',
};

const steps = [
  {
    num: '01', name: 'DISCOVER', rot: '-3deg',
    desc: "Every great brand starts with understanding. We conduct deep research into your business, audience, competitors, and market positioning.",
    deliverables: ['Brand audit & competitive analysis', 'Target audience research & personas', 'Goal-setting & KPI framework', 'Project roadmap & timeline', 'Technical requirements document'],
  },
  {
    num: '02', name: 'DESIGN & BUILD', rot: '2deg',
    desc: "Armed with insights, we create. From wireframes to high-fidelity designs to production-grade code — every detail is crafted with precision.",
    deliverables: ['Wireframes & user flows', 'High-fidelity UI/UX design', 'Front-end & back-end development', 'Content creation & copywriting', 'Quality assurance & testing'],
  },
  {
    num: '03', name: 'LAUNCH & SCALE', rot: '-2deg',
    desc: "Shipping is just the beginning. We deploy, monitor, optimize, and scale. Your brand gets continuous attention, not a one-time handoff.",
    deliverables: ['Deployment & go-live support', 'Analytics setup & tracking', 'Performance optimization', 'Monthly reporting & insights', 'Ongoing maintenance & growth strategy'],
  },
];

export default function ProcessPage() {
  return (
    <>
      <section className="hero" style={{ minHeight: 'auto' }}>
        <div className="hero-layout">
          <div className="hero-inner">
            <div className="sticker sticker-hero" style={{ '--rot': '-2deg' }}>
              <span className="mono">HOW WE WORK</span>
            </div>
            <h1 className="hero-headline">THE<br /><span className="volt">BLUEPRINT</span></h1>
            <p className="hero-sub">
              <em>Three phases. Zero guesswork. Every project follows our battle-tested framework to go from concept to domination.</em>
            </p>
          </div>
          <div className="hero-anim">
            <CreattieEmbed src="https://ik.imagekit.io/creattie/main/saved_colors/145118/fOmq6VjhbpevoY1i.json" />
          </div>
        </div>
      </section>

      {steps.map((step, i) => (
        <section key={i} className={`section ${i % 2 === 0 ? 'section-dark' : ''}`} style={i % 2 !== 0 ? { background: '#fff', color: '#000' } : {}}>
          <div style={{ maxWidth: '800px' }}>
            <div className="sticker" style={{ '--rot': step.rot, marginBottom: '24px' }}>
              <span className="mono">STEP {step.num}</span>
            </div>
            <h2 className="ranchers" style={{ fontSize: 'clamp(48px, 8vw, 100px)', lineHeight: 0.88, marginBottom: '20px', color: i % 2 !== 0 ? '#000' : '#fff' }}>
              {step.name}
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.7, color: '#475569', maxWidth: '640px', marginBottom: '32px' }}>
              {step.desc}
            </p>
            <span className="mono tag tag-volt" style={{ marginBottom: '16px' }}>DELIVERABLES</span>
            <div style={{ marginTop: '12px' }}>
              {step.deliverables.map((d, j) => (
                <div key={j} className="deliverable-item" style={i % 2 !== 0 ? { borderColor: 'rgba(0,0,0,0.1)' } : {}}>
                  <span className="deliverable-check">✓</span>
                  <span style={{ color: i % 2 !== 0 ? '#000' : '#fff' }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <CTABanner
        headline={<>LET&apos;S START<br />YOUR<br /><span className="volt">PROJECT</span></>}
        sub="Ready to go from zero to dominant? Let's talk."
        buttonText="START A PROJECT →"
      />
    </>
  );
}
