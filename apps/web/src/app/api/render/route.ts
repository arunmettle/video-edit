/**
 * POST /api/render
 * Body: { projectId: string, quality?: 'low'|'high' }
 * Requires auth. Creates a Render(row) with status 'queued' and enqueues a BullMQ job.
 */
import { auth } from '@/auth/config';
import { prisma } from '@/server/db';
import { renderQueue } from '@/server/queue';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return new Response('Unauthorized', { status: 401 });
  const { projectId, quality } = await req.json().catch(() => ({}));
  if (!projectId) return new Response('projectId required', { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response('Unauthorized', { status: 401 });

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return new Response('Not found', { status: 404 });

  const render = await prisma.render.create({
    data: { projectId: project.id, status: 'queued' },
    select: { id: true },
  });

  await renderQueue.add('render', { renderId: render.id, projectId: project.id, quality: quality || 'low' });
  return Response.json({ ok: true, renderId: render.id });
}

