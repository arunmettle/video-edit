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

# Uploads (S3 Presigned POST)

This app generates short-lived S3 presigned POST forms server-side, then uploads directly from the browser.

## Env
- `AWS_REGION`
- `S3_BUCKET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## API
- `POST /api/upload` body: `{ fileName, contentType }`
- Response: `{ url, fields, key }` — POST form target and fields, 60s expiry, 50MB max.

## Client Flow
1. Select file(s) in UploadPanel.
2. For each file, call `/api/upload` → get presigned form.
3. `fetch(url, { method: 'POST', body: formData })` (include `fields` + `file` + `Content-Type`).
4. On success, PATCH `/api/projects/[id]` with `{ addAsset: { key, url, contentType, size, name } }` to store the asset in `project.json.assets`.

## Verify
- Set AWS envs and ensure the S3 bucket exists.
- Upload an image/video in `/editor/[id]`.
- Confirm the object appears in S3 and the project’s `json.assets` updates.

# Queue (BullMQ + Redis)

This project uses BullMQ to enqueue render jobs.

## Env
- `REDIS_URL` — e.g., `redis://localhost:6379`

## Run Redis (Docker)
- Start a local Redis 7 container:
  - `docker run --name canva-lite-redis -p 6379:6379 -d redis:7`
- Stop/Start later:
  - `docker stop canva-lite-redis` / `docker start canva-lite-redis`
- Test connectivity:
  - `docker exec -it canva-lite-redis redis-cli PING` → `PONG`
- Use this in `.env`:
  - `REDIS_URL=redis://127.0.0.1:6379`

## Web (enqueue)
- Queue instance: `apps/web/src/server/queue.ts`
- API: `POST /api/render` with `{ projectId, quality }`
  - Requires auth, verifies project ownership
  - Creates a `Render` row with `status = 'queued'`
  - Enqueues a job on the `render` queue with `{ renderId, projectId, quality }`

## Worker (process)
- Worker: `apps/worker/src/index.ts`
  - `Worker('render', handler)` logs job and sets the `Render` row to `completed`
  - Start with: `pnpm worker`

## Verify
1. Ensure Redis is running (Docker command above; `REDIS_URL` in `.env`)
2. Start web and worker: `pnpm dev` and `pnpm worker`
3. From UI, trigger an export (or POST `/api/render`)
4. See worker logs; DB `Render` row transitions from `queued` → `completed`

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
│   │   │   │   │   ├── new-project-button.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── api
│   │   │   │   │   ├── auth
│   │   │   │   │   │   └── [...nextauth]
│   │   │   │   │   │       └── route.ts
│   │   │   │   │   ├── dbtest
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── health
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── projects
│   │   │   │   │   │   ├── [id]
│   │   │   │   │   │   │   └── route.ts
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── render
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── upload
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── users
│   │   │   │   │       └── register
│   │   │   │   │           └── route.ts
│   │   │   │   ├── editor
│   │   │   │   │   ├── [id]
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── upload-panel.tsx
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
│   │   │       ├── db.ts
│   │   │       └── queue.ts
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
│   │   ├── 03-auth.md
│   │   ├── 04-uploads.md
│   │   └── 05-queue.md
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
| AWS_REGION | "us-east-1" |
| S3_BUCKET | "your-bucket-name" |
| AWS_ACCESS_KEY_ID | "AKIA..." |
| AWS_SECRET_ACCESS_KEY | "..." |
| REDIS_URL | "redis://localhost:6379" |

_Generated by `packages/scripts/build-readme.ts`_