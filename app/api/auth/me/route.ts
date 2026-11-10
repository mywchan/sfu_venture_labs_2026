import { directory } from '@/lib/server/accounts';
import { requireUser } from '@/lib/server/auth/current-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Who is signed in, plus the names the screens need. No one else's email leaves the server. */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;
  try {
    const { users, parentAccounts } = await directory();
    return Response.json(
      {
        me: auth.user,
        // A parent only needs staff names; other families stay private.
        people: users.filter((u) => u.id !== auth.user.id && (auth.user.role !== 'parent' || u.role !== 'parent')).map((u) => ({ id: u.id, name: u.name, role: u.role, email: '' })),
        parentAccounts: parentAccounts.filter((p) => p.userId === auth.user.id),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[me]', err);
    return Response.json({ error: 'Couldn’t reach Peak Pals. Please try again.' }, { status: 503 });
  }
}
