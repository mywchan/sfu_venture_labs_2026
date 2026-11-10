import { fromThisSite, notFromThisSite } from '@/lib/server/auth/current-user';
import { demoMode } from '@/lib/server/demo-store';
import { sendPasswordHelp } from '@/lib/server/accounts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Always answers the same way, so nobody can test which emails have accounts. */
export async function POST(request: Request) {
  if (demoMode()) return Response.json({ error: 'Not available in the presentation version.' }, { status: 404 });
  if (!fromThisSite(request)) return notFromThisSite();
  try {
    const body = (await request.json()) as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (email && email.length <= 254) {
      await sendPasswordHelp(email, request);
    }
  } catch (err) {
    console.error('[forgot password] request failed', err instanceof Error ? err.message : '');
  }
  return Response.json({ ok: true });
}
