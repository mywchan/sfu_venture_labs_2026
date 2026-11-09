import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { register } from 'node:module';
import { PiezasError, type EntityClient, type EntityRecord, type VerifySessionResult } from '@piezas/sdk';
import type { IncidentStorage, StoredIncident, StoredAcknowledgement } from '../../lib/server/persistent-incidents/storage.ts';
import type { AppRole, RoleAssignment } from '../../lib/server/auth/authorization.ts';

register('data:text/javascript,' + encodeURIComponent(`
  export async function resolve(specifier, context, next) {
    try { return await next(specifier, context); }
    catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') &&
          !/\\.[a-z]+$/i.test(specifier)) return next(specifier + '.ts', context);
      throw error;
    }
  }
`), import.meta.url);
const { createIncidentService, IncidentServiceError } = await import('../../lib/server/persistent-incidents/service.ts');
const { createPiezasIncidentStorage } = await import('../../lib/server/persistent-incidents/storage.ts');

const scope = { appId: '11111111-1111-4111-8111-111111111111', tenantId: '22222222-2222-4222-8222-222222222222' };
const NOW = '2026-12-12T22:00:00.000Z';
const input = { childId: 'fictional-child', lessonDayId: 'fictional-lesson', lastSeenPlace: 'Pigeon chair',
  lastSeenAt: '2026-12-12T13:40:00-08:00', jacket: 'Red', bib: 101 };

function fixture() {
  // Shared fake storage exists only inside a test. No SDK client or network calls.
  const rows = new Map<string, StoredIncident>();
  const acks: StoredAcknowledgement[] = [];
  let nextId = 0;
  const storage: IncidentStorage = {
    async createIncident(row) { const saved = { ...row, id: `incident-${++nextId}` }; rows.set(saved.id, saved); return { ...saved }; },
    async listIncidents() { return [...rows.values()].map(r => ({ ...r })); },
    async getIncident(_scope, id) { return rows.has(id) ? { ...rows.get(id)! } : null; },
    async listAcknowledgements(_scope, id) { return acks.filter(a => a.emergencyId === id).map(a => ({ ...a })); },
    async createAcknowledgement(row) { acks.push({ ...row }); },
  };
  const roleFor: Record<string, AppRole> = { teacher: 'instructor', otherTeacher: 'instructor', patrol: 'patrol',
    patrolTwo: 'patrol', admin: 'admin', desk: 'desk', parent: 'parent' };
  const deps = {
    scope, storage, now: () => NOW,
    async verifier(_app: string, credential: string): Promise<VerifySessionResult> {
      if (!roleFor[credential]) return { valid: false };
      return { valid: true, user: { id: credential, email: `${credential}@example.test`, status: 'active',
        emailVerified: true, profile: {}, createdAt: '2026-01-01T00:00:00Z' },
      claims: { ...scope, sub: credential, iss: 'synthetic', aud: 'synthetic', jti: credential,
        iat: Date.parse(NOW) / 1000 - 100, exp: Date.parse(NOW) / 1000 + 100 } };
    },
    async roles(identity: { userId: string }): Promise<RoleAssignment[]> { return [{ ...scope, userId: identity.userId, role: roleFor[identity.userId] }]; },
    async resources(_scope: unknown, childId: string, lessonDayId: string) {
      return childId === input.childId && lessonDayId === input.lessonDayId ?
        { ...scope, childId, lessonDayId, instructorIds: ['teacher'], checkedIn: true, pickedUp: false } : null;
    },
  };
  return { deps, rows, acks, storage, service: createIncidentService(deps) };
}
const rejects = (work: Promise<unknown>, code: string) => assert.rejects(work,
  error => error instanceof IncidentServiceError && error.code === code);

