"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();
  return (
    <main>
      <h1>Register</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg('');
          const res = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (res.ok) {
            setMsg('Registered! Redirecting to login…');
            setTimeout(() => router.push('/login'), 800);
          } else {
            setMsg('Failed: ' + (await res.text()));
          }
        }}
        style={{ display: 'grid', gap: 8, maxWidth: 320 }}
      >
        <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Create account</button>
        {msg && <p>{msg}</p>}
      </form>
    </main>
  );
}

