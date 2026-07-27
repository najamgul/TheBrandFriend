import { getSupabase } from '../supabase.js';
import { SEED_TOPICS } from './topics.js';

/** Number of gate-passed articles kept ready to publish. */
export const CONTENT_BANK_TARGET = 4;

/**
 * Read-path client. Returns null instead of throwing when Supabase is not
 * configured, so a build or preview without env vars renders an empty blog
 * rather than failing outright. Write paths deliberately use getSupabase()
 * directly — a cron that cannot reach the database must fail loudly.
 */
function readClient() {
  try {
    return getSupabase();
  } catch (err) {
    console.warn('[blog] Supabase unavailable for read:', err.message);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Topics                                                              */
/* ------------------------------------------------------------------ */

/**
 * Insert any seed topics that are not already in the table.
 * Safe to call on every cron run — the unique index on primary_keyword
 * makes this idempotent.
 */
export async function seedTopicsIfEmpty() {
  const supabase = getSupabase();

  const { count, error: countError } = await supabase
    .from('blog_topics')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'queued');

  if (countError) throw new Error(`Counting topics failed: ${countError.message}`);
  if ((count ?? 0) > 0) return 0;

  // Dedupe in the client rather than with ON CONFLICT. The uniqueness rule is
  // an expression index on lower(primary_keyword), and Postgres cannot match a
  // column conflict target to an expression index — PostgREST's on_conflict
  // only accepts plain column names, so an upsert here fails outright.
  const { data: existing, error: readError } = await supabase
    .from('blog_topics')
    .select('primary_keyword');

  if (readError) throw new Error(`Reading existing topics failed: ${readError.message}`);

  const taken = new Set((existing || []).map(t => t.primary_keyword.toLowerCase()));

  const rows = SEED_TOPICS
    // Keywords are stored lowercased so the expression index and this check agree.
    .map(t => ({
      topic: t.topic,
      primary_keyword: t.primaryKeyword.toLowerCase().trim(),
      intent: t.intent,
      cluster: t.cluster,
      status: 'queued',
    }))
    .filter(row => !taken.has(row.primary_keyword));

  if (!rows.length) return 0;

  const { data, error } = await supabase.from('blog_topics').insert(rows).select('id');

  if (error) {
    // 23505 = unique violation: another runner seeded concurrently. Harmless.
    if (error.code === '23505') {
      console.warn('[blog] topics already seeded by a concurrent run');
      return 0;
    }
    throw new Error(`Seeding topics failed: ${error.message}`);
  }
  return data?.length ?? 0;
}

/**
 * A claim older than this is assumed dead — the runner was killed mid-flight
 * (a serverless timeout, a redeploy) and never released the row. Comfortably
 * longer than the slowest observed run (~285s).
 */
const STALE_CLAIM_MS = 20 * 60 * 1000;

/**
 * Release topics stuck in 'generating' by a runner that died before it could
 * hand them back. Without this a timed-out run silently removes a topic from
 * the queue forever, since claimNextTopic only ever looks at 'queued'.
 */
export async function recoverStaleClaims() {
  const supabase = getSupabase();
  const cutoff = new Date(Date.now() - STALE_CLAIM_MS).toISOString();

  const { data, error } = await supabase
    .from('blog_topics')
    .update({
      status: 'queued',
      failure_reason: 'Reclaimed after a runner died mid-generation (timeout or redeploy).',
    })
    .eq('status', 'generating')
    .lt('updated_at', cutoff)
    .select('id, primary_keyword');

  if (error) {
    console.error('[blog] recoverStaleClaims failed:', error.message);
    return 0;
  }
  if (data?.length) {
    console.warn(
      `[blog] reclaimed ${data.length} stale topic(s): ${data.map(t => t.primary_keyword).join(', ')}`
    );
  }
  return data?.length ?? 0;
}

/** Claim the oldest queued topic and mark it in-flight. */
export async function claimNextTopic() {
  const supabase = getSupabase();

  const { data: topics, error } = await supabase
    .from('blog_topics')
    .select('*')
    .eq('status', 'queued')
    .lt('retry_count', 3)
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) throw new Error(`Fetching next topic failed: ${error.message}`);
  if (!topics?.length) return null;

  const topic = topics[0];

  // Conditional update doubles as a lock: if a concurrent run already claimed
  // this row, status is no longer 'queued' and we get zero rows back.
  const { data: claimed, error: claimError } = await supabase
    .from('blog_topics')
    .update({ status: 'generating' })
    .eq('id', topic.id)
    .eq('status', 'queued')
    .select('*');

  if (claimError) throw new Error(`Claiming topic failed: ${claimError.message}`);
  if (!claimed?.length) return null;

  return claimed[0];
}

