import Link from 'next/link';
import BrutalistForm from '@/components/BrutalistForm';
import CreattieEmbed from '@/components/CreattieEmbed';

export const metadata = {
  title: 'Contact Us — Get A Free Brand Consultation',
  description: 'Ready to ship your brand? Contact TheBrandFriend for a free consultation. We respond within 24 hours.',
  keywords: 'contact digital agency, free brand consultation, hire web developer, hire marketing agency',
};

export default function ContactPage() {
  return (
    <>
      <section className="hero" style={{ minHeight: 'auto' }}>
        <div className="hero-layout">
          <div className="hero-inner">
            <div className="sticker sticker-hero" style={{ '--rot': '-2deg' }}>
              <span className="mono">GET IN TOUCH</span>
            </div>
            <h1 className="hero-headline">LET&apos;S<br /><span className="volt">TALK</span></h1>
            <p className="hero-sub">
              <em>Drop your details below. We&apos;ll get back within 24 hours with a game plan for your brand. No strings attached.</em>
            </p>
          </div>
          <div className="hero-anim">
            <CreattieEmbed src="https://ik.imagekit.io/creattie/main/saved_colors/145118/j9x5pS5KblJLvXEF.json" speed="101" />
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px', maxWidth: '1000px' }}>
          <div>
            <span className="mono tag tag-volt">SEND US A MESSAGE</span>
            <h2 className="ranchers" style={{ fontSize: 'clamp(32px, 5vw, 56px)', margin: '12px 0 28px' }}>PROJECT BRIEF</h2>
            <BrutalistForm variant="full" />
          </div>
          <div>
            <span className="mono tag tag-white">QUICK CONNECT</span>
            <h2 className="ranchers" style={{ fontSize: 'clamp(28px, 4vw, 48px)', margin: '12px 0 24px' }}>INFO</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p className="mono" style={{ fontSize: '10px', color: '#475569', marginBottom: '4px' }}>EMAIL</p>
                <a href="mailto:hello@thebrandfriend.com" style={{ fontSize: '15px', color: '#CCFF00', textDecoration: 'none' }}>hello@thebrandfriend.com</a>
              </div>
              <div>
                <p className="mono" style={{ fontSize: '10px', color: '#475569', marginBottom: '4px' }}>RESPONSE TIME</p>
                <p style={{ fontSize: '15px' }}>Within 24 hours</p>
              </div>
              <div>
                <p className="mono" style={{ fontSize: '10px', color: '#475569', marginBottom: '4px' }}>EXPLORE</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <Link href="/services/" className="mono" style={{ fontSize: '11px', color: '#CCFF00', textDecoration: 'none' }}>VIEW ALL SERVICES →</Link>
                  <Link href="/process/" className="mono" style={{ fontSize: '11px', color: '#CCFF00', textDecoration: 'none' }}>LEARN OUR PROCESS →</Link>
                  <Link href="/about/" className="mono" style={{ fontSize: '11px', color: '#CCFF00', textDecoration: 'none' }}>ABOUT OUR TEAM →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
