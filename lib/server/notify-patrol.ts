// Notifications to ski patrol about missing children. Server only.

import { fullName } from '@/lib/access';
import { seedData } from '@/lib/seed/data';
import { directory } from './accounts';
import { clearFor, notify, quietly } from './notifications';
import { searchesWithNoAcknowledgement } from './today';

const REMINDER_EVERY_MS = 5 * 60_000;
const ALERT = 'missing_alert';
const REMINDER = 'missing_reminder';

const everyPatroller = async () => (await directory()).users.filter((u) => u.role === 'patrol').map((u) => u.id);

function childName(childId: string) {
  const child = seedData.children.find((c) => c.id === childId);
  return child ? fullName(child) : 'a child';
}

export async function onMissingReported({ emergencyId, childId, lastSeenPlace }: { emergencyId: string; childId: string; lastSeenPlace: string }) {
  await notify(await everyPatroller(), {
    kind: ALERT,
    message: `Missing child: ${childName(childId)}, last seen at ${lastSeenPlace}. Open the search and acknowledge it.`,
    href: `/patrol?search=${emergencyId}`,
    actionLabel: 'Open search',
    urgent: true,
    refId: emergencyId,
    key: `missing|${emergencyId}`,
  });
}

/** Someone is on it, so "nobody has acknowledged this" is no longer true. */
export async function clearRemindersOnAcknowledged(emergencyId: string) {
  await clearFor(emergencyId, [REMINDER]);
}

export async function onSearchClosed(emergencyId: string) {
  await clearFor(emergencyId, [ALERT, REMINDER]);
}

/**
 * Reminds every patroller each 5 minutes a search goes unacknowledged. There's no
 * background worker, so this runs whenever a patrol screen checks for
 * notifications; the 5 minutes are counted from when the report was saved.
 */
export async function sendDueReminders() {
  await quietly(async () => {
    for (const search of await searchesWithNoAcknowledgement()) {
      const round = Math.floor((Date.now() - new Date(search.reportedAt).getTime()) / REMINDER_EVERY_MS);
      if (round < 1) continue;
      const key = `missing-reminder|${search.id}|${round}`;
      await notify(await everyPatroller(), {
        kind: REMINDER,
        message: `No one has acknowledged the search for ${childName(search.childId)} yet. It was reported ${round * 5} minutes ago.`,
        href: `/patrol?search=${search.id}`,
        actionLabel: 'Open search',
        urgent: true,
        refId: search.id,
        key,
      });
      await clearFor(search.id, [REMINDER], `${key}|`); // only the latest reminder stays up
    }
  });
}
