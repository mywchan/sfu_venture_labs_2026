# Backend integration: first increment

This is a disconnected foundation, not a working backend. The five preview
interfaces, routes, styles, fixtures and existing workflows are unchanged. No
application module imports these files. There are no SDK calls, hosted writes,
account changes, API routes or deployment changes in this increment.

## Existing workflow compatibility

- `ReportMissing` currently calls synchronous
  `reportMissing(childId, lastSeenPlace, lastSeenTime)` and immediately declares
  patrol alerted. Keep that preview behavior until an approved adapter exists.
- New contracts retain `childId`, `lastSeenPlace`, `lastSeenAt`, flat clothing
  fields, `reportedBy`, and `open`/`closed`. Acknowledgements retain the existing
  `emergencyId`, `patrollerId`, `at` names. Incident is the service term; emergency
  remains the existing reference name. No existing types are replaced.
- The future adapter must supply the verified lesson day and convert the form's
  time-only value to an explicit-offset instant on that day in Vancouver. It must
  not append the browser's timezone or use the fixed preview date in production.
  Repeated/skipped local times need explicit resolution before submission.
- Unknown clothing is `null`, not the literal text "Not recorded". Existing views
  will need an approved display adapter. Bib is a daily identifying snapshot.
- The current instructor view restricts reporting to checked-in, unreleased,
  assigned children. Server-side eligibility must be agreed before wiring it.

## Contracts and boundaries

`ReportIncidentInput` contains only reported facts and references. The runtime
validator accepts unknown input, rejects extra fields (including actor, role,
status and reporting time), trims text, checks bounds, and returns named errors.
This is not authorization. Child/day references still require server lookups.

`IncidentSummary` is an operational response without contacts or medical data.
It has a server-derived reporter, reporting time, deadline and acknowledgements.
The future response envelope should add `serverNow` and data freshness. Display
names should be supplied through a role-specific response, not a school-wide user
list. Separate emergency-detail reads will require recorded authorization.

Future acknowledgements, search updates, escalation actions, resolution and
sensitive-access history have type extension points only. No commands or storage
for these are implemented. Preserve open/closed status; use events for progress.

Future operations (not implemented): report, list patrol incidents, acknowledge,
and retrieve limited instructor status. Expected error classes: 401 sign-in,
403 role, 404 unavailable record, 409 detected conflict, 422 field errors,
503 unavailable service. No promise of conflict detection without storage support.

## Time policy

All report timestamps require seconds and `Z` or an explicit numeric offset;
successful validation normalizes them to UTC. The validator receives trusted
server time explicitly and rejects future last-seen times. It accepts overdue
reports and unknown identifying details. It does not impose a same-day limit.

Deadline is the earlier of 60 elapsed minutes after last seen or 16:00 on the
last-seen calendar date in `America/Vancouver`. An overdue report never gets a
new deadline. At the deadline, action is due. The calculation uses Node/Intl
timezone data, not host local time or a hardcoded winter/summer offset. Historical
2025 transition tests avoid assuming future daylight-saving policy. Keep runtime
timezone data current. A countdown indicates human action, not an automatic call.

## Installed SDK verification (0.5.2)

Inspected installed declarations and JavaScript; no hosted behavior was tested.

- `users.signIn`, `getSession`, `signOut`, `enableEmailMfa`, and
  `completeMfaChallenge` exist. Verify sessions and handle refresh server-side.
- `defineEntities` and record create/get/list/update exist. Entity lists support
  filters and pagination; filters do not establish end-user authorization.
- Exported `createAppRoleStore` provides record-backed product roles. Only trusted
  administration may assign them. Deny unassigned users rather than using the
  helper's default member/admin fallback. Credentials remain in the users service.
- Exported `createInboxStore` is record-backed, not push delivery. Initially poll
  the authoritative incident list so inbox fan-out failure cannot hide a report.
- Single-record create accepts a duplicate-prevention key, but its documentation
  says enforcement is pending. Updates expose no conditional version argument.
  Do not claim duplicate-safe reports, acknowledgements or releases yet. Verify
  supported hosted guarantees before choosing a concurrency strategy; no local
  database, in-memory lock or homemade SDK can replace that verification.
- Queue enqueue/list are available; claim/complete require platform credentials.
  Do not implement a tenant worker against them.
- Activity methods exist; they do not by themselves guarantee tamper-proof audit.

## Security and configuration for a later approved increment

Verify session, app/tenant, role, assignment and child relationship on every
operation. Never trust client actor IDs. Use narrow response fields, no shared
private response caching, secure session cookies and CSRF/origin checks. Keep
the privileged Piezas key server-side. Only fictional case information is allowed.

Existing standalone Next.js hosting fits. Required settings are currently empty.
The SDK can derive the users address from `PIEZAS_API_URL`; project instructions
also require `PIEZAS_USERS_URL`. Later declare consistent settings and ensure test
credentials resolve the test app rather than the live app ID. No configuration
is changed here. Design approval remains required before live backend wiring.

## Teammate decisions before frontend integration

Obtain approval before editing store, report dialog, instructor/patrol pages,
shell or sign-in. Agree async saving/failure/acknowledgement states, local-time
conversion, unknown-detail display, and role-specific response shapes. Do not
reuse the preview sign-in or role buttons as real authentication. Keep all
existing routes and test identifiers wherever practical; visual design stays
with the frontend teammate. School staff must agree family-contact wording.

## Isolated verification

The test file uses Node's built-in runner, not Playwright discovery (which would
start the app and may generate project files). On installed Node 22.11:

`node --experimental-strip-types --test tests/backend/incident-validation.spec.ts`

Application type check (no generated cache):

`node node_modules/typescript/bin/tsc --noEmit --incremental false --allowImportingTsExtensions`

The existing project excludes tests, so also check these three TypeScript files
explicitly using `--strict --skipLibCheck --target ES2022 --module esnext
--moduleResolution bundler --allowImportingTsExtensions --noEmit`, listing the
contract, validator and test paths. No dependencies or config changes are needed.
These are focused logic checks, not the future UI acceptance checks or a claim
that authentication, persistence, alerts or authorization have been implemented.
