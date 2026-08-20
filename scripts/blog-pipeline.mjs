#!/usr/bin/env node
/**
 * CLI entry point for the blog pipeline.
 *
 * This is the manual fallback for generation. The scheduled run happens in the
 * Worker (see worker.ts and the crons in wrangler.jsonc); this path exists for
 * when you want a run with no time budget at all, or Cloudflare is not the
 * place you want to spend the wall-clock.
 *
 * Publishing has no CLI equivalent — it needs Next's revalidatePath to rebuild
 * the cached pages, so it only runs inside the app.
 *
 * Usage:
 *   node scripts/blog-pipeline.mjs generate [--force]
 *
 * Env required: REPLICATE_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY
 * Optional:     PEXELS_API_KEY, REPLICATE_*_MODEL
 *
 * Locally it reads .env.local; in CI the values come from repository secrets.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

/**
 * Dynamic import of a local module by path.
 *
 * A bare absolute path works on Linux but throws on Windows, where "d:" is
 * parsed as a URL scheme (ERR_UNSUPPORTED_ESM_URL_SCHEME). Always convert to
 * a file:// URL so this runs the same on a dev machine and in CI.
 */
const importLocal = relative => import(pathToFileURL(path.join(root, relative)).href);

// Local convenience only — CI injects real environment variables.
const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

const REQUIRED = ['REPLICATE_API_TOKEN', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missing = REQUIRED.filter(key => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const command = process.argv[2] || 'generate';
const force = process.argv.includes('--force');

const { runGenerate } = await importLocal('lib/blog/pipeline.js');
const { logRun } = await importLocal('lib/blog/store.js');

if (command !== 'generate') {
  console.error(`Unknown command "${command}". Only "generate" runs here; publishing runs in the app.`);
  process.exit(1);
}

const startedAt = Date.now();
let result;

try {
  result = await runGenerate({ force });
} catch (err) {
  console.error('[blog] unhandled pipeline error:', err);
  result = { ok: false, action: 'error', summary: `Unhandled: ${err.message}` };
}

const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);

await logRun({
  kind: 'generate',
  ok: result.ok,
  summary: result.summary,
  detail: { ...(result.detail || {}), runner: 'github-actions', seconds: Number(seconds) },
}).catch(err => console.error('[blog] logRun failed:', err.message));

console.log(`\n[${result.ok ? 'OK' : 'FAIL'}] ${result.action} in ${seconds}s`);
console.log(result.summary);

// A rejected article is a normal outcome (the gate did its job) and must not
// fail the workflow — only an actual error should turn the run red.
process.exit(result.action === 'error' ? 1 : 0);
