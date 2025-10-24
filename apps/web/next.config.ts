import type { NextConfig } from 'next';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Load env from repo root so server runtime (Prisma) has DATABASE_URL
// Next.js only auto-loads .env files from the app root (apps/web),
// so for monorepos we manually hydrate process.env here.
function loadRootEnv() {
  // apps/web -> repo root
  const root = resolve(__dirname, '../../');
  const files = ['.env', '.env.local'];
  for (const name of files) {
    const p = resolve(root, name);
    if (!existsSync(p)) continue;
    try {
      let content = readFileSync(p, 'utf8');
      if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
      for (const raw of content.split(/\r?\n/)) {
        const s = raw.trim();
        if (!s || s.startsWith('#') || !s.includes('=')) continue;
        const i = s.indexOf('=');
        const k = s.slice(0, i).trim();
        let v = s.slice(i + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!(k in process.env)) process.env[k] = v;
      }
    } catch {}
  }
}

loadRootEnv();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ['@canva-lite/db', '@canva-lite/contracts'],
};

export default nextConfig;
