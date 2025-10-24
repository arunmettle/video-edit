import { auth } from '@/auth/config';
import { redirect } from 'next/navigation';

export default async function Sandbox() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return (
    <main>
      <h1>Editor Sandbox</h1>
      <p>Welcome, {session.user.email}</p>
    </main>
  );
}

