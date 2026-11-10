'use client';

import { useState } from 'react';
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
  const { data, checkIn, release, refusePickup } = useStore();
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
  const [missing, setMissing] = useState(false);
  const search = openSearchFor(data, child.id);

  return (
    <div className="card" data-testid="desk-child-panel">
      <h2>{fullName(child)}</h2>
      <p className="muted small">Bib {child.bib} · Level {child.level} · {group ? `${group.name}, ${userName(data, group.instructorId)}` : 'No group yet'}</p>

      {search && <div className="banner danger">Ski patrol is searching for {child.firstName}.</div>}

      {!a?.checkInAt && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!clothingDone) return;
            checkIn(child.id, { jacket: jacket.trim(), pants: pants.trim(), helmet: helmet.trim() });
          }}
          data-testid="checkin-form"
        >
          <h3>Check in</h3>
          <p className="small muted">Note today’s clothing: patrol uses it if {child.firstName} goes missing.</p>
          <ColourPicker id="jacket" label="Jacket colour" value={jacket} onChange={setJacket} testId="checkin-jacket" />
          <ColourPicker id="pants" label="Pants colour" value={pants} onChange={setPants} testId="checkin-pants" />
          <ColourPicker id="helmet" label="Helmet colour" value={helmet} onChange={setHelmet} testId="checkin-helmet" />
          <button className="primary big" type="submit" disabled={!clothingDone} data-testid="checkin-submit">Check in {child.firstName}</button>
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
          Went home at {timeLabel(a.pickupAt)} with {data.persons.find((p) => p.id === a.pickedUpBy)?.name}, released by {userName(data, a.releasedBy)}
        </div>
      )}

      {a?.checkInAt && !a.pickupAt && !search && (
        <div data-testid="pickup-panel">
          <h3>Pickup: approved adults</h3>
          <p className="small muted">Ask for photo ID if you don’t recognize the adult.</p>
          {refused && (
            <div className="banner danger" data-testid="pickup-refused">
              {refused} is NOT on {child.firstName}’s pickup list. Do not release {child.firstName}. The attempt has been recorded. Call a parent below.
            </div>
          )}
          <div className="stack">
            {adults.filter((x) => x.link.canPickUp).map(({ person, link }) => (
              <button key={link.id} type="button" className="big" style={{ justifyContent: 'space-between' }} onClick={() => release(child.id, person.id)} data-testid={`release-to-${person.name}`}>
                <span>Release to <strong>{person.name}</strong> <span className="muted small">({link.relationship})</span></span>
                <span className="small muted">{person.phone}</span>
              </button>
            ))}
          </div>
          {!askOther ? (
            <button type="button" className="ghost" style={{ marginTop: 10 }} onClick={() => setAskOther(true)} data-testid="someone-else">Someone else is here</button>
          ) : (
            <form
              style={{ marginTop: 12 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!otherName.trim()) return;
                refusePickup(child.id, otherName.trim());
                setRefused(otherName.trim());
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
          <h3 style={{ marginTop: 16 }}>Parents to call</h3>
          <ul className="small" data-testid="desk-contacts">
            {adults.filter((x) => x.link.contactOrder).map(({ person, link }) => (
              <li key={link.id}>{person.name} ({link.relationship}): {person.phone}</li>
            ))}
          </ul>
          <button type="button" className="ghost" style={{ color: 'var(--danger)' }} onClick={() => setMissing(true)} data-testid="desk-report-missing">Report missing</button>
        </div>
      )}
      {missing && <ReportMissing child={child} onClose={() => setMissing(false)} limitToSystemTime />}
    </div>
  );
}
