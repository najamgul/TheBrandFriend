import { runJSON, runSectioned, MODELS } from './replicate.js';
import { fetchCoverImage } from './images.js';
import {
  buildDraftPrompt,
  buildPolishPrompt,
  buildJudgePrompt,
  buildGateRepairPrompt,
  DRAFT_SCHEMA,
  POLISHED_SCHEMA,
  JUDGE_SCHEMA,
} from './prompts.js';
import { runStructuralChecks, keywordOverlap, MIN_QUALITY_SCORE } from './quality-gate.js';
import {
  seedTopicsIfEmpty,
  recoverStaleClaims,
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

/** Observed polish wall-clock is ~124s; budget generously before committing. */
const POLISH_BUDGET_MS = 150_000;

/**
 * Gate repair runs on the judge model — the edits are mechanical (remove a
 * phrase, split a paragraph), so the cheap fast model is the right tool and
 * keeps the whole run inside the serverless ceiling.
 */
const REPAIR_BUDGET_MS = 60_000;

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
export async function runGenerate({ force = false, deadline = null } = {}) {
  // Hand back anything a previously killed runner left claimed, or those
  // topics are stranded in 'generating' and never retried.
  await recoverStaleClaims();

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
    const draft = await runSectioned({
      model: MODELS.draft,
      stage: 'draft',
      maxTokens: 32768,
      deadline,
      schema: DRAFT_SCHEMA,
      prompt: buildDraftPrompt({
        topic: topic.topic,
        primaryKeyword: topic.primary_keyword,
        intent: topic.intent,
        existingPosts: existing.filter(p => p.slug),
      }),
    });

    // Polish is the long pole (~124s observed). If the remaining budget
    // cannot cover it, stop cleanly and hand the topic back rather than
    // getting killed mid-write and stranding it in 'generating'.
    if (deadline && Date.now() + POLISH_BUDGET_MS > deadline) {
      const reason = 'Ran out of time budget before the polish stage.';
      await releaseTopic(topic.id, reason);
      return { ok: false, action: 'aborted', summary: reason };
    }

    // --- Stage 2: voice rewrite (Claude via Replicate) -------------
    console.log(`[blog] polishing with ${MODELS.polish}: ${topic.primary_keyword}`);
    let article = await runSectioned({
      model: MODELS.polish,
      stage: 'polish',
      maxTokens: 32000,
      deadline,
      schema: POLISHED_SCHEMA,
      prompt: buildPolishPrompt({
        draft,
        topic: topic.topic,
        primaryKeyword: topic.primary_keyword,
      }),
    });

    // --- Stage 3a: deterministic gate ------------------------------
    let checks = runStructuralChecks(article);
    if (checks.warnings.length) {
      console.warn(`[blog] warnings for ${article.slug}:`, checks.warnings.join('; '));
    }
    // One surgical repair pass before giving up. The gate's complaints are
    // precise and mechanical, so a targeted fix salvages an otherwise good
    // article instead of discarding ~180s of work over two sentences.
    if (!checks.ok && (!deadline || Date.now() + REPAIR_BUDGET_MS < deadline)) {
      console.warn(`[blog] gate failed, attempting repair: ${checks.failures.join('; ')}`);
      try {
        const repaired = await runSectioned({
          model: MODELS.judge,
          stage: 'gate-repair',
          maxTokens: 8192,
          deadline,
          schema: POLISHED_SCHEMA,
          prompt: buildGateRepairPrompt({ article, failures: checks.failures }),
        });

        const recheck = runStructuralChecks(repaired);
        if (recheck.ok) {
          console.log('[blog] gate repair succeeded');
          article = repaired;
          checks = recheck;
        } else {
          console.warn(`[blog] repair did not clear the gate: ${recheck.failures.join('; ')}`);
        }
      } catch (err) {
        console.warn('[blog] gate repair failed:', err.message);
      }
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
      deadline,
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
    const cover = await fetchCoverImage(
      article.imageQuery || article.topicCluster || topic.topic
    );
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
      cover_image_credit: cover.credit,
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
