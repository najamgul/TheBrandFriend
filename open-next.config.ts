import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';
import { purgeCache } from '@opennextjs/cloudflare/overrides/cache-purge/index';

/**
 * How Next's cache is backed on Cloudflare.
 *
 * The site leans on both halves of ISR, so both need somewhere to live:
 *   - time-based  — `revalidate` on /, /blog, /blog/[slug], /portfolio
 *   - on-demand   — `revalidatePath` from the publish cron, which must make a
 *                   new post visible immediately rather than up to 5 minutes later
 *
 * Every binding named here is declared in wrangler.jsonc under the exact name
 * the override expects. Renaming one there silently disables the cache.
 */
export default defineCloudflareConfig({
  // R2 rather than KV: KV is eventually consistent, and a stale read right
  // after a publish is the one case this has to get right.
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: 'long-lived' }),

  // Runs the revalidation triggered by an expired `revalidate` window, and
  // de-duplicates it so one stale page does not start a rebuild per request.
  queue: doQueue,

  // Backs `revalidatePath`. Four shards is the default and is ample here —
  // the tag write rate is two posts a week.
  tagCache: doShardedTagCache({ baseShardSize: 4, regionalCache: true }),

  // Without this, a revalidated page stays cached at the edge until its own
  // TTL expires, so `revalidatePath` would update the origin and change
  // nothing a visitor sees.
  cachePurge: purgeCache({ type: 'durableObject' }),
});
