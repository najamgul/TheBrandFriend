'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import './Blog.css';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function readingTime(words) {
  if (!words) return null;
  return `${Math.max(1, Math.round(words / 225))} min read`;
}

function CardMedia({ post }) {
  if (post.cover_image) {
    return (
      <div className="blog-card-media">
        {/* Plain <img>: covers come from remote hosts and next.config sets
            images.unoptimized, so next/image adds no benefit here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cover_image}
          alt={post.cover_image_alt || post.seo_title}
          loading="lazy"
        />
      </div>
    );
  }

  const initials = (post.category || 'TBF')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 3);

  return (
    <div className="blog-card-media">
      <div className="blog-card-placeholder" aria-hidden="true">
        <span>{initials}</span>
      </div>
    </div>
  );
}

export default function BlogList({ posts }) {
  const [active, setActive] = useState('ALL');

  const categories = useMemo(() => {
    const found = [...new Set(posts.map(p => p.category).filter(Boolean))].sort();
    return ['ALL', ...found];
  }, [posts]);

  const visible = useMemo(
    () => (active === 'ALL' ? posts : posts.filter(p => p.category === active)),
    [posts, active]
  );

  return (
    <>
      <section className="blog-hero">
        <div className="blog-hero-tag">THE BRIEF</div>
        <h1 className="blog-hero-title">INSIGHTS</h1>
        <p className="blog-hero-sub">
          Straight answers on websites, branding, and paid growth — costs, timelines,
          and the trade-offs most agencies would rather not put in writing.
        </p>
      </section>

      {posts.length > 0 && categories.length > 2 && (
        <nav className="blog-filters" aria-label="Filter articles by category">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`blog-filter${active === cat ? ' is-active' : ''}`}
              aria-pressed={active === cat}
            >
              {cat}
            </button>
          ))}
        </nav>
      )}

      <section className="blog-grid-section">
        {visible.length === 0 ? (
          <div className="blog-empty">
            <h2>Nothing here yet</h2>
            <p>
              The first articles are being written. In the meantime, take a look at{' '}
              <Link href="/portfolio/">our work</Link> or{' '}
              <Link href="/contact/">tell us what you are building</Link>.
            </p>
          </div>
        ) : (
          <div className="blog-grid">
            {visible.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}/`}
                className="blog-card"
              >
                <CardMedia post={post} />
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    {post.category && (
                      <span className="blog-card-cat">{post.category}</span>
                    )}
                    <span className="blog-card-date">
                      {formatDate(post.published_at)}
                      {readingTime(post.word_count)
                        ? ` · ${readingTime(post.word_count)}`
                        : ''}
                    </span>
                  </div>
                  <h2 className="blog-card-title">{post.seo_title}</h2>
                  <p className="blog-card-desc">{post.meta_description}</p>
                  <span className="blog-card-cta">READ ARTICLE →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
