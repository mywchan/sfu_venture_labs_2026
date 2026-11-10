import 'server-only';

// Works out who is making a request, from the sign-in cookie alone. The browser
// never sees the session token and can't claim to be anyone else.

import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import type { User } from '@/lib/seed/data';
import { accountsFor, roleAssignments } from '../accounts';
import { piezasServer } from '../piezas/settings';
import { APP_ROLES, authorizeRole } from './authorization';
import { verifySession } from './session';

export const SESSION_COOKIE = 'kk_session';
export const CODE_STEP_COOKIE = 'kk_code_step';

const SESSION_MAX_AGE = 12 * 60 * 60; // the token's own expiry still applies
const REMEMBER_MS = 15_000; // screens check every few seconds; don't ask Piezas each time

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge,
});

export async function saveSession(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(SESSION_MAX_AGE));
}

type Outcome = { kind: 'ok'; user: User } | { kind: 'none' } | { kind: 'no-role' } | { kind: 'unavailable' };

const remembered = new Map<string, { until: number; user: User }>();
const fingerprint = (token: string) => createHash('sha256').update(token).digest('hex');

export function forgetSession(token: string) {
  remembered.delete(fingerprint(token));
}

async function identify(): Promise<Outcome> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return { kind: 'none' };

  const key = fingerprint(token);
  const known = remembered.get(key);
  if (known && known.until > Date.now()) return { kind: 'ok', user: known.user };

  let scope, client;
  try {
    ({ client, scope } = piezasServer());
  } catch (err) {
    console.error('[sign-in] server settings are missing or invalid', err instanceof Error ? err.message : '');
    return { kind: 'unavailable' };
  }
  const session = await verifySession(token, scope, (appId, credential) => client.users.getSession(appId, credential));
  if (!session.ok) return { kind: session.reason === 'unavailable' ? 'unavailable' : 'none' };

  const authorized = await authorizeRole(session.identity, APP_ROLES, roleAssignments);
  if (!authorized.ok) return { kind: authorized.reason === 'unavailable' ? 'unavailable' : 'no-role' };

  let account;
  try {
    [account] = await accountsFor(session.identity.userId);
  } catch {
    return { kind: 'unavailable' };
  }
  if (!account) return { kind: 'no-role' };

  const user: User = { id: account.appUserId, name: account.name, email: account.email, role: authorized.principal.role };
  if (session.serverCredentials.refreshedToken) await saveSession(session.serverCredentials.refreshedToken);
  if (remembered.size > 2000) remembered.clear();
  remembered.set(key, { until: Date.now() + REMEMBER_MS, user });
  return { kind: 'ok', user };
}

/** Changes must come from this site's own pages, so another site can't act as the person. */
export function fromThisSite(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const notFromThisSite = () => Response.json({ error: 'That request was refused.' }, { status: 403 });

/** Every protected route starts here. */
export async function requireUser(request: Request): Promise<{ user: User } | { response: Response }> {
  if (request.method !== 'GET' && request.method !== 'HEAD' && !fromThisSite(request)) return { response: notFromThisSite() };
  const outcome = await identify();
  if (outcome.kind === 'ok') return { user: outcome.user };
  if (outcome.kind === 'unavailable') return { response: Response.json({ error: 'Couldn’t reach Peak Pals. Please try again.' }, { status: 503 }) };
  if (outcome.kind === 'no-role') return { response: Response.json({ error: 'Your sign-in isn’t linked to a Kestrel Kids account. Please contact the snow school office.' }, { status: 403 }) };
  return { response: Response.json({ error: 'Not signed in' }, { status: 401 }) };
}

/** The signed-in person if there is one, for places that also work signed out. */
export async function signedInPerson() {
  const outcome = await identify().catch(() => null);
  return outcome?.kind === 'ok' ? outcome.user : null;
}
