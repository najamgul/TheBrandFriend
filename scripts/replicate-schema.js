#!/usr/bin/env node
/**
 * Dumps the real input schema for the models the blog pipeline uses.
 *
 * Replicate wraps each model in its own input schema — field names are NOT
 * the underlying provider's parameter names, and they differ between model
 * families. This prints the truth so the client code matches it exactly.
 *
 * Usage:
 *   node scripts/replicate-schema.js
 *
 * Reads REPLICATE_API_TOKEN from .env.local or the environment.
 * The token is never printed.
 */

const fs = require('fs');
const path = require('path');

const MODELS = [
  'google/gemini-2.5-flash',
  'anthropic/claude-4.5-sonnet',
  'anthropic/claude-4.5-haiku',
  // Uncomment to compare the higher tier:
  // 'anthropic/claude-opus-4.6',
];

function loadToken() {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN;

  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return null;

  const line = fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .find(l => l.trim().startsWith('REPLICATE_API_TOKEN='));

  if (!line) return null;
  return line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
}

async function describe(token, ref) {
  const res = await fetch(`https://api.replicate.com/v1/models/${ref}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.log(`\n❌ ${ref} — HTTP ${res.status} ${await res.text().catch(() => '')}`);
    return;
  }

  const model = await res.json();
  const schema =
    model?.latest_version?.openapi_schema?.components?.schemas?.Input;
  const outputSchema =
    model?.latest_version?.openapi_schema?.components?.schemas?.Output;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`MODEL: ${ref}`);
  console.log(`Official (no version hash needed): ${model.latest_version ? 'yes' : 'unknown'}`);
  console.log('='.repeat(70));

  if (!schema?.properties) {
    console.log('  (no input schema exposed)');
  } else {
    const required = schema.required || [];
    const entries = Object.entries(schema.properties).sort(
      (a, b) => (a[1]['x-order'] ?? 99) - (b[1]['x-order'] ?? 99)
    );

    for (const [name, spec] of entries) {
      const type = spec.type || (spec.allOf ? 'enum' : '?');
      const def = spec.default !== undefined ? ` default=${JSON.stringify(spec.default)}` : '';
      const req = required.includes(name) ? ' [REQUIRED]' : '';
      const range =
        spec.minimum !== undefined || spec.maximum !== undefined
          ? ` (${spec.minimum ?? '-'}..${spec.maximum ?? '-'})`
          : '';
      console.log(`  ${name.padEnd(28)} ${String(type).padEnd(8)}${range}${def}${req}`);
      if (spec.description) {
        console.log(`  ${' '.repeat(28)} ↳ ${spec.description.split('\n')[0].slice(0, 110)}`);
      }
    }
  }

  console.log(`\n  OUTPUT: ${JSON.stringify(outputSchema) || '(not exposed)'}`);
}

(async () => {
  const token = loadToken();
  if (!token) {
    console.error(
      'REPLICATE_API_TOKEN not found.\n' +
        'Add it to .env.local as:  REPLICATE_API_TOKEN=r8_...\n' +
        '(.env.local is gitignored — the token stays local.)'
    );
    process.exit(1);
  }

  for (const ref of MODELS) {
    try {
      await describe(token, ref);
    } catch (err) {
      console.log(`\n❌ ${ref} — ${err.message}`);
    }
  }
  console.log('');
})();
