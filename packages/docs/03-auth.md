# Authentication (NextAuth + Prisma)

This app uses NextAuth with a Prisma adapter and a simple Credentials provider.
Passwords are hashed using `bcrypt`. Sessions use JWTs (no database sessions).

## Models
- `User`: email, optional name/image, `hashedPassword`
- `Account`: for future OAuth providers (unique `provider + providerAccountId`)

## Config
- Auth config: `apps/web/src/auth/config.ts` (exports handlers, `auth`, `signIn`, `signOut`)
- Rate limit: `apps/web/src/auth/rateLimit.ts` (simple in-memory token bucket)
- Routes:
  - `GET/POST /api/auth/[...nextauth]`
  - `POST /api/users/register` (creates user; returns id/email)
- Pages:
  - `/login` (sign in via credentials)
  - `/register` (create account)
  - `/editor/sandbox` (protected; redirects to `/login` if unauthenticated)

## ENV
- `DATABASE_URL` — Postgres connection
- `NEXTAUTH_URL` — e.g., http://localhost:3000
- `AUTH_SECRET` — generate a strong secret in production

## Flows
- Register: POST `/api/users/register` with `{ email, password }` → user created.
- Login: POST via NextAuth credentials provider → returns a session JWT (browser cookie).
- Protecting pages: server components call `await auth()`; redirect if no session.

## Verify
1. `pnpm db:generate` (and run migrations if needed)
2. `pnpm dev`
3. Open `/register`, create a user
4. Login at `/login`
5. Visit `/editor/sandbox` → should render with your email

