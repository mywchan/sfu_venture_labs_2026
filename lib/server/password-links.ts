import 'server-only';

// Where emailed password links point, and the signed link used for a first-time
// "create your password" email. Nothing here is saved: the signature proves the
// server made the link, and the link stops working once the account is set up.

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import process from 'node:process';
import { piezasServer } from './piezas/settings';

const INVITE_DAYS = 7;
const DEV_ORIGINS = [3000, 3001, 3002, 3003].map((port) => `http://localhost:${port}`);

const production = () => process.env.NODE_ENV === 'production';

/** This site's own address, for links in emails. */
export function siteAddress(request: Request) {
  if (production()) {
    const configured = process.env.PIEZAS_APP_URL;
    if (!configured) throw new Error('PIEZAS_APP_URL is not set.');
    return new URL(configured).origin;
  }
  // While developing, follow whichever local port the app actually started on.
  const candidate = `http://${request.headers.get('host') ?? ''}`;
  return DEV_ORIGINS.includes(candidate) ? candidate : DEV_ORIGINS[0];
}

let allowed: Promise<unknown> | null = null;

/** Piezas only emails links to addresses this app has listed, so list ours once. */
export function allowPasswordLinks() {
  const origins = production() ? [new URL(process.env.PIEZAS_APP_URL ?? '').origin] : DEV_ORIGINS;
  allowed ??= (async () => {
    const { client, scope } = piezasServer();
    await client.users.configurePolicy(scope.appId, { allowedOrigins: origins });
  })().catch((err) => {
    allowed = null; // try again next time
    throw err;
  });
  return allowed;
}

const signingKey = () => createHash('sha256').update(`kk-invite|${process.env.PIEZAS_API_KEY ?? ''}`).digest();
const sign = (payload: string) => createHmac('sha256', signingKey()).update(payload).digest('base64url');

export function makeInvite(accountId: string) {
  const payload = Buffer.from(JSON.stringify({ a: accountId, e: Date.now() + INVITE_DAYS * 86_400_000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

/** The account a genuine, unexpired invite is for; otherwise null. */
export function readInvite(invite: string): string | null {
  const [payload, signature, extra] = invite.split('.');
  if (!payload || !signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { a, e } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { a?: unknown; e?: unknown };
    return typeof a === 'string' && typeof e === 'number' && e > Date.now() ? a : null;
  } catch {
    return null;
  }
}
