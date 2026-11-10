// Today's check-ins, pickups, refused pickups and the emergency log, saved in
// Piezas. Server only: this file uses PIEZAS_API_KEY. Every rule about who may
// do what is enforced here, not just hidden on screen.
//
// Children, groups and the preview's morning check-ins still come from the
// made-up list in lib/seed. A saved record always wins over the made-up one, and
// the made-up list is never copied into Piezas.

import { Piezas } from '@piezas/sdk';
import { groupForInstructor, parentOwnsChild } from '@/lib/access';
import {
  localDate,
  seedData,
  TODAY,
  TODAY_LESSON_DAY,
  type Attendance,
  type Data,
  type Emergency,
  type PatrolAck,
  type PickupRefusal,
  type User,
} from '@/lib/seed/data';
import { readGuardians } from './guardians';
import { quietly } from './notifications';
import { onAcknowledged } from './notify-acknowledged';
import { clearRemindersOnAcknowledged, onMissingReported, onSearchClosed } from './notify-patrol';
import { Refused } from './refused';
import { currentRoster } from './roster';

export type TodayRows = {
  attendance: Attendance[];
  refusals: PickupRefusal[];
  emergencies: Emergency[];
  acks: PatrolAck[];
};

export { Refused };

const PAGE_SIZE = 100;
const OUTCOMES = ['Found safe', 'Found, needed first aid', 'Handed over to police', 'False alarm'];
const HOUR_MINUTE = /^([01]\d|2[0-3]):[0-5]\d$/;

async function setUp() {
  const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY! });
  // Safe to repeat: existing record types are reused.
  const { kk_attendance: attendance, kk_pickup_refusal: refusal, kk_emergency: emergency, kk_patrol_ack: ack } = await piezas.defineEntities({
    kk_attendance: {
      fields: {
        childId: { type: 'text', required: true },
        lessonDayId: { type: 'text', required: true },
        checkInAt: { type: 'text' },
        checkedInBy: { type: 'text' },
        jacket: { type: 'text' },
        pants: { type: 'text' },
        helmet: { type: 'text' },
        clothingFixedBy: { type: 'text' },
        clothingFixedAt: { type: 'text' },
        pickupAt: { type: 'text' },
        pickedUpBy: { type: 'text' },
        pickedUpName: { type: 'text' },
        releasedBy: { type: 'text' },
      },
    },
    kk_pickup_refusal: {
      fields: {
        childId: { type: 'text', required: true },
        lessonDayId: { type: 'text', required: true },
        nameGiven: { type: 'text', required: true },
        at: { type: 'text', required: true },
        staffId: { type: 'text', required: true },
      },
    },
    // The emergency log: records are closed when a search ends, never deleted.
    kk_emergency: {
      fields: {
        childId: { type: 'text', required: true },
        lessonDayId: { type: 'text', required: true },
        reportedBy: { type: 'text', required: true },
        reportedAt: { type: 'text', required: true },
        lastSeenPlace: { type: 'text', required: true },
        lastSeenAt: { type: 'text', required: true },
        jacket: { type: 'text' },
        pants: { type: 'text' },
        helmet: { type: 'text' },
        status: { type: 'text', required: true },
        sharedWithPoliceAt: { type: 'text' },
        sharedWithPoliceBy: { type: 'text' },
        noticeMailed: { type: 'boolean' },
        closedAt: { type: 'text' },
        closedBy: { type: 'text' },
        outcome: { type: 'text' },
      },
    },
    kk_patrol_ack: {
      fields: {
        emergencyId: { type: 'text', required: true },
        patrollerId: { type: 'text', required: true },
        at: { type: 'text', required: true },
      },
    },
  });
  return { attendance, refusal, emergency, ack };
}

type Entity = Awaited<ReturnType<typeof setUp>>['attendance'];
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

/** Oldest first, so if two people act at once everyone agrees on which record counts. */
async function listAll(entity: Entity, filter: Record<string, unknown>) {
  const all: Stored[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await entity.list({ limit: PAGE_SIZE, offset, filter });
    all.push(...page.data);
    if (page.data.length < PAGE_SIZE) break;
  }
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

const text = (v: unknown) => (typeof v === 'string' && v ? v : null);
const withoutBlanks = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined));

