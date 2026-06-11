#!/usr/bin/env node
/**
 * Build script for napcat-plugin-qq-guardian
 * Uses esbuild's Node.js API directly — no CLI binary needed.
 * Run: node build.mjs [--watch]
 */
import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes('--watch');

// All npm packages that must stay external (native addons + complex loaders)
const EXTERNAL = [
  'better-sqlite3', 'argon2',
  'pino', 'pino-roll',
  'express', 'express-rate-limit', 'helmet',
  'jsonwebtoken', 'ws',
  'lru-cache', 'otplib', 'multer',
];

/** @type {esbuild.BuildOptions} */
const buildOpts = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: ['node22'],
  format: 'esm',
  outfile: 'dist/index.mjs',
  external: EXTERNAL,
  sourcemap: true,
  minify: false,
  tsconfig: 'tsconfig.json',
  logLevel: 'info',
};

async function buildOnce() {
  // Clean dist
  if (existsSync('dist')) rmSync('dist', { recursive: true, force: true });
  mkdirSync(join('dist', 'webui'), { recursive: true });

  const result = await esbuild.build(buildOpts);

  // Copy WebUI assets
  if (existsSync(join('webui', 'index.html'))) {
    copyFileSync(join('webui', 'index.html'), join('dist', 'webui', 'index.html'));
    console.log('✓ webui/index.html → dist/webui/index.html');
  }

  if (result.errors.length > 0) {
    console.error(`✗ Build failed (${result.errors.length} error(s))`);
    process.exit(1);
  }
  console.log('✓ Build complete: dist/index.mjs');
}

async function buildWatch() {
  mkdirSync(join('dist', 'webui'), { recursive: true });
  if (existsSync(join('webui', 'index.html'))) {
    copyFileSync(join('webui', 'index.html'), join('dist', 'webui', 'index.html'));
  }

  const ctx = await esbuild.context({
    ...buildOpts,
    plugins: [{
      name: 'watch-notify',
      setup(build) {
        build.onEnd(result => {
          if (result.errors.length === 0) {
            console.log(`[${new Date().toLocaleTimeString()}] Rebuilt dist/index.mjs`);
          }
        });
      },
    }],
  });
  await ctx.watch();
  console.log('Watching for changes… (Ctrl+C to stop)');
}

if (watch) {
  buildWatch().catch(e => { console.error(e); process.exit(1); });
} else {
  buildOnce().catch(e => { console.error(e); process.exit(1); });
}
