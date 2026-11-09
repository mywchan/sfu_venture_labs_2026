import 'server-only';
import type { IncidentSummary, IncidentValidationError } from '../../contracts/incidents';
import { verifySession, type SessionVerifier, type VerifiedIdentity } from '../auth/session';
import { authorizeRole, type AppRole, type RoleLookup } from '../auth/authorization';
import { withLookupTimeout } from '../auth/timeout';
import type { IdentityScope } from '../piezas/client';
import { validateIncidentReport, calculateIncidentDeadline } from '../incidents/validation';
import type { IncidentStorage, StoredAcknowledgement, StoredIncident } from './storage';

export interface ChildLessonResource extends IdentityScope {
  childId: string;
  lessonDayId: string;
  instructorIds: readonly string[];
  checkedIn: boolean;
  pickedUp: boolean;
}
/** Trusted server lookup, NOT browser-supplied assignments or preview fixtures. */
export type ResourceLookup = (scope: IdentityScope, childId: string, lessonDayId: string) => Promise<ChildLessonResource | null>;
type Principal = VerifiedIdentity & { role: AppRole };
export type IncidentFailure = 'unauthenticated' | 'forbidden' | 'not_found' | 'invalid_input' | 'conflict' | 'unavailable';
export class IncidentServiceError extends Error {
  readonly code: IncidentFailure;
  readonly fields?: IncidentValidationError[];
  constructor(code: IncidentFailure, fields?: IncidentValidationError[]) {
    super(`Incident operation: ${code}`);
    this.code = code;
    this.fields = fields;
  }
}

const matching = (a: IdentityScope, b: IdentityScope) => a.appId === b.appId && a.tenantId === b.tenantId;
const validId = (id: unknown): id is string => typeof id === 'string' && !!id.trim() && id.length <= 128;

function uniqueAcknowledgements(rows: StoredAcknowledgement[], scope: IdentityScope, id: string) {
  const byPatroller = new Map<string, StoredAcknowledgement>();
  for (const row of [...rows].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
    if (!matching(row, scope) || row.emergencyId !== id) continue;
    if (!byPatroller.has(row.patrollerId)) byPatroller.set(row.patrollerId, row);
  }
  return [...byPatroller.values()].map(({ emergencyId, patrollerId, at }) => ({ emergencyId, patrollerId, at }));
}

/** No route, cookie handling or live wiring. Every operation verifies a session.
 * Composition dependencies must be supplied by trusted server code only.
 */
