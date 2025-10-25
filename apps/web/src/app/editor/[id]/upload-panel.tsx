"use client";
/**
 * UploadPanel
 * - Lets user select files, gets a presigned POST from /api/upload, uploads to S3,
 *   then sends a PATCH to /api/projects/[id] to append an asset entry into project.json.
 */
import { useState } from 'react';

export default function UploadPanel({ projectId }: { projectId: string }) {
  const [log, setLog] = useState<string>('');

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    // First, test AWS connectivity/server presign readiness
    try {
      const chk = await fetch('/api/upload', { cache: 'no-store' });
      if (chk.ok) {
        const h = await chk.json();
        console.log('AWS check OK:', h);
        setLog((l) => l + `\nAWS OK: bucket ${h.bucket} in ${h.region}`);
      } else {
        const t = await chk.text();
        setLog((l) => l + `\nAWS check failed: ${t}`);
        return;
      }
    } catch (e: any) {
      setLog((l) => l + `\nAWS check error: ${e?.message || e}`);
      return;
    }
    for (const file of Array.from(files)) {
      setLog((l) => l + `\nPreparing ${file.name}...`);
      const up = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type || 'application/octet-stream' }),
      });
      if (!up.ok) {
        setLog((l) => l + `\nFailed to presign ${file.name}`);
        continue;
      }
      const { url, fields, key } = await up.json();
      const form = new FormData();
      Object.entries(fields).forEach(([k, v]) => form.append(k, v as any));
      form.append('file', file);
      try {
        const resp = await fetch(url, { method: 'POST', body: form });
        if (resp.ok) {
          setLog((l) => l + `\nUploaded ${file.name}`);
          await fetch(`/api/projects/${projectId}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              addAsset: {
                key,
                url: `${url}/${key}`,
                contentType: file.type || 'application/octet-stream',
                size: file.size,
                name: file.name,
              },
            }),
          });
        } else {
          const text = await resp.text().catch(() => '');
          setLog((l) => l + `\nUpload failed ${file.name}: ${resp.status} ${text}`);
        }
      } catch (e: any) {
        setLog((l) => l + `\nUpload error ${file.name}: ${e?.message || e}`);
      }
    }
  }

  return (
    <div>
      <h3>Upload</h3>
      <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} />
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{log}</pre>
    </div>
  );
}
