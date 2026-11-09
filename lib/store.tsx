'use client';

// The app's working state. Saved in Peak Pals: adults linked to a child (through
// /api/guardians), and check-ins, pickups and the emergency log (through
// /api/today). Everything else is still preview-only: it lives in this browser
// tab's memory and resets on reload, until each piece is connected the same way.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  seedData,
  TODAY,
  TODAY_LESSON_DAY,
  type Attendance,
  type ChildPerson,
  type ConsentForm,
  type Data,
  type Emergency,
  type MedicalAlert,
  type PatrolAck,
  type Person,
  type PickupRefusal,
  type Role,
  type User,
} from './seed/data';

// Demo clock: starts at 1:35 p.m. on the first Saturday and runs in real time,
// so the police-call countdown has something sensible to count.
const CLOCK_START = new Date(`${TODAY}T13:35:00`).getTime();

let idN = 1000;
const newId = (prefix: string) => `${prefix}-${++idN}`;

type Store = {
  data: Data;
  me: User | null;
  now: Date;
  signIn: (userId: string) => void;
  signOut: () => void;
  // parent
  guardianLink: 'checking' | 'connected' | 'offline'; // is the app reaching Peak Pals for adults?
  sessionChecked: boolean; // false until we've looked up who is signed in
  liveLink: 'checking' | 'connected' | 'offline'; // is the app reaching Peak Pals for today's records?
  savePerson: (childId: string, person: Person, link: Omit<ChildPerson, 'id' | 'childId' | 'personId'>, linkId?: string) => Promise<void>;
  removeLink: (linkId: string) => Promise<void>;
  saveMedical: (alert: Omit<MedicalAlert, 'id'>, id?: string) => void;
  removeMedical: (id: string) => void;
  setNoMedical: (childId: string, value: boolean) => void;
  signConsent: (form: ConsentForm) => void;
  // instructor
  logAccess: (what: string, childId: string) => void;
  fixClothing: (childId: string, clothing: { jacket: string; pants: string; helmet: string }) => Promise<void>;
  // desk
  checkIn: (childId: string, clothing: { jacket: string; pants: string; helmet: string }) => Promise<void>;
  release: (childId: string, personId: string) => Promise<void>;
  refusePickup: (childId: string, nameGiven: string) => Promise<void>;
  // missing child
  reportMissing: (childId: string, lastSeenPlace: string, lastSeenTime: string) => Promise<void>;
  acknowledge: (emergencyId: string) => Promise<void>;
  shareWithPolice: (emergencyId: string) => Promise<void>;
  markNoticeMailed: (emergencyId: string) => Promise<void>;
  closeSearch: (emergencyId: string, outcome: string) => Promise<void>;
  // admin
  updateChild: (childId: string, patch: Partial<Data['children'][number]>) => void;
  addGroup: (name: string, level: number, instructorId: string) => void;
  moveChild: (childId: string, groupId: string | null) => void;
  importRows: (rows: ImportRow[]) => { added: number; updated: number };
};

export type ImportRow = { orderNumber: string; firstName: string; lastName: string; birthDate: string; level: number; programDay: 'Saturday' | 'Sunday' };

/**
 * Keeps a child's emergency contacts numbered 1, 2, 3... with no gaps.
 * If `movedId` takes a position someone already holds, that person and
 * everyone after them shift down one; nobody loses their place on the list.
 */
function renumberContacts(rows: ChildPerson[], childId: string, movedId?: string, position?: number | null): ChildPerson[] {
  const ordered = rows
    .filter((cp) => cp.childId === childId && cp.contactOrder !== null && cp.id !== movedId)
    .sort((a, b) => (a.contactOrder ?? 0) - (b.contactOrder ?? 0))
    .map((cp) => cp.id);
  if (movedId && position) ordered.splice(position - 1, 0, movedId);
  return rows.map((cp) => {
    if (cp.childId !== childId) return cp;
    const i = ordered.indexOf(cp.id);
    return { ...cp, contactOrder: i >= 0 ? i + 1 : null };
  });
}

