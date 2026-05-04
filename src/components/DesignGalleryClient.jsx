'use client';
import { useState } from 'react';
import Link from 'next/link';
import { designs } from '@/data/designs';

const VIEWPORTS = [
  { label: '📱', name: 'MOBILE', width: 375, height: 667 },
  { label: '📋', name: 'TABLET', width: 768, height: 1024 },
  { label: '🖥️', name: 'DESKTOP', width: 1440, height: 900 },
];

export default function DesignGalleryClient() {
  const [viewport, setViewport] = useState(2); // default desktop

  return (
    <>
      {/* Viewport Toggle */}
      <div className="viewport-toggle">
        {VIEWPORTS.map((v, i) => (
          <button
            key={v.name}
            className={`viewport-btn ${i === viewport ? 'active' : ''}`}
            onClick={() => setViewport(i)}
          >
            <span className="viewport-icon">{v.label}</span>
            <span className="viewport-name mono">{v.name}</span>
          </button>
        ))}
      </div>

      {/* Design Cards */}
      <div className="designs-grid">
        {designs.map((d, i) => (
          <div key={d.slug} className="design-card" id={`design-${d.slug}`}>
            <div className="design-preview" style={{ height: viewport === 0 ? 500 : 420 }}>
              <div
                className="design-iframe-wrap"
                style={{
                  width: VIEWPORTS[viewport].width,
                  height: VIEWPORTS[viewport].height,
                  transform: `scale(${viewport === 0 ? 0.72 : viewport === 1 ? 0.55 : 0.42})`,
                }}
              >
                <iframe
                  src={`/designs/${d.slug}.html`}
                  title={`${d.name} — Design Preview`}
                  loading="lazy"
                  sandbox="allow-scripts"
                />
              </div>
              <div className="design-preview-overlay">
                <a
                  href={`/designs/${d.slug}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="design-view-btn mono"
                >
                  VIEW FULL DEMO →
                </a>
              </div>
            </div>
            <div className="design-info">
              <div className="design-meta">
                <span className="design-num ranchers">{String(i + 1).padStart(2, '0')}</span>
                <span className="mono tag tag-volt design-style-tag">{d.style}</span>
              </div>
              <h3 className="design-name ranchers">{d.name}</h3>
              <p className="design-desc">{d.description}</p>
              <div className="design-colors">
                {d.colors.map((c, j) => (
                  <span key={j} className="design-swatch" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
              <div className="design-fonts mono">{d.fonts.join(' • ')}</div>
              <div className="design-industries mono">
                {d.industries.map((ind, j) => (
                  <span key={j} className="industry-tag">{ind}</span>
                ))}
              </div>
              <Link href={`/contact/?design=${d.slug}`} className="design-cta">
                I WANT THIS →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