test('report, separate service read, acknowledgement and refreshed read share persisted state', async () => {
  const f = fixture();
  const created = await f.service.create('teacher', input);
  assert.equal(created.reportedBy, 'teacher');
  assert.equal(created.reportedAt, NOW);
  assert.equal(created.lastSeenAt, '2026-12-12T21:40:00.000Z');
  assert.equal(created.deadlineAt, '2026-12-12T22:40:00.000Z');
  assert.equal('appId' in created, false);
  const second = createIncidentService(f.deps);
  assert.equal((await second.list('patrol'))[0].id, created.id);
  await second.acknowledge('patrol', created.id);
  const refreshed = await createIncidentService(f.deps).retrieve('teacher', created.id);
  assert.deepEqual(refreshed.acknowledgements, [{ emergencyId: created.id, patrollerId: 'patrol', at: NOW }]);
  assert.equal(JSON.stringify(refreshed).includes('synthetic'), false);
});

for (const credential of [undefined, 'untrusted']) {
  test(`unauthenticated requests cannot create or list: ${String(credential)}`, async () => {
    const f = fixture();
    await rejects(f.service.create(credential, input), 'unauthenticated');
    await rejects(f.service.list(credential), 'unauthenticated');
    assert.equal(f.rows.size, 0);
  });
}
test('parents cannot create/list and patrol cannot create', async () => {
  const f = fixture();
  await rejects(f.service.create('parent', input), 'forbidden');
  await rejects(f.service.list('parent'), 'forbidden');
  await rejects(f.service.create('patrol', input), 'forbidden');
  assert.equal(f.rows.size, 0);
});
test('instructors are scoped to the authoritative child and lesson assignment', async () => {
  const f = fixture();
  await rejects(f.service.create('otherTeacher', input), 'not_found');
  await rejects(f.service.create('teacher', { ...input, lessonDayId: 'other-day' }), 'not_found');
  const saved = await f.service.create('teacher', input);
  await rejects(f.service.retrieve('otherTeacher', saved.id), 'not_found');
  assert.deepEqual(await f.service.list('otherTeacher'), []);
  f.rows.set('other-child', { ...f.rows.get(saved.id)!, id: 'other-child', childId: 'unrelated-child' });
  assert.equal((await f.service.list('teacher')).length, 1);
});
test('unchecked, released and mismatched child resources cannot be reported', async () => {
  for (const patch of [{ checkedIn: false }, { pickedUp: true }, { appId: 'foreign' }]) {
    const f = fixture();
    const load = f.deps.resources;
    f.deps.resources = async (...args) => ({ ...(await load(...args))!, ...patch });
    await assert.rejects(createIncidentService(f.deps).create('teacher', input), IncidentServiceError);
    assert.equal(f.rows.size, 0);
  }
});
test('future timestamps and browser-supplied actor fields are refused before storage', async () => {
  const f = fixture();
  for (const patch of [{ lastSeenAt: '2026-12-12T23:00:00Z' }, { reportedBy: 'patrol' },
    { role: 'admin' }, { lastSeenAt: '2026-12-12T13:40:00' }, { lastSeenPlace: '' }]) {
    await rejects(f.service.create('teacher', { ...input, ...patch }), 'invalid_input');
  }
  assert.equal(f.rows.size, 0);
});
test('Vancouver 4pm cap is reused for an overdue report', async () => {
  const f = fixture();
  const service = createIncidentService({ ...f.deps, now: () => '2026-12-13T01:00:00Z',
    verifier: async () => { const r = await f.deps.verifier(scope.appId, 'teacher'); r.claims!.exp += 20000; return r; } });
  const saved = await service.create('teacher', { ...input, lastSeenAt: '2026-12-12T15:50:00-08:00' });
  assert.equal(saved.deadlineAt, '2026-12-13T00:00:00.000Z');
});
test('only the verified patroller can acknowledge; repeat calls do not append', async () => {
  const f = fixture();
  const saved = await f.service.create('teacher', input);
  for (const credential of ['teacher', 'desk', 'admin', 'parent']) {
    await rejects(f.service.acknowledge(credential, saved.id), 'forbidden');
  }
  await f.service.acknowledge('patrol', saved.id);
  await f.service.acknowledge('patrol', saved.id);
  await f.service.acknowledge('patrolTwo', saved.id);
  assert.equal(f.acks.length, 2);
  const summary = await f.service.retrieve('teacher', saved.id);
  assert.deepEqual(summary.acknowledgements.map(a => a.patrollerId), ['patrol', 'patrolTwo']);
});
test('duplicate stored acknowledgements collapse to the earliest per patroller', async () => {
  const f = fixture(); const row = await f.service.create('teacher', input);
  f.acks.push({ ...scope, emergencyId: row.id, patrollerId: 'patrol', at: '2026-12-12T22:01:00Z' },
    { ...scope, emergencyId: row.id, patrollerId: 'patrol', at: NOW });
  assert.equal((await f.service.retrieve('teacher', row.id)).acknowledgements.length, 1);
  assert.equal((await f.service.retrieve('teacher', row.id)).acknowledgements[0].at, NOW);
});
test('concurrent acknowledgements may duplicate storage but responses remain deduplicated', async () => {
  const f = fixture(); const row = await f.service.create('teacher', input);
  await Promise.all([f.service.acknowledge('patrol', row.id), f.service.acknowledge('patrol', row.id)]);
  assert.equal((await f.service.retrieve('teacher', row.id)).acknowledgements.length, 1);
  assert.ok(f.acks.length >= 1); // No exactly-once storage guarantee is asserted.
});
test('patrol cannot retrieve/list/acknowledge a closed incident', async () => {
  const f = fixture(); const row = await f.service.create('teacher', input);
  f.rows.get(row.id)!.status = 'closed';
  await rejects(f.service.retrieve('patrol', row.id), 'not_found');
  await rejects(f.service.acknowledge('patrol', row.id), 'not_found');
  assert.deepEqual(await f.service.list('patrol'), []);
  assert.equal(f.acks.length, 0);
});
test('a close during acknowledgement denies the response without reopening the record', async () => {
  const f = fixture(); const row = await f.service.create('teacher', input);
  f.storage.createAcknowledgement = async a => { f.acks.push(a); f.rows.get(row.id)!.status = 'closed'; };
  await rejects(f.service.acknowledge('patrol', row.id), 'not_found');
  assert.equal(f.rows.get(row.id)!.status, 'closed');
});
test('foreign scope records never leave the service', async () => {
  const f = fixture(); const row = await f.service.create('teacher', input);
  f.rows.get(row.id)!.appId = 'other-app';
  assert.deepEqual(await f.service.list('admin'), []);
  await rejects(f.service.retrieve('admin', row.id), 'not_found');
});
test('missing/conflicting roles and failed identity/roster/storage dependencies deny access', async () => {
  const f = fixture();
  await rejects(createIncidentService({ ...f.deps, roles: async () => [] }).list('teacher'), 'forbidden');
  await rejects(createIncidentService({ ...f.deps, roles: async identity => {
    const roles = await f.deps.roles(identity); return [...roles, ...roles];
  } }).list('teacher'), 'forbidden');
  await rejects(createIncidentService({ ...f.deps, roles: async () => { throw new Error('private'); } }).list('teacher'), 'unavailable');
  await rejects(createIncidentService({ ...f.deps, verifier: async () => { throw new Error('private'); } }).list('teacher'), 'unavailable');
  await rejects(createIncidentService({ ...f.deps, resources: async () => { throw new Error('private'); } }).create('teacher', input), 'unavailable');
  f.storage.listIncidents = async () => { throw new Error('private upstream details'); };
  await rejects(f.service.list('admin'), 'unavailable');
});
test('session renewal requires a server-only persistence handler', async () => {
  const f = fixture();
  const verifier = async () => ({ ...await f.deps.verifier(scope.appId, 'patrol'), refreshedToken: 'synthetic-renewal' });
  await rejects(createIncidentService({ ...f.deps, verifier }).list('patrol'), 'unavailable');
  let refreshed = '';
  const service = createIncidentService({ ...f.deps, verifier, persistRefreshedSession: async value => { refreshed = value; } });
  assert.deepEqual(await service.list('patrol'), []);
  assert.equal(refreshed, 'synthetic-renewal');
  await rejects(createIncidentService({ ...f.deps, verifier, persistRefreshedSession: async () => {
    throw new Error('private cookie failure');
  } }).list('patrol'), 'unavailable');
});

