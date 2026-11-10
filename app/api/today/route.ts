import { requireUser } from '@/lib/server/auth/current-user';
import { perform, readToday, Refused } from '@/lib/server/today';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function failed(err: unknown) {
  if (err instanceof Refused) return Response.json({ error: err.message }, { status: err.status });
  // Details stay in the server log; the browser only gets a plain message.
  console.error('[today]', err);
  return Response.json({ error: 'Couldn’t reach Peak Pals, so that may not have saved. Please try again.' }, { status: 503 });
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;
  const user = auth.user;
  try {
    return Response.json({ today: await readToday(user) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return failed(err);
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;
  const user = auth.user;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  try {
    return Response.json({ today: await perform(user, body) });
  } catch (err) {
    return failed(err);
  }
}
