export const dynamic = 'force-static';

import { services } from '@/data/services';

const BASE_URL = 'https://the-brand-friend.vercel.app';

export default function sitemap() {
  const servicePages = services.map(s => ({
    url: `${BASE_URL}/services/${s.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/services/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    ...servicePages,
    { url: `${BASE_URL}/about/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/process/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
