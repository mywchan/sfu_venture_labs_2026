import 'server-only';

// Medical alerts and consent forms, saved in Piezas. Who may see or change them
// is enforced here: the desk gets nothing, an instructor only their own group,
// patrol only children in an open search, a parent only their own children.

import { fullName, groupForInstructor, groupOfChild, parentOwnsChild } from '@/lib/access';
import { notify, quietly } from './notifications';
import { seedData, TODAY, type ConsentForm, type Data, type MedicalAlert, type Severity, type User } from '@/lib/seed/data';
import { seedConsents, seedMedical } from './medical-seed';
import { recordsClient } from './demo-store';
import { Refused } from './refused';
import { currentRoster } from './roster';
import { openSearchChildIds } from './today';

export type MedicalRows = { medical: MedicalAlert[]; consents: ConsentForm[]; noMedical: Record<string, boolean> };

const SEVERITIES: Severity[] = ['high', 'medium', 'low'];
const required = { type: 'text', required: true } as const;

async function setUp() {
  const { kk_medical_alert: alert, kk_medical_answer: answer, kk_consent: consent } = await recordsClient().defineEntities({
    kk_medical_alert: {
      fields: { childId: required, shortAlert: required, details: { type: 'text' }, medicationLocation: required, severity: required, seedId: { type: 'text' } },
    },
    // One per child. Once it exists, the saved alerts are that child's whole list.
    kk_medical_answer: { fields: { childId: required, noMedicalConditions: { type: 'boolean', required: true } } },
    kk_consent: { fields: { childId: required, signedBy: required, signedDate: required, photoConsent: { type: 'boolean', required: true }, signedByUserId: required } },
  });
  return { alert, answer, consent };
}

