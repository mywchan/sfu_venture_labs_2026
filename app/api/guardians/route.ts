import { LAST_ADULT, readGuardians, saveGuardians, validateGuardians } from '@/lib/server/guardians';
import { requireUser } from '@/lib/server/auth/current-user';
import { currentRoster } from '@/lib/server/roster';
import { openSearchChildIds } from '@/lib/server/today';
import { parentOwnsChild } from '@/lib/access';
import { seedData, type Data, type User } from '@/lib/seed/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Read rules from the permissions table. Patrol only gets a child's adults
// while a search for that child is open.
function canRead(people: Data, user: User, childId: string, searching: Set<string>) {
  if (user.role === 'parent') return parentOwnsChild(people, user, childId);
  if (user.role === 'patrol') return searching.has(childId);
  return user.role === 'desk' || user.role === 'admin';
}

function canEdit(people: Data, user: User, childId: string) {
  if (user.role === 'parent') return parentOwnsChild(people, user, childId);
  return user.role === 'admin';
}

function failed(err: unknown) {
  // Details stay in the server log; the browser only gets a plain message.
  console.error('[guardians]', err);
  return Response.json({ error: 'Couldn’t finish saving to Peak Pals, so some changes may be missing. Please reload the page and check.' }, { status: 503 });
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;
  const user = auth.user;
  try {
    const searching = user.role === 'patrol' ? await openSearchChildIds() : new Set<string>();
    const people = user.role === 'parent' ? await currentRoster() : seedData;
    return Response.json({ guardians: await readGuardians((childId) => canRead(people, user, childId, searching)) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return failed(err);
  }
}

export async function PUT(request: Request) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;
  const user = auth.user;
  let body: { childId?: unknown; guardians?: unknown; removedLinkIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  const childId = typeof body.childId === 'string' ? body.childId : '';
  // Someone else's child looks the same as a child that doesn't exist.
  const people = user.role === 'parent' ? await currentRoster() : seedData;
  if (!seedData.children.some((c) => c.id === childId) || !canEdit(people, user, childId)) return Response.json({ error: 'Not found' }, { status: 404 });

  const removed = Array.isArray(body.removedLinkIds) ? body.removedLinkIds.filter((id): id is string => typeof id === 'string') : [];
  const checked = validateGuardians(childId, body.guardians);
  if ('problem' in checked) return Response.json({ error: checked.problem }, { status: 422 });
  try {
    const guardians = await saveGuardians(childId, checked.rows, removed);
    if (!guardians) return Response.json({ error: LAST_ADULT }, { status: 422 });
    return Response.json({ guardians });
  } catch (err) {
    return failed(err);
  }
}
