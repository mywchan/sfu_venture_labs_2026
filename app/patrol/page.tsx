'use client';

import { useEffect, useRef, useState } from 'react';
import { Shell } from '@/components/Shell';
import { adultsFor, ageOn, fullName, groupOfChild, policeDeadline, timeLabel, userName } from '@/lib/access';
import { TODAY, type Emergency } from '@/lib/seed/data';
import { useStore } from '@/lib/store';
import styles from './patrol.module.css';

export default function PatrolHome() {
  return (
    <Shell role="patrol">
      <Patrol />
    </Shell>
  );
}

function Patrol() {
  const { data, now, markNoticeMailed } = useStore();
  const [closedError, setClosedError] = useState<string | null>(null);
  const open = data.emergencies.filter((e) => e.status === 'open')
    .sort((a, b) => policeDeadline(a.lastSeenAt).getTime() - policeDeadline(b.lastSeenAt).getTime());
  const closed = data.emergencies.filter((e) => e.status === 'closed');
  const [openId, setOpenId] = useState<string | null>(null);
  const current = open.find((e) => e.id === openId) ?? (open.length === 1 ? open[0] : null);

  return (
    <>
      <h1>Patrol response</h1>
      <p className="small muted" data-testid="patrol-preview-note">
        Made-up children only. This screen does not call police for you.
      </p>
      {open.length === 0 ? (
        <div className="card" data-testid="no-searches">
          <h2>No open searches</h2>
          <p className="muted">Reports appear here as soon as they are filed. Children’s details are only shown during an open search.</p>
        </div>
      ) : (
        <div className={styles.dashboard} data-testid="patrol-dashboard">
          <section className={styles.incidentList} aria-labelledby="active-incidents-heading" data-testid="active-incidents">
            <div className={styles.listHeading}>
              <h2 id="active-incidents-heading">Active incidents ({open.length})</h2>
              <span className="small muted">Earliest escalation deadline first</span>
            </div>
            <div className={styles.incidentGrid}>
              {open.map((e) => {
                const c = data.children.find((x) => x.id === e.childId);
                const name = c ? fullName(c) : 'Child information unavailable';
                const deadline = policeDeadline(e.lastSeenAt);
                const minutesLeft = Math.ceil((deadline.getTime() - now.getTime()) / 60_000);
                const overdue = deadline.getTime() <= now.getTime();
                const urgent = minutesLeft <= 10;
                const acks = data.acks.filter((a) => a.emergencyId === e.id);
                const selected = current?.id === e.id;
                return (
                  <article key={e.id} className={`card ${styles.incidentCard} ${overdue ? styles.overdue : ''} ${selected ? styles.selected : ''}`}
                    aria-label={`Incident for ${name}`} aria-current={selected ? 'true' : undefined} data-testid={`incident-card-${e.childId}`}>
                    <div className="row between">
                      <h3 className={styles.childName}>{name}</h3>
                      {c?.bib != null && <span className="chip">Bib {c.bib}</span>}
                    </div>
                    <div className={styles.cardStatuses}>
                      <span className={`chip ${overdue || urgent ? 'danger' : ''}`} data-testid="incident-urgency">
                        {overdue ? 'Overdue · escalation action required' : urgent ? `Urgent · ${minutesLeft} min left` : `${minutesLeft} min to escalation`}
                      </span>
                      <span className={`chip ${acks.length ? 'ok' : 'warn'}`} data-testid="incident-ack-status">
                        {acks.length ? `Acknowledged · ${acks.length} ${acks.length === 1 ? 'patroller' : 'patrollers'}` : 'Unacknowledged'}
                      </span>
                    </div>
                    <dl className={styles.incidentFacts}>
                      <div><dt>Last seen</dt><dd>{e.lastSeenPlace} · <time dateTime={e.lastSeenAt}>{timeLabel(e.lastSeenAt)}</time></dd></div>
                      <div><dt>Reported by</dt><dd>{userName(data, e.reportedBy)}</dd></div>
                      <div><dt>Escalation deadline</dt><dd><time dateTime={deadline.toISOString()}>{timeLabel(deadline.toISOString())}</time></dd></div>
                    </dl>
                    {acks.length > 0 && <p className="small muted" data-testid="incident-responders">
                      Responding: {acks.map((a) => userName(data, a.patrollerId)).join(', ')}
                    </p>}
                    {selected ? (
                      <span className={styles.currentIndicator} data-testid={`viewing-incident-${e.childId}`}>Currently viewing</span>
                    ) : (
                      <button type="button" aria-label={`View search for ${name}`}
                        aria-controls={current ? 'patrol-incident-detail' : undefined}
                        data-testid={`open-incident-${e.childId}`} onClick={() => setOpenId(e.id)}>
                        View search
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
          {current ? <SearchScreen key={current.id} em={current} /> : (
            <div className={`card ${styles.selectPrompt}`}>
              <h2>Select an incident</h2>
              <p className="muted">Choose View search to see emergency details and record your response.</p>
            </div>
          )}
        </div>
      )}
      {closed.length > 0 && (
        <section className={`card ${styles.closedSearches}`} data-testid="closed-searches">
          <h2>Closed searches today</h2>
          <p className="small muted">Children’s details are no longer available once a search is closed.</p>
          {closedError && <div className="banner danger" data-testid="closed-error">{closedError}</div>}
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
                        <button type="button" onClick={() => markNoticeMailed(e.id).then(() => setClosedError(null), (err: Error) => setClosedError(err.message))}>To mail · mark done</button>
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
  const { data, me, now, acknowledge, shareWithPolice, markNoticeMailed, closeSearch, logAccess, guardianLink, medicalLink } = useStore();
  const child = data.children.find((c) => c.id === em.childId)!;
  const group = groupOfChild(data, child.id);
  const adults = adultsFor(data, child.id);
  const alerts = data.medical.filter((m) => m.childId === child.id);
  const consent = data.consents.find((c) => c.childId === child.id);
  const acks = data.acks.filter((a) => a.emergencyId === em.id);
  const iAcked = acks.some((a) => a.patrollerId === me!.id);
  const [closing, setClosing] = useState(false);
  const [outcome, setOutcome] = useState('Found safe');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Runs a save; the search stays on screen and shows the reason if it fails. */
  const save = async (work: () => Promise<void>) => {
    setSaving(true);
    setError(null);
    try {
      await work();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
    <div id="patrol-incident-detail" className={styles.detail} data-testid="search-screen">
      <div className="banner danger" style={{ fontSize: '1.1rem' }}>
        MISSING CHILD: {fullName(child)}, age {ageOn(child.birthDate, TODAY)} · missing {minsMissing} min
      </div>
      {error && <div className="banner danger" data-testid="search-save-error">{error}</div>}

      <section className={`card ${styles.responseControls}`} aria-label="Patrol acknowledgement">
        <div data-testid="acks">
          <h2>Patrol acknowledgement</h2>
          {acks.length === 0 ? <p className="muted">No patrollers have acknowledged yet.</p> : (
            <ul className={styles.acknowledgements}>
              {acks.map((a) => <li key={a.patrollerId}>{userName(data, a.patrollerId)} <span className="small muted">· {timeLabel(a.at)}</span></li>)}
            </ul>
          )}
        </div>
        {!iAcked && <button className="primary" type="button" disabled={saving} onClick={() => void save(() => acknowledge(em.id))} data-testid="acknowledge">I’m on it</button>}
      </section>

      <div className={styles.detailGrid}>
        <section className="card" aria-label="Child identification">
          <h2>Child identification</h2>
          <div className={styles.identification}>
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
          <h2>Escalation</h2>
          <h3>Call police by {deadline.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}</h3>
          <div className="big-number" style={{ color: minsLeft <= 10 ? 'var(--danger)' : undefined }}>
            {msLeft > 0 ? `${minsLeft} min left` : 'Call police now'}
          </div>
          <p className="small muted">60 minutes after last seen, or 4 p.m., whichever comes first. Call the family at the same time.</p>
          {!em.sharedWithPoliceAt ? (
            <button type="button" disabled={saving} onClick={() => void save(() => shareWithPolice(em.id))} data-testid="share-police">Record: details shared with police</button>
          ) : (
            <div className="stack">
              <div className="banner warn" data-testid="police-shared">Shared with police at {timeLabel(em.sharedWithPoliceAt)}</div>
              {!em.noticeMailed ? (
                <div className="row between card" style={{ margin: 0 }} data-testid="notice-todo">
                  <span>Mail a notice to the family (privacy law)</span>
                  <button type="button" disabled={saving} onClick={() => void save(() => markNoticeMailed(em.id))}>Mark done</button>
                </div>
              ) : (
                <span className="chip ok">Notice mailed</span>
              )}
            </div>
          )}
        </section>

        <section className="card" data-testid="search-medical">
          <h2>Medical alerts</h2>
          {medicalLink !== 'connected' && alerts.length === 0 ? <p className={medicalLink === 'offline' ? 'field-error' : 'muted'} data-testid="medical-not-loaded">{medicalLink === 'offline' ? 'Can’t load medical alerts. Call the family.' : 'Loading medical alerts…'}</p> : alerts.length === 0 ? <p className="muted">No medical alerts.</p> : alerts.map((a) => (
            <div key={a.id} style={{ marginBottom: 10 }}>
              <div className={`alert-line ${a.severity}`}>{a.shortAlert}</div>
              <p className="small" style={{ margin: '6px 0 0' }}>{a.details} Medication: {a.medicationLocation}.</p>
            </div>
          ))}
        </section>

        <section className="card" data-testid="search-contacts">
          {guardianLink === 'offline' && (
            <div className="banner danger" data-testid="guardians-stale">Can’t reach Peak Pals, so these contacts may be out of date.</div>
          )}
          <h2>Emergency contacts</h2>
          {adults.filter((x) => x.link.contactOrder).map(({ person, link }) => (
            <p key={link.id}>
              <strong>{link.contactOrder}. {person.name}</strong> ({link.relationship})<br />
              <a href={`tel:${person.phone}`}>{person.phone}</a>
              <br />
              <span className={`chip ${link.canPickUp ? 'ok' : ''}`}>{link.canPickUp ? 'Can pick up' : 'Not allowed to pick up'}</span>
            </p>
          ))}
          <h3>Other adults allowed to pick up</h3>
          <p className="small">{adults.filter((x) => x.link.canPickUp && !x.link.contactOrder).map((x) => `${x.person.name} (${x.link.relationship})`).join(', ') || 'No one else'}</p>
        </section>
      </div>

      <section className="card" aria-label="Search resolution">
        <h2>Resolve search</h2>
        <p className="small muted">Record the outcome when the search is complete.</p>
        {!closing ? (
          <button type="button" onClick={() => setClosing(true)} data-testid="close-search">Close search</button>
        ) : (
          <form
            className={styles.closureForm}
            onSubmit={(e) => {
              e.preventDefault();
              void save(() => closeSearch(em.id, outcome));
            }}
          >
            <label htmlFor="outcome" style={{ margin: 0 }}>Outcome</label>
            <select id="outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} data-testid="close-outcome">
              <option>Found safe</option>
              <option>Found, needed first aid</option>
              <option>Handed over to police</option>
              <option>False alarm</option>
            </select>
            <button className="primary" type="submit" disabled={saving} data-testid="close-confirm">Close search</button>
            <button className="ghost" type="button" onClick={() => setClosing(false)}>Cancel</button>
          </form>
        )}
      </section>
    </div>
  );
}
