"use client";

import { useState } from 'react';

export default function Page() {
  const [health, setHealth] = useState<string>('');
  const [dbtest, setDbtest] = useState<string>('');

  const callHealth = async () => {
    setHealth('…');
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const json = await res.json();
      setHealth(JSON.stringify(json));
    } catch (e) {
      setHealth('error');
    }
  };

  const callDbTest = async () => {
    setDbtest('…');
    try {
      const res = await fetch('/api/dbtest', { cache: 'no-store' });
      const json = await res.json();
      setDbtest(JSON.stringify(json));
    } catch (e) {
      setDbtest('error');
    }
  };

  return (
    <main>
      <h1>Hello Canva-lite</h1>
      <p>
        <a href="/login">Login</a> · <a href="/register">Register</a> ·{' '}
        <a href="/editor/sandbox">Editor</a>
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={callHealth}>Check Health</button>
        <span>{health}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button onClick={callDbTest}>DB Smoke Test</button>
        <span>{dbtest}</span>
      </div>
    </main>
  );
}
