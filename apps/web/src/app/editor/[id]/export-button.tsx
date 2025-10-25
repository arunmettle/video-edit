"use client";
// ExportButton enqueues a render job for the current project
import { useState } from 'react';

export default function ExportButton({ projectId }: { projectId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMsg('');
          try {
            const res = await fetch('/api/render', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ projectId, quality: 'low' }),
            });
            if (res.ok) {
              const data = await res.json();
              setMsg(`Queued render ${data.renderId}`);
            } else {
              const text = await res.text();
              setMsg(`Failed: ${res.status} ${text}`);
            }
          } catch (e: any) {
            setMsg(`Error: ${e?.message || e}`);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'Exporting…' : 'Export'}
      </button>
      {msg && <small>{msg}</small>}
    </div>
  );
}

