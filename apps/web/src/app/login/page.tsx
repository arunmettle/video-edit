"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();
  return (
    <main>
      <h1>Login</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setErr('');
          const res = await signIn('credentials', { email, password, redirect: false });
          if (res?.error) setErr('Invalid credentials');
          else router.push('/editor/sandbox');
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
        <button type="submit">Sign in</button>
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </form>
    </main>
  );
}

