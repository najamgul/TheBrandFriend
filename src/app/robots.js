export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://the-brand-friend.vercel.app/sitemap.xml',
  };
}
