/**
 * Projects collection routes
 * - POST /api/projects { title } -> create a project for current user with empty json {}
 * - GET /api/projects -> list current user's projects
 */
import { prisma } from '@/server/db';
import { auth } from '@/auth/config';
import { ProjectCreateSchema } from '@canva-lite/contracts';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return new Response('Unauthorized', { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response('Unauthorized', { status: 401 });

  const data = await req.json().catch(() => ({}));
  const parsed = ProjectCreateSchema.safeParse(data);
  if (!parsed.success) return new Response('Invalid payload', { status: 400 });

  const created = await prisma.project.create({
    data: { title: parsed.data.title, json: {}, userId: user.id },
    select: { id: true, title: true, updatedAt: true },
  });
  return Response.json(created, { status: 201 });
}

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return new Response('Unauthorized', { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response('Unauthorized', { status: 401 });

  const items = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, updatedAt: true },
  });
  return Response.json(items);
}

