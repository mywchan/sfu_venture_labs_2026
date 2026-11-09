import { localOnly, notFound, previewCaller } from '@/lib/server/preview-caller';
import { changeRoster, readRoster } from '@/lib/server/roster';
import { Refused } from '@/lib/server/today';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function failed(err: unknown) {
  if (err instanceof Refused) return Response.json({ error: err.message }, { status: err.status });
  console.error('[groups]', err);
  return Response.json({ error: 'Couldn’t reach Peak Pals, so that may not have saved. Please try again.' }, { status: 503 });
}

export async function GET(request: Request) {
  if (localOnly()) return notFound();
  const user = previewCaller(new URL(request.url).searchParams.get('as'));
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
  try {
    return Response.json(await readRoster(user), { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return failed(err);
  }
}

export async function POST(request: Request) {
  if (localOnly()) return notFound();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  const user = previewCaller(body?.as);
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
  try {
    return Response.json(await changeRoster(user, body));
  } catch (err) {
    return failed(err);
  }
}
