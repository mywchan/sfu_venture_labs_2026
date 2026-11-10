import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createPiezasClient, validateSettings } from '../../lib/server/piezas/client.ts';
import type { RoleAssignment } from '../../lib/server/auth/authorization.ts';
import { PiezasError, type Piezas, type VerifySessionResult } from '@piezas/sdk';
import { register } from 'node:module';

// Node 22's type stripper does not resolve extensionless TS imports. Keep normal
// Next.js/bundler imports in production; this test-only loader resolves .ts files.
const loader = 'data:text/javascript,' + encodeURIComponent(`
  export async function resolve(specifier, context, next) {
    try { return await next(specifier, context); }
    catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') &&
          !/\\.[a-z]+$/i.test(specifier)) return next(specifier + '.ts', context);
      throw error;
    }
  }
`);
register(loader, import.meta.url);
const { verifySession } = await import('../../lib/server/auth/session.ts');
const { APP_ROLES, authorizeRole } = await import('../../lib/server/auth/authorization.ts');
const { withLookupTimeout, DEFAULT_LOOKUP_TIMEOUT_MS } = await import('../../lib/server/auth/timeout.ts');

// Deliberately inert strings: never used with a real SDK client or network.
const settings = {
  apiKey: 'sk_test_SYNTHETIC_NOT_A_CREDENTIAL', apiBaseUrl: 'https://api.piezas.ai',
  usersUrl: 'https://api.piezas.ai/users',
  appId: '11111111-1111-4111-8111-111111111111', tenantId: '22222222-2222-4222-8222-222222222222',
};
const scope = { appId: settings.appId, tenantId: settings.tenantId };
const identity = { ...scope, userId: 'fictional-patroller' };
const now = 1800000000;
function valid(): VerifySessionResult {
  return { valid: true,
    user: { id: identity.userId, email: 'patrol@example.test', status: 'active', emailVerified: true,
      profile: {}, createdAt: '2026-01-01T00:00:00Z' },
    claims: { iss: 'synthetic-issuer', aud: 'synthetic-audience', sub: identity.userId, ...scope,
      jti: 'fictional-session', iat: now - 100, exp: now + 100 },
  };
}

test('factory validates settings and constructs only when explicitly invoked', () => {
  let called = 0;
  const result = createPiezasClient(settings, config => {
    called++;
    assert.equal(config.appId, scope.appId);
    assert.equal(config.usersUrl, settings.usersUrl);
    assert.equal(config.entitiesUrl, 'https://api.piezas.ai/entities');
    assert.equal(config.adminUrl, 'https://api.piezas.ai/admin');
    assert.equal(config.devUserId, undefined);
    return { fake: true };
  });
  assert.equal(called, 1);
  assert.deepEqual(result, { client: { fake: true }, scope });
});

for (const field of Object.keys(settings) as (keyof typeof settings)[]) {
  test(`missing setting is rejected without disclosing it: ${field}`, () => {
    assert.throws(() => validateSettings({ ...settings, [field]: '' }), /^Error: Invalid server Piezas settings\.$/);
  });
}
test('rejects untrusted URLs, development keys and invalid app context', () => {
  for (const patch of [{ apiBaseUrl: 'http://localhost:3000' }, { usersUrl: 'https://other.example/users' },
    { apiKey: 'arbitrary-secret' }, { appId: 'bad' }, { tenantId: 'bad' }]) {
    let called = false;
    assert.throws(() => createPiezasClient({ ...settings, ...patch }, () => { called = true; }));
    assert.equal(called, false);
  }
});
test('rejects ambient development identities', () => {
  const name = 'PIEZAS_DEV_USER_ID';
  const previous = process.env[name];
  try {
    process.env[name] = 'fictional-override';
    assert.throws(() => createPiezasClient(settings, () => null), /overrides/);
  } finally {
    if (previous === undefined) delete process.env[name]; else process.env[name] = previous;
  }
});

test('installed SDK getSession method fits the verifier without invented properties', () => {
  // Type-level adapter only: no SDK instance is created and nothing is called.
  const adapter = (users: Pick<Piezas['users'], 'getSession'>) =>
    (appId: string, credential: string) => users.getSession(appId, credential);
  assert.equal(typeof adapter, 'function');
});

