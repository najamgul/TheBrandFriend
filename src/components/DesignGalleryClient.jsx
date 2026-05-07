'use client';
import Link from 'next/link';
import { designs } from '@/data/designs';

// ─── Scoring Maps ─────────────────────────────────────────────
const INDUSTRY_MAP = {
  tech:      ['Tech', 'SaaS', 'Startup', 'Product', 'Marketing', 'Analytics'],
  fashion:   ['Fashion', 'Luxury', 'Editorial'],
  creative:  ['Creative', 'Agency', 'Studio', 'Portfolio', 'Architecture'],
  medical:   ['Medical', 'Spa', 'Skincare'],
  travel:    ['Travel', 'Hospitality', 'Lifestyle'],
  ecommerce: ['E-commerce', 'Retail'],
  other:     [],
};

const VIBE_MAP = {
  bold:     ['NEO-BRUTALIST', 'BRUTALIST', 'BOLD SAAS'],
  clean:    ['MINIMALIST', 'MODERNIST', 'MEDICAL SPA'],
  dark:     ['EDITORIAL', 'PORTFOLIO'],
  warm:     ['FASHION', 'QUIET LUXURY', 'LUXURY'],
  playful:  ['NEO-BRUTALIST'],
};

const PRIORITY_MAP = {
  standout: ['NEO-BRUTALIST', 'BRUTALIST', 'BOLD SAAS', 'FASHION'],
  trust:    ['MINIMALIST', 'MODERNIST', 'QUIET LUXURY', 'MEDICAL SPA'],
  convert:  ['BOLD SAAS', 'MODERNIST', 'NEO-BRUTALIST'],
  showcase: ['PORTFOLIO', 'EDITORIAL', 'LUXURY', 'FASHION'],
};

function scoreDesign(design, answers) {
  if (!answers) return 0;
  let score = 0;

  // Industry match (+40)
  const industryTerms = INDUSTRY_MAP[answers.industry] || [];
  if (industryTerms.length === 0) {
    score += 15; // "Other" gets partial credit
  } else if (design.industries.some(ind => industryTerms.includes(ind))) {
    score += 40;
  }

  // Vibe match (+40)
  const vibeStyles = VIBE_MAP[answers.vibe] || [];
  if (vibeStyles.includes(design.style)) {
    score += 40;
  }

  // Priority alignment (+20)
  const priorityStyles = PRIORITY_MAP[answers.priority] || [];
  if (priorityStyles.includes(design.style)) {
    score += 20;
  }

  return score;
}

export default function DesignGalleryClient({ quizAnswers = null }) {
  // Score and sort designs if quiz was completed
  const scoredDesigns = designs.map(d => ({
    ...d,
    matchScore: scoreDesign(d, quizAnswers),
  }));

  // Sort by match score descending (if quiz was taken)
  if (quizAnswers) {
    scoredDesigns.sort((a, b) => b.matchScore - a.matchScore);
  }

  return (
    <div className="designs-grid">
      {scoredDesigns.map((d, i) => (
        <div key={d.slug} className="design-card" id={`design-${d.slug}`}>
          <div className="design-preview">
            {/* Match Badge */}
            {quizAnswers && d.matchScore >= 60 && (
              <div className={`design-match-badge${d.matchScore >= 80 ? ' top-pick' : ''}`}>
                {d.matchScore >= 80 ? '🎯 ' : ''}{d.matchScore}% MATCH
              </div>
            )}
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
