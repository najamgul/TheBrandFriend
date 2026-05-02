'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { href: '/services/', label: 'SERVICES' },
  { href: '/about/', label: 'ABOUT' },
  { href: '/process/', label: 'PROCESS' },
  { href: '/contact/', label: 'CONTACT' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="navbar" id="navbar">
        <Link href="/" className="nav-logo">
          <Image
            src="/logo-full.png"
            alt="TheBrandFriend - Digital Agency"
            width={200}
            height={48}
            className="nav-logo-img"
            priority
          />
        </Link>
        <div className="nav-right">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="nav-link mono">
              {link.label}
            </Link>
          ))}
          <Link href="/contact/" className="btn-nav">LET&apos;S TALK</Link>
        </div>
        <button
          className="hamburger"
          id="hamburger"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} id="mobile-menu">
        <button
          className="close-btn"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
