export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Cron and lead endpoints have nothing to index and should not be crawled.
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://thebrandfriend.com/sitemap.xml',
    host: 'https://thebrandfriend.com',
  };
}
