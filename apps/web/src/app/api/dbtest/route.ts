/**
 * DB smoke test
 *
 * GET /api/dbtest
 *
 * Behavior:
 * - Creates a temp Project { title: 'smoke', json: {} }
 * - Immediately deletes it (best-effort)
 *
 * Response Example:
 * { ok: true }
 */
import { prisma } from '@/server/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const created = await prisma.project.create({
      data: { title: 'smoke', json: {} },
      select: { id: true },
    });
    // Best-effort cleanup; ignore if already gone
    await prisma.project.delete({ where: { id: created.id } }).catch(() => {});
    return Response.json({ ok: true });
  } catch (err) {
    console.error('dbtest error:', err);
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
}
