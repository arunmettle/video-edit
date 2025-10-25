/**
 * Project item route
 * - GET /api/projects/[id] -> fetch project owned by current user
 */
import { prisma } from '@/server/db';
import { auth } from '@/auth/config';
import { ProjectPatchSchema } from '@canva-lite/contracts';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return new Response('Unauthorized', { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response('Unauthorized', { status: 401 });

  const id = ctx.params.id;
  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) return new Response('Not found', { status: 404 });
  return Response.json(project);
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return new Response('Unauthorized', { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response('Unauthorized', { status: 401 });

  const id = ctx.params.id;
  const existing = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!existing) return new Response('Not found', { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = ProjectPatchSchema.safeParse(body);
  if (!parsed.success) return new Response('Invalid payload', { status: 400 });

  let nextJson: any = existing.json ?? {};
  if (parsed.data.addAsset) {
    const assets = Array.isArray(nextJson.assets) ? nextJson.assets : [];
    nextJson = { ...nextJson, assets: [...assets, parsed.data.addAsset] };
  }

  const updated = await prisma.project.update({ where: { id }, data: { json: nextJson } });
  return Response.json({ ok: true, id: updated.id });
}
