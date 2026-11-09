# Persistent incidents: isolated service/storage increment

Branch starts from origin/main f5d7ad8 (PR #5). No frontend, reporting control,
shared store, fixture, auth helper or configuration is modified. The authoritative
app remains **Peak Pals by Kestrel Kids**, app ID
`794788d9-10e0-4ccb-bdf8-2455236c13dc`. The manifest must stay byte-for-byte main's.

## Implemented locally

`createIncidentService` implements create, list, retrieve and acknowledge using
injected session verification, protected roles, child/lesson authorization and
storage. It calls the existing verifySession/authorizeRole helpers per operation.
No request body can supply a reporter, patroller or role. Parents cannot use this
operational API. Instructors access only their authoritative assignments; desk
and admin can report checked-in children; patrol reads/acknowledges open incidents.
Instructor/admin/desk summaries include acknowledgements without medical/contact
information. No arbitrary day filter hides an unresolved previous-day incident.

Input validation and Vancouver deadlines reuse Increment 1. Server time supplies
reporting and acknowledgement timestamps. Unknown clothing remains allowed.
Returned objects are explicitly projected and contain no credentials or SDK data.
Service errors expose safe categories, not raw upstream errors. Dependencies use
the existing bounded lookup helper; a timed-out write might still complete.

Acknowledgements are separate durable records, not a full incident overwrite.
Sequential retries reuse the same acknowledgement. Reads collapse duplicates to
the earliest acknowledgement for each patroller. A post-write incident read denies
details if closure occurred meanwhile; no operation reopens or closes incidents.

## Published SDK surface verified (installed 0.5.2)

The adapter uses `client.entities.ofType(typeId)` and its actual `create`, `get`,
`list` methods. It checks entity type, tenant and app references on reads and pages
past 100 records. It validates persisted incident content/deadlines before use.
Acknowledgement changes use record creation; no incident update is necessary.
The SDK's `update(id, { data })` exists but has no conditional version argument,
so it is deliberately not used to overwrite acknowledgement arrays/status.

`ofType` binds an existing type locally without requests. `defineEntities` is the
supported future setup operation, but no schema creation is called here. Type IDs
are required trusted inputs, not guessed from PR #6. No client is constructed from
environment values, and importing the modules performs no I/O.

Single-record create does not yet honor its idempotency header according to the
installed SDK. Concurrent requests can create duplicate incidents/acknowledgements;
deduplicated responses do not mean exactly-once storage. No cross-process lock or
atomic incident-close/acknowledgement guarantee is claimed. A concurrent close may
leave an acknowledgement event even though the response is denied. An ambiguous
write failure must be reconciled by reading before a retry.

## Authentication blocker: no production wiring yet

Real credentials, cookies, login and app-specific role/roster storage are not
connected. This is a tested service/storage adapter, not a working authenticated
cross-browser demo. Future server composition must bind the verifier to
`client.users.getSession(appId, credential)`, load exactly one protected role,
and resolve child/lesson assignments from authoritative records. It must use the
existing server-only client factory with trusted app/tenant settings.

If verification returns refreshedToken, the service requires a trusted
persistRefreshedSession callback (future secure cookie transport). Without it,
or if it fails, access is unavailable rather than silently dropping the refresh.
Tests supply synthetic verifier/role/resource results only; these are never used
as a default or production fallback. No preview-user parameter is accepted.

Provisioning accounts/roles/types and testing SDK requests require a later explicit
approval. The local manifest identifies the intended app, but key binding, tenant
ID, users-service access and hosted behavior have not been checked. Do not infer
any of these from the signed-in Piezas console account or fictional fixture IDs.

## Coordination with teammate work

PR #6's useful separation of incident and acknowledgement records was reviewed,
but none of its preview authentication, timestamp construction, schemas or routes
is copied. This increment uses new persistent-incidents paths, avoiding its
today.ts/guardians.ts and the reporting-time changes in PRs #1/#2/#4. Later agree
entity names and resource identifiers with the teammate before any setup; two
parallel incident stores must not be deployed. Reconcile a single reporting-time
contract before wiring the current synchronous preview actions to promises.

## Verification

Run isolated tests without SDK calls:

`node --conditions=react-server --experimental-strip-types --test tests/backend/persistent-incidents.spec.ts tests/backend/security-foundation.spec.ts tests/backend/incident-validation.spec.ts`

The test-only Node loader resolves extensionless TS imports as in the existing
security tests. Fixtures use an injected in-memory adapter and substitute only
the SDK record methods actually used. No local business database or API routes
are created. Passing these tests proves service behavior against injected state,
not actual Piezas persistence or authenticated browser sessions.

Next approved step: agree the teammate's record ownership and trusted account,
role and child/lesson sources, then implement the secure session/role/resource
composition. Only afterward approve test-app provisioning and a two-session
create/read/acknowledge/reload check. UI integration remains a separate step.
