/**
 * Health check endpoint
 *
 * GET /api/health
 *
 * Request: none
 * Response Example:
 * {
 *   ok: true,
 *   time: 1730073600000
 * }
 */
export const runtime = 'nodejs';

export async function GET() {
  return Response.json({ ok: true, time: Date.now() });
}
