import 'server-only';

// Who may sign in and what they are. Passwords and sign-in codes live only in
// the Piezas accounts service; this record holds the person's role and, for a
// parent, their children. Only this server can write it, using the API key.

import { randomUUID } from 'node:crypto';
import { seedData, type ParentAccount, type Role, type User } from '@/lib/seed/data';
import { APP_ROLES, type RoleAssignment } from './auth/authorization';
import type { VerifiedIdentity } from './auth/session';
import { allowPasswordLinks, makeInvite, readInvite, siteAddress } from './password-links';
import { demoMode, recordsClient } from './demo-store';
import { piezasServer } from './piezas/settings';
import { Refused } from './refused';

export type Account = {
  id: string;
  authUserId: string;
  appUserId: string;
  name: string;
  email: string;
  role: Role;
  childIds: string[];
};

// Until the person creates their password, there is no Piezas sign-in to link to.
const NOT_YET = 'pending';

async function setUp() {
  const required = { type: 'text', required: true } as const;
  const { kk_account: account } = await recordsClient().defineEntities({
    kk_account: {
      fields: { authUserId: required, appUserId: required, name: required, email: required, role: required, childIds: { type: 'text' } },
    },
  });
  return account;
}

type Entity = Awaited<ReturnType<typeof setUp>>;
type Stored = Awaited<ReturnType<Entity['list']>>['data'][number];

let ready: ReturnType<typeof setUp> | null = null;
function records() {
  if (!ready) {
    ready = setUp().catch((err) => {
      ready = null; // try again on the next request rather than staying broken
      throw err;
    });
  }
  return ready;
}

function toAccount(r: Stored): Account {
  const childIds = typeof r.data.childIds === 'string' && r.data.childIds ? r.data.childIds.split(',') : [];
  return {
    id: r.id,
    authUserId: String(r.data.authUserId),
    appUserId: String(r.data.appUserId),
    name: String(r.data.name),
    email: String(r.data.email),
    role: String(r.data.role) as Role,
    childIds,
  };
}

async function listAll(entity: Entity, filter?: Record<string, unknown>) {
  const all: Stored[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await entity.list({ limit: 100, offset, ...(filter ? { filter } : {}) });
    all.push(...page.data);
    if (page.data.length < 100) return all.map(toAccount);
  }
}

/** The account or accounts for a verified sign-in. More than one is refused by the caller. */
export async function accountsFor(authUserId: string) {
  return listAll(await records(), { authUserId });
}

/** The role lookup used by authorizeRole, scoped to the verified sign-in. */
export async function roleAssignments(identity: VerifiedIdentity): Promise<RoleAssignment[]> {
  const found = await accountsFor(identity.userId);
  return found.map((a) => ({ ...identity, role: a.role }));
}

let cachedDirectory: { until: number; value: Promise<Directory> } | null = null;
export type Directory = { accounts: Account[]; users: User[]; parentAccounts: ParentAccount[] };

export { demoMode };

async function loadDirectory(): Promise<Directory> {
  const accounts = await listAll(await records());
  const real = accounts.map((a) => ({ id: a.appUserId, name: a.name, email: a.email, role: a.role }));
  const realIds = new Set(real.map((u) => u.id));
  const users = demoMode() ? [...seedData.users.filter((u) => !realIds.has(u.id)), ...real] : real;
  const parents = new Set(accounts.filter((a) => a.role === 'parent').map((a) => a.appUserId));
  const parentAccounts = [
    ...seedData.parentAccounts.filter((p) => demoMode() || parents.has(p.userId)),
    ...accounts.filter((a) => a.role === 'parent').flatMap((a) => a.childIds.map((childId) => ({ userId: a.appUserId, childId }))),
  ];
  return { accounts, users, parentAccounts };
}

