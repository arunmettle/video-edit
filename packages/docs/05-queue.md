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
