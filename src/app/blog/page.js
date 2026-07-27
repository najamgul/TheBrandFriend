import { getPublishedPosts } from '../../../lib/blog/store';
import BlogList from '@/components/BlogList';
import CTABanner from '@/components/CTABanner';

export const metadata = {
  title: 'Insights — Web, Brand & Growth Articles',
  description:
    'Straight answers on website costs, branding, and paid growth for Indian businesses. Real numbers, real trade-offs, no agency fluff.',
  alternates: { canonical: '/blog/' },
  openGraph: {
    type: 'website',
    url: '/blog/',
    title: 'Insights — TheBrandFriend',
    description: 'Straight answers on websites, branding, and paid growth.',
  },
};

// Rebuilt every 5 minutes, and immediately by the publish cron via revalidatePath.
export const revalidate = 300;

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://www.thebrandfriend.com/blog/#blog',
    name: 'TheBrandFriend Insights',
    description:
      'Articles on web development, brand identity, and performance marketing for growing businesses.',
    url: 'https://www.thebrandfriend.com/blog/',
    publisher: {
      '@type': 'Organization',
      name: 'TheBrandFriend',
      url: 'https://www.thebrandfriend.com',
      logo: 'https://www.thebrandfriend.com/logo-full.png',
    },
    blogPost: posts.slice(0, 20).map(p => ({
      '@type': 'BlogPosting',
      headline: p.seo_title,
      url: `https://www.thebrandfriend.com/blog/${p.slug}/`,
      datePublished: p.published_at,
      author: { '@type': 'Organization', name: 'TheBrandFriend' },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.thebrandfriend.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Insights',
        item: 'https://www.thebrandfriend.com/blog/',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogList posts={posts} />
      <CTABanner />
    </>
  );
}
