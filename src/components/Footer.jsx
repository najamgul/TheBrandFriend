import Link from 'next/link';
import Image from 'next/image';
import { services } from '@/data/services';

const social = [
  { href: 'https://www.instagram.com/thebrandfriend.com_/', label: 'Instagram' },
  { href: 'https://www.linkedin.com/company/the-brand-friend', label: 'LinkedIn' },
  { href: 'https://www.facebook.com/thebrandfriends', label: 'Facebook' },
];

const pages = [
  { href: '/portfolio/', label: 'Work' },
  { href: '/designs/', label: 'Design systems' },
  { href: '/process/', label: 'Process' },
  { href: '/about/', label: 'Studio' },
  { href: '/blog/', label: 'Journal' },
  { href: '/contact/', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__top">
          <div>
            <div className="foot__logo">
              <Image src="/logo-full.png" alt="TheBrandFriend" width={180} height={40} />
            </div>
            <p className="foot__blurb">
              An independent design and engineering studio. We build brand systems and
              the products that carry them.
            </p>
          </div>

          <div className="foot__col">
            <h2 className="label foot__coltitle">Studio</h2>
            {pages.map(p => (
              <Link key={p.href} href={p.href} className="ulink">{p.label}</Link>
            ))}
          </div>

          <div className="foot__col">
            <h2 className="label foot__coltitle">Services</h2>
            {services.map(s => (
              <Link key={s.slug} href={`/services/${s.slug}/`} className="ulink">{s.name}</Link>
            ))}
          </div>

          <div className="foot__col">
            <h2 className="label foot__coltitle">Elsewhere</h2>
            {social.map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="ulink">
                {s.label}
              </a>
            ))}
            <a href="mailto:care@thebrandfriend.com" className="ulink">care@thebrandfriend.com</a>
          </div>
        </div>

        <div className="foot__bottom">
          <p>© {new Date().getFullYear()} TheBrandFriend</p>
          <div className="foot__legal">
            <Link href="/privacy/" className="ulink">Privacy</Link>
            <Link href="/terms/" className="ulink">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
