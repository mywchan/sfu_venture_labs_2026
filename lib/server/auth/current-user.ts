import 'server-only';

// Works out who is making a request, from the sign-in cookie alone. The browser
// never sees the session token and can't claim to be anyone else.

import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import type { User } from '@/lib/seed/data';
import { PiezasError, type VerifySessionResult } from '@piezas/sdk';
import { accountsFor, directory, roleAssignments } from '../accounts';
import type { IdentityScope } from '../piezas/client';
import { piezasServer } from '../piezas/settings';
import { APP_ROLES, authorizeRole } from './authorization';
import { verifySession } from './session';

export const SESSION_COOKIE = 'kk_session';
export const CODE_STEP_COOKIE = 'kk_code_step';

const SESSION_MAX_AGE = 12 * 60 * 60; // the token's own expiry still applies
const REMEMBER_MS = 15_000; // screens check every few seconds; don't ask Piezas each time
const CLOCK_ALLOWANCE_SECONDS = 60;
const LOOKUP_TIMEOUT_MS = 15_000; // the first request after starting up is slow

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

const filled = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

/** Logs which check would fail, by name only, so a rejected sign-in can be diagnosed. */
function explainRejection(result: VerifySessionResult, scope: IdentityScope, now: number) {
  const { user, claims } = result;
  const problems = [
    result.valid !== true && 'not valid',
    user?.status !== 'active' && 'account not active',
    claims?.appId !== scope.appId && 'different app',
    claims?.tenantId !== scope.tenantId && 'different organization',
    claims && claims.iat > now && 'issued in the future',
    claims && claims.exp <= now && 'expired',
    claims && claims.sub !== user?.id && 'session is for a different person',
    claims && claims.exp <= claims.iat && 'expiry before issue',
    ...(['iss', 'aud', 'jti'] as const).filter((f) => !filled(claims?.[f])).map((f) => `missing ${f}`),
    ...(['iat', 'exp'] as const).filter((f) => !Number.isSafeInteger(claims?.[f])).map((f) => `${f} is ${typeof claims?.[f]}, not a whole number`),
    ...(['id', 'email', 'createdAt'] as const).filter((f) => !filled(user?.[f])).map((f) => `missing user ${f}`),
    typeof user?.emailVerified !== 'boolean' && 'emailVerified is not yes or no',
    (!user?.profile || typeof user.profile !== 'object' || Array.isArray(user.profile)) && 'profile is not an object',
  ].filter(Boolean);
  if (problems.length > 0) console.warn(`[sign-in] session check: ${problems.join(', ')}`);
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
  // A just-issued session can look like it's from the future if this computer's
  // clock is slightly behind Piezas's, so allow for a small difference.
  const now = Math.floor(Date.now() / 1000) + CLOCK_ALLOWANCE_SECONDS;
  const session = await verifySession(
    token,
    scope,
    async (appId, credential) => {
      let answer: VerifySessionResult;
      try {
        answer = await client.users.getSession(appId, credential);
      } catch (err) {
        console.warn(`[sign-in] session lookup failed: ${err instanceof PiezasError ? err.code : 'unknown error'}`);
        throw err;
      }
      // Piezas can send an empty value here when there's no new token; that means "none".
      const { refreshedToken, ...result } = answer;
      const cleaned: VerifySessionResult = refreshedToken ? { ...result, refreshedToken } : result;
      explainRejection(cleaned, scope, now);
      return cleaned;
    },
    now,
    LOOKUP_TIMEOUT_MS,
  );
  if (!session.ok) {
    console.warn(`[sign-in] session not accepted: ${session.reason}`);
    return { kind: session.reason === 'unavailable' ? 'unavailable' : 'none' };
  }

  await directory().catch(() => null); // first use sets up the records, outside the time limit below
  const authorized = await authorizeRole(session.identity, APP_ROLES, roleAssignments, LOOKUP_TIMEOUT_MS);
  if (!authorized.ok) {
    console.warn(`[sign-in] role not accepted: ${authorized.reason}`);
    return { kind: authorized.reason === 'unavailable' ? 'unavailable' : 'no-role' };
  }

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
