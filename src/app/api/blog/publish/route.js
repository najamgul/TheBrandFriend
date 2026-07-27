import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  claimNextApprovedPost,
  recordIndexing,
  logRun,
  getPublishedPosts,
} from '../../../../../lib/blog/store';
import { notifySearchEngines, blogUrl, SITE_URL } from '../../../../../lib/blog/indexing';
import { isAuthorized, unauthorized } from '../../../../../lib/blog/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Publishing days, as JS day numbers in Asia/Kolkata (0 = Sunday).
 * Tuesday and Friday gives the 2-posts-per-week cadence with an even spread.
 */
const PUBLISH_DAYS = [2, 5];

function istDayOfWeek() {
  // en-US + weekday:'short' avoids parsing an offset by hand.
  const day = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  }).format(new Date());

  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[day];
}

/**
 * Cron: publishes at most one banked article, then pings IndexNow and the
 * Google Indexing API.
 *
 * Manual run:  curl -H "Authorization: Bearer $CRON_SECRET" \
 *                https://www.thebrandfriend.com/api/blog/publish/?force=1
 */
export async function GET(request) {
  if (!isAuthorized(request)) return unauthorized();

  const params = new URL(request.url).searchParams;
  const force = params.get('force') === '1';

  // Re-submit already-published URLs without publishing anything new. Use this
  // after fixing an indexing credential — otherwise posts that were published
  // while Google was misconfigured are never submitted at all.
  if (params.get('reping') === '1') {
    const posts = await getPublishedPosts({ limit: 100 });
    if (!posts.length) {
      return NextResponse.json(
        { ok: true, action: 'skipped', summary: 'No published posts to re-submit.' },
        { status: 200 }
      );
    }
    const urls = [`${SITE_URL}/blog/`, ...posts.map(p => blogUrl(p.slug))];
    const indexing = await notifySearchEngines(urls);

    // Keep the stored state truthful — the troubleshooting guide tells you to
    // read blog_posts.indexing, so a successful re-ping must clear an earlier
    // failure rather than leaving it stale.
    await Promise.all(posts.map(p => recordIndexing(p.id, indexing)));

    return NextResponse.json(
      {
        ok: true,
        action: 'repinged',
        summary: `Re-submitted ${urls.length} URL(s)`,
        detail: { indexing, count: urls.length },
      },
      { status: 200 }
    );
  }

  const today = istDayOfWeek();

  if (!force && !PUBLISH_DAYS.includes(today)) {
    const result = { ok: true, action: 'skipped', summary: `Not a publishing day (IST day ${today})` };
    return NextResponse.json(result, { status: 200 });
  }

  let result;
  try {
    const post = await claimNextApprovedPost();

    if (!post) {
      result = {
        ok: true,
        action: 'skipped',
        summary: 'Content bank empty — nothing approved to publish.',
      };
    } else {
      const url = blogUrl(post.slug);

      // Rebuild the cached pages before telling search engines to crawl,
      // otherwise a crawler can arrive at a stale listing.
      revalidatePath('/blog');
      revalidatePath(`/blog/${post.slug}`);
      revalidatePath('/sitemap.xml');

      const indexing = await notifySearchEngines([url, `${SITE_URL}/blog/`]);
      await recordIndexing(post.id, indexing);

      result = {
        ok: true,
        action: 'published',
        summary: `Published ${url}`,
        detail: { slug: post.slug, url, indexing },
      };
    }
  } catch (err) {
    console.error('[blog] publish route failed:', err);
    result = { ok: false, action: 'error', summary: `Publish error: ${err.message}` };
  }

  await logRun({
    kind: 'publish',
    ok: result.ok,
    summary: result.summary,
    detail: result.detail || {},
  });

  return NextResponse.json(result, { status: 200 });
}
