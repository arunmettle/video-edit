# Canva-lite Monorepo

> AUTO-GENERATED – Do not edit directly. Run `pnpm docs:build`.

# About

This repository is a minimal pnpm workspaces monorepo containing a Next.js app, a Node worker, and shared packages. Documentation is auto-generated.

# Setup

- Install dependencies: `pnpm i`
- Start web app: `pnpm dev` (http://localhost:3000)
- Run worker: `pnpm worker`
- Rebuild docs: `pnpm docs:build`

# Database (Prisma + Postgres)

This project uses Prisma ORM with a Postgres database. The shared Prisma client lives in `packages/db` and is reused by the web app via a small server util.

## Models

See `packages/db/prisma/schema.prisma` for the initial schema:

- Project: stores project metadata and JSON payload
- Render: stores render status, URL and errors, related to a Project

## Setup

1) Run Postgres locally (Docker or local service)
- Example Docker: `docker run --name canva-lite-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=canva_lite -p 5432:5432 -d postgres:16`

2) Configure env
- Set `DATABASE_URL` in `.env` (see `.env.example` for a template)

3) Generate Prisma Client
- `pnpm db:generate` (loads root `.env` and runs Prisma for the db package)

4) Create and apply migrations
- `pnpm db:migrate -- --name init` (reads root `.env`)

Note: We run Prisma from the workspace root with `--schema packages/db/prisma/schema.prisma` so the CLI uses the root `.env` for `DATABASE_URL`.

## Using the client

- Server helper in web: `apps/web/src/server/db.ts`
- Import and use: `import { prisma } from '@/server/db'` (server-only)

## Verification

- After running migrations, confirm `Project` and `Render` tables exist (e.g., `psql` or a DB UI)

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

## File Tree
```
├── .editorconfig
├── .env
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── .husky
│   ├── _
│   │   ├── .gitignore
│   │   ├── applypatch-msg
│   │   ├── commit-msg
│   │   ├── h
│   │   ├── husky.sh
│   │   ├── post-applypatch
│   │   ├── post-checkout
│   │   ├── post-commit
│   │   ├── post-merge
│   │   ├── post-rewrite
│   │   ├── pre-applypatch
│   │   ├── pre-auto-gc
│   │   ├── pre-commit
│   │   ├── pre-merge-commit
│   │   ├── pre-push
│   │   ├── pre-rebase
│   │   └── prepare-commit-msg
│   ├── post-checkout
│   ├── post-merge
│   └── pre-commit
├── .prettierrc
├── README.md
├── apps
│   ├── web
│   │   ├── .eslintrc.cjs
│   │   ├── .gitignore
│   │   ├── next-env.d.ts
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app
│   │   │   │   ├── (root)
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── api
│   │   │   │   │   ├── auth
│   │   │   │   │   │   └── [...nextauth]
│   │   │   │   │   │       └── route.ts
│   │   │   │   │   ├── dbtest
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── health
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── users
│   │   │   │   │       └── register
│   │   │   │   │           └── route.ts
│   │   │   │   ├── editor
│   │   │   │   │   └── sandbox
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── globals.css
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── login
│   │   │   │   │   └── page.tsx
│   │   │   │   └── register
│   │   │   │       └── page.tsx
│   │   │   ├── auth
│   │   │   │   ├── config.ts
│   │   │   │   └── rateLimit.ts
│   │   │   └── server
│   │   │       └── db.ts
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── vitest.setup.ts
│   └── worker
│       ├── .eslintrc.cjs
│       ├── package.json
│       ├── src
│       │   └── index.ts
│       └── tsconfig.json
├── package.json
├── packages
│   ├── contracts
│   │   ├── .eslintrc.cjs
│   │   ├── package.json
│   │   └── src
│   │       └── index.ts
│   ├── db
│   │   ├── .eslintrc.cjs
│   │   ├── package.json
│   │   ├── prisma
│   │   │   ├── migrations
│   │   │   │   ├── 20251024133231_init
│   │   │   │   │   └── migration.sql
│   │   │   │   ├── 20251024141130_auth_init
│   │   │   │   │   └── migration.sql
│   │   │   │   └── migration_lock.toml
│   │   │   └── schema.prisma
│   │   ├── scripts
│   │   │   └── run-prisma.mjs
│   │   └── src
│   │       └── index.ts
│   ├── docs
│   │   ├── 00-intro.md
│   │   ├── 01-setup.md
│   │   ├── 02-db.md
│   │   └── 03-auth.md
│   └── scripts
│       ├── .eslintrc.cjs
│       ├── build-readme.ts
│       └── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Scripts
| Scope | Script | Command |
|---|---|---|
| root | build | `pnpm -C apps/web build && pnpm -C apps/worker build` |
| root | db:generate | `node packages/db/scripts/run-prisma.mjs generate` |
| root | db:migrate | `node packages/db/scripts/run-prisma.mjs migrate dev` |
| root | dev | `pnpm -C apps/web dev` |
| root | docs:build | `tsx packages/scripts/build-readme.ts` |
| root | prepare | `husky install` |
| root | worker | `pnpm -C apps/worker start` |
| web | build | `next build` |
| web | dev | `next dev -p 3000` |
| web | lint | `eslint .` |
| web | start | `next start -p 3000` |
| web | test | `vitest` |
| worker | build | `tsc -p tsconfig.json` |
| worker | lint | `eslint .` |
| worker | start | `tsx src/index.ts` |
| worker | start:prod | `node dist/index.js` |

## Environment
| Name | Example / Default |
|---|---|
| DATABASE_URL | "postgresql://postgres:postgres@localhost:5432/canva_lite?schema=public" |
| NEXTAUTH_URL | "http://localhost:3000" |
| AUTH_SECRET | "changeme-please" |

_Generated by `packages/scripts/build-readme.ts`_