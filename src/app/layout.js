import {
  Anton,
  Archivo,
  DM_Sans,
  Fraunces,
  Instrument_Serif,
  Space_Grotesk,
  Space_Mono,
  Syne,
} from 'next/font/google';

import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import VoiceAgent from '@/components/VoiceAgent';
import RecaptchaProvider from '@/components/RecaptchaProvider';
import MetaPixel from '@/components/MetaPixel';
import { SkinProvider, skinBootScript } from '@/components/SkinProvider';
import SkinSwitcher from '@/components/SkinSwitcher';
import { skinsToCSS } from '@/data/skins';

/* ── Typefaces ─────────────────────────────────────────────────────────
   Eight families sounds heavy, and would be if they all loaded. Only the
   three used by the default skin are preloaded; the rest are declared but
   not fetched until a skin actually renders glyphs in them — i.e. only if
   a visitor uses the switcher. Most sessions download three fonts.       */

const archivo = Archivo({ subsets: ['latin'], variable: '--f-archivo', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--f-dm', display: 'swap' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--f-mono', display: 'swap' });

const instrument = Instrument_Serif({ subsets: ['latin'], weight: ['400'], variable: '--f-instrument', display: 'swap', preload: false });
const anton = Anton({ subsets: ['latin'], weight: ['400'], variable: '--f-anton', display: 'swap', preload: false });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--f-grotesk', display: 'swap', preload: false });
const syne = Syne({ subsets: ['latin'], variable: '--f-syne', display: 'swap', preload: false });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--f-fraunces', display: 'swap', preload: false });

const fontVars = [archivo, dmSans, spaceMono, instrument, anton, grotesk, syne, fraunces]
  .map(f => f.variable)
  .join(' ');

export const metadata = {
  metadataBase: new URL('https://www.thebrandfriend.com'),
  title: {
    default: 'TheBrandFriend — Brand systems, built to be lived in',
    template: '%s | TheBrandFriend',
  },
  description:
    'An independent design and engineering studio. We build brand systems — identity, websites, and the campaigns that carry them — for companies that intend to be around in ten years.',
  keywords: [
    'design studio',
    'brand identity',
    'web development',
    'design system',
    'Next.js development',
    'performance marketing',
    'TheBrandFriend',
  ],
  authors: [{ name: 'TheBrandFriend' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'TheBrandFriend',
    title: 'TheBrandFriend — Brand systems, built to be lived in',
    description:
      'One studio, eight design languages. Change the way this site looks and see how we work.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TheBrandFriend' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheBrandFriend — Brand systems, built to be lived in',
    description: 'One studio, eight design languages. Change the way this site looks.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  // Matches the default skin's --bg so the browser chrome never flashes white.
  themeColor: '#F3F1EC',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': 'https://www.thebrandfriend.com/#organization',
      name: 'TheBrandFriend',
      url: 'https://www.thebrandfriend.com',
      logo: { '@type': 'ImageObject', url: 'https://www.thebrandfriend.com/logo-full.png' },
      image: 'https://www.thebrandfriend.com/og-image.png',
      description:
        'Independent design and engineering studio building brand systems: identity, websites, and the campaigns that carry them.',
      slogan: 'Brand systems, built to be lived in.',
      areaServed: { '@type': 'Country', name: 'India' },
      sameAs: [
        'https://www.instagram.com/thebrandfriend.com_/',
        'https://www.linkedin.com/company/the-brand-friend',
        'https://www.facebook.com/thebrandfriends',
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: 'care@thebrandfriend.com',
          availableLanguage: ['English', 'Hindi'],
        },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Studio Services',
        itemListElement: [
          'Website Development',
          'Software Solutions',
          'Social Media Management',
          'Performance Marketing',
          'Product Reels & Video Content',
          'Brand Identity Design',
        ].map(name => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.thebrandfriend.com/#website',
      url: 'https://www.thebrandfriend.com',
      name: 'TheBrandFriend',
      publisher: { '@id': 'https://www.thebrandfriend.com/#organization' },
      inLanguage: 'en',
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        {/* Skin tokens, rendered from the single source of truth in data/skins.js */}
        <style id="skins" dangerouslySetInnerHTML={{ __html: skinsToCSS() }} />
        {/* Must run before first paint so the stored skin is never seen changing. */}
        <script dangerouslySetInnerHTML={{ __html: skinBootScript }} />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="128x128" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <MetaPixel />
        <a className="skip" href="#main">Skip to content</a>
        <SkinProvider>
          <RecaptchaProvider>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
            <SkinSwitcher />
          </RecaptchaProvider>
        </SkinProvider>
        <Reveal />
        <VoiceAgent />
      </body>
    </html>
  );
}
