import { runJSON, MODELS } from './replicate.js';
import {
  buildDraftPrompt,
  buildPolishPrompt,
  buildJudgePrompt,
  DRAFT_SCHEMA,
  POLISHED_SCHEMA,
  JUDGE_SCHEMA,
} from './prompts.js';
import { runStructuralChecks, keywordOverlap, MIN_QUALITY_SCORE } from './quality-gate.js';
import {
  seedTopicsIfEmpty,
  claimNextTopic,
  markTopic,
  releaseTopic,
  getPostsForLinking,
  countApproved,
  insertApprovedPost,
  slugExists,
  CONTENT_BANK_TARGET,
} from './store.js';

const CANNIBALIZATION_THRESHOLD = 0.8;

/**
 * Optional cover image from Unsplash. Returns nulls when the key is absent —
 * the blog UI renders a branded gradient card in that case, so this is
 * genuinely optional rather than a hidden requirement.
 */
async function fetchCoverImage(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return { url: null, alt: null };

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    if (!res.ok) return { url: null, alt: null };

    const data = await res.json();
    const photo = data?.results?.[0];
    if (!photo) return { url: null, alt: null };

    return {
      url: `${photo.urls.raw}&w=1200&h=630&fit=crop`,
      alt: photo.alt_description || null,
    };
  } catch (err) {
    console.warn('[blog] cover image fetch failed:', err.message);
    return { url: null, alt: null };
  }
}

/** Append -2, -3, ... until the slug is free. */
async function uniqueSlug(base) {
  let slug = base;
  let suffix = 2;
  while (await slugExists(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
    if (suffix > 10) {
      slug = `${base}-${Date.now().toString(36)}`;
      break;
    }
  }
  return slug;
}

/**
 * Generate one article: Gemini draft -> Claude polish -> gate -> content bank.
 *
 * Returns a result object rather than throwing, so the cron route can always
 * write a run log and return 200 (a non-200 makes Vercel retry, which would
 * burn tokens re-running a job that failed deterministically).
 */
export async function runGenerate({ force = false } = {}) {
  const seeded = await seedTopicsIfEmpty();
  if (seeded) console.log(`[blog] seeded ${seeded} topics`);

  const banked = await countApproved();
  if (!force && banked >= CONTENT_BANK_TARGET) {
    return {
      ok: true,
      action: 'skipped',
      summary: `Content bank full (${banked}/${CONTENT_BANK_TARGET} approved)`,
    };
  }

  const topic = await claimNextTopic();
  if (!topic) {
    return {
      ok: true,
      action: 'skipped',
      summary: 'No queued topics available. Add rows to blog_topics.',
    };
  }

  try {
    // --- Cannibalisation guard -------------------------------------
    const existing = await getPostsForLinking({ limit: 100 });
    const clash = existing.find(
      p => keywordOverlap(topic.primary_keyword, p.primary_keyword) >= CANNIBALIZATION_THRESHOLD
    );
    if (clash) {
      const reason = `Keyword "${topic.primary_keyword}" overlaps existing post "${clash.slug}"`;
      await markTopic(topic.id, 'skipped', reason);
      return { ok: true, action: 'skipped', summary: reason };
    }

    // --- Stage 1: draft (Gemini via Replicate) ---------------------
    console.log(`[blog] drafting with ${MODELS.draft}: ${topic.primary_keyword}`);
    const draft = await runJSON({
      model: MODELS.draft,
      stage: 'draft',
      maxTokens: 32768,
      schema: DRAFT_SCHEMA,
      prompt: buildDraftPrompt({
        topic: topic.topic,
        primaryKeyword: topic.primary_keyword,
        intent: topic.intent,
        existingPosts: existing.filter(p => p.slug),
      }),
    });

    // --- Stage 2: voice rewrite (Claude via Replicate) -------------
    console.log(`[blog] polishing with ${MODELS.polish}: ${topic.primary_keyword}`);
    const article = await runJSON({
      model: MODELS.polish,
      stage: 'polish',
      maxTokens: 32000,
      schema: POLISHED_SCHEMA,
      prompt: buildPolishPrompt({
        draft,
        topic: topic.topic,
        primaryKeyword: topic.primary_keyword,
      }),
    });

    // --- Stage 3a: deterministic gate ------------------------------
    const checks = runStructuralChecks(article);
    if (checks.warnings.length) {
      console.warn(`[blog] warnings for ${article.slug}:`, checks.warnings.join('; '));
    }
    if (!checks.ok) {
      const reason = `Structural gate failed: ${checks.failures.join('; ')}`;
      const { exhausted } = await releaseTopic(topic.id, reason);
      return {
        ok: false,
        action: 'rejected',
        summary: reason,
        detail: { stats: checks.stats, exhausted },
      };
    }

    // --- Stage 3b: model judge -------------------------------------
    const verdict = await runJSON({
      model: MODELS.judge,
      stage: 'judge',
      maxTokens: 2048,
      schema: JUDGE_SCHEMA,
      prompt: buildJudgePrompt({
        article: { ...article, primaryKeyword: topic.primary_keyword },
      }),
    });

    const judgeFailed =
      verdict.qualityScore < MIN_QUALITY_SCORE ||
      !verdict.readsHuman ||
      !verdict.noFabrication;

    if (judgeFailed) {
      const reason = `Quality judge failed (${verdict.qualityScore}/10): ${verdict.reason}`;
      const { exhausted } = await releaseTopic(topic.id, reason);
      return {
        ok: false,
        action: 'rejected',
        summary: reason,
        detail: { verdict, stats: checks.stats, exhausted },
      };
    }

    // --- Persist to the content bank -------------------------------
    const cover = await fetchCoverImage(article.topicCluster || topic.topic);
    const slug = await uniqueSlug(article.slug);

    const saved = await insertApprovedPost({
      topic_id: topic.id,
      slug,
      seo_title: article.seoTitle,
      meta_description: article.metaDescription,
      tldr: article.tldr,
      content_markdown: article.contentMarkdown,
      faq: article.faq,
      category: article.category,
      tags: article.tags,
      primary_keyword: topic.primary_keyword,
      topic_cluster: article.topicCluster,
      cover_image: cover.url,
      cover_image_alt: article.imageAlt || cover.alt,
      internal_links: article.internalLinks || [],
      external_links: article.externalLinks || [],
      word_count: checks.stats.words,
      quality_score: verdict.qualityScore,
      quality_notes: verdict.reason,
    });

    await markTopic(topic.id, 'done');

    return {
      ok: true,
      action: 'generated',
      summary: `Approved "${slug}" (${checks.stats.words} words, score ${verdict.qualityScore}/10)`,
      detail: { slug, postId: saved.id, stats: checks.stats, verdict },
    };
  } catch (err) {
    const { exhausted } = await releaseTopic(topic.id, err.message);
    console.error('[blog] generate failed:', err);
    return {
      ok: false,
      action: 'error',
      summary: `Generation error: ${err.message}`,
      detail: { topicId: topic.id, exhausted },
    };
  }
}
