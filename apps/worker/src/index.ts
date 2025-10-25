// BullMQ render worker
// - Consumes 'render' queue
// - Logs job data
// - Updates Render row from 'queued' to 'completed'
import { Worker, QueueEvents } from 'bullmq';
import { prisma } from '@canva-lite/db';
import { ffmpegArgs } from './ffmpegArgs';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, createReadStream, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Load env from repo root so the worker sees AWS/Redis/DB vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function loadEnv(file: string) {
  try {
    let content = readFileSync(file, 'utf8');
    if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
    for (const raw of content.split(/\r?\n/)) {
      const s = raw.trim();
      if (!s || s.startsWith('#') || !s.includes('=')) continue;
      const i = s.indexOf('=');
      const k = s.slice(0, i).trim();
      let v = s.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!(k in process.env)) (process.env as any)[k] = v;
    }
  } catch {
    // ignore
  }
}

const repoRoot = resolve(__dirname, '../../..');
loadEnv(resolve(repoRoot, '.env'));
loadEnv(resolve(repoRoot, '.env.local'));

const connection = { url: process.env.REDIS_URL as string };

const events = new QueueEvents('render', { connection });
events.on('completed', ({ jobId }) => console.log('job completed', jobId));
events.on('failed', ({ jobId, failedReason }) => console.error('job failed', jobId, failedReason));

const worker = new Worker(
  'render',
  async (job) => {
    console.log('processing job', job.id, job.name, job.data);
    const { renderId } = job.data as { renderId: string };
    // 1) Generate a tiny test video using ffmpeg
    const { args, out } = ffmpegArgs();
    let outPath = out;
    if (process.platform === 'win32') {
      // Map /tmp/out.mp4 to %TEMP%/out.mp4 on Windows
      const t = tmpdir();
      try {
        if (!existsSync(t)) mkdirSync(t, { recursive: true });
      } catch {}
      outPath = join(t, 'out.mp4');
      args[args.length - 1] = outPath;
    }

    await new Promise<void>((resolve, reject) => {
      const p = spawn('ffmpeg', args, { stdio: 'inherit' });
      p.on('error', reject);
      p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
    });

    // 2) Upload to S3
    const region = process.env.AWS_REGION as string;
    const bucket = process.env.S3_BUCKET as string;
    if (!region || !bucket) throw new Error('Missing AWS config');
    const s3 = new S3Client({ region });
    const key = `renders/${renderId}.mp4`;
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: createReadStream(outPath), ContentType: 'video/mp4' }),
    );
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    // 3) Mark render completed with URL
    if (renderId) {
      await prisma.render.update({ where: { id: renderId }, data: { status: 'completed', url } });
    }
    return { ok: true, url };
  },
  { connection },
);

worker.on('ready', () => console.log('worker up'));
worker.on('error', (e) => console.error('worker error', e));
