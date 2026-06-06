export const dynamic = 'force-static';

import { services } from '@/data/services';

const BASE_URL = 'https://thebrandfriend.com';

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
    { url: `${BASE_URL}/designs/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/portfolio/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...servicePages,
    { url: `${BASE_URL}/about/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/process/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/privacy/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];
}
