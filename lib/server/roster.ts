// Who is in which group today, saved in Piezas. Server only. The made-up groups
// in lib/seed stay as the starting point; saved groups and placements win.

import { Piezas } from '@piezas/sdk';
import { groupForInstructor, groupOfChild, fullName, parentOwnsChild } from '@/lib/access';
import { currentLessonDayId, seedData, TODAY_LESSON_DAY, type Data, type Group, type GroupMember, type User } from '@/lib/seed/data';
import { hasUnread, notify, quietly } from './notifications';
import { directory } from './accounts';
import { Refused } from './refused';

const MAX_GROUP = 6;
const NOT_PLACED = 'none';

async function setUp() {
  const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY! });
  const { kk_group: group, kk_group_placement: placement } = await piezas.defineEntities({
    kk_group: {
      fields: {
        lessonDayId: { type: 'text', required: true },
        name: { type: 'text', required: true },
        level: { type: 'integer', required: true },
        instructorId: { type: 'text', required: true },
      },
    },
    // One per child per day; overrides the child's starting group.
    kk_group_placement: {
      fields: {
        lessonDayId: { type: 'text', required: true },
        childId: { type: 'text', required: true },
        groupId: { type: 'text', required: true },
      },
    },
  });
  return { group, placement };
}

type Entity = Awaited<ReturnType<typeof setUp>>['group'];
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

async function listAll(entity: Entity, filter: Record<string, unknown>) {
  const all: Stored[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await entity.list({ limit: 100, offset, filter });
    all.push(...page.data);
    if (page.data.length < 100) break;
  }
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function toGroup(r: Stored): Group {
  return { id: r.id, lessonDayId: String(r.data.lessonDayId), name: String(r.data.name), level: Number(r.data.level), instructorId: String(r.data.instructorId) };
}

export async function currentRoster(): Promise<Data> {
  const { group, placement } = await records();
  const day = { lessonDayId: TODAY_LESSON_DAY };
  const [savedGroups, placements, people] = await Promise.all([listAll(group, day), listAll(placement, day), directory()]);
  const firstPerChild = new Map<string, string>();
  for (const p of placements) {
    const childId = String(p.data.childId);
    if (!firstPerChild.has(childId)) firstPerChild.set(childId, String(p.data.groupId));
  }
  const groupMembers: GroupMember[] = [
    ...seedData.groupMembers.filter((m) => !firstPerChild.has(m.childId)),
    ...[...firstPerChild].filter(([, groupId]) => groupId !== NOT_PLACED).map(([childId, groupId]) => ({ groupId, childId })),
  ];
  return { ...seedData, users: people.users, parentAccounts: people.parentAccounts, groups: [...seedData.groups, ...savedGroups.map(toGroup)], groupMembers };
}

export function instructorOf(roster: Data, childId: string) {
  return groupOfChild(roster, childId)?.instructorId ?? null;
}

/** Everyone sees the groups; parents and instructors only see their own children in them. */
export async function readRoster(user: User) {
  const roster = await currentRoster();
  const ownGroup = user.role === 'instructor' ? groupForInstructor(roster, user).group?.id : null;
  const groupMembers =
    user.role === 'parent'
      ? roster.groupMembers.filter((m) => parentOwnsChild(roster, user, m.childId))
      : user.role === 'instructor'
        ? roster.groupMembers.filter((m) => m.groupId === ownGroup)
        : roster.groupMembers;
  // Keeps groups showing if the server has been running since before midnight.
  const currentDay = currentLessonDayId();
  return { groups: roster.groups.map((g) => (g.lessonDayId === TODAY_LESSON_DAY ? { ...g, lessonDayId: currentDay } : g)), groupMembers };
}

/** Creates a group or moves a child, then tells the instructor. Administrator only. */
export async function changeRoster(user: User, raw: Record<string, unknown>) {
  if (user.role !== 'admin') throw new Refused('Your account can’t do that.', 403);
  const { group, placement } = await records();
  const roster = await currentRoster();

  if (raw.action === 'addGroup') {
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    const level = raw.level;
    const instructorId = raw.instructorId;
    if (!name || name.length > 60) throw new Refused('Please give the group a name.', 422);
    if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > 6) throw new Refused('Please choose a level from 1 to 6.', 422);
    // The made-up instructors stay choosable while their sample groups exist.
    const instructor = [...roster.users, ...seedData.users].find((u) => u.id === instructorId && u.role === 'instructor');
    if (!instructor) throw new Refused('Please choose an instructor.', 422);
    if (typeof instructorId !== 'string') throw new Refused('Please choose an instructor.', 422);
    if (groupForInstructor(roster, instructor).group) throw new Refused(`${instructor.name} already has a group today. An instructor teaches one group at a time.`);
    const created = await group.create({ title: name, data: { lessonDayId: TODAY_LESSON_DAY, name, level, instructorId } });
    await quietly(() =>
      notify([instructorId], {
        kind: 'group_assigned',
        message: `You’ve been assigned ${name} (level ${level}) for today. Please review your children’s information.`,
        href: '/instructor',
        actionLabel: 'View children',
        refId: created.id,
        key: `group-assigned|${created.id}`,
      }),
    );
    return readRoster(user);
  }

  if (raw.action === 'moveChild') {
    const childId = typeof raw.childId === 'string' ? raw.childId : '';
    const child = seedData.children.find((c) => c.id === childId);
    if (!child) throw new Refused('Not found', 404);
    const groupId = typeof raw.groupId === 'string' && raw.groupId ? raw.groupId : null;
    const target = groupId ? roster.groups.find((g) => g.id === groupId && g.lessonDayId === TODAY_LESSON_DAY) : null;
    if (groupId && !target) throw new Refused('That group no longer exists.');
    if (target && roster.groupMembers.filter((m) => m.groupId === target.id && m.childId !== childId).length >= MAX_GROUP) {
      throw new Refused(`That group already has ${MAX_GROUP} children. Groups are limited to ${MAX_GROUP}.`);
    }
    const alreadyThere = groupOfChild(roster, childId)?.id === groupId;
    const [existing] = await listAll(placement, { lessonDayId: TODAY_LESSON_DAY, childId });
    const data = { lessonDayId: TODAY_LESSON_DAY, childId, groupId: groupId ?? NOT_PLACED };
    if (existing) await placement.update(existing.id, { data });
    else await placement.create({ title: `${childId} placement`, data });

    if (target && !alreadyThere) {
      await quietly(async () => {
        // One reminder at a time: if the instructor hasn't opened the last one, it still covers this.
        if (await hasUnread(target.instructorId, target.id)) return;
        await notify([target.instructorId], {
          kind: 'group_assigned',
          message: `${fullName(child)} was added to your group, ${target.name}. Please review their information.`,
          href: '/instructor',
          actionLabel: 'View children',
          refId: target.id,
          key: `group-child|${target.id}|${childId}|${Date.now()}`,
        });
      });
    }
    return readRoster(user);
  }

  throw new Refused('That request could not be read.', 400);
}
