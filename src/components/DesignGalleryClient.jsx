'use client';
import Link from 'next/link';
import { designs } from '@/data/designs';

export default function DesignGalleryClient() {
  return (
    <div className="designs-grid">
      {designs.map((d, i) => (
        <div key={d.slug} className="design-card" id={`design-${d.slug}`}>
          <div className="design-preview">
            <div className="design-iframe-wrap">
              <iframe
                src={`/designs/${d.slug}/`}
                title={`${d.name} — Design Preview`}
                loading="lazy"
                sandbox="allow-scripts"
              />
            </div>
            <div className="design-preview-overlay">
              <a
                href={`/designs/${d.slug}/`}
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
  );
}
