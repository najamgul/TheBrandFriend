import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Animations from '@/components/Animations';
import VoiceAgent from '@/components/VoiceAgent';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://the-brand-friend.vercel.app'),
  title: {
    default: 'TheBrandFriend — Digital Agency | Strategy, Design, Development, Marketing',
    template: '%s | TheBrandFriend',
  },
  description: 'TheBrandFriend is a brutally effective digital agency. Strategy, Design, Development, Marketing — we ship brands that dominate the digital space.',
  keywords: ['digital agency', 'web development', 'brand identity', 'social media management', 'performance marketing', 'TheBrandFriend'],
  authors: [{ name: 'TheBrandFriend' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'TheBrandFriend',
    title: 'TheBrandFriend — Digital Agency | Strategy, Design, Development, Marketing',
    description: 'We ship brands that dominate the digital space. Strategy, Design, Development, Marketing.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TheBrandFriend Digital Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheBrandFriend — Digital Agency',
    description: 'We ship brands that dominate the digital space.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${spaceMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Ranchers&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'TheBrandFriend',
              url: 'https://the-brand-friend.vercel.app',
              logo: 'https://the-brand-friend.vercel.app/logo-full.png',
              description: 'Brutally effective digital agency — Strategy, Design, Development, Marketing.',
              sameAs: [
                'https://instagram.com/thebrandfriend',
                'https://linkedin.com/company/thebrandfriend',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'sales',
                email: 'hello@thebrandfriend.com',
              },
            }),
          }}
        />
      </head>
      <body>
        <Sidebar />
        <main className="main-content">
          <Navbar />
          {children}
          <Footer />
        </main>
        <Animations />
        <VoiceAgent />
      </body>
    </html>
  );
}
