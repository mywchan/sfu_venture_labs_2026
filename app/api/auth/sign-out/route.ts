import { cookies } from 'next/headers';
import { CODE_STEP_COOKIE, DEMO_COOKIE, forgetSession, fromThisSite, notFromThisSite, SESSION_COOKIE } from '@/lib/server/auth/current-user';
import { demoMode } from '@/lib/server/demo-store';
import { piezasServer } from '@/lib/server/piezas/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!fromThisSite(request)) return notFromThisSite();
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  jar.delete(SESSION_COOKIE);
  jar.delete(CODE_STEP_COOKIE);
  jar.delete(DEMO_COOKIE);
  if (token && !demoMode()) {
    forgetSession(token);
    try {
      const { client, scope } = piezasServer();
      await client.users.signOut(scope.appId, token);
    } catch {
      /* the cookie is already gone from this browser */
    }
  }
  return Response.json({ ok: true });
}