function toAttendance(r: Stored): Attendance {
  const d = r.data;
  return {
    id: r.id,
    childId: String(d.childId),
    lessonDayId: String(d.lessonDayId),
    checkInAt: text(d.checkInAt),
    checkedInBy: text(d.checkedInBy),
    jacket: text(d.jacket) ?? '',
    pants: text(d.pants) ?? '',
    helmet: text(d.helmet) ?? '',
    clothingFixedBy: text(d.clothingFixedBy),
    clothingFixedAt: text(d.clothingFixedAt),
    pickupAt: text(d.pickupAt),
    pickedUpBy: text(d.pickedUpBy),
    pickedUpName: text(d.pickedUpName),
    releasedBy: text(d.releasedBy),
  };
}

function toEmergency(r: Stored): Emergency {
  const d = r.data;
  return {
    id: r.id,
    childId: String(d.childId),
    reportedBy: String(d.reportedBy),
    lastSeenPlace: String(d.lastSeenPlace),
    lastSeenAt: String(d.lastSeenAt),
    jacket: text(d.jacket) ?? 'Not recorded',
    pants: text(d.pants) ?? 'Not recorded',
    helmet: text(d.helmet) ?? 'Not recorded',
    status: d.status === 'closed' ? 'closed' : 'open',
    sharedWithPoliceAt: text(d.sharedWithPoliceAt),
    noticeMailed: d.noticeMailed === true,
    closedAt: text(d.closedAt),
    outcome: text(d.outcome),
  };
}

const toRefusal = (r: Stored): PickupRefusal => ({
  id: r.id,
  childId: String(r.data.childId),
  lessonDayId: String(r.data.lessonDayId),
  nameGiven: String(r.data.nameGiven),
  at: String(r.data.at),
  staffId: String(r.data.staffId),
});

const toAck = (r: Stored): PatrolAck => ({ emergencyId: String(r.data.emergencyId), patrollerId: String(r.data.patrollerId), at: String(r.data.at) });

const teaches = (roster: Data, user: User, childId: string) => user.role === 'instructor' && groupForInstructor(roster, user).kids.some((c) => c.id === childId);

function seesAttendance(roster: Data, user: User, childId: string) {
  if (user.role === 'desk' || user.role === 'admin') return true;
  if (user.role === 'parent') return parentOwnsChild(roster, user, childId);
  return teaches(roster, user, childId);
}

function seesSearch(roster: Data, user: User, childId: string) {
  if (user.role === 'desk' || user.role === 'admin' || user.role === 'patrol') return true;
  return teaches(roster, user, childId);
}

/** Today's records, cut down to what this person's role is allowed to see. */
export async function readToday(user: User): Promise<TodayRows> {
  const { attendance, refusal, emergency, ack } = await records();
  const day = { lessonDayId: TODAY_LESSON_DAY };
  const staffOnly = user.role === 'desk' || user.role === 'admin';
  const roster = user.role === 'instructor' || user.role === 'parent' ? await currentRoster() : seedData;
  const [attendanceRows, refusalRows, emergencyRows, ackRows] = await Promise.all([
    user.role === 'patrol' ? [] : listAll(attendance, day),
    staffOnly ? listAll(refusal, day) : [],
    user.role === 'parent' ? [] : listAll(emergency, day),
    user.role === 'parent' ? [] : listAll(ack, {}),
  ]);

  const onePerChild = new Map<string, Attendance>();
  for (const row of attendanceRows.map(toAttendance)) {
    if (!onePerChild.has(row.childId) && seesAttendance(roster, user, row.childId)) onePerChild.set(row.childId, row);
  }
  const emergencies = emergencyRows.map(toEmergency).filter((e) => seesSearch(roster, user, e.childId)).reverse();
  const emergencyIds = new Set(emergencies.map((e) => e.id));
  const seenAcks = new Set<string>();
  const acks = ackRows.map(toAck).filter((a) => {
    const key = `${a.emergencyId}|${a.patrollerId}`;
    if (seenAcks.has(key) || !emergencyIds.has(a.emergencyId)) return false;
    seenAcks.add(key);
    return true;
  });
  return { attendance: [...onePerChild.values()], refusals: refusalRows.map(toRefusal).reverse(), emergencies, acks };
}

/** Children patrol may currently see details for. */
export async function openSearchChildIds(): Promise<Set<string>> {
  const { emergency } = await records();
  const rows = await listAll(emergency, { lessonDayId: TODAY_LESSON_DAY });
  return new Set(rows.map(toEmergency).filter((e) => e.status === 'open').map((e) => e.childId));
}

