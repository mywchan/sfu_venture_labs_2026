'use client';

import { useRef, useState } from 'react';
import { ColourPicker } from '@/components/ColourPicker';
import { ReportMissing } from '@/components/ReportMissing';
import { Shell } from '@/components/Shell';
import { adultsFor, fullName, groupOfChild, openSearchFor, timeLabel, todaysAttendance, userName } from '@/lib/access';
import type { Child } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

export default function DeskHome() {
  return (
    <Shell role="desk">
      <Desk />
    </Shell>
  );
}

function Desk() {
  const { data } = useStore();
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Today's children are everyone registered for Saturday.
  const kids = data.children.filter((c) => c.programDay === 'Saturday');
  const att = (id: string) => todaysAttendance(data, id);
  const checkedIn = kids.filter((c) => att(c.id)?.checkInAt).length;
  const pickedUp = kids.filter((c) => att(c.id)?.pickupAt).length;

  const term = q.trim().toLowerCase();
  const results = term
    ? kids.filter((c) => fullName(c).toLowerCase().includes(term) || String(c.bib) === term)
    : kids;
  const selected = data.children.find((c) => c.id === selectedId) ?? null;

  return (
    <>
      <div className="row between" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Check-in and pickup</h1>
        <div className="row small" data-testid="desk-counts">
          <span className="chip ok">{checkedIn} of {kids.length} checked in</span>
          <span className="chip">{pickedUp} gone home</span>
        </div>
      </div>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <section className="card">
          <label htmlFor="desk-search">Find a child by name or bib number</label>
          <input id="desk-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Owen, or 101" autoFocus data-testid="desk-search" />
          <div style={{ marginTop: 12, maxHeight: 480, overflowY: 'auto' }} data-testid="desk-results">
            {results.map((c) => {
              const a = att(c.id);
              const status = openSearchFor(data, c.id) ? (
                <span className="chip danger">Missing</span>
              ) : a?.pickupAt ? (
                <span className="chip">Gone home</span>
              ) : a?.checkInAt ? (
                <span className="chip ok">Here</span>
              ) : (
                <span className="chip warn">Not checked in</span>
              );
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  style={{ width: '100%', justifyContent: 'space-between', marginBottom: 6, borderColor: c.id === selectedId ? 'var(--brand)' : undefined }}
                  data-testid={`desk-result-${c.id}`}
                >
                  <span>
                    <strong>{fullName(c)}</strong> <span className="muted small">· bib {c.bib}</span>
                  </span>
                  {status}
                </button>
              );
            })}
            {results.length === 0 && <p className="muted">No child matches “{q}”.</p>}
          </div>
        </section>
        <section>{selected ? <ChildPanel key={selected.id} child={selected} /> : <div className="card muted">Pick a child to check in or release.</div>}</section>
      </div>
      {data.refusals.length > 0 && (
        <section className="card" data-testid="refusals">
          <h2>Pickups refused today</h2>
          <table>
            <thead>
              <tr><th>Time</th><th>Child</th><th>Adult who asked</th><th>Staff</th></tr>
            </thead>
            <tbody>
              {data.refusals.map((r) => {
                const c = data.children.find((x) => x.id === r.childId)!;
                return (
                  <tr key={r.id}><td>{timeLabel(r.at)}</td><td>{fullName(c)}</td><td>{r.nameGiven}</td><td>{userName(data, r.staffId)}</td></tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}

function ChildPanel({ child }: { child: Child }) {
  const { data, checkIn, release, refusePickup, guardianLink } = useStore();
  const a = todaysAttendance(data, child.id);
  const group = groupOfChild(data, child.id);
  const adults = adultsFor(data, child.id);
  const [jacket, setJacket] = useState(a?.jacket ?? '');
  const [pants, setPants] = useState(a?.pants ?? '');
  const [helmet, setHelmet] = useState(a?.helmet ?? '');
  const clothingDone = Boolean(jacket.trim() && pants.trim() && helmet.trim());
  const [otherName, setOtherName] = useState('');
  const [askOther, setAskOther] = useState(false);
  const [refused, setRefused] = useState<string | null>(null);
  const [onList, setOnList] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const search = openSearchFor(data, child.id);
  const [pickupPersonId, setPickupPersonId] = useState<string | null>(null);
  const pickupTrigger = useRef<HTMLButtonElement | null>(null);
  const pickupAdult = adults.find(({ person, link }) => person.id === pickupPersonId && link.canPickUp);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Runs a save; the panel stays put and shows the reason if it fails. */
  const save = async (work: () => Promise<void>, ifFailed = '') => {
    setSaving(true);
    setError(null);
    try {
      await work();
    } catch (err) {
      setError(`${ifFailed}${err instanceof Error ? err.message : 'That didn’t save.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" data-testid="desk-child-panel">
      <h2>{fullName(child)}</h2>
      <p className="muted small">Bib {child.bib} · Level {child.level} · {group ? `${group.name}, ${userName(data, group.instructorId)}` : 'No group yet'}</p>

      {search && <div className="banner danger" data-testid="desk-incident-status">
        {child.firstName} is reported missing. {data.acks.some((ack) => ack.emergencyId === search.id) ? 'Patrol has acknowledged the report.' : 'Awaiting patrol acknowledgement.'} Pickup is blocked until the incident is closed.
      </div>}
      {error && <div className="banner danger" data-testid="desk-save-error">{error}</div>}

      {!a?.checkInAt && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!clothingDone || saving) return;
            void save(() => checkIn(child.id, { jacket: jacket.trim(), pants: pants.trim(), helmet: helmet.trim() }));
          }}
          data-testid="checkin-form"
        >
          <h3>Check in</h3>
          <p className="small muted">Note today’s clothing: patrol uses it if {child.firstName} goes missing.</p>
          <ColourPicker id="jacket" label="Jacket colour" value={jacket} onChange={setJacket} testId="checkin-jacket" />
          <ColourPicker id="pants" label="Pants colour" value={pants} onChange={setPants} testId="checkin-pants" />
          <ColourPicker id="helmet" label="Helmet colour" value={helmet} onChange={setHelmet} testId="checkin-helmet" />
          <button className="primary big" type="submit" disabled={!clothingDone || saving} data-testid="checkin-submit">{saving ? 'Saving…' : `Check in ${child.firstName}`}</button>
        </form>
      )}

      {a?.checkInAt && (
        <div className="banner ok" data-testid="checkin-status">
          Checked in at {timeLabel(a.checkInAt)} by {userName(data, a.checkedInBy)} · {a.jacket} jacket, {a.pants} pants, {a.helmet} helmet
          {a.clothingFixedAt && <div className="small" data-testid="clothing-fixed-note">Clothing corrected at {timeLabel(a.clothingFixedAt)} by {userName(data, a.clothingFixedBy ?? null)}</div>}
        </div>
      )}

      {a?.pickupAt && (
        <div className="banner ok" data-testid="pickup-status">
          Went home at {timeLabel(a.pickupAt)} with {a.pickedUpName ?? data.persons.find((p) => p.id === a.pickedUpBy)?.name}, released by {userName(data, a.releasedBy)}
        </div>
      )}

      {a?.checkInAt && !a.pickupAt && !search && (
        <div data-testid="pickup-panel">
          {guardianLink === 'offline' && (
            <div className="banner danger" data-testid="guardians-stale">
              Can’t reach Peak Pals, so this list may be out of date. Call a parent to confirm before releasing {child.firstName}.
            </div>
          )}
          <h3>Pickup: approved adults</h3>
          <p className="small muted">Ask for photo ID if you don’t recognize the adult.</p>
          {refused && (
            <div className="banner danger" data-testid="pickup-refused">
              {refused} is NOT on {child.firstName}’s pickup list. Do not release {child.firstName}. Call a parent below.
            </div>
          )}
          {onList && (
            <div className="banner ok" data-testid="pickup-on-list">
              {onList} is on {child.firstName}’s pickup list. Check their photo ID, then use their Release button.
            </div>
          )}
          <div className="stack">
            {adults.filter((x) => x.link.canPickUp).map(({ person, link }) => (
              <button key={link.id} type="button" className="big" style={{ justifyContent: 'space-between' }} disabled={saving} onClick={(event) => { pickupTrigger.current = event.currentTarget; setPickupPersonId(person.id); }} data-testid={`release-to-${person.name}`}>
                <span>Release to <strong>{person.name}</strong> <span className="muted small">({link.relationship})</span></span>
                <span className="small muted">{person.phone}</span>
              </button>
            ))}
          </div>
          {pickupAdult && (
            <PickupConfirmation
              key={pickupAdult.person.id}
              childName={fullName(child)}
              adultName={pickupAdult.person.name}
              onCancel={() => { setPickupPersonId(null); pickupTrigger.current?.focus(); }}
              onConfirm={() => {
                // Recheck permissions and attendance at confirmation. The server checks again when saving.
                if (!a?.checkInAt || a.pickupAt || search || !adults.some(({ person, link }) => person.id === pickupAdult.person.id && link.canPickUp)) return;
                const adultId = pickupAdult.person.id;
                setPickupPersonId(null);
                void save(() => release(child.id, adultId));
              }}
            />
          )}
          {!askOther ? (
            <button type="button" className="ghost" style={{ marginTop: 10 }} onClick={() => setAskOther(true)} data-testid="someone-else">Someone else is here</button>
          ) : (
            <form
              style={{ marginTop: 12 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!otherName.trim()) return;
                // Only a name that isn't on the approved list counts as a refusal.
                const tidy = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
                const approved = adults.find((x) => x.link.canPickUp && tidy(x.person.name) === tidy(otherName));
                if (approved) {
                  setOnList(approved.person.name);
                  setRefused(null);
                } else {
                  // The warning shows straight away; only the record of it waits for the save.
                  const nameGiven = otherName.trim();
                  void save(() => refusePickup(child.id, nameGiven), 'The warning stands, but this attempt wasn’t recorded. ');
                  setRefused(otherName.trim());
                  setOnList(null);
                }
                setOtherName('');
                setAskOther(false);
              }}
            >
              <label htmlFor="other">Name the adult gave</label>
              <div className="row">
                <input id="other" style={{ flex: 1 }} value={otherName} onChange={(e) => setOtherName(e.target.value)} data-testid="other-name" />
                <button type="submit" data-testid="other-check">Check</button>
              </div>
            </form>
          )}
          <button type="button" className="ghost" style={{ color: 'var(--danger)' }} onClick={() => setMissing(true)} data-testid="desk-report-missing">Report missing</button>
        </div>
      )}
      <h3 style={{ marginTop: 16 }}>Emergency contacts</h3>
      <ul className="small" data-testid="desk-contacts">
        {adults.filter((x) => x.link.contactOrder).map(({ person, link }) => (
          <li key={link.id}>{link.contactOrder}. {person.name} ({link.relationship}): <a href={`tel:${person.phone}`}>{person.phone}</a></li>
        ))}
      </ul>
      {!adults.some((x) => x.link.contactOrder) && <p className="small muted">No emergency contacts recorded. Contact the snow school office.</p>}
      {missing && <ReportMissing child={child} onClose={() => setMissing(false)} limitToSystemTime />}
    </div>
  );
}

function PickupConfirmation({ childName, adultName, onCancel, onConfirm }: {
  childName: string; adultName: string; onCancel: () => void; onConfirm: () => void;
}) {
  const [identityChecked, setIdentityChecked] = useState(false);
  return (
    <form className="card" style={{ marginTop: 12 }} aria-labelledby="pickup-confirm-title" aria-describedby="pickup-confirm-note"
      data-testid="pickup-confirmation" onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); onCancel(); } }}
      onSubmit={(event) => { event.preventDefault(); if (identityChecked) onConfirm(); }}>
      <h3 id="pickup-confirm-title">Confirm pickup</h3>
      <p>Child: <strong>{childName}</strong></p>
      <p>Authorized adult: <strong>{adultName}</strong></p>
      <p className="small muted" id="pickup-confirm-note">Staff must check identity before recording pickup. The app does not independently verify identity.</p>
      <label className="checkbox field">
        <input type="checkbox" autoFocus checked={identityChecked} onChange={(event) => setIdentityChecked(event.target.checked)} data-testid="pickup-identity-checked" />
        I checked this adult’s identity against the approved pickup information.
      </label>
      <div className="row">
        <button type="submit" className="primary" disabled={!identityChecked} data-testid="pickup-confirm-release">Confirm release</button>
        <button type="button" className="ghost" onClick={onCancel} data-testid="pickup-cancel">Cancel</button>
      </div>
    </form>
  );
}
