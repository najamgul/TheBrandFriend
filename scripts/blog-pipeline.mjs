#!/usr/bin/env node
/**
 * CLI entry point for the blog pipeline.
 *
 * Generation runs here rather than in a Vercel function because a measured
 * end-to-end run takes ~4-5 minutes (draft ~60-120s, polish ~160s). That does
 * not fit Vercel's 60s Hobby limit and sits uncomfortably against Pro's 300s
 * ceiling. GitHub Actions has no such constraint.
 *
 * Publishing stays on Vercel — it is a database update plus two HTTP pings,
 * and it needs Next's revalidatePath to rebuild the cached pages.
 *
 * Usage:
 *   node scripts/blog-pipeline.mjs generate [--force]
 *
 * Env required: REPLICATE_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY
 * Optional:     UNSPLASH_ACCESS_KEY, REPLICATE_*_MODEL
 *
 * Locally it reads .env.local; in CI the values come from repository secrets.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

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

const { runGenerate } = await import(path.join(root, 'lib/blog/pipeline.js'));
const { logRun } = await import(path.join(root, 'lib/blog/store.js'));

if (command !== 'generate') {
  console.error(`Unknown command "${command}". Only "generate" runs here; publishing runs on Vercel.`);
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