/** The saved record for this child today, or else the preview's made-up one. */
async function currentAttendance(entity: Entity, childId: string) {
  const [record] = await listAll(entity, { childId, lessonDayId: TODAY_LESSON_DAY });
  if (record) return { record, row: toAttendance(record) };
  const seed = seedData.attendance.find((a) => a.childId === childId && a.lessonDayId === TODAY_LESSON_DAY) ?? null;
  return { record: null, row: seed };
}

async function saveAttendance(entity: Entity, childId: string, record: Stored | null, row: Omit<Attendance, 'id'>) {
  const { id: _id, ...fields } = row as Attendance;
  const data = withoutBlanks(fields);
  if (record) await entity.update(record.id, { data });
  else await entity.create({ title: `${childId} on ${TODAY}`, data });
}

/** May this adult take this child home? Uses the saved list when the child has one. */
async function approvedPickupName(childId: string, personId: string): Promise<string | null> {
  const saved = await readGuardians((id) => id === childId);
  if (saved.length > 0) return saved.find((g) => g.personId === personId && g.canPickUp)?.name ?? null;
  const link = seedData.childPersons.find((cp) => cp.childId === childId && cp.personId === personId && cp.canPickUp);
  return link ? (seedData.persons.find((p) => p.id === personId)?.name ?? null) : null;
}

function field(raw: Record<string, unknown>, name: string, max: number, label: string) {
  const value = typeof raw[name] === 'string' ? (raw[name] as string).trim() : '';
  if (!value || value.length > max) throw new Refused(`Please check ${label}.`, 422);
  return value;
}

/** Times are set here, from the system clock, so a phone with the wrong time can't change the record. */
function systemTime() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${localDate(d)}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function requireRole(user: User, allowed: boolean) {
  if (!allowed) throw new Refused('Your account can’t do that.', 403);
}

