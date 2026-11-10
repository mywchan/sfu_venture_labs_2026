import { createAccount, directory, removeAccount, resendWelcome } from '@/lib/server/accounts';
import { requireUser } from '@/lib/server/auth/current-user';
import { Refused } from '@/lib/server/refused';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notAllowed = () => Response.json({ error: 'Your account can’t do that.' }, { status: 403 });

function failed(err: unknown) {
  if (err instanceof Refused) return Response.json({ error: err.message }, { status: err.status });
  console.error('[accounts]', err instanceof Error ? err.message : 'failed');
  return Response.json({ error: 'Couldn’t reach Peak Pals, so that may not have saved. Please try again.' }, { status: 503 });
}

const forScreen = async () => ({
  accounts: (await directory()).accounts.map((a) => ({ id: a.id, name: a.name, email: a.email, role: a.role, childIds: a.childIds })),
});

/** Administrator only: everyone with an account. */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;
  if (auth.user.role !== 'admin') return notAllowed();
  try {
    return Response.json(await forScreen(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return failed(err);
  }
}

/** Administrator only: create or remove an account, or email a set-password link again. */
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;
  if (auth.user.role !== 'admin') return notAllowed();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  try {
    if (body.action === 'resend') await resendWelcome(body.accountId, request);
    else if (body.action === 'remove') await removeAccount(body.accountId, auth.user);
    else await createAccount(body, request);
    return Response.json(await forScreen());
  } catch (err) {
    return failed(err);
  }
}