const types = { incidentTypeId: '33333333-3333-4333-8333-333333333333', acknowledgementTypeId: '44444444-4444-4444-8444-444444444444' };
function sdkHarness() {
  const persisted = new Map<string, EntityRecord>(); let nextId = 0; let calls = 0;
  const pages: number[] = [];
  const entities = { ofType(typeId: string): EntityClient {
    // Only the actual SDK methods used by the adapter are substituted here.
    return {
      async create(value: { title: string; data?: Record<string, unknown> }) {
        calls++; const record: EntityRecord = { id: `sdk-${++nextId}`, tenantId: scope.tenantId,
          entityTypeId: typeId, title: value.title, data: { ...value.data }, status: 'active', tags: [],
          createdAt: NOW, updatedAt: NOW };
        persisted.set(record.id, record); return record;
      },
      async get(id: string) { calls++; if (!persisted.has(id)) throw new PiezasError('not_found', 'private'); return persisted.get(id)!; },
      async list(params: { offset?: number; limit?: number; filter?: Record<string, unknown> }) {
        calls++; pages.push(params.offset ?? 0);
        const filtered = [...persisted.values()].filter(r => r.entityTypeId === typeId &&
          Object.entries(params.filter ?? {}).every(([k, v]) => r.data[k] === v));
        return { data: filtered.slice(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 100)), total: filtered.length };
      },
    } as EntityClient;
  } };
  return { entities, persisted, pages, calls: () => calls };
}
test('SDK adapter binds existing types without requests and persists across adapter instances', async () => {
  const h = sdkHarness();
  const adapter = createPiezasIncidentStorage(h.entities, types);
  assert.equal(h.calls(), 0);
  const f = fixture(); const row = await f.service.create('teacher', input);
  const { id: _id, acknowledgements: _acks, ...summary } = row;
  const saved = await adapter.createIncident({ ...summary, ...scope });
  await adapter.createAcknowledgement({ ...scope, emergencyId: saved.id, patrollerId: 'patrol', at: NOW });
  const refreshed = createPiezasIncidentStorage(h.entities, types);
  assert.equal((await refreshed.getIncident(scope, saved.id))!.reportedBy, 'teacher');
  assert.equal((await refreshed.listAcknowledgements(scope, saved.id))[0].patrollerId, 'patrol');
  assert.equal(await refreshed.getIncident({ ...scope, appId: 'other' }, saved.id), null);
  assert.equal(await refreshed.getIncident(scope, 'missing'), null);
});
test('SDK adapter pages beyond 100 and rejects malformed persisted records', async () => {
  const h = sdkHarness(); const adapter = createPiezasIncidentStorage(h.entities, types);
  const f = fixture(); const summary = await f.service.create('teacher', input);
  const { id: _id, acknowledgements: _acks, ...row } = summary;
  for (let i = 0; i < 101; i++) await adapter.createIncident({ ...row, ...scope });
  assert.equal((await adapter.listIncidents(scope)).length, 101);
  assert.deepEqual(h.pages, [0, 100]);
  h.persisted.values().next().value!.data.deadlineAt = 'bad';
  await assert.rejects(adapter.listIncidents(scope));
});
test('SDK adapter distinguishes not-found from unavailable and rejects wrong types', async () => {
  const h = sdkHarness(); const adapter = createPiezasIncidentStorage(h.entities, types);
  const f = fixture(); const summary = await f.service.create('teacher', input);
  const { id: _id, acknowledgements: _acks, ...row } = summary;
  const saved = await adapter.createIncident({ ...row, ...scope });
  h.persisted.get(saved.id)!.entityTypeId = types.acknowledgementTypeId;
  assert.equal(await adapter.getIncident(scope, saved.id), null);
  const unavailable = { ofType() { return { get: async () => { throw new PiezasError('network_error', 'private'); } } as unknown as EntityClient; } };
  await assert.rejects(createPiezasIncidentStorage(unavailable, types).getIncident(scope, saved.id));
  assert.throws(() => createPiezasIncidentStorage(h.entities, { ...types, incidentTypeId: '' }));
});
