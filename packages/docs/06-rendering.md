# Rendering (ffmpeg + S3)

For now, rendering is stubbed with a short ffmpeg-generated test video and upload to S3. Later, this will build a graph from `project.json`.

## Flow
- Web enqueues a job via `POST /api/render` with `{ projectId, quality }`.
- Worker consumes the `render` queue:
  1. Runs `ffmpeg` with static args to create a 2s 1920x1080 MP4 with silent audio to `/tmp/out.mp4`.
  2. Uploads the file to S3 at `renders/<renderId>.mp4`.
  3. Updates the `Render` row to `completed` and sets `url` to the S3 object.

## Requirements
- ffmpeg available on the worker machine (in PATH).
- AWS env vars configured (`AWS_REGION`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

## Commands
- Start worker: `pnpm worker`
- Enqueue: POST `/api/render` with `{ projectId }` (from the app or API client)

## Future plan
- Parse `project.json` into a render graph (clips, tracks, transitions).
- Dynamically construct ffmpeg filter_complex and inputs.
- Stream output or upload progressive chunks; integrate with the Timeline UI.

