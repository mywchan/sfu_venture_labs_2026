import { cookies } from 'next/headers';
import { seedData } from '@/lib/seed/data';
import { demoMode } from '@/lib/server/accounts';
import { cookieOptions, DEMO_COOKIE, fromThisSite, notFromThisSite, SESSION_COOKIE } from '@/lib/server/auth/current-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Presentation sign-in: opens a made-up account with one tap. Doesn't exist on a live site. */
export async function POST(request: Request) {
  if (!demoMode()) return Response.json({ error: 'Not found' }, { status: 404 });
  if (!fromThisSite(request)) return notFromThisSite();
  const body = (await request.json().catch(() => ({}))) as { userId?: unknown };
  const user = seedData.users.find((u) => u.id === body.userId);
  if (!user) return Response.json({ error: 'That account doesn’t exist.' }, { status: 404 });
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.set(DEMO_COOKIE, user.id, cookieOptions(12 * 60 * 60));
  return Response.json({ ok: true });
}
