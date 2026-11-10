'use client';

// Instructor's offline copy of today's group, for the hill where there is no wifi.
//
// What goes on the phone is deliberately limited: names, bibs, today's clothing
// and the one-line alerts with where medication is kept. Full medical details,
// contacts and anything about other groups are excluded. Expiry is checked
// while this screen runs; closing the app does not erase browser storage.
//
// Preview: kept in this browser's storage. Real build: the same snapshot,
// plus an offline-capable page so the screen opens with no connection at all.

import { useCallback, useEffect, useState } from 'react';
import { ageOn, fullName, groupForInstructor, todaysAttendance } from '@/lib/access';
import { TODAY, TODAY_LESSON_DAY, type Child, type Group, type Severity, type User } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

export type OfflineSnapshot = {
  instructorId: string;
  groupId: string;
  lessonDayId: string;
  savedAt: string;
  expiresAt: string;
  groupName: string;
  level: number;
  kids: {
    name: string;
    bib: number;
    age: number;
    clothing: string | null;
    alerts: { shortAlert: string; severity: Severity; medicationLocation: string }[];
  }[];
};

const EXPIRES = `${TODAY}T16:00:00`;
const keyFor = (userId: string) => `kk-offline-${userId}`;

const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 1000;
const keys = (v: Record<string, unknown>, allowed: string[]) => Object.keys(v).length === allowed.length && Object.keys(v).every(k => allowed.includes(k));

/** Untrusted browser storage: validate both shape and current preview assignment. */
function validSnapshot(v: unknown, me: User, group: Group | null, kids: Child[], now: Date): v is OfflineSnapshot {
  if (!object(v) || !group || me.role !== 'instructor' || group.instructorId !== me.id ||
      !keys(v, ['instructorId', 'groupId', 'lessonDayId', 'savedAt', 'expiresAt', 'groupName', 'level', 'kids']) ||
      v.instructorId !== me.id || v.groupId !== group.id || v.lessonDayId !== TODAY_LESSON_DAY ||
      v.groupName !== group.name || v.level !== group.level || v.expiresAt !== EXPIRES ||
      typeof v.savedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(v.savedAt) ||
      !v.savedAt.startsWith(TODAY + 'T') || !Number.isFinite(Date.parse(v.savedAt)) ||
      Date.parse(v.savedAt) > now.getTime() || Date.parse(v.savedAt) >= Date.parse(EXPIRES) ||
      now.getTime() >= Date.parse(EXPIRES) || !Array.isArray(v.kids) || v.kids.length !== kids.length) return false;
  const seen = new Set<number>();
  return v.kids.every((kid: unknown) => {
    if (!object(kid) || !keys(kid, ['name', 'bib', 'age', 'clothing', 'alerts']) ||
        typeof kid.bib !== 'number' || !Number.isSafeInteger(kid.bib) || seen.has(kid.bib)) return false;
    seen.add(kid.bib);
    const assigned = kids.find(c => c.bib === kid.bib);
    return !!assigned && kid.name === fullName(assigned) && kid.age === ageOn(assigned.birthDate, TODAY) &&
      (kid.clothing === null || text(kid.clothing)) && Array.isArray(kid.alerts) && kid.alerts.length <= 50 &&
      kid.alerts.every((alert: unknown) => object(alert) && keys(alert, ['shortAlert', 'severity', 'medicationLocation']) &&
        text(alert.shortAlert) && text(alert.medicationLocation) && typeof alert.severity === 'string' && ['high', 'medium', 'low'].includes(alert.severity));
  });
}

