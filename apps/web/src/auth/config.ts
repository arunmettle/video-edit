// NextAuth v5 config with Prisma adapter and Credentials provider
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@canva-lite/db';
import bcrypt from 'bcrypt';
import { allow } from '../auth/rateLimit';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (creds, req) => {
        // Simple rate limit by IP
        const ip = req?.headers?.get('x-forwarded-for') || req?.headers?.get('x-real-ip') || 'local';
        if (!allow(`login:${ip}`)) return null;

        const email = String(creds?.email || '').toLowerCase().trim();
        const password = String(creds?.password || '');
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) return null;
        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
});

