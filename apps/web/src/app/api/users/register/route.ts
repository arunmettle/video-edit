/**
 * POST /api/users/register
 * Body: { email, password }
 * Creates a user with hashed password. Returns { id, email }.
 */
import { prisma } from '@canva-lite/db';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) ?? {};
    const e = String(email || '').toLowerCase().trim();
    const p = String(password || '');
    if (!e || p.length < 6) return new Response('Invalid input', { status: 400 });

    const exists = await prisma.user.findUnique({ where: { email: e } });
    if (exists) return new Response('Email already registered', { status: 409 });

    const hash = await bcrypt.hash(p, 10);
    const user = await prisma.user.create({ data: { email: e, hashedPassword: hash } });
    return Response.json({ id: user.id, email: user.email });
  } catch (err) {
    console.error('register error:', err);
    return new Response('Server error', { status: 500 });
  }
}

