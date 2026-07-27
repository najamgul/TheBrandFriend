import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { getPostBySlug, getPublishedPosts } from '../../../../lib/blog/store';
import CTABanner from '@/components/CTABanner';
import '@/components/Blog.css';

const SITE = 'https://thebrandfriend.com';

export const revalidate = 300;
// Posts appear after the build, so allow rendering slugs not in the static list.
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPublishedPosts({ limit: 100 });
  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Article not found', robots: { index: false, follow: false } };
  }

  return {
    title: post.seo_title,
    description: post.meta_description,
    keywords: post.tags?.join(', '),
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      type: 'article',
      url: `/blog/${post.slug}/`,
      title: post.seo_title,
      description: post.meta_description,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author],
      ...(post.cover_image ? { images: [{ url: post.cover_image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title,
      description: post.meta_description,
      ...(post.cover_image ? { images: [post.cover_image] } : {}),
    },
  };
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Wraps tables so wide content scrolls inside its own box, not the page. */
const markdownComponents = {
  table: ({ node, ...props }) => (
    <div className="post-table-wrap">
      <table {...props} />
    </div>
  ),
  a: ({ node, href, ...props }) => {
    const isExternal = href?.startsWith('http');
    return (
      <a
        href={href}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      />
    );
  },
};

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const all = await getPublishedPosts({ limit: 50 });
  const related = all
    .filter(p => p.slug !== post.slug)
    .sort((a, b) => {
      const aMatch = a.category === post.category ? 1 : 0;
      const bMatch = b.category === post.category ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 3);

  const url = `${SITE}/blog/${post.slug}/`;
  const readMinutes = Math.max(1, Math.round((post.word_count || 0) / 225));

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.seo_title,
    description: post.meta_description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    wordCount: post.word_count || undefined,
    keywords: post.tags?.join(', ') || undefined,
    articleSection: post.category || undefined,
    ...(post.cover_image ? { image: [post.cover_image] } : {}),
    author: {
      '@type': 'Organization',
      name: post.author || 'TheBrandFriend',
      url: SITE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TheBrandFriend',
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/logo-full.png` },
    },
  };

  const faqSchema =
    Array.isArray(post.faq) && post.faq.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faq.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }
      : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE}/blog/` },
      { '@type': 'ListItem', position: 3, name: post.seo_title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article>
        <header className="post-hero">
          <div className="post-hero-inner">
            <nav className="post-crumbs" aria-label="Breadcrumb">
              <Link href="/">HOME</Link>
              <span>/</span>
              <Link href="/blog/">INSIGHTS</Link>
              <span>/</span>
              {post.category || 'ARTICLE'}
            </nav>
            <h1 className="post-title">{post.seo_title}</h1>
            <div className="post-meta">
              <span>{post.author || 'THEBRANDFRIEND'}</span>
              <span>·</span>
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              <span>·</span>
              <span>{readMinutes} MIN READ</span>
            </div>
          </div>
        </header>

        {post.cover_image && (
          <div className="post-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image}
              alt={post.cover_image_alt || post.seo_title}
            />
          </div>
        )}

        <div className="post-body-section">
          {post.tldr && (
            <aside className="post-tldr">
              <div className="post-tldr-label mono">TL;DR</div>
              <p>{post.tldr}</p>
            </aside>
          )}

          <div className="post-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {post.content_markdown}
            </ReactMarkdown>
          </div>

          {Array.isArray(post.faq) && post.faq.length > 0 && (
            <section className="post-faq">
              <h2 className="ranchers">FAQs</h2>
              {post.faq.map((item, i) => (
                <div key={i} className="post-faq-item">
                  <h3 className="post-faq-q">{item.question}</h3>
                  <p className="post-faq-a">{item.answer}</p>
                </div>
              ))}
            </section>
          )}

          {post.tags?.length > 0 && (
            <div className="post-tags">
              {post.tags.map(tag => (
                <span key={tag} className="post-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="post-back">
            <Link href="/blog/">← ALL ARTICLES</Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="post-related">
            <h2 className="post-related-title">KEEP READING</h2>
            <div className="blog-grid">
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}/`} className="blog-card">
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      {r.category && <span className="blog-card-cat">{r.category}</span>}
                      <span className="blog-card-date">{formatDate(r.published_at)}</span>
                    </div>
                    <h3 className="blog-card-title">{r.seo_title}</h3>
                    <p className="blog-card-desc">{r.meta_description}</p>
                    <span className="blog-card-cta">READ ARTICLE →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <CTABanner
        headline={
          <>
            NEED THIS<br />DONE<br />
            <span className="volt">PROPERLY?</span>
          </>
        }
        sub="Reading about it is step one. We build the thing. Free consultation, honest scope, no BS."
        buttonText="TALK TO US →"
      />
    </>
  );
}
