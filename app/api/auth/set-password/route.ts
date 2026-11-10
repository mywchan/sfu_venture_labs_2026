import { PiezasError } from '@piezas/sdk';
import { claimInvite } from '@/lib/server/accounts';
import { fromThisSite, notFromThisSite } from '@/lib/server/auth/current-user';
import { piezasServer } from '@/lib/server/piezas/settings';
import { Refused } from '@/lib/server/refused';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_LENGTH = 12;
const EXPIRED = 'This link has expired or has already been used. Go to the sign-in page and choose “Forgot your password?” for a new one.';

/** Finishes a first-time "create password" link or a "forgot password" link. */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return notFromThisSite();
  let body: { invite?: unknown; token?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  const password = typeof body.password === 'string' ? body.password : '';
  if (password.length < MIN_LENGTH || password.length > 512) return Response.json({ error: `Choose a password with at least ${MIN_LENGTH} characters.` }, { status: 422 });

  try {
    if (typeof body.invite === 'string' && body.invite) {
      await claimInvite(body.invite, password, request);
    } else if (typeof body.token === 'string' && body.token) {
      const { client, scope } = piezasServer();
      await client.users.resetPassword(scope.appId, { token: body.token, newPassword: password });
    } else {
      return Response.json({ error: EXPIRED }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof Refused) return Response.json({ error: err.message }, { status: err.status });
    if (err instanceof PiezasError) {
      if (err.code === 'invalid_link') return Response.json({ error: EXPIRED }, { status: 400 });
      if (err.code === 'validation_failed') return Response.json({ error: 'Piezas wouldn’t accept that password. Please choose a longer one.' }, { status: 422 });
      if (err.code === 'rate_limited') return Response.json({ error: 'Too many tries. Please wait a few minutes and try again.' }, { status: 429 });
    }
    console.error('[set password]', err instanceof PiezasError ? err.code : 'failed');
    return Response.json({ error: 'Couldn’t reach Peak Pals. Please try again.' }, { status: 503 });
  }
}
