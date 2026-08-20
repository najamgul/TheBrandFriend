import { services } from '@/data/services';
import { getPublishedPosts } from '../../lib/blog/store';

import { SITE_URL as BASE_URL } from '../../lib/site';

/**
 * Always generated fresh. No ISR, no edge cache.
 *
 * Two cache-based approaches were tried in production and both failed:
 * revalidatePath('/sitemap.xml') from the publish route never purged this
 * metadata route, and revalidate = 300 still served a cached copy with
 * a cache HIT and an Age over 600s well after a publish (observed on Vercel;
 * the same reasoning applies to Cloudflare's cache).
 *
 * A sitemap is fetched by crawlers a handful of times a day, so the one
 * Supabase query per request is irrelevant, while a stale sitemap actively
 * withholds new URLs from search engines. Correctness wins over a cache
 * that saves nothing measurable.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap() {
  const now = new Date();

  const servicePages = services.map(s => ({
    url: `${BASE_URL}/services/${s.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Never let a Supabase hiccup produce a sitemap missing the static pages.
  let postPages = [];
  try {
    const posts = await getPublishedPosts({ limit: 500 });
    postPages = posts.map(p => ({
      url: `${BASE_URL}/blog/${p.slug}/`,
      lastModified: new Date(p.updated_at || p.published_at || now),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (err) {
    console.error('[sitemap] failed to load blog posts:', err.message);
  }

  return [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/services/`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/designs/`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/portfolio/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/blog/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...servicePages,
    ...postPages,
    { url: `${BASE_URL}/about/`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/process/`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact/`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/privacy/`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms/`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