type Entity = Awaited<ReturnType<typeof setUp>>['alert'];
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
async function listAll(entity: Entity, filter: Record<string, unknown> = {}) {
  const all: Stored[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await entity.list({ limit: 100, offset, filter });
    all.push(...page.data);
    if (page.data.length < 100) break;
  }
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

const toAlert = (r: Stored): MedicalAlert => ({
  id: r.id,
  childId: String(r.data.childId),
  shortAlert: String(r.data.shortAlert),
  details: typeof r.data.details === 'string' ? r.data.details : '',
  medicationLocation: String(r.data.medicationLocation),
  severity: SEVERITIES.includes(r.data.severity as Severity) ? (r.data.severity as Severity) : 'high',
});

const toConsent = (r: Stored): ConsentForm => ({
  childId: String(r.data.childId),
  signedBy: String(r.data.signedBy),
  signedDate: String(r.data.signedDate),
  photoConsent: r.data.photoConsent === true,
});

function firstPerChild(rows: Stored[]) {
  const found = new Map<string, Stored>();
  for (const r of rows) if (!found.has(String(r.data.childId))) found.set(String(r.data.childId), r);
  return found;
}

async function canSee(user: User): Promise<(childId: string) => boolean> {
  if (user.role === 'admin') return () => true;
  if (user.role === 'parent') {
    const roster = await currentRoster();
    return (id) => parentOwnsChild(roster, user, id);
  }
  if (user.role === 'instructor') {
    const kids = new Set(groupForInstructor(await currentRoster(), user).kids.map((c) => c.id));
    return (id) => kids.has(id);
  }
  if (user.role === 'patrol') {
    const searching = await openSearchChildIds();
    return (id) => searching.has(id);
  }
  return () => false; // the desk never sees medical details
}

/** What this person's role is allowed to see, and nothing else. */
export async function readMedical(user: User): Promise<MedicalRows> {
  const allowed = await canSee(user);
  const { alert, answer, consent } = await records();
  const [alertRows, answerRows, consentRows] = await Promise.all([listAll(alert), listAll(answer), listAll(consent)]);
  const answers = firstPerChild(answerRows);
  const signed = firstPerChild(consentRows);

  const noMedical: Record<string, boolean> = {};
  for (const child of seedData.children) {
    if (!allowed(child.id)) continue;
    const saved = answers.get(child.id);
    noMedical[child.id] = saved ? saved.data.noMedicalConditions === true : child.noMedicalConditions;
  }
  return {
    medical: [
      ...alertRows.filter((r) => answers.has(String(r.data.childId))).map(toAlert),
      ...seedMedical.filter((m) => !answers.has(m.childId)),
    ].filter((m) => allowed(m.childId)),
    consents: [...[...signed.values()].map(toConsent), ...seedConsents.filter((c) => !signed.has(c.childId))].filter((c) => allowed(c.childId)),
    noMedical,
  };
}

/** The first change to a child copies their made-up alerts in, so none are lost. */
async function savedAnswerFor(childId: string) {
  const { alert, answer } = await records();
  const [existing] = await listAll(answer, { childId });
  if (existing) return existing;
  const copied = await listAll(alert, { childId });
  for (const m of seedMedical.filter((s) => s.childId === childId)) {
    if (copied.some((r) => r.data.seedId === m.id)) continue;
    await alert.create({ title: m.shortAlert, data: { childId, shortAlert: m.shortAlert, details: m.details, medicationLocation: m.medicationLocation, severity: m.severity, seedId: m.id } });
  }
  const child = seedData.children.find((c) => c.id === childId);
  return answer.create({ title: `Medical answer for ${childId}`, data: { childId, noMedicalConditions: child?.noMedicalConditions === true } });
}

function text(raw: Record<string, unknown>, name: string, max: number, problem: string, optional = false) {
  const value = typeof raw[name] === 'string' ? (raw[name] as string).trim() : '';
  if (value.length > max || (!optional && !value)) throw new Refused(problem, 422);
  return value;
}

/** Carries out one change, then returns what this person may see. */
export async function changeMedical(user: User, raw: Record<string, unknown>): Promise<MedicalRows> {
  const childId = typeof raw.childId === 'string' ? raw.childId : '';
  if (!seedData.children.some((c) => c.id === childId)) throw new Refused('Not found', 404);
  const roster: Data = await currentRoster();
  const ownChild = user.role === 'parent' && parentOwnsChild(roster, user, childId);
  // Someone else's child looks the same as a child that doesn't exist.
  if (!ownChild && user.role !== 'admin') throw new Refused('Not found', 404);

  const { alert, answer, consent } = await records();

  if (raw.action === 'signConsent') {
    if (!ownChild) throw new Refused('Only a parent can sign this form.', 403);
    const signedBy = text(raw, 'signedBy', 120, 'Type your full name to sign.');
    if (typeof raw.photoConsent !== 'boolean') throw new Refused('Say whether staff may see a photo.', 422);
    const alreadySigned = seedConsents.some((c) => c.childId === childId) || (await listAll(consent, { childId })).length > 0;
    if (!alreadySigned) {
      await consent.create({ title: `Consent for ${childId}`, data: { childId, signedBy, signedDate: TODAY, photoConsent: raw.photoConsent, signedByUserId: user.id } });
    }
    return readMedical(user);
  }

  const saved = await savedAnswerFor(childId);
  const setAnswer = async (noMedicalConditions: boolean) => {
    if (saved.data.noMedicalConditions !== noMedicalConditions) await answer.update(saved.id, { data: { ...saved.data, noMedicalConditions } });
  };
  const alerts = await listAll(alert, { childId });
  const find = (id: unknown) => {
    const row = alerts.find((r) => r.id === id || r.data.seedId === id);
    if (!row) throw new Refused('That alert no longer exists. Please reload the page.', 404);
    return row;
  };

  if (raw.action === 'saveAlert') {
    const severity = raw.severity as Severity;
    if (!SEVERITIES.includes(severity)) throw new Refused('Choose how serious this is.', 422);
    const shortAlert = text(raw, 'shortAlert', 200, 'Write the short alert the instructor should see, in one line.');
    const data = {
      childId,
      shortAlert,
      details: text(raw, 'details', 2000, 'Those details are too long.', true),
      medicationLocation: text(raw, 'medicationLocation', 200, 'Please shorten where the medication is kept.', true) || 'None',
      severity,
    };
    if (raw.id) {
      const row = find(raw.id);
      await alert.update(row.id, { title: shortAlert, data: { ...row.data, ...data } });
      await tellInstructor(user, roster, childId, 'updated medical information for');
    } else {
      await alert.create({ title: shortAlert, data });
      await tellInstructor(user, roster, childId, 'added new medical information for');
    }
    await setAnswer(false);
  } else if (raw.action === 'removeAlert') {
    await alert.delete(find(raw.id).id);
    await tellInstructor(user, roster, childId, 'removed a medical alert for');
  } else if (raw.action === 'setNoMedical') {
    if (typeof raw.value !== 'boolean') throw new Refused('That request could not be read.', 400);
    if (raw.value && alerts.length > 0) throw new Refused('Remove the alerts on file before saying there are none.');
    const changed = saved.data.noMedicalConditions !== raw.value;
    await setAnswer(raw.value);
    if (changed) await tellInstructor(user, roster, childId, 'updated medical information for');
  } else {
    throw new Refused('That request could not be read.', 400);
  }
  return readMedical(user);
}

/** Lets the child's instructor today know a parent changed their medical details. */
async function tellInstructor(user: User, roster: Data, childId: string, what: string) {
  if (user.role !== 'parent') return;
  const group = groupOfChild(roster, childId);
  const child = roster.children.find((c) => c.id === childId);
  if (!group || !child) return;
  await quietly(() =>
    notify([group.instructorId], {
      kind: 'medical_changed',
      message: `${user.name} (parent) ${what} ${fullName(child)}. Please review it before your lesson.`,
      href: '/instructor',
      actionLabel: 'View children',
      refId: childId,
      key: `medical|${childId}|${Date.now()}`,
    }),
  );
}
