// Saving and reading a child's adults (guardians, emergency contacts, pickup adults)
// in Piezas. Server only: this file uses PIEZAS_API_KEY, so it must never be
// imported by a browser component.

import { recordsClient } from './demo-store';
import { phoneProblem, formatPhone } from '@/lib/access';

// The same shape the screens use. `linkId` and `personId` are Piezas record ids
// once saved; anything else (a made-up preview id) means "not saved yet".
export type GuardianRow = {
  linkId: string;
  personId: string;
  childId: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  contactOrder: number | null;
  canPickUp: boolean;
};

type Entity = Awaited<ReturnType<typeof setUp>>['person'];
type Stored = Awaited<ReturnType<Entity['list']>>['data'][number];

export const LAST_ADULT = 'Each child needs at least one adult on file. Add another adult before removing this one.';
const MAX_ADULTS_PER_CHILD = 30;
const PAGE_SIZE = 100;
const PIEZAS_RECORD_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function setUp() {
  const piezas = recordsClient();
  // Safe to repeat: existing record types are reused. "kk_" keeps these apart
  // from anything else stored in the same Piezas account.
  const { kk_person: person, kk_child_person: childPerson } = await piezas.defineEntities({
    kk_person: {
      fields: {
        name: { type: 'text', required: true },
        phone: { type: 'phone', required: true },
        email: { type: 'email' },
      },
    },
    kk_child_person: {
      fields: {
        childId: { type: 'text', required: true },
        personId: { type: 'text', required: true },
        relationship: { type: 'text', required: true },
        contactOrder: { type: 'integer' },
        canPickUp: { type: 'boolean', required: true },
      },
    },
  });
  return { person, childPerson };
}

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

/** Piezas returns at most 100 records per call, so keep asking until a short page. */
async function listAll(entity: Entity, filter?: Record<string, unknown>) {
  const all: Stored[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await entity.list({ limit: PAGE_SIZE, offset, ...(filter ? { filter } : {}) });
    all.push(...page.data);
    if (page.data.length < PAGE_SIZE) return all;
  }
}

function toRow(link: Stored, person: Stored | undefined): GuardianRow | null {
  if (!person) return null;
  return {
    linkId: link.id,
    personId: person.id,
    childId: String(link.data.childId),
    name: String(person.data.name ?? person.title),
    phone: String(person.data.phone ?? ''),
    email: String(person.data.email ?? ''),
    relationship: String(link.data.relationship ?? ''),
    contactOrder: typeof link.data.contactOrder === 'number' ? link.data.contactOrder : null,
    canPickUp: link.data.canPickUp === true,
  };
}

/** Every saved adult, for the children the caller is allowed to see. */
export async function readGuardians(allowedChild: (childId: string) => boolean): Promise<GuardianRow[]> {
  const { person, childPerson } = await records();
  const [links, people] = await Promise.all([listAll(childPerson), listAll(person)]);
  const peopleById = new Map(people.map((p) => [p.id, p]));
  return links
    .filter((l) => allowedChild(String(l.data.childId)))
    .map((l) => toRow(l, peopleById.get(String(l.data.personId))))
    .filter((r): r is GuardianRow => r !== null);
}

const personData = (r: GuardianRow) => ({ name: r.name, phone: r.phone, ...(r.email ? { email: r.email } : {}) });
const linkData = (r: GuardianRow, personId: string) => ({
  childId: r.childId,
  personId,
  relationship: r.relationship,
  canPickUp: r.canPickUp,
  ...(r.contactOrder !== null ? { contactOrder: r.contactOrder } : {}),
});

/**
 * Saves the adults that changed: new ones are created and changed ones updated.
 * Only what changed is sent, so one parent's save can't undo what another parent
 * saved seconds earlier. Only adults named in `removedLinkIds` are deleted.
 * Returns null, saving nothing, if that would leave the child with no adults.
 */
export async function saveGuardians(childId: string, rows: GuardianRow[], removedLinkIds: string[]): Promise<GuardianRow[] | null> {
  const { person, childPerson } = await records();
  const existing = await listAll(childPerson, { childId });
  const existingById = new Map(existing.map((l) => [l.id, l]));
  const removing = new Set(removedLinkIds);
  const adding = rows.filter((r) => !existingById.has(r.linkId) && !PIEZAS_RECORD_ID.test(r.linkId)).length;
  if (existing.filter((l) => !removing.has(l.id)).length + adding === 0) return null;

  for (const row of rows) {
    const link = existingById.get(row.linkId);
    if (link) {
      // The person id comes from what's stored, never from the browser.
      const personId = String(link.data.personId);
      await person.update(personId, { title: row.name, data: personData(row) });
      await childPerson.update(link.id, { title: `${row.name} for ${childId}`, data: linkData(row, personId) });
    } else {
      // A Piezas id that's no longer stored means someone removed this adult
      // while this browser still had the old list. Don't bring them back.
      if (PIEZAS_RECORD_ID.test(row.linkId)) continue;
      const created = await person.create({ title: row.name, data: personData(row) });
      await childPerson.create({ title: `${row.name} for ${childId}`, data: linkData(row, created.id) });
    }
  }

  for (const link of existing) {
    if (!removing.has(link.id)) continue;
    const personId = String(link.data.personId);
    await childPerson.delete(link.id);
    const others = await listAll(childPerson, { personId });
    if (others.length === 0) await person.delete(personId);
  }

  const [links, people] = await Promise.all([listAll(childPerson, { childId }), listAll(person)]);
  const peopleById = new Map(people.map((p) => [p.id, p]));
  return links.map((l) => toRow(l, peopleById.get(String(l.data.personId)))).filter((r): r is GuardianRow => r !== null);
}

/** Checks what the browser sent. Returns cleaned rows, or a message saying what's wrong. */
export function validateGuardians(childId: string, input: unknown): { rows: GuardianRow[] } | { problem: string } {
  if (!Array.isArray(input) || input.length > MAX_ADULTS_PER_CHILD) return { problem: 'The list of adults is not valid.' };
  const rows: GuardianRow[] = [];
  const positions = new Set<number>();
  for (const raw of input) {
    const r = (raw ?? {}) as Record<string, unknown>;
    const name = typeof r.name === 'string' ? r.name.trim() : '';
    const relationship = typeof r.relationship === 'string' ? r.relationship.trim() : '';
    const phone = typeof r.phone === 'string' ? r.phone : '';
    const email = typeof r.email === 'string' ? r.email.trim() : '';
    const order = r.contactOrder ?? null;
    if (!name || name.length > 120) return { problem: 'Enter a name for each adult.' };
    if (!relationship || relationship.length > 60) return { problem: `Say how ${name} is related to the child.` };
    const phoneIssue = phoneProblem(phone);
    if (phoneIssue) return { problem: `${name}: ${phoneIssue}` };
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { problem: `${name}: that email address isn't valid.` };
    if (order !== null && (!Number.isInteger(order) || (order as number) < 1 || positions.has(order as number))) {
      return { problem: 'The emergency contact order is not valid.' };
    }
    if (order !== null) positions.add(order as number);
    if (typeof r.canPickUp !== 'boolean') return { problem: 'Say whether each adult can pick up.' };
    rows.push({
      linkId: typeof r.linkId === 'string' ? r.linkId : '',
      personId: '',
      childId,
      name,
      phone: formatPhone(phone),
      email,
      relationship,
      contactOrder: order as number | null,
      canPickUp: r.canPickUp,
    });
  }
  return { rows };
}
