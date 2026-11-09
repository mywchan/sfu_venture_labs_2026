import { readGuardians, saveGuardians, validateGuardians } from '@/lib/server/guardians';
import { parentOwnsChild } from '@/lib/access';
import { seedData, type User } from '@/lib/seed/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// TEMPORARY: real sign-in isn't built yet, so "who is asking" comes from the
// preview's made-up people. That can't be trusted on a real site, so this route
// doesn't exist outside local development. Replace `previewCaller` with the
// verified Piezas session before removing the production check.
const localOnly = () => process.env.NODE_ENV === 'production';
const notFound = () => Response.json({ error: 'Not found' }, { status: 404 });

function previewCaller(id: unknown): User | null {
  return seedData.users.find((u) => u.id === id) ?? null;
}

// Read rules from the permissions table. Patrol's "only during an open search"
// is still applied on screen, because searches aren't saved in Piezas yet.
function canRead(user: User, childId: string) {
  if (user.role === 'parent') return parentOwnsChild(seedData, user, childId);
  return user.role === 'desk' || user.role === 'patrol' || user.role === 'admin';
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
    return Response.json({ guardians: await readGuardians((childId) => canRead(user, childId)) }, { headers: { 'Cache-Control': 'no-store' } });
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

  const checked = validateGuardians(childId, body.guardians);
  if ('problem' in checked) return Response.json({ error: checked.problem }, { status: 422 });
  try {
    const removed = Array.isArray(body.removedLinkIds) ? body.removedLinkIds.filter((id): id is string => typeof id === 'string') : [];
    return Response.json({ guardians: await saveGuardians(childId, checked.rows, removed) });
  } catch (err) {
    return failed(err);
  }
}
