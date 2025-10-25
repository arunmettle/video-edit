/**
 * Editor page
 * - Server-side loads a project owned by the current user
 * - UI shows three placeholders: Upload panel, CanvasStage (1920x1080), Timeline (clips)
 */
import { auth } from '@/auth/config';
import { prisma } from '@/server/db';
import UploadPanel from './upload-panel';
import ExportButton from './export-button';
import { redirect } from 'next/navigation';

export default async function EditorPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect('/login');

  const project = await prisma.project.findFirst({ where: { id: params.id, userId: user.id } });
  if (!project) redirect('/');

  const clips = Array.isArray((project as any).json?.clips) ? (project as any).json.clips : [];

  return (
    <main style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100vh', gap: 12 }}>
      <section style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12 }}>
        <aside style={{ border: '1px solid #ddd', padding: 12 }}>
          <UploadPanel projectId={project.id} />
        </aside>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div
            style={{
              width: 960,
              height: 540,
              background: '#111',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
            }}
          >
            CanvasStage 1920x1080 (scaled 50%)
          </div>
        </div>
      </section>
      <footer style={{ borderTop: '1px solid #ddd', padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Timeline</strong>
          <ExportButton projectId={project.id} />
        </div>
        <ul>
          {clips.length ? clips.map((c: any, i: number) => <li key={i}>{JSON.stringify(c)}</li>) : <li>Empty</li>}
        </ul>
      </footer>
    </main>
  );
}