/** Everyone with an account. Briefly remembered, as every screen asks for it. */
export function directory(): Promise<Directory> {
  if (!cachedDirectory || cachedDirectory.until < Date.now()) {
    const value = loadDirectory().catch((err) => {
      cachedDirectory = null;
      throw err;
    });
    cachedDirectory = { until: Date.now() + 10_000, value };
  }
  return cachedDirectory.value;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Creates someone's account and emails them a link to create their password.
 * Their Piezas sign-in is only made when they choose that password.
 * While the children are still made up, naming a person from the made-up list
 * with the same role links the account to that person's existing data.
 */
export async function createAccount(raw: Record<string, unknown>, request: Request): Promise<Account> {
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
  const role = raw.role as Role;
  const wanted = Array.isArray(raw.childIds) ? raw.childIds.filter((c): c is string => typeof c === 'string') : [];
  if (!name || name.length > 120) throw new Refused('Enter the person’s name.', 422);
  if (!EMAIL.test(email) || email.length > 254) throw new Refused('Enter a valid email address.', 422);
  if (!APP_ROLES.includes(role)) throw new Refused('Choose a role.', 422);
  if (wanted.some((id) => !seedData.children.some((c) => c.id === id))) throw new Refused('One of those children no longer exists.', 422);

  const entity = await records();
  const everyone = await listAll(entity);
  if (everyone.some((a) => sameText(a.email, email))) throw new Refused('That email address already has an account.');
  const seedPerson = seedData.users.find((u) => u.role === role && sameText(u.name, name) && !everyone.some((a) => a.appUserId === u.id));
  if (role === 'parent' && wanted.length === 0 && !seedPerson) throw new Refused('Choose at least one child for this parent.', 422);

  const created = toAccount(
    await entity.create({
      title: name,
      data: {
        authUserId: NOT_YET,
        appUserId: seedPerson?.id ?? `acct-${randomUUID()}`,
        name,
        email,
        role,
        ...(role === 'parent' && wanted.length > 0 ? { childIds: wanted.join(',') } : {}),
      },
    }),
  );
  cachedDirectory = null;
  try {
    await emailCreatePassword(created, request);
  } catch (err) {
    console.error('[accounts] create-password email failed', err instanceof Error ? err.message : '');
    throw new Refused('The account was created, but its email couldn’t be sent. Reload this page and use Resend email.', 502);
  }
  return created;
}

async function emailCreatePassword(account: Account, request: Request) {
  const link = `${siteAddress(request)}/set-password?invite=${makeInvite(account.id)}`;
  await piezasServer().client.sendEmail({
    to: account.email,
    subject: 'Create your Kestrel Kids password',
    body: `Hello ${account.name},\n\nAn account has been set up for you on the Kestrel Kids portal. Create your password here:\n\n${link}\n\nThis link works for 7 days. If you weren't expecting this email, you can ignore it.\n\nKestrel Kids`,
  });
}

async function emailResetPassword(email: string, request: Request) {
  await allowPasswordLinks();
  const { client, scope } = piezasServer();
  await client.users.forgotPassword(scope.appId, email, { returnUrl: `${siteAddress(request)}/set-password` });
}

/** The right email for this person: create a password the first time, otherwise reset it. */
export async function sendPasswordHelp(email: string, request: Request) {
  cachedDirectory = null;
  const account = (await directory()).accounts.find((a) => sameText(a.email, email));
  if (account?.authUserId === NOT_YET) await emailCreatePassword(account, request);
  else await emailResetPassword(email, request);
}

/** Someone opened their first-time link and chose a password. */
export async function claimInvite(invite: string, password: string, request: Request) {
  const expired = 'This link has expired or has already been used. Go to the sign-in page and choose “Forgot your password?” for a new one.';
  const accountId = readInvite(invite);
  if (!accountId) throw new Refused(expired, 400);
  cachedDirectory = null;
  const account = (await directory()).accounts.find((a) => a.id === accountId);
  if (!account || account.authUserId !== NOT_YET) throw new Refused(expired, 400);

  const { client, scope } = piezasServer();
  const [row] = (await client.users.importUsers(scope.appId, [{ email: account.email, emailVerified: true, password, profile: { name: account.name } }])).results;
  if (!row || row.status === 'error') throw new Refused('Piezas wouldn’t accept that password. Please choose a longer one.', 422);
  const person = (await client.users.listUsers(scope.appId, { email: account.email, limit: 20 })).users.find((u) => sameText(u.email, account.email));
  if (!person) throw new Error('New account was not found.');

  const entity = await records();
  await entity.update(account.id, {
    data: {
      authUserId: person.id,
      appUserId: account.appUserId,
      name: account.name,
      email: account.email,
      role: account.role,
      ...(account.childIds.length > 0 ? { childIds: account.childIds.join(',') } : {}),
    },
  });
  cachedDirectory = null;
  if (row.status === 'skipped_existing') {
    // That address already had a sign-in, so the password just typed wasn't used.
    await emailResetPassword(account.email, request);
    throw new Refused('This email address already had a sign-in, so we’ve emailed you a link to reset its password instead.', 409);
  }
}

/** Ends someone's access: they can no longer sign in, and any open session stops working. */
export async function removeAccount(accountId: unknown, me: User) {
  cachedDirectory = null;
  const account = (await directory()).accounts.find((a) => a.id === accountId);
  if (!account) throw new Refused('Not found', 404);
  if (account.appUserId === me.id) throw new Refused('You can’t remove your own account.');
  await (await records()).delete(account.id); // access ends here, even if the next step fails
  cachedDirectory = null;
  const { client, scope } = piezasServer();
  if (account.authUserId !== NOT_YET) await client.users.deleteUser(scope.appId, account.authUserId);
}

/** Sends the set-password email again, for someone who lost or never got it. */
export async function resendWelcome(accountId: unknown, request: Request) {
  const account = (await directory()).accounts.find((a) => a.id === accountId);
  if (!account) throw new Refused('Not found', 404);
  await sendPasswordHelp(account.email, request);
}