// What the server sends back for each saved adult (see lib/server/guardians.ts).
type GuardianRow = {
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

/** Replaces the listed children's adults with what Peak Pals has saved. */
function applyGuardians(d: Data, rows: GuardianRow[], childIds: Set<string>): Data {
  const incoming = new Map(rows.map((r) => [r.personId, { id: r.personId, name: r.name, phone: r.phone, email: r.email }]));
  return {
    ...d,
    persons: [...d.persons.filter((p) => !incoming.has(p.id)), ...incoming.values()],
    childPersons: [
      ...d.childPersons.filter((cp) => !childIds.has(cp.childId)),
      ...rows.map((r) => ({ id: r.linkId, childId: r.childId, personId: r.personId, relationship: r.relationship, contactOrder: r.contactOrder, canPickUp: r.canPickUp })),
    ],
  };
}

// What the server sends back for today (see lib/server/today.ts).
type TodayRows = { attendance: Attendance[]; refusals: PickupRefusal[]; emergencies: Emergency[]; acks: PatrolAck[] };

/** Puts today's saved records in place. A saved check-in replaces the made-up one. */
function applyToday(d: Data, t: TodayRows): Data {
  const saved = new Set(t.attendance.map((a) => a.childId));
  return {
    ...d,
    attendance: [...d.attendance.filter((a) => !(a.lessonDayId === TODAY_LESSON_DAY && saved.has(a.childId))), ...t.attendance],
    refusals: t.refusals,
    emergencies: t.emergencies,
    acks: t.acks,
  };
}

const PIEZAS_RECORD_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One child's adults, in the shape the server saves. */
function guardianRows(d: Data, childId: string) {
  return d.childPersons
    .filter((cp) => cp.childId === childId)
    .map((cp) => {
      const p = d.persons.find((x) => x.id === cp.personId);
      return { linkId: cp.id, name: p?.name ?? '', phone: p?.phone ?? '', email: p?.email ?? '', relationship: cp.relationship, contactOrder: cp.contactOrder, canPickUp: cp.canPickUp };
    });
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(seedData);
  const [meId, setMeId] = useState<string | null>(null);
  const [started] = useState(() => Date.now());
  const [now, setNow] = useState(() => new Date(CLOCK_START));
  const [guardianLink, setGuardianLink] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [liveLink, setLiveLink] = useState<'checking' | 'connected' | 'offline'>('checking');
  // Counts saves, so a background refresh that started before a save can't overwrite it.
  const saves = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date(CLOCK_START + (Date.now() - started))), 1000);
    return () => clearInterval(t);
  }, [started]);

  // Remember who is signed in across page changes within this tab.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('kk-preview-user');
      if (saved) setMeId(saved);
    } catch {
      /* storage unavailable: stay signed out */
    }
    setSessionChecked(true);
  }, []);

  const me = data.users.find((u) => u.id === meId) ?? null;
  // Local wall-clock time (no time zone suffix), matching how the seed times are written.
  const stamp = useCallback(() => {
    const d = new Date(CLOCK_START + (Date.now() - started));
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }, [started]);
  const update = useCallback((fn: (d: Data) => Data) => setData((d) => fn(d)), []);
  const openSearches = data.emergencies.filter((e) => e.status === 'open').map((e) => e.id).join();

  // Adults come from Peak Pals: loaded on sign-in, then re-checked every 10
  // seconds so a change made on another device shows up here.
  useEffect(() => {
    if (!meId) return;
    let stopped = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/guardians?as=${encodeURIComponent(meId)}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const { guardians } = (await res.json()) as { guardians: GuardianRow[] };
        if (stopped) return;
        setData((d) => applyGuardians(d, guardians, new Set(guardians.map((g) => g.childId))));
        setGuardianLink('connected');
      } catch {
        if (!stopped) setGuardianLink('offline');
      }
    };
    void load();
    const t = setInterval(load, 10_000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
    // A search opening or closing changes which adults patrol may see, so re-check at once.
  }, [meId, openSearches]);

  // Today's records come from Peak Pals: staff re-check every 5 seconds so a
  // missing-child alert reaches patrol quickly; parents less often.
  const staff = data.users.find((u) => u.id === meId)?.role !== 'parent';
  useEffect(() => {
    if (!meId) return;
    let stopped = false;
    const load = async () => {
      const startedAt = saves.current;
      try {
        const res = await fetch(`/api/today?as=${encodeURIComponent(meId)}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const { today } = (await res.json()) as { today: TodayRows };
        if (stopped || saves.current !== startedAt) return;
        setData((d) => applyToday(d, today));
        setLiveLink('connected');
      } catch {
        if (!stopped) setLiveLink('offline');
      }
    };
    void load();
    const t = setInterval(load, staff ? 5_000 : 30_000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [meId, staff]);

  /** Sends one action to Peak Pals. The screen only changes once it's saved. */
  const sendToday = useCallback(async (asUserId: string, action: Record<string, unknown>) => {
    saves.current += 1;
    try {
      let res: Response;
      try {
        res = await fetch('/api/today', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ as: asUserId, ...action }) });
      } catch {
        setLiveLink('offline');
        throw new Error('Couldn’t reach Peak Pals, so that was not saved.');
      }
      const body = (await res.json().catch(() => ({}))) as { today?: TodayRows; error?: string };
      if (!res.ok || !body.today) throw new Error(body.error ?? 'That didn’t save. Please try again.');
      const saved = body.today;
      setData((d) => applyToday(d, saved));
      setLiveLink('connected');
    } finally {
      saves.current += 1;
    }
  }, []);

  /** Sends only the adults that changed, so this save can't undo another parent's. */
  const pushGuardians = useCallback(async (before: Data, next: Data, childId: string, asUserId: string, removedLinkIds: string[] = []) => {
    const previous = new Map(guardianRows(before, childId).map((r) => [r.linkId, JSON.stringify(r)]));
    // Adults still only on the made-up list have to go up too, or they'd vanish.
    const guardians = guardianRows(next, childId).filter((r) => !PIEZAS_RECORD_ID.test(r.linkId) || previous.get(r.linkId) !== JSON.stringify(r));
    const res = await fetch('/api/guardians', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ as: asUserId, childId, guardians, removedLinkIds }),
    });
    if (res.status === 404) throw new Error('Saving is only switched on for local testing until real sign-in is ready.');
    const body = (await res.json().catch(() => ({}))) as { guardians?: GuardianRow[]; error?: string };
    if (!res.ok || !body.guardians) throw new Error(body.error ?? 'That didn’t save. Please try again.');
    const saved = body.guardians;
    setData((d) => applyGuardians(d, saved, new Set([childId])));
    setGuardianLink('connected');
  }, []);

  const store = useMemo<Store>(() => {
    const userId = me?.id ?? '';
    const role = (me?.role ?? 'parent') as Role;
    const record = (d: Data, what: string, childId: string): Data => ({
      ...d,
      accessRecords: [{ id: newId('ar'), userId, role, what, childId, at: stamp() }, ...d.accessRecords],
    });

    return {
      data,
      me,
      now,
      signIn: (id) => {
        setMeId(id);
        try {
          sessionStorage.setItem('kk-preview-user', id);
        } catch {
          /* ignore */
        }
      },
      signOut: () => {
        setMeId(null);
        try {
          sessionStorage.removeItem('kk-preview-user');
        } catch {
          /* ignore */
        }
      },
      guardianLink,
      sessionChecked,
      liveLink,
      savePerson: async (childId, person, link, linkId) => {
        const persons = data.persons.some((p) => p.id === person.id)
          ? data.persons.map((p) => (p.id === person.id ? person : p))
          : [...data.persons, person];
        const rowId = linkId ?? newId('cp');
        const row: ChildPerson = { id: rowId, childId, personId: person.id, ...link };
        const links = linkId ? data.childPersons.map((cp) => (cp.id === linkId ? row : cp)) : [...data.childPersons, row];
        await pushGuardians(data, { ...data, persons, childPersons: renumberContacts(links, childId, rowId, link.contactOrder) }, childId, userId);
      },
      removeLink: async (linkId) => {
        const childId = data.childPersons.find((cp) => cp.id === linkId)?.childId;
        if (!childId) return;
        const rest = data.childPersons.filter((cp) => cp.id !== linkId);
        await pushGuardians(data, { ...data, childPersons: renumberContacts(rest, childId) }, childId, userId, [linkId]);
      },
      saveMedical: (alert, id) =>
        update((d) => ({
          ...d,
          children: d.children.map((c) => (c.id === alert.childId ? { ...c, noMedicalConditions: false } : c)),
          medical: id ? d.medical.map((m) => (m.id === id ? { ...alert, id } : m)) : [...d.medical, { ...alert, id: newId('m') }],
        })),
      removeMedical: (id) => update((d) => ({ ...d, medical: d.medical.filter((m) => m.id !== id) })),
      setNoMedical: (childId, value) =>
        update((d) => ({ ...d, children: d.children.map((c) => (c.id === childId ? { ...c, noMedicalConditions: value } : c)) })),
      signConsent: (form) => update((d) => ({ ...d, consents: [...d.consents.filter((c) => c.childId !== form.childId), form] })),
      logAccess: (what, childId) => update((d) => record(d, what, childId)),
      fixClothing: (childId, clothing) => sendToday(userId, { action: 'fixClothing', childId, ...clothing, at: stamp() }),
      checkIn: (childId, clothing) => sendToday(userId, { action: 'checkIn', childId, ...clothing, at: stamp() }),
      release: (childId, personId) => sendToday(userId, { action: 'release', childId, personId, at: stamp() }),
      refusePickup: (childId, nameGiven) => sendToday(userId, { action: 'refusePickup', childId, nameGiven, at: stamp() }),
      reportMissing: (childId, lastSeenPlace, lastSeenTime) => sendToday(userId, { action: 'reportMissing', childId, lastSeenPlace, lastSeenTime, at: stamp() }),
      acknowledge: (emergencyId) => sendToday(userId, { action: 'acknowledge', emergencyId, at: stamp() }),
      shareWithPolice: async (emergencyId) => {
        await sendToday(userId, { action: 'shareWithPolice', emergencyId, at: stamp() });
        const childId = data.emergencies.find((e) => e.id === emergencyId)?.childId;
        if (childId) update((d) => record(d, 'Shared details with police', childId));
      },
      markNoticeMailed: (emergencyId) => sendToday(userId, { action: 'markNoticeMailed', emergencyId, at: stamp() }),
      closeSearch: (emergencyId, outcome) => sendToday(userId, { action: 'closeSearch', emergencyId, outcome, at: stamp() }),
      updateChild: (childId, patch) =>
        update((d) => ({ ...d, children: d.children.map((c) => (c.id === childId ? { ...c, ...patch } : c)) })),
      addGroup: (name, level, instructorId) =>
        update((d) => ({ ...d, groups: [...d.groups, { id: newId('g'), lessonDayId: TODAY_LESSON_DAY, name, level, instructorId }] })),
      moveChild: (childId, groupId) =>
        update((d) => {
          const todayGroupIds = new Set(d.groups.filter((g) => g.lessonDayId === TODAY_LESSON_DAY).map((g) => g.id));
          const rest = d.groupMembers.filter((m) => !(m.childId === childId && todayGroupIds.has(m.groupId)));
          return { ...d, groupMembers: groupId ? [...rest, { groupId, childId }] : rest };
        }),
      importRows: (rows) => {
        // Matched on the store's order number: existing children are updated, never duplicated.
        const known = new Set(data.children.map((c) => c.orderNumber));
        const updated = rows.filter((r) => known.has(r.orderNumber)).length;
        update((d) => {
          let kids = [...d.children];
          for (const r of rows) {
            const i = kids.findIndex((c) => c.orderNumber === r.orderNumber);
            if (i >= 0) kids[i] = { ...kids[i], ...r };
            else kids = [...kids, { id: newId('c'), ...r, bib: 500 + kids.length, noMedicalConditions: false }];
          }
          return { ...d, children: kids };
        });
        return { added: rows.length - updated, updated };
      },
    };
  }, [data, me, now, stamp, update, guardianLink, sessionChecked, liveLink, pushGuardians, sendToday]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