test('valid session derives identity and keeps renewed credentials separate', async () => {
  const result = await verifySession('synthetic-session', scope, async (appId, credential) => {
    assert.equal(appId, scope.appId);
    assert.equal(credential, 'synthetic-session');
    return { ...valid(), refreshedToken: 'synthetic-renewal' };
  }, now);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.identity, identity);
    assert.deepEqual(result.serverCredentials, { refreshedToken: 'synthetic-renewal' });
    assert.equal(JSON.stringify(result.identity).includes('synthetic'), false);
  }
});
test('valid session without refresh has no credential output', async () => {
  const result = await verifySession('synthetic-session', scope, async () => valid(), now);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.serverCredentials, {});
});
for (const credential of [undefined, null, '', ' ', 42]) {
  test(`missing or malformed credential rejected: ${String(credential)}`, async () => {
    let called = false;
    assert.deepEqual(await verifySession(credential, scope, async () => { called = true; return valid(); }, now),
      { ok: false, reason: 'unauthenticated' });
    assert.equal(called, false);
  });
}

const mutations: Record<string, (r: VerifySessionResult) => void> = {
  invalid: r => { r.valid = false; }, missingUser: r => { delete r.user; },
  missingClaims: r => { delete r.claims; }, disabled: r => { r.user!.status = 'disabled'; },
  pending: r => { r.user!.status = 'pending'; }, expired: r => { r.claims!.exp = now; },
  futureIssued: r => { r.claims!.iat = now + 1; },
  mismatchedUser: r => { r.claims!.sub = 'another-user'; },
  mismatchedApp: r => { r.claims!.appId = 'another-app'; },
  mismatchedTenant: r => { r.claims!.tenantId = 'another-tenant'; },
  invalidExpiry: r => { r.claims!.exp = NaN; },
  missingIssuer: r => { r.claims!.iss = ''; }, missingAudience: r => { r.claims!.aud = ''; },
  missingSessionId: r => { r.claims!.jti = ''; }, emptyRefresh: r => { r.refreshedToken = ''; },
  malformedUser: r => { r.user!.createdAt = 'invalid'; },
};
for (const [name, mutate] of Object.entries(mutations)) {
  test(`rejects session result: ${name}`, async () => {
    const response = valid(); mutate(response);
    assert.deepEqual(await verifySession('synthetic-session', scope, async () => response, now),
      { ok: false, reason: 'unauthenticated' });
  });
}
test('identity service failure denies access without leaking errors', async () => {
  assert.deepEqual(await verifySession('synthetic-session', scope, async () => {
    throw new Error('private upstream detail');
  }, now), { ok: false, reason: 'unavailable' });
});
test('invalid trusted context never invokes verification', async () => {
  let called = false;
  assert.deepEqual(await verifySession('synthetic-session', { ...scope, appId: '' }, async () => {
    called = true; return valid();
  }, now), { ok: false, reason: 'unavailable' });
  assert.equal(called, false);
});

for (const role of APP_ROLES) {
  test(`only explicit assignment authorizes ${role}`, async () => {
    assert.deepEqual(await authorizeRole(identity, [role], async received => {
      assert.deepEqual(received, identity);
      return [{ ...identity, role }];
    }), { ok: true, principal: { ...identity, role } });
  });
}
test('roles fail closed for missing, ambiguous, mismatched, unknown or disallowed assignments', async () => {
  const assignment: RoleAssignment = { ...identity, role: 'patrol' };
  for (const assignments of [[], [assignment, assignment], [{ ...assignment, userId: 'other' }],
    [{ ...assignment, appId: 'other' }], [{ ...assignment, tenantId: 'other' }],
    [{ ...assignment, role: 'owner' }], [{ ...assignment, role: 'parent' }]]) {
    assert.deepEqual(await authorizeRole(identity, ['patrol'], async () => assignments as RoleAssignment[]),
      { ok: false, reason: 'forbidden' });
  }
});
test('role service failure never grants fallback administrator access', async () => {
  assert.deepEqual(await authorizeRole(identity, ['admin'], async () => { throw new Error('private'); }),
    { ok: false, reason: 'unavailable' });
});
test('empty allowlist and malformed identity deny access', async () => {
  assert.deepEqual(await authorizeRole(identity, [], async () => [{ ...identity, role: 'admin' }]),
    { ok: false, reason: 'forbidden' });
  let called = false;
  assert.deepEqual(await authorizeRole({ ...identity, userId: '' }, ['admin'], async () => {
    called = true; return [];
  }), { ok: false, reason: 'forbidden' });
  assert.equal(called, false);
});

test('fresh module imports make no requests', async () => {
  const { spawnSync } = await import('node:child_process');
  const script = `globalThis.fetch = () => { throw new Error('Unexpected network request'); };
    const { register } = await import('node:module');
    register(${JSON.stringify(loader)}, import.meta.url);
    await import('./lib/server/piezas/client.ts');
    await import('./lib/server/auth/session.ts');
    await import('./lib/server/auth/authorization.ts');
    await import('./lib/server/auth/timeout.ts');`;
  const run = spawnSync(process.execPath, ['--conditions=react-server', '--experimental-strip-types', '--input-type=module', '-e', script],
    { cwd: process.cwd(), encoding: 'utf8', timeout: 15000 });
  assert.equal(run.status, 0, run.stderr);
});

