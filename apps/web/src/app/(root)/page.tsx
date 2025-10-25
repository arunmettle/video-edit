/**
 * Home page
 * - Lists current user's projects
 * - Button to create a new project (client fetch + refresh)
 */
import { auth } from '@/auth/config';
import { prisma } from '@/server/db';
import NewProjectButton from './new-project-button';

export default async function Page() {
  const session = await auth();
  const email = session?.user?.email;
  let projects: { id: string; title: string; updatedAt: Date }[] = [];
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      projects = await prisma.project.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true, updatedAt: true },
      });
    }
  }

  return (
    <main>
      <h1>Projects</h1>
      <p>
        {email ? (
          <>
            Signed in as {email} · <a href="/editor/sandbox">Sandbox</a>
          </>
        ) : (
          <>
            <a href="/login">Login</a> · <a href="/register">Register</a>
          </>
        )}
      </p>
      {email && <NewProjectButton />}
      <ul style={{ marginTop: 12 }}>
        {projects.length ? (
          projects.map((p) => (
            <li key={p.id}>
              <a href={`/editor/${p.id}`}>{p.title}</a> · {new Date(p.updatedAt).toLocaleString()}
            </li>
          ))
        ) : (
          <li>No projects</li>
        )}
      </ul>
    </main>
  );
}
