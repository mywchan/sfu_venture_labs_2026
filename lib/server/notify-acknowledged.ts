// Tells staff when patrol has taken on a search. Server only.

import { fullName } from '@/lib/access';
import { seedData, type Role, type User } from '@/lib/seed/data';
import { notify } from './notifications';
import { currentRoster, instructorOf } from './roster';

const usersWithRole = (role: Role) => seedData.users.filter((u) => u.role === role).map((u) => u.id);

export async function onAcknowledged({ emergencyId, childId, patroller }: { emergencyId: string; childId: string; patroller: User }) {
  const child = seedData.children.find((c) => c.id === childId);
  const roster = await currentRoster();
  const instructor = instructorOf(roster, childId);
  const notice = {
    kind: 'search_acknowledged',
    message: `${patroller.name} from ski patrol has acknowledged the search for ${child ? fullName(child) : 'a child'}.`,
    actionLabel: 'View',
    refId: emergencyId,
    key: `acknowledged|${emergencyId}|${patroller.id}`,
  };
  await notify(usersWithRole('admin'), { ...notice, href: '/admin' });
  await notify(usersWithRole('desk'), { ...notice, href: '/desk' });
  if (instructor) await notify([instructor], { ...notice, href: '/instructor' });
}