export function createIncidentService(deps: {
  scope: IdentityScope;
  verifier: SessionVerifier;
  roles: RoleLookup;
  resources: ResourceLookup;
  storage: IncidentStorage;
  now?: () => string;
  persistRefreshedSession?: (credential: string) => Promise<void>;
}) {
  const scope = { ...deps.scope };
  const now = () => (deps.now ?? (() => new Date().toISOString()))();
  const io = <T>(work: () => Promise<T>) => withLookupTimeout(work);

  async function run<T>(credential: unknown, allowed: readonly AppRole[], work: (who: Principal) => Promise<T>): Promise<T> {
    try {
      const at = now();
      const session = await verifySession(credential, scope, deps.verifier, Math.floor(new Date(at).getTime() / 1000));
      if (!session.ok) throw new IncidentServiceError(session.reason);
      const auth = await authorizeRole(session.identity, allowed, deps.roles);
      if (!auth.ok) throw new IncidentServiceError(auth.reason);
      if (session.serverCredentials.refreshedToken) {
        if (!deps.persistRefreshedSession) throw new IncidentServiceError('unavailable');
        await io(() => deps.persistRefreshedSession!(session.serverCredentials.refreshedToken!));
      }
      return await work(auth.principal);
    } catch (error) {
      if (error instanceof IncidentServiceError) throw error;
      throw new IncidentServiceError('unavailable');
    }
  }

  async function resource(childId: string, lessonDayId: string) {
    const row = await io(() => deps.resources(scope, childId, lessonDayId));
    if (!row || !matching(row, scope) || row.childId !== childId || row.lessonDayId !== lessonDayId) {
      throw new IncidentServiceError('not_found');
    }
    return row;
  }

  async function readAllowed(who: Principal, row: StoredIncident): Promise<boolean> {
    if (!matching(row, scope)) return false;
    if (who.role === 'patrol') return row.status === 'open';
    if (who.role === 'admin' || who.role === 'desk') return true;
    try {
      const assignment = await resource(row.childId, row.lessonDayId);
      return assignment.instructorIds.includes(who.userId);
    } catch (error) {
      if (error instanceof IncidentServiceError && error.code === 'not_found') return false;
      throw error;
    }
  }

  async function find(who: Principal, id: unknown) {
    if (!validId(id)) throw new IncidentServiceError('invalid_input');
    const row = await io(() => deps.storage.getIncident(scope, id));
    if (!row || row.id !== id || !await readAllowed(who, row)) throw new IncidentServiceError('not_found');
    return row;
  }

  async function summary(row: StoredIncident): Promise<IncidentSummary> {
    const acks = await io(() => deps.storage.listAcknowledgements(scope, row.id));
    // Explicit projection: never return scope, SDK records or future private fields.
    const { id, childId, lessonDayId, lastSeenPlace, lastSeenAt, jacket, pants, helmet,
      bib, identifyingDetails, status, reportedBy, reportedAt, deadlineAt } = row;
    return { id, childId, lessonDayId, lastSeenPlace, lastSeenAt, jacket, pants, helmet,
      bib, identifyingDetails, status, reportedBy, reportedAt, deadlineAt,
      acknowledgements: uniqueAcknowledgements(acks, scope, id) };
  }

  return {
    create(credential: unknown, input: unknown) {
      return run(credential, ['instructor', 'desk', 'admin'], async who => {
        const reportedAt = now();
        const checked = validateIncidentReport(input, reportedAt);
        if (!checked.ok) throw new IncidentServiceError('invalid_input', checked.errors);
        const assignment = await resource(checked.value.childId, checked.value.lessonDayId);
        if (who.role === 'instructor' && !assignment.instructorIds.includes(who.userId)) throw new IncidentServiceError('not_found');
        if (assignment.checkedIn !== true || assignment.pickedUp !== false) throw new IncidentServiceError('conflict');
        const created = await io(() => deps.storage.createIncident({ ...checked.value, ...scope,
          status: 'open', reportedBy: who.userId, reportedAt,
          deadlineAt: calculateIncidentDeadline(checked.value.lastSeenAt, reportedAt).deadlineAt }));
        if (!matching(created, scope)) throw new IncidentServiceError('unavailable');
        return summary(created);
      });
    },
    list(credential: unknown) {
      return run(credential, ['instructor', 'desk', 'admin', 'patrol'], async who => {
        const rows = await io(() => deps.storage.listIncidents(scope));
        const result: IncidentSummary[] = [];
        for (const row of rows) if (await readAllowed(who, row)) result.push(await summary(row));
        return result.sort((a, b) => a.deadlineAt.localeCompare(b.deadlineAt));
      });
    },
    retrieve(credential: unknown, id: unknown) {
      return run(credential, ['instructor', 'desk', 'admin', 'patrol'], async who => summary(await find(who, id)));
    },
    acknowledge(credential: unknown, id: unknown) {
      return run(credential, ['patrol'], async who => {
        const row = await find(who, id);
        if (row.status !== 'open') throw new IncidentServiceError('conflict');
        const acks = await io(() => deps.storage.listAcknowledgements(scope, row.id));
        if (!acks.some(a => matching(a, scope) && a.emergencyId === row.id && a.patrollerId === who.userId)) {
          await io(() => deps.storage.createAcknowledgement({ ...scope, emergencyId: row.id, patrollerId: who.userId, at: now() }));
        }
        // Recheck after the write: never return details for a now-closed incident.
        // No SDK compare-and-set exists; a simultaneous close can still race a write.
        return summary(await find(who, row.id));
      });
    },
  };
}