test('documented SDK invalid_session error requests sign-in', async () => {
  assert.deepEqual(await verifySession('synthetic-session', scope, async () => {
    throw new PiezasError('invalid_session', 'private detail');
  }, now), { ok: false, reason: 'unauthenticated' });
});

for (const code of ['network_error', 'rate_limited', 'server_error', 'unauthorized', 'invalid_api_key', 'app_mismatch'] as const) {
  test(`SDK ${code} remains unavailable`, async () => {
    assert.deepEqual(await verifySession('synthetic-session', scope, async () => {
      throw new PiezasError(code, 'invalid_session');
    }, now), { ok: false, reason: 'unavailable' });
  });
}
test('message text and non-SDK code fields do not classify invalid sessions', async () => {
  for (const error of [new Error('invalid_session'), { code: 'invalid_session' }]) {
    assert.deepEqual(await verifySession('synthetic-session', scope, async () => { throw error; }, now),
      { ok: false, reason: 'unavailable' });
  }
});

test('default deadline is five seconds and a stalled session fails closed', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  assert.equal(DEFAULT_LOOKUP_TIMEOUT_MS, 5000);
  const pending = verifySession('synthetic-session', scope, () => new Promise(() => {}), now);
  t.mock.timers.tick(5000);
  assert.deepEqual(await pending, { ok: false, reason: 'unavailable' });
});
test('stalled role lookup fails closed at the trusted custom deadline', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pending = authorizeRole(identity, ['patrol'], () => new Promise(() => {}), 20);
  t.mock.timers.tick(20);
  assert.deepEqual(await pending, { ok: false, reason: 'unavailable' });
});

for (const action of ['resolve', 'reject'] as const) {
  test(`late session ${action} cannot change a timeout decision`, async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let finish!: () => void;
    const dependency = new Promise<VerifySessionResult>((resolve, reject) => {
      finish = () => action === 'resolve' ? resolve(valid()) : reject(new Error('late private failure'));
    });
    const pending = verifySession('synthetic-session', scope, () => dependency, now, 10);
    await Promise.resolve();
    t.mock.timers.tick(10);
    const result = await pending;
    finish();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(result, { ok: false, reason: 'unavailable' });
  });
  test(`late role ${action} cannot change a timeout decision`, async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let finish!: () => void;
    const dependency = new Promise<RoleAssignment[]>((resolve, reject) => {
      finish = () => action === 'resolve' ? resolve([{ ...identity, role: 'patrol' }]) : reject(new Error('late'));
    });
    const pending = authorizeRole(identity, ['patrol'], () => dependency, 10);
    await Promise.resolve();
    t.mock.timers.tick(10);
    const result = await pending;
    finish();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(result, { ok: false, reason: 'unavailable' });
  });
}
test('invalid trusted timeouts deny access before invoking dependencies', async () => {
  for (const timeout of [0, -1, NaN, Infinity, 1.5, 2_147_483_648]) {
    let called = false;
    assert.deepEqual(await verifySession('synthetic-session', scope, async () => {
      called = true; return valid();
    }, now, timeout), { ok: false, reason: 'unavailable' });
    assert.deepEqual(await authorizeRole(identity, ['patrol'], async () => {
      called = true; return [{ ...identity, role: 'patrol' }];
    }, timeout), { ok: false, reason: 'unavailable' });
    assert.equal(called, false);
  }
});
test('deadline timer is cleared after successful and failed lookups', async t => {
  const clear = t.mock.method(globalThis, 'clearTimeout');
  assert.equal(await withLookupTimeout(async () => 'done'), 'done');
  await assert.rejects(withLookupTimeout(async () => { throw new Error('failure'); }));
  assert.equal(clear.mock.callCount(), 2);
});
test('default Node condition rejects every server-only module', async () => {
  const { spawnSync } = await import('node:child_process');
  for (const path of ['piezas/client', 'auth/session', 'auth/authorization', 'auth/timeout']) {
    const script = `const { register } = await import('node:module');
      register(${JSON.stringify(loader)}, import.meta.url);
      await import('./lib/server/${path}.ts');`;
    const run = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', script],
      { cwd: process.cwd(), encoding: 'utf8', timeout: 15000 });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /cannot be imported from a Client Component/);
  }
});
