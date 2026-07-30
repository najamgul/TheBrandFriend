import Link from 'next/link';

export default function CTABanner({
  title = <>Let&apos;s build<br />something durable.</>,
  sub = "Tell us what you're making and when it needs to be live. We'll tell you honestly whether we're the right studio for it.",
  cta = 'Start a project',
  href = '/contact/',
}) {
  return (
    <section className="cta">
      <div className="wrap">
        <h2 className="display cta__title" data-reveal>{title}</h2>
        <p className="cta__sub" data-reveal style={{ '--reveal-delay': '80ms' }}>{sub}</p>
        <div data-reveal style={{ '--reveal-delay': '140ms' }}>
          <Link href={href} className="btn">
            {cta}
            <span className="btn__arrow" aria-hidden="true">→</span>
          </Link>
        </div>
        <p className="cta__mail" data-reveal>
          or write to{' '}
          <a href="mailto:care@thebrandfriend.com" className="ulink">care@thebrandfriend.com</a>
        </p>
      </div>
    </section>
  );
}
