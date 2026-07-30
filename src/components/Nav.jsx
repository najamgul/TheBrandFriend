'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/portfolio/', label: 'Work' },
  { href: '/designs/', label: 'Systems' },
  { href: '/services/', label: 'Services' },
  { href: '/process/', label: 'Process' },
  { href: '/blog/', label: 'Journal' },
  { href: '/about/', label: 'Studio' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Trap the page behind the drawer, and let Escape out.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isCurrent = href => (href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, '')));

  return (
    <>
      <header className="nav">
        <div className="wrap nav__inner">
          <Link href="/" className="nav__logo" aria-label="TheBrandFriend — home">
            <Image src="/logo-full.png" alt="TheBrandFriend" width={180} height={60} priority />
          </Link>

          <nav className="nav__links" aria-label="Primary">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="nav__link"
                aria-current={isCurrent(l.href) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nav__actions">
            <Link href="/contact/" className="btn">
              Start a project
              <span className="btn__arrow" aria-hidden="true">→</span>
            </Link>
            <button
              type="button"
              className="nav__burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="navdrawer"
              onClick={() => setOpen(v => !v)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* inert keeps the closed drawer out of the tab order and off screen readers */}
      <div id="navdrawer" className={`navdrawer${open ? ' is-open' : ''}`} inert={!open}>
        {links.map(l => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
        <Link href="/contact/">Contact</Link>
      </div>
    </>
  );
}
