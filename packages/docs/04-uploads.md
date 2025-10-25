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

