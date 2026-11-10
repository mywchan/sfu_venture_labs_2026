// In-app notifications, saved in Piezas so they survive a reload and reach the
// person on any device. Server only. Piezas's own notification service sends
// emails and texts; this is the app's inbox, kept as Piezas records.

import { recordsClient } from './demo-store';
import type { AppNotification, User } from '@/lib/seed/data';

export type NewNotification = {
  kind: string;
  message: string;
  href: string; // the screen the button opens
  actionLabel: string;
  urgent?: boolean;
  refId?: string; // the search or group this is about
  key: string; // the same key is never sent twice to the same person
};

const required = { type: 'text', required: true } as const;

async function setUp() {
  const piezas = recordsClient();
  const { kk_notification: notification } = await piezas.defineEntities({
    kk_notification: {
      fields: {
        recipientId: required,
        kind: required,
        message: required,
        href: required,
        actionLabel: required,
        dedupeKey: required,
        urgent: { type: 'boolean' },
        refId: { type: 'text' },
        readAt: { type: 'text' },
      },
    },
  });
  return notification;
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

const isUnread = (r: Stored) => !r.data.readAt;

async function listAll(entity: Entity, filter: Record<string, unknown>) {
  const all: Stored[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await entity.list({ limit: 100, offset, filter });
    all.push(...page.data);
    if (page.data.length < 100) return all;
  }
}

/** One copy per person. Two servers acting at once can create a twin; readers collapse those. */
function onePerKey(rows: Stored[]) {
  const seen = new Map<string, Stored>();
  for (const r of [...rows].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const key = String(r.data.dedupeKey);
    if (!seen.has(key)) seen.set(key, r);
  }
  return [...seen.values()];
}

/** Sends to each person who hasn't already had this one. */
export async function notify(recipientIds: string[], n: NewNotification) {
  const entity = await records();
  for (const recipientId of new Set(recipientIds)) {
    const dedupeKey = `${n.key}|${recipientId}`;
    if ((await entity.list({ limit: 1, filter: { dedupeKey } })).data.length > 0) continue;
    await entity.create({
      title: n.message.slice(0, 200),
      data: {
        recipientId,
        kind: n.kind,
        message: n.message,
        href: n.href,
        actionLabel: n.actionLabel,
        dedupeKey,
        urgent: n.urgent === true,
        ...(n.refId ? { refId: n.refId } : {}),
      },
    });
  }
}

/** Runs a notification step without letting it undo the save that triggered it. */
export async function quietly(work: () => Promise<void>) {
  try {
    await work();
  } catch (err) {
    console.error('[notifications]', err);
  }
}

/** This person's notifications, newest first. */
export async function readNotifications(user: User): Promise<AppNotification[]> {
  const entity = await records();
  const rows = onePerKey(await listAll(entity, { recipientId: user.id }));
  return rows
    .reverse()
    .slice(0, 50)
    .map((r) => ({
      id: r.id,
      kind: String(r.data.kind),
      message: String(r.data.message),
      href: String(r.data.href),
      actionLabel: String(r.data.actionLabel),
      urgent: r.data.urgent === true,
      createdAt: r.createdAt,
      readAt: typeof r.data.readAt === 'string' ? r.data.readAt : null,
    }));
}

/** Marks some of this person's own notifications read. Other people's ids are ignored. */
export async function markRead(user: User, ids: string[]) {
  const entity = await records();
  const rows = await listAll(entity, { recipientId: user.id });
  const keys = new Set(rows.filter((r) => ids.includes(r.id)).map((r) => r.data.dedupeKey));
  const readAt = new Date().toISOString();
  for (const r of rows) {
    if (isUnread(r) && keys.has(r.data.dedupeKey)) await entity.update(r.id, { data: { ...r.data, readAt } });
  }
}

/** Does this person have something unread about this search or group? */
export async function hasUnread(recipientId: string, refId: string) {
  const entity = await records();
  return (await listAll(entity, { recipientId, refId })).some(isUnread);
}

/** Clears notifications that no longer apply, for everyone who has them. */
export async function clearFor(refId: string, kinds: string[], exceptKeyPrefix?: string) {
  const entity = await records();
  const readAt = new Date().toISOString();
  for (const r of await listAll(entity, { refId })) {
    if (!isUnread(r) || !kinds.includes(String(r.data.kind))) continue;
    if (exceptKeyPrefix && String(r.data.dedupeKey).startsWith(exceptKeyPrefix)) continue;
    await entity.update(r.id, { data: { ...r.data, readAt } });
  }
}
