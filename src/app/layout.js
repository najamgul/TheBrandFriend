import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Animations from '@/components/Animations';
import VoiceAgent from '@/components/VoiceAgent';
import RecaptchaProvider from '@/components/RecaptchaProvider';
import ClickSpark from '@/components/ClickSpark';
import MetaPixel from '@/components/MetaPixel';

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
  metadataBase: new URL('https://www.thebrandfriend.com'),
  title: {
    default: 'TheBrandFriend — Digital Agency | Strategy, Design, Development, Marketing',
    template: '%s | TheBrandFriend',
  },
  description: 'TheBrandFriend is a brutally effective digital agency. Strategy, Design, Development, Marketing — we ship brands that dominate the digital space.',
  keywords: ['digital agency', 'web development', 'brand identity', 'social media management', 'performance marketing', 'TheBrandFriend'],
  authors: [{ name: 'TheBrandFriend' }],
  alternates: { canonical: '/' },
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
        <link rel="icon" href="/favicon.png" type="image/png" sizes="128x128" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': ['Organization', 'ProfessionalService'],
                  '@id': 'https://www.thebrandfriend.com/#organization',
                  name: 'TheBrandFriend',
                  url: 'https://www.thebrandfriend.com',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://www.thebrandfriend.com/logo-full.png',
                  },
                  image: 'https://www.thebrandfriend.com/og-image.png',
                  description:
                    'Brutally effective digital agency — Strategy, Design, Development, Marketing.',
                  slogan: 'We ship brands that dominate.',
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
                    name: 'Digital Agency Services',
                    itemListElement: [
                      'Website Development',
                      'Software Solutions',
                      'Social Media Management',
                      'Performance Marketing',
                      'Product Reels & Video Content',
                      'Brand Identity Design',
                    ].map(name => ({
                      '@type': 'Offer',
                      itemOffered: { '@type': 'Service', name },
                    })),
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
            }),
          }}
        />
      </head>
      <body>
        <MetaPixel />
        <ClickSpark
          sparkColor='#fff'
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <RecaptchaProvider>
            <Sidebar />
            <main className="main-content">
              <Navbar />
              {children}
              <Footer />
            </main>
            <Animations />
            <VoiceAgent />
          </RecaptchaProvider>
        </ClickSpark>
      </body>
    </html>
  );
}