/** Hook: the saved copy for this instructor, plus save and delete. Expired copies are removed. */
export function useOfflineCopy(me: User) {
  const { data, now } = useStore();
  const [saved, setSaved] = useState<OfflineSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const { group, kids } = groupForInstructor(data, me);
  // Validate before rendering, including when the roster changes or the copy expires.
  const copy = validSnapshot(saved, me, group, kids, now) ? saved : null;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(keyFor(me.id));
      const candidate: unknown = raw ? JSON.parse(raw) : null;
      if (raw !== null && !validSnapshot(candidate, me, group, kids, now)) throw new Error('Invalid copy');
      setSaved(candidate as OfflineSnapshot | null);
      // A second development-mode effect may see the invalid copy already removed.
      // Keep its warning until a valid copy is loaded or explicitly saved/deleted.
      if (candidate) setError(null);
    } catch {
      setSaved(null);
      setError('Saved copy could not be read or validated. Save a new copy while connected.');
      try { localStorage.removeItem(keyFor(me.id)); } catch { /* Never claim erasure if storage is blocked. */ }
    } finally { setChecked(true); }
    // Re-read only when the intended instructor/group changes. Other changes are
    // checked synchronously above, without reading storage on every clock tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.id, group?.id]);

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(keyFor(me.id));
      if (localStorage.getItem(keyFor(me.id)) !== null) throw new Error('Delete failed');
    } catch {
      setError('Could not delete the saved copy from this browser. Try again before sharing this device.');
      return;
    }
    setSaved(null);
    setError(null);
  }, [me.id]);

  // Best-effort cleanup only while mounted; invalid copies are never rendered.
  useEffect(() => {
    if (saved && !copy) {
      setSaved(null);
      setError('Saved copy expired or no longer matches your group. Save a new copy while connected.');
      try { localStorage.removeItem(keyFor(me.id)); } catch { /* The browser may retain it; do not display it. */ }
    }
  }, [saved, copy, me.id]);

  const save = useCallback(() => {
    const { group, kids } = groupForInstructor(data, me);
    if (!group) return;
    const p = (n: number) => String(n).padStart(2, '0');
    const snap: OfflineSnapshot = {
      instructorId: me.id,
      groupId: group.id,
      lessonDayId: TODAY_LESSON_DAY,
      savedAt: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T${p(now.getHours())}:${p(now.getMinutes())}:00`,
      expiresAt: EXPIRES,
      groupName: group.name,
      level: group.level,
      kids: kids.map((c) => {
        const a = todaysAttendance(data, c.id);
        return {
          name: fullName(c),
          bib: c.bib,
          age: ageOn(c.birthDate, TODAY),
          clothing: a?.checkInAt ? `${a.jacket} jacket, ${a.pants} pants, ${a.helmet} helmet` : null,
          alerts: data.medical
            .filter((m) => m.childId === c.id)
            .map((m) => ({ shortAlert: m.shortAlert, severity: m.severity, medicationLocation: m.medicationLocation })),
        };
      }),
    };
    if (!validSnapshot(snap, me, group, kids, now)) {
      setError('A valid copy cannot be saved now. Check your group and the preview clock; copies expire at 4 p.m.');
      return;
    }
    try {
      const serialized = JSON.stringify(snap);
      localStorage.setItem(keyFor(me.id), serialized);
      if (localStorage.getItem(keyFor(me.id)) !== serialized) throw new Error('Save not confirmed');
    } catch {
      setSaved(null);
      setError('Could not save to this browser. Do not rely on an offline copy. Keep the app connected and use your radio in an emergency.');
      return;
    }
    setSaved(snap);
    setError(null);
  }, [data, me, now]);

  return { copy, save, remove, error, checked };
}

/** Whether the phone currently has a connection. */
export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

const t = (iso: string) => new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });

export function OfflineCopyCard({ copy, onSave, onRemove, onView, error, canSave }: { copy: OfflineSnapshot | null; onSave: () => void; onRemove: () => void; onView: () => void; error?: string | null; canSave: boolean }) {
  return (
    <section className={copy ? 'card offline-saved' : 'card'} data-testid="offline-card">
      {error && <p className="field-error" role="alert" data-testid="offline-error">{error}</p>}
      {copy ? (
        <>
          <div className="row between">
            <strong>Saved on this phone at {t(copy.savedAt)}</strong>
            <span className="chip fill dark">Saved to this browser</span>
          </div>
          <p className="small" style={{ marginTop: 6 }}>
            Names, clothing and short alerts only. Keep this page open: reopening without a connection is not supported. Save again after changes.
          </p>
          <div className="button-stack">
            <button type="button" className="white" disabled={!canSave} onClick={onSave} data-testid="offline-save">Update saved copy</button>
            <button type="button" className="black" onClick={onView} data-testid="offline-view">View offline copy</button>
            <button type="button" className="pink" onClick={onRemove} data-testid="offline-delete">Delete</button>
          </div>
        </>
      ) : (
        <>
          <strong>No wifi on the hill?</strong>
          <p className="small muted" style={{ margin: '4px 0 10px' }}>
            Save today’s group to this browser: names, bibs, clothing and short alerts. Keep this page open before losing connectivity.
          </p>
          <button type="button" className="primary big" disabled={!canSave} onClick={onSave} data-testid="offline-save">Save for offline</button>
        </>
      )}
      <p className={copy ? 'small' : 'small muted'} style={{ marginTop: 12, marginBottom: 0 }}>Expires at 4 p.m. on the preview clock. Expiry is checked and deletion attempted while this screen is open. Closing the app does not erase the copy. Delete it before sharing this device.</p>
    </section>
  );
}

export function OfflineCopyView({ copy, online, onBack }: { copy: OfflineSnapshot; online: boolean; onBack?: () => void }) {
  return (
    <div data-testid="offline-copy">
      <div className="banner fill warn">
        {online ? 'Offline copy' : 'No connection. Showing your offline copy'} (saved {t(copy.savedAt)}). It may be out of date. Full medical details and contacts are not included. Keep this page open; reopening offline is not supported.
      </div>
      <h1>{copy.groupName} · Level {copy.level}</h1>
      {copy.kids.map((k) => (
        <div className="kid-row" key={k.bib} data-testid={`offline-child-${k.bib}`}>
          <div>
            <div className="name">{k.name}</div>
            <div className="small muted">Age {k.age} · Bib {k.bib}{k.clothing ? ` · ${k.clothing}` : ' · not checked in when saved'}</div>
          </div>
          {k.alerts.map((a) => (
            <div key={a.shortAlert} className={`alert-block ${a.severity}`}>
              ⚠ {a.shortAlert}
              {a.medicationLocation && a.medicationLocation !== 'None' ? <span style={{ fontWeight: 400 }}> · Medication: {a.medicationLocation}</span> : null}
            </div>
          ))}
        </div>
      ))}
      <p className="small muted">To report a missing child with no connection, use your radio.</p>
      <p className="small muted">Expires at {t(copy.expiresAt)} on the preview clock. Closing the app does not erase browser storage.</p>
      {onBack && online && <button type="button" className="white wide" onClick={onBack} data-testid="offline-back">Back to live list</button>}
    </div>
  );
}
