/**
 * Worker entrypoint.
 *
 * OpenNext generates `.open-next/worker.js` at build time, which handles every
 * HTTP request. That generated worker has no `scheduled` export, so the blog
 * crons — which ran on Vercel Cron before the move to Cloudflare — need this
 * wrapper. `wrangler.jsonc` points `main` here instead of at the generated file.
 *
 * The Durable Object re-exports below are not optional: the incremental cache's
 * revalidation queue, the tag cache behind `revalidatePath`, and the CDN purge
 * are all Durable Objects declared in wrangler.jsonc, and Cloudflare resolves
 * their classes from the deployed entrypoint.
 */

import { default as handler } from './.open-next/worker.js';

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from './.open-next/worker.js';

/** Canonical host, mirroring lib/site.js. Only used to build the cron's URL. */
const SITE_HOST = 'www.thebrandfriend.com';

/**
 * Cron schedule → route. Must stay in step with `triggers.crons` in
 * wrangler.jsonc; a schedule with no entry here is a no-op, not an error.
 */
const CRON_ROUTES: Record<string, string> = {
  '0 2 * * *': '/api/blog/generate/',
  '0 4 * * *': '/api/blog/publish/',
};

export default {
  fetch: handler.fetch,

  async scheduled(controller, env, ctx) {
    const path = CRON_ROUTES[controller.cron];
    if (!path) {
      console.error(`[cron] no route mapped for schedule "${controller.cron}"`);
      return;
    }

    const secret = env.CRON_SECRET;
    if (!secret) {
      // The routes reject unauthenticated calls anyway; say why, so a missing
      // secret reads as a config problem in the logs rather than a 401 mystery.
      console.error('[cron] CRON_SECRET is not set — the route will reject this run.');
    }

    // Dispatched straight through the Next handler rather than over the
    // network. `global_fetch_strictly_public` would send a fetch() to our own
    // host out to the public internet and back, which costs a round trip and
    // would be served by whatever currently answers for the domain.
    const request = new Request(`https://${SITE_HOST}${path}`, {
      headers: { authorization: `Bearer ${secret}` },
    });

    const response = await handler.fetch(request, env, ctx);
    const body = await response.text();

    // The routes answer 200 even on failure, on purpose — a non-2xx makes the
    // scheduler retry, and every failure mode there is deterministic. So the
    // body, not the status, is what tells you what happened.
    console.log(`[cron] ${path} → ${response.status} ${body.slice(0, 500)}`);
  },
} satisfies ExportedHandler<CloudflareEnv>;
