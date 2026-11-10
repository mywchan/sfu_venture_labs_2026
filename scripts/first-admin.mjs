// Creates the very first administrator, who can then create everyone else in the
// app. Refuses to run once an administrator exists.
//   npm run accounts:first-admin -- "Your Name" you@example.com
import { Piezas } from '@piezas/sdk';

const [name, rawEmail] = process.argv.slice(2);
const email = rawEmail?.trim().toLowerCase();
const appId = process.env.PIEZAS_APP_ID;
if (!name?.trim() || !email?.includes('@')) {
  console.error('\nUsage: npm run accounts:first-admin -- "Your Name" you@example.com\n');
  process.exit(1);
}
if (!appId) {
  console.error('\nPIEZAS_APP_ID is missing from .env\n');
  process.exit(1);
}

const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY, appId });
const required = { type: 'text', required: true };
// Keep these fields in step with lib/server/accounts.ts.
const { kk_account: account } = await piezas.defineEntities(
  { kk_account: { fields: { authUserId: required, appUserId: required, name: required, email: required, role: required, childIds: { type: 'text' } } } },
  { onDrift: 'ignore' },
);

const admins = await account.list({ limit: 1, filter: { role: 'admin' } });
if (admins.data.length > 0) {
  console.error('\nAn administrator already exists. Create new accounts from the Accounts tab in the app.\n');
  process.exit(1);
}

const [row] = (await piezas.users.importUsers(appId, [{ email, emailVerified: true, profile: { name } }])).results;
if (!row || row.status === 'error') {
  console.error('\nPiezas could not create that account.\n');
  process.exit(1);
}
const person = (await piezas.users.listUsers(appId, { email, limit: 20 })).users.find((u) => u.email.toLowerCase() === email);
if (!person) {
  console.error('\nThe new account was not found. Please try again.\n');
  process.exit(1);
}
if (row.status === 'skipped_existing') await piezas.users.forgotPassword(appId, email);

await account.create({ title: name, data: { authUserId: person.id, appUserId: `acct-${person.id}`, name: name.trim(), email, role: 'admin' } });
console.log(`\nDone. Check ${email} for an email with a link to set your password.\n`);
