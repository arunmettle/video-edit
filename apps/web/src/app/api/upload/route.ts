/**
 * Presigned S3 upload
 * POST /api/upload { fileName, contentType }
 * -> { url, fields, key } for a 60s POST policy (max 50MB)
 */
import { auth } from '@/auth/config';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

export const runtime = 'nodejs';

// Simple AWS connectivity check
export async function GET() {
  const region = process.env.AWS_REGION!;
  const bucket = process.env.S3_BUCKET!;
  if (!region || !bucket) return new Response('Missing S3 config', { status: 500 });
  try {
    const s3 = new S3Client({ region });
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    return Response.json({ ok: true, bucket, region });
  } catch (err: any) {
    const msg = err?.message || 'AWS check failed';
    return new Response(msg, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return new Response('Unauthorized', { status: 401 });

  const { fileName, contentType } = await req.json().catch(() => ({} as any));
  if (!fileName || !contentType) return new Response('Invalid payload', { status: 400 });

  const region = process.env.AWS_REGION!;
  const bucket = process.env.S3_BUCKET!;
  if (!region || !bucket) return new Response('Missing S3 config', { status: 500 });

  const s3 = new S3Client({ region });
  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `uploads/${Date.now()}-${safeName}`;

  const { url, fields } = await createPresignedPost(s3, {
    Bucket: bucket,
    Key: key,
    Conditions: [
      ['content-length-range', 0, 50 * 1024 * 1024],
    ],
    // Do not fix the Content-Type via Fields to avoid strict equality checks;
    // allow any content type via the starts-with condition above.
    Fields: {},
    Expires: 60,
  });

  return Response.json({ url, fields, key });
}
