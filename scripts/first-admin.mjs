// Creates the very first administrator, who can then create everyone else in the
// app. Refuses to run once an administrator exists.
//   npm run accounts:first-admin -- "Your Name" you@example.com
import { createHash, createHmac, randomUUID } from 'node:crypto';
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

// The same signed link the app makes (see lib/server/password-links.ts).
const created = await account.create({ title: name, data: { authUserId: 'pending', appUserId: `acct-${randomUUID()}`, name: name.trim(), email, role: 'admin' } });
const key = createHash('sha256').update(`kk-invite|${process.env.PIEZAS_API_KEY}`).digest();
const payload = Buffer.from(JSON.stringify({ a: created.id, e: Date.now() + 7 * 86_400_000 })).toString('base64url');
const invite = `${payload}.${createHmac('sha256', key).update(payload).digest('base64url')}`;
const site = process.env.PIEZAS_APP_URL ?? 'http://localhost:3000';
await piezas.sendEmail({
  to: email,
  subject: 'Create your Kestrel Kids password',
  body: `Hello ${name.trim()},\n\nYou're the first administrator of the Kestrel Kids portal. Create your password here:\n\n${new URL(site).origin}/set-password?invite=${invite}\n\nThis link works for 7 days.\n\nKestrel Kids`,
});
console.log(`\nDone. Check ${email} for an email with a link to create your password.\n`);
