import { BANNED_PHRASES } from './prompts.js';

export const MIN_WORDS = 1500;
export const MIN_INTERNAL_LINKS = 4;
export const MIN_QUALITY_SCORE = 7;
export const MAX_PARAGRAPH_WORDS = 90;
export const MAX_LONG_PARAGRAPHS = 3;

/** Word count of the body, ignoring markdown table pipes and list markers. */
export function wordCount(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[|>#*_`-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Normalise a keyword so "seo for agencies" and "agencies SEO" collide. */
export function normalizeKeyword(kw) {
  return String(kw || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ');
}

/**
 * Jaccard-style overlap between two keywords. Used to stop the pipeline
 * publishing two articles that compete for the same query — the single most
 * common way an automated blog quietly damages its own rankings.
 */
export function keywordOverlap(a, b) {
  const wordsA = new Set(normalizeKeyword(a).split(' ').filter(Boolean));
  const wordsB = new Set(normalizeKeyword(b).split(' ').filter(Boolean));
  if (!wordsA.size || !wordsB.size) return 0;
  const shared = [...wordsA].filter(w => wordsB.has(w)).length;
  return shared / Math.max(wordsA.size, wordsB.size);
}

/**
 * Deterministic checks. Cheap, runs before the paid judge call, and catches
 * the failure modes that are objectively measurable.
 *
 * @returns {{ok: boolean, failures: string[], warnings: string[], stats: object}}
 */
export function runStructuralChecks(article) {
  const failures = [];
  const warnings = [];
  const md = article.contentMarkdown || '';
  const lower = md.toLowerCase();

  const words = wordCount(md);
  if (words < MIN_WORDS) {
    failures.push(`Word count too low: ${words} (need ${MIN_WORDS}+)`);
  }

  const banned = BANNED_PHRASES.filter(p => lower.includes(p));
  if (banned.length) {
    failures.push(`Contains banned AI phrasing: ${banned.slice(0, 4).join(', ')}`);
  }

  // Internal links = markdown links pointing at a site-relative path.
  const internal = md.match(/\[[^\]]+\]\(\/[^)]*\)/g) || [];
  if (internal.length < MIN_INTERNAL_LINKS) {
    failures.push(
      `Insufficient internal links: ${internal.length} (need ${MIN_INTERNAL_LINKS}+)`
    );
  }

  const lazyAnchors = (md.match(/\[(click here|read more|learn more|here|this article)\]/gi) || []);
  if (lazyAnchors.length) {
    failures.push(`Non-descriptive anchor text used ${lazyAnchors.length}x`);
  }

  // An H1 in the body would compete with the page's own H1.
  if (/^#\s+/m.test(md)) {
    failures.push('Body contains an H1 — the page renders the title separately');
  }

  const paragraphs = md.split(/\n\n+/).filter(p => p.trim());
  const longParas = paragraphs.filter(
    p => !p.trim().startsWith('|') && p.split(/\s+/).length > MAX_PARAGRAPH_WORDS
  );
  if (longParas.length > MAX_LONG_PARAGRAPHS) {
    failures.push(
      `Readability: ${longParas.length} paragraphs over ${MAX_PARAGRAPH_WORDS} words`
    );
  }

  if (!Array.isArray(article.faq) || article.faq.length < 5) {
    failures.push(`Needs 5+ FAQs, got ${article.faq?.length || 0}`);
  }

  if (!article.metaDescription || article.metaDescription.length > 160) {
    failures.push(
      `Meta description missing or too long (${article.metaDescription?.length || 0} chars)`
    );
  }

  if (!article.seoTitle || article.seoTitle.length > 70) {
    failures.push(`SEO title missing or too long (${article.seoTitle?.length || 0} chars)`);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug || '')) {
    failures.push(`Invalid slug: "${article.slug}"`);
  }

  // Non-blocking signals — logged, not fatal.
  const tableRows = (md.match(/^\|.*\|.*\|$/gm) || []).length;
  if (tableRows < 4) warnings.push(`Thin or missing comparison table (${tableRows} rows)`);
  if (!lower.includes('key takeaway')) warnings.push('No Key Takeaways block');

  const external = md.match(/\[[^\]]+\]\(https?:\/\/[^)]*\)/g) || [];
  if (external.length < 2) warnings.push(`Only ${external.length} external authority links`);

  return {
    ok: failures.length === 0,
    failures,
    warnings,
    stats: {
      words,
      internalLinks: internal.length,
      externalLinks: external.length,
      tableRows,
      faqs: article.faq?.length || 0,
    },
  };
}
