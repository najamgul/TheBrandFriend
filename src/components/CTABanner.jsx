import Link from 'next/link';
import LaunchSequence from '@/components/LaunchSequence';

export default function CTABanner({ headline, sub, buttonText, buttonHref }) {
  return (
    <section className="section section-dark" id="cta-banner">
      <div className="cta-layout">
        <div className="cta-block">
          <h2 className="ranchers cta-headline">
            {headline || <>READY TO<br />SHIP YOUR<br /><span className="volt">BRAND?</span></>}
          </h2>
          <p className="cta-sub">{sub || "Drop your details. We'll get back in 24 hours. No BS."}</p>
          <Link href={buttonHref || '/contact/'} className="btn-submit">
            {buttonText || 'GET STARTED →'}
          </Link>
        </div>
        <LaunchSequence />
      </div>
    </section>
  );
}
