import { NextResponse } from 'next/server';

/**
 * Cron route auth.
 *
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically when
 * the CRON_SECRET environment variable is set on the project. The same header
 * lets you trigger a run by hand with curl.
 *
 * If CRON_SECRET is unset the routes are locked shut rather than left open —
 * an unauthenticated generate endpoint is a way to burn API credit.
 */
export function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[blog] CRON_SECRET is not set — refusing to run.');
    return false;
  }
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
