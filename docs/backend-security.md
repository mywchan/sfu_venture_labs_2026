# Increment 2: disconnected server security foundation

Only five new files are added. Existing frontend, contracts, fixtures, routes,
configuration and deployment settings remain unchanged. There are no hosted
requests, records, schemas, account changes or sign-in routes in this increment.

## Server boundaries

All executable modules depend on Node built-ins and reject browser execution.
They also import the standard `server-only` marker (pinned dependency 0.0.1).
Next.js rejects client imports; direct Node tests use `--conditions=react-server`.
The default Node condition rejects these modules, as checked in subprocesses.
Do not import these modules into client components. The client factory imports
the published SDK but constructs it only when called. Importing modules does not
read credentials or initiate requests. No global SDK singleton is created.

The factory receives explicit trusted settings: API key, gateway/users addresses,
app ID and tenant ID. It accepts only the hosted addresses in the project contract,
requires UUID context, rejects development identity overrides, and explicitly
sets SDK service URLs to prevent ambient URL overrides. Errors contain no values.
It never reads the deployment manifest or selects test/live context itself. The
SDK performs its own app-binding checks when actually used. Prefix validation is
not credential authentication. Test keys and app IDs must be paired by the future
trusted settings loader. No such loader or settings change is implemented here.

## Session verification

Use `verifySession(credential, scope, (appId, credential) =>
client.users.getSession(appId, credential))` on the server. The dependency uses
the installed SDK's `VerifySessionResult`, not invented session properties.

Only an explicitly valid result with an active user and matching user/app/tenant
claims is accepted. Required claim structure, expiry and issue time are checked
against server time. The SDK/service verifies authenticity; this code does not
decode unverified credentials or implement signing. Issuer/audience must be
present; their expected values are not guessed. Hosted verification remains to
be tested. Unknown upstream exceptions deny access as unavailable, with no raw
error disclosure. Invalid returned results deny access as unauthenticated.
The installed SDK's `PiezasError` with code `invalid_session` is also mapped to
unauthenticated. No message text or generic HTTP status is used for this decision.
Other exceptions, including API-key/configuration errors, remain unavailable.

Session and role dependencies each have a five-second default wait limit through
`withLookupTimeout`. Trusted server callers may supply a positive integer timeout
up to Node's timer limit; never pass a browser or request setting. Invalid limits
deny access before invoking the dependency. Timers are cleared after completion.
Late success cannot change a returned denial; late rejection is handled. This
bounds the caller's wait, not execution: the installed Piezas SDK offers no request
abort argument, so an underlying request may continue (including session refresh).
No SDK cancellation or durable worker behavior is claimed. These limits do not
interrupt synchronous CPU-blocking code; dependencies are asynchronous I/O.

The minimal `identity` is safe to use as a public identifier response after the
future route's review. `serverCredentials.refreshedToken` is separate and private.
Never serialize the complete successful result. A future cookie handler must
persist refresh safely; cookie transport, CSRF checks and sign-in are not included.
Email verification and second-factor policy are not inferred from `emailVerified`;
enrollment and policy enforcement remain a later authentication workflow.

## Explicit roles

`authorizeRole` takes only a verified identity, an allowed-role list and a trusted
lookup. Exactly one matching assignment is required. Missing, conflicting,
unknown, mismatched or disallowed assignments deny access. Lookup exceptions deny
access as unavailable. Allowed roles retain parent/instructor/desk/patrol/admin.
No browser state, preview account, email or platform owner status grants a role.

The lookup is an application interface, not a Piezas endpoint or schema. The
future protected Piezas assignment reader must scope by app/tenant/user and detect
duplicates. The SDK's `createAppRoleStore` exists but its default fallback and
single-assignment lookup are not sufficient for these guarantees. No role records
are defined or written here. Child/group/incident permissions must be checked in
future resource services, not inferred from role success.

## Installed SDK findings (0.5.2)

Verified declarations and implementation for getSession, signIn, signOut and
second-factor methods. Verification returns valid/user/claims/refreshedToken;
sign-in may return a second-factor challenge instead of a session. SDK auth calls
resolve app binding; no administrator set-password operation is assumed.

Record create/update and role/inbox helpers exist. Single-record creation's
duplicate-prevention header is documented as not enforced yet. Updates expose no
conditional-version argument. No safe concurrent report/release guarantee is
claimed. Queue claim/complete require platform credentials. Tenant applications
must not build a worker against those methods. Hosted revocation, disabled-user
behavior, role storage scoping and concurrency must be verified separately.

## Next integration approvals

Existing instructor reports and patrol acknowledgement components stay intact.
Later routes will verify sessions and roles before resource-specific checks.
After frontend approval, an adapter will replace preview actions with asynchronous
server calls while retaining components, field names, routes and test identifiers.
Medical/contact disclosure needs separate authorized and recorded reads.

Later declare required server settings in the shared deployment configuration:
PIEZAS_API_KEY, PIEZAS_API_URL and PIEZAS_USERS_URL, plus agreed trusted app/tenant
settings. No values belong in browser code or fixtures. Existing standalone Next.js
hosting fits. Test/live context, cookie behavior, role bootstrap and the recorded
design approval need resolution before live wiring. No deployment changes here.

## Verification

Use Node's built-in runner directly, not Playwright discovery:

`node --conditions=react-server --experimental-strip-types --test tests/backend/security-foundation.spec.ts tests/backend/incident-validation.spec.ts`

Node 22.11's type stripping does not resolve extensionless TypeScript imports.
The security test file registers a test-only resolver for those imports before
loading session/role modules. Production code retains Next.js-compatible imports;
there is no production loader. No scripts or TypeScript configuration are changed.
Playwright ignores `tests/backend/**`, preserving its other discovery settings.
Verify with `node node_modules/@playwright/test/cli.js test --list --reporter=line`;
list-only discovery starts no application or browser.

Run application TypeScript checking with `--noEmit --incremental false`. Also
check both test files and their imported modules explicitly with strict checking,
ES2022, esnext modules, bundler resolution and `--allowImportingTsExtensions
--skipLibCheck --noEmit`. Tests inject inert constructors/verifiers/lookups and
use synthetic strings, never real credentials. An isolated subprocess checks
fresh imports with networking disabled. These tests establish local behavior,
not successful hosted authentication or complete application access protection.

Hardening verification (2026-11-08): all 96 Node checks passed (79 existing plus
17 hardening checks); application and focused TypeScript checks passed. Playwright
list-only discovery returned the two existing smoke checks and no backend tests.
The local production build was attempted with telemetry disabled but stopped on
Windows EPERM opening `.next/trace`, even outside the sandbox. No missing-setting
error was reported before that stop. Production build compatibility remains
unverified; no running processes were stopped and no build output was removed.