/** Carries out one action, then returns today's records for this person. */
export async function perform(user: User, raw: Record<string, unknown>): Promise<TodayRows> {
  const { attendance, refusal, emergency, ack } = await records();
  const action = raw.action;
  const roster = await currentRoster();

  if (action === 'acknowledge' || action === 'shareWithPolice' || action === 'markNoticeMailed' || action === 'closeSearch') {
    requireRole(user, user.role === 'patrol');
    const emergencyId = field(raw, 'emergencyId', 64, 'the search');
    const all = await listAll(emergency, { lessonDayId: TODAY_LESSON_DAY });
    const record = all.find((r) => r.id === emergencyId);
    if (!record) throw new Refused('Not found', 404);
    const em = toEmergency(record);

    if (action === 'markNoticeMailed') {
      if (!em.sharedWithPoliceAt) throw new Refused('No notice is needed: details weren’t shared with police.');
      await emergency.update(record.id, { data: { ...record.data, noticeMailed: true } });
      return readToday(user);
    }
    if (em.status !== 'open') throw new Refused('This search has already been closed.');
    const at = systemTime();

    if (action === 'acknowledge') {
      const existing = await listAll(ack, { emergencyId, patrollerId: user.id });
      if (existing.length === 0) {
        await ack.create({ title: `${user.name} on ${em.childId}`, data: { emergencyId, patrollerId: user.id, at } });
        await quietly(() => clearRemindersOnAcknowledged(emergencyId));
        await quietly(() => onAcknowledged({ emergencyId, childId: em.childId, patroller: user }));
      }
    } else if (action === 'shareWithPolice') {
      if (!em.sharedWithPoliceAt) await emergency.update(record.id, { data: { ...record.data, sharedWithPoliceAt: at, sharedWithPoliceBy: user.id } });
    } else {
      const outcome = field(raw, 'outcome', 60, 'the outcome');
      if (!OUTCOMES.includes(outcome)) throw new Refused('Please choose an outcome from the list.', 422);
      // Two people reporting at the same moment can open two entries; end them together.
      for (const open of all.filter((r) => toEmergency(r).status === 'open' && r.data.childId === em.childId)) {
        await emergency.update(open.id, { data: { ...open.data, status: 'closed', closedAt: at, closedBy: user.id, outcome } });
        await quietly(() => onSearchClosed(open.id));
      }
    }
    return readToday(user);
  }

  const childId = typeof raw.childId === 'string' ? raw.childId : '';
  if (!seedData.children.some((c) => c.id === childId)) throw new Refused('Not found', 404);
  const openFor = async () => (await listAll(emergency, { childId, lessonDayId: TODAY_LESSON_DAY })).filter((r) => toEmergency(r).status === 'open');
  const at = systemTime();

  if (action === 'checkIn' || action === 'fixClothing') {
    requireRole(user, action === 'checkIn' ? user.role === 'desk' : teaches(roster, user, childId));
    const clothing = {
      jacket: field(raw, 'jacket', 40, 'the jacket colour'),
      pants: field(raw, 'pants', 40, 'the pants colour'),
      helmet: field(raw, 'helmet', 40, 'the helmet colour'),
    };
    const { record, row } = await currentAttendance(attendance, childId);

    if (action === 'checkIn') {
      if (!row?.checkInAt) {
        await saveAttendance(attendance, childId, record, {
          childId,
          lessonDayId: TODAY_LESSON_DAY,
          checkInAt: at,
          checkedInBy: user.id,
          ...clothing,
          pickupAt: null,
          pickedUpBy: null,
          releasedBy: null,
        });
      }
      return readToday(user);
    }

    if (!row?.checkInAt || row.pickupAt) throw new Refused('Clothing can only be corrected while the child is checked in.');
    await saveAttendance(attendance, childId, record, { ...row, ...clothing, clothingFixedBy: user.id, clothingFixedAt: at });
    // A correction during a search has to reach patrol too.
    for (const open of await openFor()) await emergency.update(open.id, { data: { ...open.data, ...clothing } });
    return readToday(user);
  }

  if (action === 'release') {
    requireRole(user, user.role === 'desk');
    const { record, row } = await currentAttendance(attendance, childId);
    if (!row?.checkInAt) throw new Refused('This child hasn’t been checked in.');
    if (row.pickupAt) throw new Refused('This child has already gone home.');
    if ((await openFor()).length > 0) throw new Refused('Ski patrol is searching for this child. Do not release them.');
    const personId = field(raw, 'personId', 64, 'the adult');
    const name = await approvedPickupName(childId, personId);
    if (!name) throw new Refused('This adult is no longer on the pickup list. Do not release the child. Call a parent.');
    await saveAttendance(attendance, childId, record, { ...row, pickupAt: at, pickedUpBy: personId, pickedUpName: name, releasedBy: user.id });
    return readToday(user);
  }

  if (action === 'refusePickup') {
    requireRole(user, user.role === 'desk');
    const nameGiven = field(raw, 'nameGiven', 120, 'the name');
    await refusal.create({ title: `${nameGiven} refused for ${childId}`, data: { childId, lessonDayId: TODAY_LESSON_DAY, nameGiven, at, staffId: user.id } });
    return readToday(user);
  }

  if (action === 'reportMissing') {
    requireRole(user, user.role === 'desk' || user.role === 'admin' || teaches(roster, user, childId));
    const lastSeenPlace = field(raw, 'lastSeenPlace', 200, 'where they were last seen');
    const lastSeenTime = typeof raw.lastSeenTime === 'string' ? raw.lastSeenTime : '';
    if (!HOUR_MINUTE.test(lastSeenTime)) throw new Refused('Please check the time they were last seen.', 422);
    // Already being searched for: don't start a second search.
    if ((await openFor()).length === 0) {
      const { row } = await currentAttendance(attendance, childId);
      const created = await emergency.create({
        title: `Missing: ${childId}`,
        data: withoutBlanks({
          childId,
          lessonDayId: TODAY_LESSON_DAY,
          reportedBy: user.id,
          reportedAt: at,
          lastSeenPlace,
          lastSeenAt: `${TODAY}T${lastSeenTime}:00`,
          jacket: row?.jacket || 'Not recorded',
          pants: row?.pants || 'Not recorded',
          helmet: row?.helmet || 'Not recorded',
          status: 'open',
          noticeMailed: false,
        }),
      });
      await quietly(() => onMissingReported({ emergencyId: created.id, childId, lastSeenPlace }));
    }
    return readToday(user);
  }

  throw new Refused('That request could not be read.', 400);
}

/** Open searches nobody on patrol has acknowledged yet. */
export async function searchesWithNoAcknowledgement() {
  const { emergency, ack } = await records();
  const [rows, acks] = await Promise.all([listAll(emergency, { lessonDayId: TODAY_LESSON_DAY }), listAll(ack, {})]);
  const acknowledged = new Set(acks.map((a) => String(a.data.emergencyId)));
  return rows.filter((r) => toEmergency(r).status === 'open' && !acknowledged.has(r.id)).map((r) => ({ id: r.id, childId: String(r.data.childId), reportedAt: r.createdAt }));
}
