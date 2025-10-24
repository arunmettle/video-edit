#!/usr/bin/env node
// Tiny helper to run Prisma CLI for the db package while loading the root .env
// - Loads env from repo root .env and injects into process.env
// - Delegates to: pnpm --filter @canva-lite/db exec prisma <args>
// Keeps commands cross-platform without extra deps.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '../../..');

// Simple .env parser (key=value, ignore comments/blank lines)
function loadEnv(file) {
  try {
    let content = readFileSync(file, 'utf8');
    // Strip UTF-8 BOM if present
    if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
    for (const raw of content.split(/\r?\n/)) {
      const s = raw.trim();
      if (!s || s.startsWith('#') || !s.includes('=')) continue;
      const i = s.indexOf('=');
      const key = s.slice(0, i).trim();
      let val = s.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // ignore missing
  }
}

const envPath = resolve(repoRoot, '.env');
console.log('[run-prisma] repoRoot =', repoRoot);
console.log('[run-prisma] reading env from', envPath);
loadEnv(envPath);
const envLocalPath = resolve(repoRoot, '.env.local');
if (existsSync(envLocalPath)) {
  console.log('[run-prisma] reading env from', envLocalPath);
  loadEnv(envLocalPath);
}

if (!process.env.DATABASE_URL) {
  console.error('[run-prisma] DATABASE_URL is not set.');
  console.error('[run-prisma] Looked for root env at:', envPath, existsSync(envPath) ? '(found)' : '(missing)');
  console.error('[run-prisma] Please add DATABASE_URL to the root .env or set it in your shell.');
  process.exit(1);
} else {
  const masked = process.env.DATABASE_URL.replace(/:[^:@/]+@/, ':*****@');
  console.log('[run-prisma] DATABASE_URL detected:', masked);
}

const args = process.argv.slice(2);
console.log('[run-prisma] args:', args.join(' '));
const cmd = `pnpm --filter @canva-lite/db exec prisma ${args.join(' ')}`;
console.log('[run-prisma] shell exec:', cmd);
const run = spawnSync(cmd, { stdio: 'inherit', cwd: repoRoot, env: process.env, shell: true });
console.log('[run-prisma] exit code =', run.status, 'signal =', run.signal);
if (run.error) console.error('[run-prisma] error:', run.error);
process.exit(run.status ?? 1);