export async function markTopic(id, status, failureReason = null) {
  const supabase = getSupabase();
  const patch = { status };
  if (failureReason) patch.failure_reason = failureReason.slice(0, 1000);

  const { error } = await supabase.from('blog_topics').update(patch).eq('id', id);
  if (error) console.error('[blog] markTopic failed:', error.message);
}

export async function releaseTopic(id, failureReason) {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('blog_topics')
    .select('retry_count')
    .eq('id', id)
    .single();

  const retryCount = (data?.retry_count ?? 0) + 1;
  const exhausted = retryCount >= 3;

  const { error } = await supabase
    .from('blog_topics')
    .update({
      status: exhausted ? 'failed' : 'queued',
      retry_count: retryCount,
      failure_reason: String(failureReason).slice(0, 1000),
    })
    .eq('id', id);

  if (error) console.error('[blog] releaseTopic failed:', error.message);
  return { retryCount, exhausted };
}

/* ------------------------------------------------------------------ */
/* Posts                                                               */
/* ------------------------------------------------------------------ */

/** Published posts, newest first. Used by the listing page and sitemap. */
export async function getPublishedPosts({ limit = 200 } = {}) {
  const supabase = readClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      'id, slug, seo_title, meta_description, tldr, category, tags, cover_image, cover_image_alt, author, published_at, updated_at, word_count'
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[blog] getPublishedPosts failed:', error.message);
    return [];
  }
  return data || [];
}

export async function getPostBySlug(slug) {
  const supabase = readClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error('[blog] getPostBySlug failed:', error.message);
    return null;
  }
  return data;
}

/** Recent posts of any status — the model uses these as internal link targets. */
export async function getPostsForLinking({ limit = 30 } = {}) {
  const supabase = readClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, seo_title, category, primary_keyword')
    .in('status', ['approved', 'published'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[blog] getPostsForLinking failed:', error.message);
    return [];
  }
  return data || [];
}

/** How many gate-passed articles are waiting to go live. */
export async function countApproved() {
  const supabase = getSupabase();

  const { count, error } = await supabase
    .from('blog_posts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved');

  if (error) throw new Error(`Counting approved posts failed: ${error.message}`);
  return count ?? 0;
}

export async function insertApprovedPost(row) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({ ...row, status: 'approved' })
    .select('id, slug')
    .single();

  if (error) throw new Error(`Inserting post failed: ${error.message}`);
  return data;
}

/** Oldest approved article — publish in the order they were written. */
export async function claimNextApprovedPost() {
  const supabase = getSupabase();

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) throw new Error(`Fetching approved post failed: ${error.message}`);
  if (!posts?.length) return null;

  const post = posts[0];

  const { data: claimed, error: claimError } = await supabase
    .from('blog_posts')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', post.id)
    .eq('status', 'approved')
    .select('*');

  if (claimError) throw new Error(`Publishing post failed: ${claimError.message}`);
  if (!claimed?.length) return null;

  return claimed[0];
}

export async function recordIndexing(postId, indexing) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('blog_posts')
    .update({ indexing: { ...indexing, at: new Date().toISOString() } })
    .eq('id', postId);

  if (error) console.error('[blog] recordIndexing failed:', error.message);
}

/** Slug collision guard — the DB unique index is the real backstop. */
export async function slugExists(slug) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[blog] slugExists failed:', error.message);
    return false;
  }
  return Boolean(data);
}

/* ------------------------------------------------------------------ */
/* Runs                                                                */
/* ------------------------------------------------------------------ */

export async function logRun({ kind, ok, summary, detail = {} }) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('blog_runs')
    .insert({ kind, ok, summary: String(summary).slice(0, 2000), detail });

  if (error) console.error('[blog] logRun failed:', error.message);
}
