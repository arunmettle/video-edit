// BullMQ render worker
// - Consumes 'render' queue
// - Logs job data
// - Updates Render row from 'queued' to 'completed'
import { Worker, QueueEvents } from 'bullmq';
import { prisma } from '@canva-lite/db';

const connection = { url: process.env.REDIS_URL as string };

const events = new QueueEvents('render', { connection });
events.on('completed', ({ jobId }) => console.log('job completed', jobId));
events.on('failed', ({ jobId, failedReason }) => console.error('job failed', jobId, failedReason));

const worker = new Worker(
  'render',
  async (job) => {
    console.log('processing job', job.id, job.name, job.data);
    const { renderId } = job.data as { renderId: string };
    // Simulate processing
    await new Promise((r) => setTimeout(r, 500));
    // Mark render completed
    if (renderId) {
      await prisma.render.update({ where: { id: renderId }, data: { status: 'completed', url: null } });
    }
    return { ok: true };
  },
  { connection },
);

worker.on('ready', () => console.log('worker up'));
worker.on('error', (e) => console.error('worker error', e));

