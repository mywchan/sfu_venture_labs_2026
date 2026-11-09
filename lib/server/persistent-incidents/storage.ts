import 'server-only';
import { PiezasError, type EntityClient, type EntityRecord, type Piezas } from '@piezas/sdk';
import type { IncidentAcknowledgement, IncidentSummary } from '../../contracts/incidents';
import type { IdentityScope } from '../piezas/client';
import { validateIncidentReport, calculateIncidentDeadline } from '../incidents/validation';

export type StoredIncident = Omit<IncidentSummary, 'acknowledgements'> & IdentityScope;
export type NewIncident = Omit<StoredIncident, 'id'>;
export interface StoredAcknowledgement extends IncidentAcknowledgement, IdentityScope {}

/** No auth in this adapter: only the authenticated service may expose it. */
export interface IncidentStorage {
  createIncident(row: NewIncident): Promise<StoredIncident>;
  listIncidents(scope: IdentityScope): Promise<StoredIncident[]>;
  getIncident(scope: IdentityScope, id: string): Promise<StoredIncident | null>;
  listAcknowledgements(scope: IdentityScope, id: string): Promise<StoredAcknowledgement[]>;
  createAcknowledgement(row: StoredAcknowledgement): Promise<void>;
}

const sameScope = (data: Record<string, unknown>, scope: IdentityScope) =>
  data.appId === scope.appId && data.tenantId === scope.tenantId;
const nonempty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

function decodeIncident(record: EntityRecord): StoredIncident {
  const d = record.data;
  const checked = validateIncidentReport({
    childId: d.childId, lessonDayId: d.lessonDayId, lastSeenPlace: d.lastSeenPlace,
    lastSeenAt: d.lastSeenAt, jacket: d.jacket, pants: d.pants, helmet: d.helmet,
    bib: d.bib, identifyingDetails: d.identifyingDetails,
  }, String(d.reportedAt));
  if (!checked.ok || !nonempty(record.id) || !nonempty(d.appId) || !nonempty(d.tenantId) ||
      !nonempty(d.reportedBy) || (d.status !== 'open' && d.status !== 'closed')) {
    throw new Error('Invalid incident record.');
  }
  const deadlineAt = calculateIncidentDeadline(checked.value.lastSeenAt, String(d.reportedAt)).deadlineAt;
  if (d.deadlineAt !== deadlineAt) throw new Error('Invalid incident deadline.');
  return { ...checked.value, id: record.id, appId: d.appId, tenantId: d.tenantId,
    status: d.status, reportedBy: d.reportedBy,
    reportedAt: new Date(String(d.reportedAt)).toISOString(), deadlineAt };
}

function decodeAcknowledgement(record: EntityRecord): StoredAcknowledgement {
  const d = record.data;
  if (![d.appId, d.tenantId, d.emergencyId, d.patrollerId, d.at].every(nonempty) ||
      typeof d.at !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(d.at) || !Number.isFinite(Date.parse(d.at))) {
    throw new Error('Invalid acknowledgement record.');
  }
  return { appId: d.appId as string, tenantId: d.tenantId as string,
    emergencyId: d.emergencyId as string, patrollerId: d.patrollerId as string, at: d.at };
}

/** Reads all pages; never assume the first 100 records are the complete result. */
async function listAll(entity: EntityClient, filter: Record<string, unknown>) {
  const rows: EntityRecord[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await entity.list({ filter, limit: 100, offset, sort: 'created_at', order: 'asc' });
    rows.push(...page.data);
    if (page.data.length < 100) return rows;
  }
}

/** Binds existing entity types only. No defineEntities, schema setup, or I/O here.
 * Type IDs and client must come from trusted, app-specific server configuration.
 */
export function createPiezasIncidentStorage(
  entities: Pick<Piezas['entities'], 'ofType'>,
  types: { incidentTypeId: string; acknowledgementTypeId: string },
): IncidentStorage {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(types.incidentTypeId) || !uuid.test(types.acknowledgementTypeId) ||
      types.incidentTypeId === types.acknowledgementTypeId) throw new Error('Invalid incident storage settings.');
  const incidents = entities.ofType(types.incidentTypeId);
  const acknowledgements = entities.ofType(types.acknowledgementTypeId);
  return {
    async createIncident(row) {
      return decodeIncident(await incidents.create({ title: `Incident for ${row.childId}`, data: { ...row } }));
    },
    async listIncidents(scope) {
      const rows = await listAll(incidents, { ...scope });
      return rows.filter(r => r.tenantId === scope.tenantId && r.entityTypeId === types.incidentTypeId && sameScope(r.data, scope)).map(decodeIncident);
    },
    async getIncident(scope, id) {
      let record: EntityRecord;
      try { record = await incidents.get(id); }
      catch (error) {
        if (error instanceof PiezasError && error.code === 'not_found') return null;
        throw error;
      }
      if (record.tenantId !== scope.tenantId || record.entityTypeId !== types.incidentTypeId || !sameScope(record.data, scope)) return null;
      return decodeIncident(record);
    },
    async listAcknowledgements(scope, id) {
      const rows = await listAll(acknowledgements, { ...scope, emergencyId: id });
      return rows.filter(r => r.tenantId === scope.tenantId && r.entityTypeId === types.acknowledgementTypeId &&
        sameScope(r.data, scope) && r.data.emergencyId === id).map(decodeAcknowledgement);
    },
    async createAcknowledgement(row) {
      await acknowledgements.create({ title: `Incident acknowledgement`, data: { ...row } });
    },
  };
}
