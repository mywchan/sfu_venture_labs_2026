'use client';

import { useEffect, useRef, useState } from 'react';
import { Shell } from '@/components/Shell';
import { adultsFor, ageOn, fullName, groupOfChild, policeDeadline, timeLabel, userName } from '@/lib/access';
import { TODAY, type Emergency } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

export default function PatrolHome() {
  return (
    <Shell role="patrol">
      <Patrol />
    </Shell>
  );
}

function Patrol() {
  const { data, markNoticeMailed } = useStore();
  const open = data.emergencies.filter((e) => e.status === 'open');
  const closed = data.emergencies.filter((e) => e.status === 'closed');
  const [openId, setOpenId] = useState<string | null>(null);
  const current = open.find((e) => e.id === openId) ?? (open.length === 1 ? open[0] : null);

  return (
    <>
      {open.length === 0 ? (
        <div className="card" data-testid="no-searches">
          <h1>No open searches</h1>
          <p className="muted">When an instructor or the desk reports a child missing, the alert appears here immediately. Children’s details are only available to patrol during a search.</p>
        </div>
      ) : (
        <>
          {open.length > 1 && (
            <div className="row" style={{ marginBottom: 12 }}>
              {open.map((e) => {
                const c = data.children.find((x) => x.id === e.childId)!;
                return (
                  <button key={e.id} type="button" className={current?.id === e.id ? 'primary' : ''} onClick={() => setOpenId(e.id)}>
                    {fullName(c)}
                  </button>
                );
              })}
            </div>
          )}
          {current && <SearchScreen key={current.id} em={current} />}
        </>
      )}
      {closed.length > 0 && (
        <section className="card" data-testid="closed-searches">
          <h2>Closed searches today</h2>
          <p className="small muted">Children’s details are no longer available once a search is closed.</p>
          <table>
            <thead><tr><th>Child</th><th>Closed</th><th>Outcome</th><th>Notice to family</th></tr></thead>
            <tbody>
              {closed.map((e) => {
                const c = data.children.find((x) => x.id === e.childId)!;
                return (
                  <tr key={e.id}>
                    <td>{c.firstName} {c.lastName.charAt(0)}.</td>
                    <td>{timeLabel(e.closedAt)}</td>
                    <td>{e.outcome}</td>
                    <td>
                      {!e.sharedWithPoliceAt ? (
                        'Not needed'
                      ) : e.noticeMailed ? (
                        'Mailed'
                      ) : (
                        <button type="button" onClick={() => markNoticeMailed(e.id)}>To mail · mark done</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}

function SearchScreen({ em }: { em: Emergency }) {
  const { data, me, now, acknowledge, shareWithPolice, markNoticeMailed, closeSearch, logAccess } = useStore();
  const child = data.children.find((c) => c.id === em.childId)!;
  const group = groupOfChild(data, child.id);
  const adults = adultsFor(data, child.id);
  const alerts = data.medical.filter((m) => m.childId === child.id);
  const consent = data.consents.find((c) => c.childId === child.id);
  const acks = data.acks.filter((a) => a.emergencyId === em.id);
  const iAcked = acks.some((a) => a.patrollerId === me!.id);
  const [closing, setClosing] = useState(false);
  const [outcome, setOutcome] = useState('Found safe');

  const logged = useRef(false);
  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    logAccess('Opened child details during a search', child.id);
  }, [logAccess, child.id]);

  const deadline = policeDeadline(em.lastSeenAt);
  const msLeft = deadline.getTime() - now.getTime();
  const minsLeft = Math.ceil(msLeft / 60_000);
  const minsMissing = Math.max(0, Math.floor((now.getTime() - new Date(em.lastSeenAt).getTime()) / 60_000));

  return (
    <div data-testid="search-screen">
      <div className="banner danger" style={{ fontSize: '1.1rem' }}>
        MISSING CHILD: {fullName(child)}, age {ageOn(child.birthDate, TODAY)} · missing {minsMissing} min
      </div>

      <div className="grid2" style={{ alignItems: 'start' }}>
        <section className="card">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <div
              aria-label={consent?.photoConsent ? 'Photo' : 'No photo consent'}
              style={{ width: 84, height: 100, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: consent?.photoConsent ? '1.8rem' : '0.75rem', color: 'var(--ink-2)', textAlign: 'center', padding: 4 }}
              data-testid="search-photo"
            >
              {consent?.photoConsent ? `${child.firstName[0]}${child.lastName[0]}` : 'No photo consent'}
            </div>
            <dl className="kv" style={{ flex: 1 }}>
              <dt>Jacket</dt><dd data-testid="search-jacket">{em.jacket}</dd>
              <dt>Pants</dt><dd data-testid="search-pants">{em.pants}</dd>
              <dt>Helmet</dt><dd data-testid="search-helmet">{em.helmet}</dd>
              <dt>Level</dt><dd>{child.level}</dd>
              <dt>Bib</dt><dd>{child.bib}</dd>
            </dl>
          </div>
          <h3 style={{ marginTop: 14 }}>Last seen</h3>
          <p data-testid="search-last-seen"><strong>{em.lastSeenPlace}</strong> at {timeLabel(em.lastSeenAt)}</p>
          <p className="small muted">Reported by {userName(data, em.reportedBy)}</p>
          <h3>Group</h3>
          <p data-testid="search-group">{group ? `${group.name} · instructor ${userName(data, group.instructorId)}` : 'No group'}</p>
        </section>

        <section className="card" data-testid="search-countdown">
          <h3>Call police by {deadline.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}</h3>
          <div className="big-number" style={{ color: minsLeft <= 10 ? 'var(--danger)' : undefined }}>
            {msLeft > 0 ? `${minsLeft} min left` : 'Call police now'}
          </div>
          <p className="small muted">60 minutes after last seen, or 4 p.m., whichever comes first. Call the family at the same time.</p>
          {!em.sharedWithPoliceAt ? (
            <button type="button" onClick={() => shareWithPolice(em.id)} data-testid="share-police">Record: details shared with police</button>
          ) : (
            <div className="stack">
              <div className="banner warn" data-testid="police-shared">Shared with police at {timeLabel(em.sharedWithPoliceAt)}</div>
              {!em.noticeMailed ? (
                <div className="row between card" style={{ margin: 0 }} data-testid="notice-todo">
                  <span>Mail a notice to the family (privacy law)</span>
                  <button type="button" onClick={() => markNoticeMailed(em.id)}>Mark done</button>
                </div>
              ) : (
                <span className="chip ok">Notice mailed</span>
              )}
            </div>
          )}
        </section>

        <section className="card" data-testid="search-medical">
          <h3>Medical</h3>
          {alerts.length === 0 ? <p className="muted">No medical alerts.</p> : alerts.map((a) => (
            <div key={a.id} style={{ marginBottom: 10 }}>
              <div className={`alert-line ${a.severity}`}>{a.shortAlert}</div>
              <p className="small" style={{ margin: '6px 0 0' }}>{a.details} Medication: {a.medicationLocation}.</p>
            </div>
          ))}
        </section>

        <section className="card" data-testid="search-contacts">
          <h3>Emergency contacts</h3>
          {adults.filter((x) => x.link.contactOrder).map(({ person, link }) => (
            <p key={link.id}>
              <strong>{link.contactOrder}. {person.name}</strong> ({link.relationship})<br />
              <a href={`tel:${person.phone}`}>{person.phone}</a>
            </p>
          ))}
          <h3>Also allowed to pick up</h3>
          <p className="small">{adults.filter((x) => x.link.canPickUp && !x.link.contactOrder).map((x) => `${x.person.name} (${x.link.relationship})`).join(', ') || 'No one else'}</p>
        </section>
      </div>

      <section className="card">
        <div className="row between">
          <div data-testid="acks">
            <strong>Acknowledged:</strong>{' '}
            {acks.length === 0 ? <span className="muted">no one yet</span> : acks.map((a) => `${userName(data, a.patrollerId)} (${timeLabel(a.at)})`).join(', ')}
          </div>
          {!iAcked && <button className="primary" type="button" onClick={() => acknowledge(em.id)} data-testid="acknowledge">I’m on it</button>}
        </div>
      </section>

      <section className="card">
        {!closing ? (
          <button type="button" onClick={() => setClosing(true)} data-testid="close-search">Close search</button>
        ) : (
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              closeSearch(em.id, outcome);
            }}
          >
            <label htmlFor="outcome" style={{ margin: 0 }}>Outcome</label>
            <select id="outcome" style={{ width: 'auto' }} value={outcome} onChange={(e) => setOutcome(e.target.value)} data-testid="close-outcome">
              <option>Found safe</option>
              <option>Found, needed first aid</option>
              <option>Handed over to police</option>
              <option>False alarm</option>
            </select>
            <button className="primary" type="submit" data-testid="close-confirm">Close search</button>
            <button className="ghost" type="button" onClick={() => setClosing(false)}>Cancel</button>
          </form>
        )}
      </section>
    </div>
  );
}
