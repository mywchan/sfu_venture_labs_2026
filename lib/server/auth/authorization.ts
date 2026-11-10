import 'server-only';
import process from 'node:process';
import type { VerifiedIdentity } from './session';
import { withLookupTimeout } from './timeout';

if (!process.versions.node || typeof window !== 'undefined') throw new Error('Server module only.');

export const APP_ROLES = ['parent', 'instructor', 'desk', 'patrol', 'admin'] as const;
export type AppRole = typeof APP_ROLES[number];
export interface RoleAssignment extends VerifiedIdentity { role: AppRole }
/** Must read protected assignments, scoped by app, tenant and verified user. */
export type RoleLookup = (identity: VerifiedIdentity) => Promise<readonly RoleAssignment[]>;
export type AuthorizationResult =
  | { ok: true; principal: VerifiedIdentity & { role: AppRole } }
  | { ok: false; reason: 'forbidden' | 'unavailable' };

/** Role gating only; child ownership, group membership and incident scope follow later. */
export async function authorizeRole(
  identity: VerifiedIdentity, allowed: readonly AppRole[], lookup: RoleLookup,
  timeoutMs?: number,
): Promise<AuthorizationResult> {
  if (![identity?.userId, identity?.appId, identity?.tenantId].every(v => typeof v === 'string' && v.trim())) {
    return { ok: false, reason: 'forbidden' };
  }
  let assignments: readonly RoleAssignment[];
  try { assignments = await withLookupTimeout(() => lookup({ ...identity }), timeoutMs); }
  catch { return { ok: false, reason: 'unavailable' }; }
  if (!Array.isArray(assignments) || assignments.length !== 1) return { ok: false, reason: 'forbidden' };
  const assignment = assignments[0];
  if (!assignment || assignment.userId !== identity.userId || assignment.appId !== identity.appId ||
      assignment.tenantId !== identity.tenantId || !APP_ROLES.includes(assignment.role) ||
      !allowed.includes(assignment.role)) return { ok: false, reason: 'forbidden' };
  return { ok: true, principal: {
    userId: identity.userId, appId: identity.appId, tenantId: identity.tenantId, role: assignment.role,
  } };
}
