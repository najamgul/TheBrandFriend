import Link from 'next/link';
import Image from 'next/image';
import { services } from '@/data/services';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-logo">
            <Image
              src="/logo-full.png"
              alt="TheBrandFriend"
              width={180}
              height={40}
              className="footer-logo-img"
            />
          </div>
          <p className="mono footer-copy">
            © {new Date().getFullYear()} THEBRANDFRIEND. ALL RIGHTS RESERVED.<br />
            BUILT WITH OBSESSION.
          </p>
          <div className="footer-legal">
            <Link href="/privacy/" className="mono footer-legal-link">PRIVACY POLICY</Link>
            <Link href="/terms/" className="mono footer-legal-link">TERMS OF SERVICE</Link>
          </div>
        </div>

        <div className="footer-cols">
          {/* Page links */}
          <div className="footer-col">
            <h4 className="mono footer-col-title">NAVIGATE</h4>
            <Link href="/" className="mono">HOME</Link>
            <Link href="/services/" className="mono">SERVICES</Link>
            <Link href="/about/" className="mono">ABOUT US</Link>
            <Link href="/process/" className="mono">OUR PROCESS</Link>
            <Link href="/contact/" className="mono">CONTACT</Link>
          </div>

          {/* Service deep links — critical for SEO */}
          <div className="footer-col">
            <h4 className="mono footer-col-title">SERVICES</h4>
            {services.map(s => (
              <Link key={s.slug} href={`/services/${s.slug}/`} className="mono">
                {s.name.toUpperCase()}
              </Link>
            ))}
          </div>

          {/* Social / Contact */}
          <div className="footer-col">
            <h4 className="mono footer-col-title">CONNECT</h4>
            <a href="https://www.instagram.com/thebrandfriend.com_/" target="_blank" rel="noopener noreferrer" className="mono">INSTAGRAM</a>
            <a href="https://www.linkedin.com/company/the-brand-friend" target="_blank" rel="noopener noreferrer" className="mono">LINKEDIN</a>
            <a href="https://www.facebook.com/thebrandfriends" target="_blank" rel="noopener noreferrer" className="mono">FACEBOOK</a>
            <a href="mailto:care@thebrandfriend.com" className="mono">EMAIL US</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="mono">STRATEGY. DESIGN. DEVELOPMENT. MARKETING.</p>
      </div>
    </footer>
  );
}
