import { markRead, readNotifications } from '@/lib/server/notifications';
import { sendDueReminders } from '@/lib/server/notify-patrol';
import { requireUser } from '@/lib/server/auth/current-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function failed(err: unknown) {
  console.error('[notifications]', err);
  return Response.json({ error: 'Couldn’t reach Peak Pals.' }, { status: 503 });
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;
  const user = auth.user;
  try {
    if (user.role === 'patrol') await sendDueReminders();
    return Response.json({ notifications: await readNotifications(user) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return failed(err);
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;
  const user = auth.user;
  let body: { ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === 'string') : [];
  try {
    await markRead(user, ids);
    return Response.json({ notifications: await readNotifications(user) });
  } catch (err) {
    return failed(err);
  }
}
