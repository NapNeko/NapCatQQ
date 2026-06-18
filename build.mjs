#!/usr/bin/env node
/**
 * Build script — uses esbuild JS API (no CLI binary needed).
 * Produces a fully self-contained dist/index.mjs with:
 *   - ZERO runtime npm dependencies
 *   - Only Node.js built-ins (node:sqlite, node:crypto, etc.) at runtime
 *   - jsonwebtoken, lru-cache, otplib bundled inside dist/index.mjs
 *
 * Run: node build.mjs [--watch]
 */
import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes('--watch');

// Everything is bundled EXCEPT Node.js built-ins.
// No native addons remain — better-sqlite3/argon2 have been replaced by node:sqlite/node:crypto.
const EXTERNAL = [
  // Node.js built-in modules (never bundle these)
  'node:*',
  'crypto', 'fs', 'path', 'url', 'events', 'os', 'http', 'https',
  'stream', 'buffer', 'util', 'net', 'child_process', 'worker_threads',
  'assert', 'tls', 'zlib', 'perf_hooks',
];

/** @type {esbuild.BuildOptions} */
const buildOpts = {
  entryPoints: ['src/index.ts'],
  bundle:      true,
  platform:    'node',
  target:      ['node22'],
  format:      'esm',
  outfile:     'dist/index.mjs',
  external:    EXTERNAL,
  sourcemap:   true,
  minify:      false,
  tsconfig:    'tsconfig.json',
  logLevel:    'warning',
};

async function buildOnce() {
  // Build first — only replace dist/ after success so a failed build leaves old dist intact
  mkdirSync(join('dist', 'webui'), { recursive: true });

  const result = await esbuild.build(buildOpts);

  if (result.errors.length > 0) {
    console.error('✗ Build failed:', result.errors.map(e => e.text).join('\n'));
    process.exit(1);
  }

  // Copy webui assets now that build succeeded
  if (existsSync(join('webui', 'index.html'))) {
    copyFileSync(join('webui', 'index.html'), join('dist', 'webui', 'index.html'));
  }

  const size = (await import('fs')).statSync('dist/index.mjs').size;
  console.log(`✓ dist/index.mjs  ${(size/1024).toFixed(0)} KB  (fully bundled, zero runtime npm deps)`);
  console.log('✓ dist/webui/index.html');
}

async function buildWatch() {
  mkdirSync(join('dist', 'webui'), { recursive: true });
  if (existsSync(join('webui', 'index.html')))
    copyFileSync(join('webui', 'index.html'), join('dist', 'webui', 'index.html'));

  const ctx = await esbuild.context({
    ...buildOpts,
    plugins: [{
      name: 'rebuild-notify',
      setup(build) {
        build.onEnd(r => {
          if (r.errors.length === 0)
            console.log(`[${new Date().toLocaleTimeString()}] Rebuilt dist/index.mjs`);
        });
      },
    }],
  });
  await ctx.watch();
  console.log('Watching… (Ctrl+C to stop)');
}

watch ? buildWatch().catch(e => { console.error(e); process.exit(1); })
      : buildOnce().catch(e => { console.error(e); process.exit(1); });
