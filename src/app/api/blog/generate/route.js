import { NextResponse } from 'next/server';
import { runGenerate } from '../../../../../lib/blog/pipeline';
import { logRun } from '../../../../../lib/blog/store';
import { isAuthorized, unauthorized } from '../../../../../lib/blog/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Vercel Pro's ceiling. A typical run is ~186s; the slowest observed was 285s
// when a malformed draft triggered a JSON repair retry.
export const maxDuration = 300;

// Stop work 40s before Vercel kills the function. The pipeline uses this to
// abort cleanly and hand its topic back, rather than being killed mid-write
// and leaving the topic stranded in 'generating'.
const SAFETY_MARGIN_MS = 40_000;

/**
 * Cron: tops the content bank up to CONTENT_BANK_TARGET approved articles.
 * Runs daily and no-ops once the bank is full, so a slow or failed generation
 * never disturbs the publishing cadence.
 *
 * Requires Vercel Pro — a run does not fit the 60s Hobby function limit.
 * For a manual run outside Vercel, `node scripts/blog-pipeline.mjs generate`
 * does the same work with no time limit.
 *
 * Manual run:  curl -H "Authorization: Bearer $CRON_SECRET" \
 *                https://www.thebrandfriend.com/api/blog/generate?force=1
 */
export async function GET(request) {
  if (!isAuthorized(request)) return unauthorized();

  const force = new URL(request.url).searchParams.get('force') === '1';

  const deadline = Date.now() + maxDuration * 1000 - SAFETY_MARGIN_MS;

  let result;
  try {
    result = await runGenerate({ force, deadline });
  } catch (err) {
    console.error('[blog] generate route crashed:', err);
    result = { ok: false, action: 'error', summary: `Unhandled: ${err.message}` };
  }

  await logRun({
    kind: 'generate',
    ok: result.ok,
    summary: result.summary,
    detail: result.detail || {},
  });

  // Always 200: a non-2xx makes the scheduler retry, and every failure mode
  // here is deterministic — a retry would just burn tokens on the same error.
  return NextResponse.json(result, { status: 200 });
}
