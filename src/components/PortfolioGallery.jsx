'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import './PortfolioGallery.css';

const CATEGORIES = [
  { key: 'all', label: 'ALL' },
  { key: 'branding', label: 'BRANDING' },
  { key: 'web-design', label: 'WEB DESIGN' },
  { key: 'social-media', label: 'SOCIAL MEDIA' },
  { key: 'video-production', label: 'VIDEO' },
  { key: 'marketing', label: 'MARKETING' },
];

export default function PortfolioGallery({ items = [] }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const gridRef = useRef(null);
  const observerRef = useRef(null);

  // Filter items
  const filtered = activeFilter === 'all'
    ? items
    : items.filter(item => item.category === activeFilter);

  // ── IntersectionObserver for entrance animations ──
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger the animation based on position
            const delay = (entry.target.dataset.index % 6) * 80;
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    // Observe all items
    const items = gridRef.current?.querySelectorAll('.portfolio-item');
    items?.forEach(item => {
      item.classList.remove('visible');
      observerRef.current?.observe(item);
    });

    return () => observerRef.current?.disconnect();
  }, [filtered]);

  // ── Lightbox keyboard navigation ──
  useEffect(() => {
    if (!lightbox.open) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') setLightbox({ open: false, index: 0 });
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightbox.open, lightbox.index, filtered.length]);

  const navigateLightbox = useCallback((direction) => {
    setLightbox(prev => ({
      ...prev,
      index: (prev.index + direction + filtered.length) % filtered.length,
    }));
  }, [filtered.length]);

  const openLightbox = (index) => {
    setLightbox({ open: true, index });
  };

  const currentItem = filtered[lightbox.index];

  return (
    <>
      {/* ── Hero ── */}
      <section className="portfolio-hero" id="portfolio-hero">
        <div className="portfolio-hero-tag">SELECTED WORKS</div>
        <h1 className="portfolio-hero-title">
          OUR<br />WORK
        </h1>
        <p className="portfolio-hero-sub">
          Every project ships with obsessive attention to detail.
          Here&apos;s proof.
        </p>
      </section>

      {/* ── Category Filters ── */}
      <div className="portfolio-filters" id="portfolio-filters">
        <div className="portfolio-filters-inner">
          {CATEGORIES.map(cat => {
            const count = cat.key === 'all'
              ? items.length
              : items.filter(i => i.category === cat.key).length;

            if (cat.key !== 'all' && count === 0) return null;

            return (
              <button
                key={cat.key}
                className={`portfolio-filter-btn ${activeFilter === cat.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat.key)}
              >
                {cat.label}
                <span style={{
                  marginLeft: 6,
                  opacity: 0.4,
                  fontSize: '9px',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Gallery Grid ── */}
      <section className="portfolio-section" id="portfolio-gallery">
        {filtered.length > 0 ? (
          <div className="portfolio-masonry" ref={gridRef}>
            {filtered.map((item, index) => (
              <div
                key={item.id}
                className={`portfolio-item ${item.is_featured ? 'featured' : ''}`}
                data-index={index}
                onClick={() => openLightbox(index)}
              >
                {/* Media */}
                <div className="portfolio-media">
                  {item.media_type === 'video' ? (
                    <>
                      <video
                        src={item.media_url}
                        poster={item.thumbnail_url || undefined}
                        muted
                        playsInline
                        loop
                        preload="metadata"
                        onMouseOver={(e) => e.target.play().catch(() => {})}
                        onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                      <div className="portfolio-play-icon" />
                    </>
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.title}
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="portfolio-item-info">
                  <div className="portfolio-item-title">{item.title}</div>
                  <div className="portfolio-item-meta">
                    <span className="portfolio-item-category">
                      {CATEGORIES.find(c => c.key === item.category)?.label || item.category}
                    </span>
                    {item.client_name && (
                      <span className="portfolio-item-client">{item.client_name}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="portfolio-empty">
            <div className="portfolio-empty-icon">◎</div>
            <div className="portfolio-empty-text">
              {activeFilter === 'all'
                ? 'Portfolio coming soon — we\'re curating our best work.'
                : `No ${CATEGORIES.find(c => c.key === activeFilter)?.label?.toLowerCase()} projects yet.`
              }
            </div>
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="portfolio-cta" id="portfolio-cta">
        <h2 className="portfolio-cta-headline">
          LIKE WHAT<br />YOU SEE?
        </h2>
        <p className="portfolio-cta-sub">
          We built these. Let us build yours.
        </p>
        <Link href="/contact/" className="btn-submit">
          START YOUR PROJECT →
        </Link>
        <div className="portfolio-cta-stats">
          <div className="portfolio-cta-stat">
            <span className="portfolio-cta-stat-num ranchers">50+</span>
            <span className="portfolio-cta-stat-label">PROJECTS SHIPPED</span>
          </div>
          <div className="portfolio-cta-stat">
            <span className="portfolio-cta-stat-num ranchers">3 DAYS</span>
            <span className="portfolio-cta-stat-label">AVG. DELIVERY</span>
          </div>
          <div className="portfolio-cta-stat">
            <span className="portfolio-cta-stat-num ranchers">24/7</span>
            <span className="portfolio-cta-stat-label">SUPPORT</span>
          </div>
        </div>
      </section>

      {/* ── Lightbox ── */}
      <div
        className={`portfolio-lightbox ${lightbox.open ? 'open' : ''}`}
        onClick={() => setLightbox({ open: false, index: 0 })}
      >
        {lightbox.open && currentItem && (
          <>
            <button
              className="portfolio-lightbox-close"
              onClick={(e) => { e.stopPropagation(); setLightbox({ open: false, index: 0 }); }}
              aria-label="Close lightbox"
            >
              ✕
            </button>

            {filtered.length > 1 && (
              <>
                <button
                  className="portfolio-lightbox-nav portfolio-lightbox-prev"
                  onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                  aria-label="Previous"
                >
                  ←
                </button>
                <button
                  className="portfolio-lightbox-nav portfolio-lightbox-next"
                  onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                  aria-label="Next"
                >
                  →
                </button>
              </>
            )}

            <div className="portfolio-lightbox-content" onClick={(e) => e.stopPropagation()}>
              {currentItem.media_type === 'video' ? (
                <video
                  key={currentItem.id}
                  src={currentItem.media_url}
                  controls
                  autoPlay
                  playsInline
                  style={{ maxWidth: '90vw', maxHeight: '85vh' }}
                />
              ) : (
                <img
                  key={currentItem.id}
                  src={currentItem.media_url}
                  alt={currentItem.title}
                />
              )}
            </div>

            <div className="portfolio-lightbox-info">
              <div className="portfolio-lightbox-title">{currentItem.title}</div>
              <div className="portfolio-lightbox-counter">
                {lightbox.index + 1} / {filtered.length}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
