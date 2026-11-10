'use client';

// Instructor's offline copy of today's group, for the hill where there is no wifi.
//
// What goes on the phone is deliberately limited: names, bibs, today's clothing
// and the one-line alerts with where medication is kept. Full medical details,
// contacts and anything about other groups stay online, because each look at
// full details is recorded and that can't happen offline. The copy deletes
// itself at 4 p.m.
//
// Preview: kept in this browser's storage. Real build: the same snapshot,
// plus an offline-capable page so the screen opens with no connection at all.

import { useCallback, useEffect, useState } from 'react';
import { ageOn, fullName, groupForInstructor, todaysAttendance } from '@/lib/access';
import { TODAY, type Severity, type User } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

export type OfflineSnapshot = {
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

function read(userId: string): OfflineSnapshot | null {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    return raw ? (JSON.parse(raw) as OfflineSnapshot) : null;
  } catch {
    return null;
  }
}

/** Hook: the saved copy for this instructor, plus save and delete. Expired copies are removed. */
export function useOfflineCopy(me: User) {
  const { data, now } = useStore();
  const [copy, setCopy] = useState<OfflineSnapshot | null>(null);

  useEffect(() => setCopy(read(me.id)), [me.id]);

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(keyFor(me.id));
    } catch {
      /* ignore */
    }
    setCopy(null);
  }, [me.id]);

  // Delete automatically once the lesson day is over.
  useEffect(() => {
    if (copy && now.getTime() >= new Date(copy.expiresAt).getTime()) remove();
  }, [copy, now, remove]);

  const save = useCallback(() => {
    const { group, kids } = groupForInstructor(data, me);
    if (!group) return;
    const p = (n: number) => String(n).padStart(2, '0');
    const snap: OfflineSnapshot = {
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
    try {
      localStorage.setItem(keyFor(me.id), JSON.stringify(snap));
    } catch {
      /* storage full or blocked: keep it in memory for this visit */
    }
    setCopy(snap);
  }, [data, me, now]);

  return { copy, save, remove };
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

export function OfflineCopyCard({ copy, onSave, onRemove, onView, canSave }: { copy: OfflineSnapshot | null; onSave: () => void; onRemove: () => void; onView: () => void; canSave: boolean }) {
  return (
    <section className="card" data-testid="offline-card">
      {copy ? (
        <>
          <div className="row between">
            <strong>Saved on this phone at {t(copy.savedAt)}</strong>
            <span className="chip ok">Works without wifi</span>
          </div>
          <p className="small muted" style={{ marginTop: 6 }}>
            Names, clothing and alerts only. Deletes itself at {t(copy.expiresAt)}. Save again after changes so it stays up to date.
          </p>
          <div className="row">
            <button type="button" className="primary" disabled={!canSave} onClick={onSave} data-testid="offline-save">Update saved copy</button>
            <button type="button" onClick={onView} data-testid="offline-view">View offline copy</button>
            <button type="button" className="ghost" onClick={onRemove} data-testid="offline-delete">Delete</button>
          </div>
        </>
      ) : (
        <>
          <strong>No wifi on the hill?</strong>
          <p className="small muted" style={{ margin: '4px 0 10px' }}>
            Save today’s group to this phone: names, bibs, clothing and alerts. It deletes itself at 4 p.m.
          </p>
          <button type="button" className="primary big" disabled={!canSave} onClick={onSave} data-testid="offline-save">Save for offline</button>
        </>
      )}
    </section>
  );
}

export function OfflineCopyView({ copy, online, onBack }: { copy: OfflineSnapshot; online: boolean; onBack?: () => void }) {
  return (
    <div data-testid="offline-copy">
      <div className="banner warn">
        {online ? 'Offline copy' : 'No connection. Showing your offline copy'} (saved {t(copy.savedAt)}). It may be out of date. Full medical details need a connection.
      </div>
      <h1>{copy.groupName} · Level {copy.level}</h1>
      {copy.kids.map((k) => (
        <div className="kid-row" key={k.bib} data-testid={`offline-child-${k.bib}`}>
          <div>
            <div className="name">{k.name}</div>
            <div className="small muted">Age {k.age} · Bib {k.bib}{k.clothing ? ` · ${k.clothing}` : ' · not checked in when saved'}</div>
          </div>
          {k.alerts.map((a) => (
            <div key={a.shortAlert} className={`alert-line ${a.severity}`}>
              ⚠ {a.shortAlert}
              {a.medicationLocation && a.medicationLocation !== 'None' ? <span style={{ fontWeight: 400 }}> · Medication: {a.medicationLocation}</span> : null}
            </div>
          ))}
        </div>
      ))}
      <p className="small muted">To report a missing child with no connection, use your radio.</p>
      {onBack && online && <button type="button" onClick={onBack} data-testid="offline-back">Back to live list</button>}
    </div>
  );
}
