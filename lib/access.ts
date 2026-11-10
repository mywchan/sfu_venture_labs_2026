// Who may see what, taken from the team's permissions table (permissions_table.xlsx).
// In the preview these run in the browser. In the real build the same checks
// run on the server before any record leaves Piezas.

import { TODAY, TODAY_LESSON_DAY, type Child, type Data, type Emergency, type User } from './seed/data';

/** Today in words, for example "Sunday, November 8". */
export const todayLabel = () => new Date(`${TODAY}T12:00:00`).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });

export const fullName = (c: Pick<Child, 'firstName' | 'lastName'>) => `${c.firstName} ${c.lastName}`;

export function ageOn(birthDate: string, on: string) {
  const b = new Date(birthDate);
  const d = new Date(on);
  let age = d.getFullYear() - b.getFullYear();
  if (d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())) age--;
  return age;
}

/** Parent: "view own / edit own" — only children linked to their account. */
export function childrenForParent(d: Data, user: User) {
  const ids = new Set(d.parentAccounts.filter((pa) => pa.userId === user.id).map((pa) => pa.childId));
  return d.children.filter((c) => ids.has(c.id));
}

export function parentOwnsChild(d: Data, user: User, childId: string) {
  return d.parentAccounts.some((pa) => pa.userId === user.id && pa.childId === childId);
}

/** Instructor: "view own group" — today's group only. */
export function groupForInstructor(d: Data, user: User) {
  const group = d.groups.find((g) => g.instructorId === user.id && g.lessonDayId === TODAY_LESSON_DAY) ?? null;
  const ids = new Set(d.groupMembers.filter((m) => m.groupId === group?.id).map((m) => m.childId));
  return { group, kids: d.children.filter((c) => ids.has(c.id)) };
}

/** Patrol: "view if open emergency" — a child's details only while a search for them is open. */
export function openSearchFor(d: Data, childId: string): Emergency | null {
  return d.emergencies.find((e) => e.childId === childId && e.status === 'open') ?? null;
}

export function groupOfChild(d: Data, childId: string) {
  const m = d.groupMembers.find((gm) => gm.childId === childId && d.groups.some((g) => g.id === gm.groupId && g.lessonDayId === TODAY_LESSON_DAY));
  return d.groups.find((g) => g.id === m?.groupId) ?? null;
}

export function todaysAttendance(d: Data, childId: string) {
  return d.attendance.find((a) => a.childId === childId && a.lessonDayId === TODAY_LESSON_DAY) ?? null;
}

export function adultsFor(d: Data, childId: string) {
  return d.childPersons
    .filter((cp) => cp.childId === childId)
    .map((cp) => ({ link: cp, person: d.persons.find((p) => p.id === cp.personId)! }))
    .filter((x) => x.person)
    .sort((a, b) => (a.link.contactOrder ?? Infinity) - (b.link.contactOrder ?? Infinity));
}

/** 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11 -> "11th" ... */
export function ordinal(n: number) {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

export function userName(d: Data, userId: string | null) {
  return d.users.find((u) => u.id === userId)?.name ?? '—';
}

/** Administrator: what is missing for each child. */
export function missingInfo(d: Data, childId: string) {
  const child = d.children.find((c) => c.id === childId);
  const links = d.childPersons.filter((cp) => cp.childId === childId);
  const out: string[] = [];
  if (!d.consents.some((c) => c.childId === childId)) out.push('No consent form');
  if (!links.some((l) => l.contactOrder === 1)) out.push('No 1st emergency contact');
  if (!links.some((l) => l.contactOrder === 2)) out.push('No 2nd emergency contact');
  if (!links.some((l) => l.canPickUp)) out.push('No pickup adult');
  if (child && !child.noMedicalConditions && !d.medical.some((m) => m.childId === childId)) out.push('No medical answer');
  return out;
}

// Phone numbers: 10 digits (North American), any common punctuation.
export function phoneProblem(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 'Enter a phone number.';
  const ten = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (ten.length !== 10) return `This number has ${ten.length} digits. A phone number needs 10, for example 604-555-0187.`;
  return null;
}

export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(-10);
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

export function timeLabel(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
}

/** A Date as 24-hour "HH:MM", the format a time input uses. */
export function hhmm(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const CHECK_IN_STARTS = 8 * 60 + 30; // 8:30 a.m., in minutes after midnight
const LAST_SEEN_STEP = 5; // minutes between choices in the list

/**
 * The times an instructor may pick for "last seen": now first, then every
 * 5 minutes back to 8:30 a.m. Empty before check-in has started.
 */
export function lastSeenTimeChoices(current: Date) {
  const nowMinutes = current.getHours() * 60 + current.getMinutes();
  if (nowMinutes < CHECK_IN_STARTS) return [];
  const toChoice = (minutes: number, suffix = '') => {
    const d = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
    return { value: hhmm(d), label: d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }) + suffix };
  };
  const choices = [toChoice(nowMinutes, ' (now)')];
  const firstStep = Math.floor((nowMinutes - 1) / LAST_SEEN_STEP) * LAST_SEEN_STEP;
  for (let m = firstStep; m >= CHECK_IN_STARTS; m -= LAST_SEEN_STEP) choices.push(toChoice(m));
  return choices;
}

/**
 * The end of the ski day: 4 p.m. on the live site. The presentation version
 * (run with `npm run dev`) uses 6 p.m. so the demo can run in the late afternoon.
 */
export const DAY_END_HOUR = process.env.NODE_ENV === 'production' ? 16 : 18;
export const DAY_END_LABEL = DAY_END_HOUR === 16 ? '4 p.m.' : '6 p.m.';

/** Police must be called 60 minutes after last seen, or at the end of the day, whichever comes first. */
export function policeDeadline(lastSeenAt: string) {
  const seen = new Date(lastSeenAt).getTime();
  const cutoff = new Date(`${lastSeenAt.slice(0, 10)}T${DAY_END_HOUR}:00:00`).getTime();
  return new Date(Math.min(seen + 60 * 60_000, cutoff));
}
