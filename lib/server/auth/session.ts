import 'server-only';
import process from 'node:process';
import { PiezasError, type VerifySessionResult } from '@piezas/sdk';
import type { IdentityScope } from '../piezas/client';
import { withLookupTimeout } from './timeout';

if (!process.versions.node || typeof window !== 'undefined') throw new Error('Server module only.');

export interface VerifiedIdentity extends IdentityScope { userId: string }
export type SessionVerifier = (appId: string, credential: string) => Promise<VerifySessionResult>;
export type SessionResult =
  | { ok: true; identity: VerifiedIdentity; serverCredentials: { refreshedToken?: string } }
  | { ok: false; reason: 'unauthenticated' | 'unavailable' };

const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/** Invoke only on the server. Never serialize the whole result to a client. */
export async function verifySession(
  credential: unknown, scope: IdentityScope, verifier: SessionVerifier,
  nowSeconds = Math.floor(Date.now() / 1000),
  timeoutMs?: number,
): Promise<SessionResult> {
  if (!text(scope.appId) || !text(scope.tenantId) || !Number.isSafeInteger(nowSeconds)) {
    return { ok: false, reason: 'unavailable' };
  }
  if (!text(credential)) return { ok: false, reason: 'unauthenticated' };
  let result: VerifySessionResult;
  try {
    result = await withLookupTimeout(() => verifier(scope.appId, credential), timeoutMs);
  } catch (error) {
    if (error instanceof PiezasError && error.code === 'invalid_session') {
      return { ok: false, reason: 'unauthenticated' };
    }
    // No message matching or raw SDK details; unknown failures deny access.
    return { ok: false, reason: 'unavailable' };
  }
  const user = result?.user, claims = result?.claims;
  if (result?.valid !== true || !user || !claims || user.status !== 'active' ||
      !text(user.id) || !text(user.email) || typeof user.emailVerified !== 'boolean' ||
      !user.profile || typeof user.profile !== 'object' || Array.isArray(user.profile) ||
      !text(user.createdAt) || !Number.isFinite(Date.parse(user.createdAt)) ||
      !text(claims.iss) || !text(claims.aud) || !text(claims.jti) ||
      claims.sub !== user.id || claims.appId !== scope.appId || claims.tenantId !== scope.tenantId ||
      !Number.isSafeInteger(claims.exp) || !Number.isSafeInteger(claims.iat) ||
      claims.iat > nowSeconds || claims.exp <= nowSeconds || claims.exp <= claims.iat ||
      (result.refreshedToken !== undefined && !text(result.refreshedToken))) {
    return { ok: false, reason: 'unauthenticated' };
  }
  return {
    ok: true,
    identity: { userId: user.id, appId: claims.appId, tenantId: claims.tenantId },
    serverCredentials: result.refreshedToken === undefined ? {} : { refreshedToken: result.refreshedToken },
  };
}
