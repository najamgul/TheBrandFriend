import CTABanner from '@/components/CTABanner';

export const metadata = {
  title: 'Process — How a project actually runs',
  description:
    'Three phases: read the room, design the system, build and hand over. What happens week by week, what you sign off, and what you own at the end.',
  keywords: 'design process, web development process, branding process, project workflow',
  alternates: { canonical: '/process/' },
};

const steps = [
  {
    num: '01',
    name: 'Read the room',
    desc: 'Before anything is drawn we work out what has to be true for the business — who is actually buying, what they already believe, and what this project needs to change about that. Most of the bad outcomes in this industry are decided here, by skipping it.',
    deliverables: [
      'Brand and competitive audit',
      'Audience research and positioning',
      'Success measures agreed in writing',
      'Roadmap, milestones and dependencies',
      'Technical requirements',
    ],
  },
  {
    num: '02',
    name: 'Design the system',
    desc: 'Not a page — a system. Type scale, palette, grid, components, states and motion, plus the rules that keep it coherent as it grows. You review and sign this off before a line of production code is written, so nothing expensive gets discovered late.',
    deliverables: [
      'Wireframes and user flows',
      'Full design system and key screens',
      'Copywriting and content structure',
      'Prototype for the interactions that matter',
      'Accessibility and responsive behaviour defined',
    ],
  },
  {
    num: '03',
    name: 'Build and hand over',
    desc: 'Hand-written Next.js, measured against Core Web Vitals rather than a screenshot. Then a genuine handover: the repository, the design files, and documentation complete enough that you could take it to another studio tomorrow.',
    deliverables: [
      'Production build and deployment',
      'Analytics and conversion tracking',
      'Performance and SEO pass',
      'Source code and design files transferred',
      'Documentation and a walkthrough session',
    ],
  },
];

export default function ProcessPage() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <span className="label pagehead__label" data-reveal>Process</span>
          <h1 className="display pagehead__title" data-reveal style={{ '--reveal-delay': '60ms' }}>
            Three phases.
            <br />
            No surprises.
          </h1>
          <p className="lede pagehead__lede" data-reveal style={{ '--reveal-delay': '120ms' }}>
            You always know what is happening, what you are approving, and what you own
            at the end of it.
          </p>
        </div>
      </section>

      {steps.map((step, i) => (
        <section key={step.num} className={`section${i % 2 ? ' section--alt' : ''}`}>
          <div className="wrap">
            <div className="phase">
              <div>
                <span className="label phase__num" data-reveal>Phase {step.num}</span>
                <h2 className="h1 phase__name" data-reveal style={{ '--reveal-delay': '60ms' }}>
                  {step.name}
                </h2>
                <p className="prose muted" data-reveal style={{ '--reveal-delay': '120ms' }}>
                  {step.desc}
                </p>
              </div>

              <div data-reveal style={{ '--reveal-delay': '180ms' }}>
                <h3 className="label" style={{ marginBottom: 'var(--s-4)', color: 'var(--muted)' }}>
                  What you get
                </h3>
                <div className="checklist">
                  {step.deliverables.map(d => (
                    <div className="checkitem" key={d}>{d}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <CTABanner
        title={<>Ready to<br />start one?</>}
        sub="Send the brief and we'll come back with a shape, a timeline and a number — or an honest reason why we're not the right fit."
      />
    </>
  );
}
