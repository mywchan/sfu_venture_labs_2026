import { LAST_ADULT, readGuardians, saveGuardians, validateGuardians } from '@/lib/server/guardians';
import { localOnly, notFound, previewCaller } from '@/lib/server/preview-caller';
import { openSearchChildIds } from '@/lib/server/today';
import { parentOwnsChild } from '@/lib/access';
import { seedData, type User } from '@/lib/seed/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Read rules from the permissions table. Patrol only gets a child's adults
// while a search for that child is open.
function canRead(user: User, childId: string, searching: Set<string>) {
  if (user.role === 'parent') return parentOwnsChild(seedData, user, childId);
  if (user.role === 'patrol') return searching.has(childId);
  return user.role === 'desk' || user.role === 'admin';
}

function canEdit(user: User, childId: string) {
  if (user.role === 'parent') return parentOwnsChild(seedData, user, childId);
  return user.role === 'admin';
}

function failed(err: unknown) {
  // Details stay in the server log; the browser only gets a plain message.
  console.error('[guardians]', err);
  return Response.json({ error: 'Couldn’t finish saving to Peak Pals, so some changes may be missing. Please reload the page and check.' }, { status: 503 });
}

export async function GET(request: Request) {
  if (localOnly()) return notFound();
  const user = previewCaller(new URL(request.url).searchParams.get('as'));
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
  try {
    const searching = user.role === 'patrol' ? await openSearchChildIds() : new Set<string>();
    return Response.json({ guardians: await readGuardians((childId) => canRead(user, childId, searching)) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return failed(err);
  }
}

export async function PUT(request: Request) {
  if (localOnly()) return notFound();
  let body: { as?: unknown; childId?: unknown; guardians?: unknown; removedLinkIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  const user = previewCaller(body.as);
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
  const childId = typeof body.childId === 'string' ? body.childId : '';
  // Someone else's child looks the same as a child that doesn't exist.
  if (!seedData.children.some((c) => c.id === childId) || !canEdit(user, childId)) return notFound();

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
