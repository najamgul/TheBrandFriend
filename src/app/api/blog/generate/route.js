import { NextResponse } from 'next/server';
import { runGenerate } from '../../../../../lib/blog/pipeline';
import { logRun } from '../../../../../lib/blog/store';
import { isAuthorized, unauthorized } from '../../../../../lib/blog/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const maxDuration = 300;

/**
 * Escape hatch, NOT the scheduled path.
 *
 * A measured end-to-end run is ~4-5 minutes (draft ~60-120s, polish ~160s),
 * which does not fit Vercel's 60s Hobby limit and leaves no headroom against
 * Pro's 300s ceiling. The scheduled generator therefore runs in GitHub
 * Actions — see .github/workflows/blog-pipeline.yml — where there is no
 * meaningful time limit.
 *
 * This route is kept for a manual top-up when you have Pro and want one now.
 * On Hobby it will time out; use the workflow's "Run workflow" button instead.
 *
 * Manual run:  curl -H "Authorization: Bearer $CRON_SECRET" \
 *                https://www.thebrandfriend.com/api/blog/generate?force=1
 */
export async function GET(request) {
  if (!isAuthorized(request)) return unauthorized();

  const force = new URL(request.url).searchParams.get('force') === '1';

  let result;
  try {
    result = await runGenerate({ force });
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
