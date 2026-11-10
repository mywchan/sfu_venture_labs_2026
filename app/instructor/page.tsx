'use client';

import { useEffect, useRef, useState } from 'react';
import { OfflineCopyCard, OfflineCopyView, useOfflineCopy, useOnline } from '@/components/OfflineCopy';
import { ColourPicker } from '@/components/ColourPicker';
import { ReportMissing } from '@/components/ReportMissing';
import { Shell } from '@/components/Shell';
import { ageOn, fullName, groupForInstructor, openSearchFor, timeLabel, todaysAttendance, userName } from '@/lib/access';
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
  const [fixing, setFixing] = useState<Child | null>(null);
  const { copy, save, remove, error, checked } = useOfflineCopy(me!);
  const online = useOnline();
  const [viewingCopy, setViewingCopy] = useState(false);

  // With no connection, the saved copy is all there is.
  if (copy && (!online || viewingCopy)) {
    return <OfflineCopyView copy={copy} online={online} onBack={() => setViewingCopy(false)} />;
  }

  if (!online) {
    return <section className="card" data-testid="offline-unavailable" aria-labelledby="offline-unavailable-title">
      <h1 id="offline-unavailable-title">{checked ? 'No valid saved group available' : 'Checking saved group…'}</h1>
      <p role="status">You are offline. The normal roster and reporting controls are unavailable. Use your radio or the established emergency procedure for a missing child.</p>
      {error && <p className="field-error" role="alert">{error}</p>}
      <p className="small muted">Reconnect, then save a valid group copy. Reopening the app offline is not supported.</p>
    </section>;
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
      <p className="small" style={{ fontWeight: 600 }}>{kids.length} children today. Tap an alert for details.</p>
      <OfflineCopyCard copy={copy} onSave={save} onRemove={remove} onView={() => setViewingCopy(true)} error={error} />

      <div data-testid="group-list">
        {kids.map((c) => {
          const alerts = data.medical.filter((m) => m.childId === c.id);
          const att = todaysAttendance(data, c.id);
          const search = openSearchFor(data, c.id);
          // The status sits on the card's left strip, as in the wireframes.
          const [statusClass, statusLabel] = search ? ['danger', 'Missing'] : att?.pickupAt ? ['gone', 'Gone home'] : att?.checkInAt ? ['ok', 'Here'] : ['waiting', 'Not checked in'];
          return (
            <div className={`kid-row strip-card ${statusClass}`} key={c.id} data-testid={`group-child-${c.id}`}>
              <div className="strip">{statusLabel}</div>
              <div className="strip-body">
              <div className="row between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div className="name">{fullName(c)}</div>
                  <div className="small">Age {ageOn(c.birthDate, TODAY)} · Bib {c.bib}</div>
                  {att?.checkInAt && <div className="small" style={{ fontWeight: 700 }}>{att.jacket} jacket, {att.pants} pants, {att.helmet} helmet</div>}
                </div>
                {search && (
                  <span className="chip fill danger">Missing · {data.acks.some((a) => a.emergencyId === search.id) ? 'patrol acknowledged' : 'awaiting patrol acknowledgement'}</span>
                )}
              </div>
              {alerts.map((a) => (
                <button key={a.id} type="button" className={`alert-block ${a.severity}`} onClick={() => setDetail({ child: c, alert: a })} data-testid={`alert-${c.id}`}>
                  <span className="details-pill" aria-hidden="true">Details</span>
                  <span>⚠ {a.shortAlert}</span>
                </button>
              ))}
              {att?.clothingFixedAt && (
                <div className="small muted" data-testid={`clothing-fixed-${c.id}`}>Clothing corrected at {timeLabel(att.clothingFixedAt)} by {userName(data, att.clothingFixedBy ?? null)}</div>
              )}
              {att?.checkInAt && !att.pickupAt && (
                <div className="row" style={{ gap: 'var(--space-sm)' }}>
                  <button type="button" className="small" onClick={() => setFixing(c)} data-testid={`fix-clothing-${c.id}`}>
                    Fix clothing
                  </button>
                  {!search && (
                    <button type="button" className="danger small" onClick={() => setMissing(c)} data-testid={`report-missing-${c.id}`}>
                      Report missing
                    </button>
                  )}
                </div>
              )}
              </div>
            </div>
          );
        })}
      </div>
      {detail && <MedicalDetail child={detail.child} alert={detail.alert} onClose={() => setDetail(null)} />}
      {missing && <ReportMissing child={missing} onClose={() => setMissing(null)} limitToSystemTime />}
      {fixing && <FixClothing child={fixing} onClose={() => setFixing(null)} />}
    </>
  );
}

function FixClothing({ child, onClose }: { child: Child; onClose: () => void }) {
  const { data, fixClothing } = useStore();
  const att = todaysAttendance(data, child.id);
  const [jacket, setJacket] = useState(att?.jacket ?? '');
  const [pants, setPants] = useState(att?.pants ?? '');
  const [helmet, setHelmet] = useState(att?.helmet ?? '');
  const complete = Boolean(jacket.trim() && pants.trim() && helmet.trim());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="fix-title" onClick={onClose}>
      <form
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!complete || saving) return;
          setSaving(true);
          setError(null);
          try {
            await fixClothing(child.id, { jacket: jacket.trim(), pants: pants.trim(), helmet: helmet.trim() });
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'That didn’t save.');
            setSaving(false);
          }
        }}
        data-testid="fix-clothing-sheet"
      >
        <h2 id="fix-title">What is {child.firstName} wearing now?</h2>
        <p className="small muted">Ski patrol uses this if {child.firstName} goes missing. Your name is recorded with the change.</p>
        <ColourPicker id="fix-jacket" label="Jacket colour" value={jacket} onChange={setJacket} testId="fix-jacket" />
        <ColourPicker id="fix-pants" label="Pants colour" value={pants} onChange={setPants} testId="fix-pants" />
        <ColourPicker id="fix-helmet" label="Helmet colour" value={helmet} onChange={setHelmet} testId="fix-helmet" />
        {error && <div className="banner danger" data-testid="fix-clothing-error">{error}</div>}
        <button className="big primary" type="submit" disabled={!complete || saving} data-testid="fix-clothing-save">{saving ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={onClose} style={{ width: '100%', marginTop: 8 }}>Cancel</button>
      </form>
    </div>
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
        <h2 style={{ marginBottom: 2 }}>Medical details</h2>
        <p className="subtitle">{fullName(child)} · Bib {child.bib}</p>
        <div className={`card strip-card ${alert.severity}`} style={{ marginBottom: 'var(--space-md)' }}>
          <div className="strip">{alert.severity === 'high' ? 'Life-threatening' : alert.severity === 'medium' ? 'Needs attention' : 'Good to know'}</div>
          <div className="strip-body">
            <div style={{ fontWeight: 700 }}>{alert.shortAlert}</div>
            <p className="small" style={{ margin: '6px 0' }}>Details: {alert.details || 'No further details.'}</p>
            <p className="small" style={{ margin: 0 }}><strong>Medication:</strong> {alert.medicationLocation}</p>
          </div>
        </div>
        <p className="card small" style={{ padding: '10px var(--space-md)', marginBottom: 'var(--space-md)' }}>This view was recorded. Medical details are only for keeping {child.firstName} safe today.</p>
        <button className="big white" type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
