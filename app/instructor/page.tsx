'use client';

import { useEffect, useRef, useState } from 'react';
import { OfflineCopyCard, OfflineCopyView, useOfflineCopy, useOnline } from '@/components/OfflineCopy';
import { ReportMissing } from '@/components/ReportMissing';
import { Shell } from '@/components/Shell';
import { ageOn, fullName, groupForInstructor, openSearchFor, todaysAttendance } from '@/lib/access';
import { TODAY, type Child, type MedicalAlert } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

export default function InstructorHome() {
  return (
    <Shell role="instructor" narrow>
      <MyGroup />
    </Shell>
  );
}

function MyGroup() {
  const { data, me } = useStore();
  const { group, kids } = groupForInstructor(data, me!);
  const [detail, setDetail] = useState<{ child: Child; alert: MedicalAlert } | null>(null);
  const [missing, setMissing] = useState<Child | null>(null);
  const { copy, save, remove } = useOfflineCopy(me!);
  const online = useOnline();
  const [viewingCopy, setViewingCopy] = useState(false);

  // With no connection, the saved copy is all there is.
  if (copy && (!online || viewingCopy)) {
    return <OfflineCopyView copy={copy} online={online} onBack={() => setViewingCopy(false)} />;
  }

  if (!group) {
    return (
      <div className="card">
        <h1>No group today</h1>
        <p>You aren’t teaching a group today. Check with the snow school office.</p>
      </div>
    );
  }

  return (
    <>
      <h1 data-testid="group-title">{group.name} · Level {group.level}</h1>
      <p className="muted">{kids.length} children today. Tap an alert for details.</p>
      <OfflineCopyCard copy={copy} onSave={save} onRemove={remove} onView={() => setViewingCopy(true)} />
      <div data-testid="group-list">
        {kids.map((c) => {
          const alerts = data.medical.filter((m) => m.childId === c.id);
          const att = todaysAttendance(data, c.id);
          const search = openSearchFor(data, c.id);
          return (
            <div className="kid-row" key={c.id} data-testid={`group-child-${c.id}`}>
              <div className="row between">
                <div>
                  <div className="name">{fullName(c)}</div>
                  <div className="small muted">
                    Age {ageOn(c.birthDate, TODAY)} · Bib {c.bib}
                    {att?.checkInAt ? ` · ${att.jacket} jacket, ${att.pants} pants, ${att.helmet} helmet` : ''}
                  </div>
                </div>
                {search ? (
                  <span className="chip danger">Missing · patrol searching</span>
                ) : att?.pickupAt ? (
                  <span className="chip">Gone home</span>
                ) : att?.checkInAt ? (
                  <span className="chip ok">Here</span>
                ) : (
                  <span className="chip warn">Not checked in</span>
                )}
              </div>
              {alerts.map((a) => (
                <button key={a.id} type="button" className={`alert-line ${a.severity}`} onClick={() => setDetail({ child: c, alert: a })} data-testid={`alert-${c.id}`}>
                  ⚠ {a.shortAlert}
                </button>
              ))}
              {att?.checkInAt && !att.pickupAt && !search && (
                <button type="button" className="ghost small" style={{ alignSelf: 'flex-start', color: 'var(--danger)' }} onClick={() => setMissing(c)} data-testid={`report-missing-${c.id}`}>
                  Report missing
                </button>
              )}
            </div>
          );
        })}
      </div>
      {detail && <MedicalDetail child={detail.child} alert={detail.alert} onClose={() => setDetail(null)} />}
      {missing && <ReportMissing child={missing} onClose={() => setMissing(null)} />}
    </>
  );
}

function MedicalDetail({ child, alert, onClose }: { child: Child; alert: MedicalAlert; onClose: () => void }) {
  const { logAccess } = useStore();
  // Recorded once, when the details are opened.
  const logged = useRef(false);
  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    logAccess(`Viewed medical details: ${alert.shortAlert}`, child.id);
  }, [logAccess, alert.shortAlert, child.id]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} data-testid="medical-detail">
        <h2>{fullName(child)}</h2>
        <div className={`alert-line ${alert.severity}`}>{alert.shortAlert}</div>
        <p style={{ marginTop: 12 }}>{alert.details || 'No further details.'}</p>
        <p><strong>Medication:</strong> {alert.medicationLocation}</p>
        <p className="small muted">This view was recorded. Medical details are only for keeping {child.firstName} safe today.</p>
        <button className="big primary" type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
