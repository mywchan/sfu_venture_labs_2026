import { markRead, readNotifications } from '@/lib/server/notifications';
import { sendDueReminders } from '@/lib/server/notify-patrol';
import { localOnly, notFound, previewCaller } from '@/lib/server/preview-caller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function failed(err: unknown) {
  console.error('[notifications]', err);
  return Response.json({ error: 'Couldn’t reach Peak Pals.' }, { status: 503 });
}

export async function GET(request: Request) {
  if (localOnly()) return notFound();
  const user = previewCaller(new URL(request.url).searchParams.get('as'));
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
  try {
    if (user.role === 'patrol') await sendDueReminders();
    return Response.json({ notifications: await readNotifications(user) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return failed(err);
  }
}

export async function POST(request: Request) {
  if (localOnly()) return notFound();
  let body: { as?: unknown; ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  const user = previewCaller(body.as);
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
  const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === 'string') : [];
  try {
    await markRead(user, ids);
    return Response.json({ notifications: await readNotifications(user) });
  } catch (err) {
    return failed(err);
  }
}
