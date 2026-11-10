import { PiezasError } from '@piezas/sdk';
import { cookies } from 'next/headers';
import { CODE_STEP_COOKIE, fromThisSite, notFromThisSite, saveSession } from '@/lib/server/auth/current-user';
import { piezasServer } from '@/lib/server/piezas/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Step two: check the emailed code and finish signing in. */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return notFromThisSite();
  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  const jar = await cookies();
  const challenge = jar.get(CODE_STEP_COOKIE)?.value;
  if (!challenge) return Response.json({ error: 'That sign-in has expired. Please start again.', restart: true }, { status: 401 });
  if (!/^\d{6}$/.test(code)) return Response.json({ error: 'Enter the 6-digit code from your email.' }, { status: 422 });

  try {
    const { client, scope } = piezasServer();
    const result = await client.users.completeMfaChallenge(scope.appId, challenge, code);
    if (!result.session) throw new Error('No session returned.');
    await saveSession(result.session.token);
    jar.delete(CODE_STEP_COOKIE);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof PiezasError) {
      if (err.code === 'invalid_code') return Response.json({ error: 'That code isn’t right, or it has expired. Check your latest email from Kestrel Kids.' }, { status: 401 });
      if (err.code === 'invalid_session' || err.code === 'unauthorized') {
        jar.delete(CODE_STEP_COOKIE);
        return Response.json({ error: 'That sign-in has expired. Please start again.', restart: true }, { status: 401 });
      }
      if (err.code === 'rate_limited') return Response.json({ error: 'Too many tries. Please wait a few minutes and try again.' }, { status: 429 });
    }
    console.error('[sign-in code]', err instanceof PiezasError ? err.code : 'failed');
    return Response.json({ error: 'Couldn’t reach Peak Pals. Please try again.' }, { status: 503 });
  }
}
