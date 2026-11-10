import { PiezasError } from '@piezas/sdk';
import { cookies } from 'next/headers';
import { CODE_STEP_COOKIE, cookieOptions, fromThisSite, notFromThisSite } from '@/lib/server/auth/current-user';
import { demoMode } from '@/lib/server/demo-store';
import { piezasServer } from '@/lib/server/piezas/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CODE_STEP_SECONDS = 10 * 60; // how long Piezas keeps the code valid

const WRONG = 'That email and password don’t match an account.';

/** Step one: check the password. Piezas then emails the 6-digit code. */
export async function POST(request: Request) {
  if (demoMode()) return Response.json({ error: 'Not available in the presentation version.' }, { status: 404 });
  if (!fromThisSite(request)) return notFromThisSite();
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password || email.length > 254 || password.length > 512) return Response.json({ error: WRONG }, { status: 401 });

  try {
    const { client, scope } = piezasServer();
    let result = await client.users.signIn(scope.appId, { email, password });
    if (result.session && !result.mfa) {
      // First sign-in: turn on emailed codes, then start over so the code is
      // required this time too. A session must never come from a password alone.
      await client.users.enableEmailMfa(scope.appId, result.session.token);
      await client.users.signOut(scope.appId, result.session.token);
      result = await client.users.signIn(scope.appId, { email, password });
    }
    if (!result.mfa?.factors.includes('email')) {
      if (result.session) await client.users.signOut(scope.appId, result.session.token);
      console.error('[sign-in] the emailed code step was not available');
      return Response.json({ error: 'We couldn’t send your sign-in code. Please try again.' }, { status: 503 });
    }
    (await cookies()).set(CODE_STEP_COOKIE, result.mfa.challengeToken, cookieOptions(CODE_STEP_SECONDS));
    return Response.json({ step: 'code' });
  } catch (err) {
    if (err instanceof PiezasError) {
      if (err.code === 'invalid_credentials') return Response.json({ error: WRONG }, { status: 401 });
      if (err.code === 'account_pending') return Response.json({ error: 'Please create your password from the link in your email first.' }, { status: 401 });
      if (err.code === 'rate_limited') return Response.json({ error: 'Too many tries. Please wait a few minutes and try again.' }, { status: 429 });
    }
    console.error('[sign-in]', err instanceof PiezasError ? err.code : 'failed');
    return Response.json({ error: 'Couldn’t reach Peak Pals. Please try again.' }, { status: 503 });
  }
}
