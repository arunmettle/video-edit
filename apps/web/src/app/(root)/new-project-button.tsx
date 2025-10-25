"use client";
/**
 * Client button to create a new project via /api/projects then refresh the list
 */
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProjectButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch('/api/projects', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ title: `Project ${new Date().toLocaleTimeString()}` }),
          });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? 'Creating…' : 'New Project'}
    </button>
  );
}

