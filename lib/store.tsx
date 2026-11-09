'use client';

// The app's working state. Adults linked to a child (guardians, emergency
// contacts, pickup adults) are saved in Peak Pals through /api/guardians.
// Everything else is still preview-only: it lives in this browser tab's memory
// and resets on reload, until each piece is connected the same way.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { groupForInstructor } from './access';
import {
  seedData,
  TODAY,
  TODAY_LESSON_DAY,
  type Attendance,
  type ChildPerson,
  type ConsentForm,
  type Data,
  type MedicalAlert,
  type Person,
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
  savePerson: (childId: string, person: Person, link: Omit<ChildPerson, 'id' | 'childId' | 'personId'>, linkId?: string) => Promise<void>;
  removeLink: (linkId: string) => Promise<void>;
  saveMedical: (alert: Omit<MedicalAlert, 'id'>, id?: string) => void;
  removeMedical: (id: string) => void;
  setNoMedical: (childId: string, value: boolean) => void;
  signConsent: (form: ConsentForm) => void;
  // instructor
  logAccess: (what: string, childId: string) => void;
  fixClothing: (childId: string, clothing: { jacket: string; pants: string; helmet: string }) => void;
  // desk
  checkIn: (childId: string, clothing: { jacket: string; pants: string; helmet: string }) => void;
  release: (childId: string, personId: string) => void;
  refusePickup: (childId: string, nameGiven: string) => void;
  // missing child
  reportMissing: (childId: string, lastSeenPlace: string, lastSeenTime: string) => string;
  acknowledge: (emergencyId: string) => void;
  shareWithPolice: (emergencyId: string) => void;
  markNoticeMailed: (emergencyId: string) => void;
  closeSearch: (emergencyId: string, outcome: string) => void;
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

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(seedData);
  const [meId, setMeId] = useState<string | null>(null);
  const [started] = useState(() => Date.now());
  const [now, setNow] = useState(() => new Date(CLOCK_START));
  const [guardianLink, setGuardianLink] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [sessionChecked, setSessionChecked] = useState(false);

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
  }, [meId]);

  /** Sends a child's full list to Peak Pals. The screen only changes once it's saved. */
  const pushGuardians = useCallback(async (next: Data, childId: string, asUserId: string, removedLinkIds: string[] = []) => {
    const guardians = next.childPersons
      .filter((cp) => cp.childId === childId)
      .map((cp) => {
        const p = next.persons.find((x) => x.id === cp.personId);
        return { linkId: cp.id, name: p?.name ?? '', phone: p?.phone ?? '', email: p?.email ?? '', relationship: cp.relationship, contactOrder: cp.contactOrder, canPickUp: cp.canPickUp };
      });
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
      savePerson: async (childId, person, link, linkId) => {
        const persons = data.persons.some((p) => p.id === person.id)
          ? data.persons.map((p) => (p.id === person.id ? person : p))
          : [...data.persons, person];
        const rowId = linkId ?? newId('cp');
        const row: ChildPerson = { id: rowId, childId, personId: person.id, ...link };
        const links = linkId ? data.childPersons.map((cp) => (cp.id === linkId ? row : cp)) : [...data.childPersons, row];
        await pushGuardians({ ...data, persons, childPersons: renumberContacts(links, childId, rowId, link.contactOrder) }, childId, userId);
      },
      removeLink: async (linkId) => {
        const childId = data.childPersons.find((cp) => cp.id === linkId)?.childId;
        if (!childId) return;
        const rest = data.childPersons.filter((cp) => cp.id !== linkId);
        await pushGuardians({ ...data, childPersons: renumberContacts(rest, childId) }, childId, userId, [linkId]);
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
      fixClothing: (childId, clothing) =>
        update((d) => {
          // Instructors may only correct children in their own group today.
          if (role === 'instructor' && me && !groupForInstructor(d, me).kids.some((c) => c.id === childId)) return d;
          return {
            ...d,
            attendance: d.attendance.map((a) =>
              a.childId === childId && a.lessonDayId === TODAY_LESSON_DAY ? { ...a, ...clothing, clothingFixedBy: userId, clothingFixedAt: stamp() } : a,
            ),
            // A correction during a search has to reach patrol too.
            emergencies: d.emergencies.map((e) => (e.childId === childId && e.status === 'open' ? { ...e, ...clothing } : e)),
          };
        }),
      checkIn: (childId, { jacket, pants, helmet }) =>
        update((d) => {
          const existing = d.attendance.find((a) => a.childId === childId && a.lessonDayId === TODAY_LESSON_DAY);
          const row: Attendance = {
            id: existing?.id ?? newId('a'),
            childId,
            lessonDayId: TODAY_LESSON_DAY,
            checkInAt: stamp(),
            checkedInBy: userId,
            jacket,
            pants,
            helmet,
            pickupAt: null,
            pickedUpBy: null,
            releasedBy: null,
          };
          return { ...d, attendance: [...d.attendance.filter((a) => a.id !== row.id), row] };
        }),
      release: (childId, personId) =>
        update((d) => ({
          ...d,
          attendance: d.attendance.map((a) =>
            a.childId === childId && a.lessonDayId === TODAY_LESSON_DAY ? { ...a, pickupAt: stamp(), pickedUpBy: personId, releasedBy: userId } : a,
          ),
        })),
      refusePickup: (childId, nameGiven) =>
        update((d) => ({
          ...d,
          refusals: [{ id: newId('rf'), childId, lessonDayId: TODAY_LESSON_DAY, nameGiven, at: stamp(), staffId: userId }, ...d.refusals],
        })),
      reportMissing: (childId, lastSeenPlace, lastSeenTime) => {
        const id = newId('em');
        update((d) => {
          const att = d.attendance.find((a) => a.childId === childId && a.lessonDayId === TODAY_LESSON_DAY);
          return {
            ...d,
            emergencies: [
              {
                id,
                childId,
                reportedBy: userId,
                lastSeenPlace,
                lastSeenAt: `${TODAY}T${lastSeenTime}:00`,
                jacket: att?.jacket ?? 'Not recorded',
                pants: att?.pants ?? 'Not recorded',
                helmet: att?.helmet ?? 'Not recorded',
                status: 'open',
                sharedWithPoliceAt: null,
                noticeMailed: false,
                closedAt: null,
                outcome: null,
              },
              ...d.emergencies,
            ],
          };
        });
        return id;
      },
      acknowledge: (emergencyId) =>
        update((d) =>
          d.acks.some((a) => a.emergencyId === emergencyId && a.patrollerId === userId)
            ? d
            : { ...d, acks: [...d.acks, { emergencyId, patrollerId: userId, at: stamp() }] },
        ),
      shareWithPolice: (emergencyId) =>
        update((d) => {
          const em = d.emergencies.find((e) => e.id === emergencyId);
          const next = { ...d, emergencies: d.emergencies.map((e) => (e.id === emergencyId ? { ...e, sharedWithPoliceAt: stamp() } : e)) };
          return em ? record(next, 'Shared details with police', em.childId) : next;
        }),
      markNoticeMailed: (emergencyId) =>
        update((d) => ({ ...d, emergencies: d.emergencies.map((e) => (e.id === emergencyId ? { ...e, noticeMailed: true } : e)) })),
      closeSearch: (emergencyId, outcome) =>
        update((d) => ({
          ...d,
          emergencies: d.emergencies.map((e) => (e.id === emergencyId ? { ...e, status: 'closed', closedAt: stamp(), outcome } : e)),
        })),
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
  }, [data, me, now, stamp, update, guardianLink, sessionChecked, pushGuardians]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
