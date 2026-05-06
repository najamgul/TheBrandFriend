/**
 * TheBrandFriend — Design Builder
 * 
 * Builds all AI Studio design projects from /designs-src/{slug}/
 * and deploys them to /public/designs/{slug}/.
 * 
 * Usage:
 *   npm run build:designs           → Build all designs
 *   npm run build:designs swiss-echo → Build one specific design
 * 
 * Workflow:
 *   1. Create design in AI Studio, download the Vite project
 *   2. Drop it into /designs-src/{slug}/  (e.g. designs-src/swiss-echo/)
 *   3. Run: npm run build:designs
 *   4. Push to GitHub → live on your site
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'designs-src');
const OUT_DIR = path.join(ROOT, 'public', 'designs');
const SHARED_DIR = path.join(OUT_DIR, '_shared');

// Toolbar + animation injection snippets
const HEAD_INJECT = `
  <link rel="stylesheet" href="../_shared/toolbar.css">
  <link rel="stylesheet" href="../_shared/animations.css">`;

const BODY_INJECT = `
<script src="../_shared/animations.js"></script>
<script src="../_shared/toolbar.js"></script>`;

// ─── Helpers ───

function log(msg) { console.log(`\x1b[36m[designs]\x1b[0m ${msg}`); }
function success(msg) { console.log(`\x1b[32m  ✓\x1b[0m ${msg}`); }
function warn(msg) { console.log(`\x1b[33m  ⚠\x1b[0m ${msg}`); }
function fail(msg) { console.error(`\x1b[31m  ✗\x1b[0m ${msg}`); }

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function cleanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    // Don't delete _shared folder or its contents
    if (entry.name === '_shared') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // We only clean the individual design folder, not all of /public/designs/
    }
  }
}

function injectToolbar(htmlPath) {
  let html = fs.readFileSync(htmlPath, 'utf-8');
  let modified = false;

  // Inject CSS before </head> (if not already present)
  if (!html.includes('_shared/toolbar.css')) {
    html = html.replace('</head>', `${HEAD_INJECT}\n</head>`);
    modified = true;
  }

  // Inject JS before </body> (if not already present)
  if (!html.includes('_shared/toolbar.js')) {
    html = html.replace('</body>', `${BODY_INJECT}\n</body>`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(htmlPath, html);
  }
  return modified;
}

// ─── Build Single Design ───

function buildDesign(slug) {
  const srcPath = path.join(SRC_DIR, slug);
  const destPath = path.join(OUT_DIR, slug);

  if (!fs.existsSync(srcPath)) {
    fail(`Source not found: designs-src/${slug}/`);
    return false;
  }

  log(`Building "${slug}"...`);

  // Check if it's a Vite/React project or plain HTML
  const hasPackageJson = fs.existsSync(path.join(srcPath, 'package.json'));
  const hasIndexHtml = fs.existsSync(path.join(srcPath, 'index.html'));

  if (hasPackageJson) {
    // ── Vite/React project: install + build ──
    try {
      // Install dependencies if needed
      if (!fs.existsSync(path.join(srcPath, 'node_modules'))) {
        log(`  Installing dependencies...`);
        execSync('npm install', { cwd: srcPath, stdio: 'pipe' });
        success('Dependencies installed');
      }

      // Build with relative base path so assets work from any subfolder
      log(`  Running build...`);
      execSync('npx vite build --base=./', { cwd: srcPath, stdio: 'pipe' });
      success('Build complete');

      // Find the dist folder (Vite default is "dist")
      const distPath = path.join(srcPath, 'dist');
      if (!fs.existsSync(distPath)) {
        fail(`Build succeeded but dist/ folder not found in designs-src/${slug}/`);
        return false;
      }

      // Clean destination and copy dist contents
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true });
      }
      copyDirSync(distPath, destPath);
      success(`Copied dist → public/designs/${slug}/`);

    } catch (err) {
      fail(`Build failed for "${slug}": ${err.message}`);
      if (err.stderr) console.error(err.stderr.toString().slice(0, 500));
      return false;
    }
  } else if (hasIndexHtml) {
    // ── Plain HTML project: just copy everything ──
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true });
    }
    copyDirSync(srcPath, destPath);
    success(`Copied HTML project → public/designs/${slug}/`);
  } else {
    fail(`No package.json or index.html found in designs-src/${slug}/`);
    return false;
  }

  // ── Inject shared toolbar into index.html ──
  const indexPath = path.join(destPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    const injected = injectToolbar(indexPath);
    if (injected) {
      success('Toolbar + animations injected');
    } else {
      warn('Toolbar already present, skipped injection');
    }
  } else {
    warn('No index.html found in output — toolbar not injected');
  }

  return true;
}

// ─── Main ───

function main() {
  const targetSlug = process.argv[2]; // Optional: build a single design

  // Ensure source directory exists
  if (!fs.existsSync(SRC_DIR)) {
    fs.mkdirSync(SRC_DIR, { recursive: true });
    log(`Created designs-src/ directory.`);
    log(`Drop your AI Studio projects there and run again.`);
    log(`Example: designs-src/swiss-echo/  designs-src/raw-form/`);
    return;
  }

  // Ensure shared assets exist
  if (!fs.existsSync(SHARED_DIR)) {
    fail(`Missing public/designs/_shared/ — shared toolbar files not found.`);
    process.exit(1);
  }

  if (targetSlug) {
    // Build single design
    const ok = buildDesign(targetSlug);
    process.exit(ok ? 0 : 1);
  }

  // Build all designs
  const slugs = fs.readdirSync(SRC_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(name => !name.startsWith('.') && !name.startsWith('_'));

  if (slugs.length === 0) {
    log('No design projects found in designs-src/');
    log('Drop your AI Studio projects there:');
    log('  designs-src/swiss-echo/');
    log('  designs-src/raw-form/');
    log('  ...');
    return;
  }

  log(`Found ${slugs.length} design(s): ${slugs.join(', ')}\n`);

  let passed = 0;
  let failed = 0;

  for (const slug of slugs) {
    const ok = buildDesign(slug);
    if (ok) passed++;
    else failed++;
    console.log(''); // spacer
  }

  // Summary
  console.log('─'.repeat(40));
  log(`Done! ${passed} built, ${failed} failed.`);
  if (passed > 0) {
    log(`Run "npm run build && git push" to deploy.`);
  }
}

main();
