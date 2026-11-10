'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Shell } from '@/components/Shell';
import { adultsFor, ageOn, fullName, groupOfChild, policeDeadline, timeLabel, userName } from '@/lib/access';
import { TODAY, type Emergency } from '@/lib/seed/data';
import { useStore } from '@/lib/store';
import styles from './patrol.module.css';

// Validate before using the existing deadline rule; never invent a replacement time.
function incidentDeadline(value: unknown, now: Date): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)) return null;
  const seen = new Date(value).getTime();
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!Number.isFinite(seen) || seen > now.getTime() || month < 1 || month > 12 ||
      day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate() ||
      Number(value.slice(11, 13)) > 23 || Number(value.slice(14, 16)) > 59 || Number(value.slice(17, 19)) > 59) return null;
  const deadline = policeDeadline(value);
  return Number.isFinite(deadline.getTime()) ? deadline : null;
}

const recordedTime = (value: string | null) =>
  value && Number.isFinite(new Date(value).getTime()) ? timeLabel(value) : 'Time unavailable';

function countdown(ms: number) {
  const seconds = Math.ceil(Math.abs(ms) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Recorded facts only. Closed searches never expose last-seen/identifying details. */
function IncidentActivity({ em }: { em: Emergency }) {
  const { data, now } = useStore();
  const events: { id: string; label: string; at: string | null; detail?: string }[] = [];
  if (em.status === 'open') events.push({ id: 'seen', label: 'Last seen',
    at: incidentDeadline(em.lastSeenAt, now) ? em.lastSeenAt : null, detail: em.lastSeenPlace });
  data.acks.filter((a) => a.emergencyId === em.id).forEach((a, i) => {
    events.push({ id: `ack-${i}`, label: `Patrol acknowledged · ${userName(data, a.patrollerId)}`, at: a.at });
  });
  if (em.sharedWithPoliceAt) events.push({ id: 'police', label: 'Police disclosure recorded', at: em.sharedWithPoliceAt });
  if (em.status === 'closed') events.push({ id: 'closed', label: 'Search closed', at: em.closedAt, detail: em.outcome ?? 'Outcome not recorded' });
  const order = (at: string | null) => at && Number.isFinite(Date.parse(at)) ? Date.parse(at) : Number.MAX_SAFE_INTEGER;
  events.sort((a, b) => order(a.at) - order(b.at));
  return (
    <ol className={styles.timeline} aria-label="Recorded incident activity" data-testid="incident-timeline">
      {events.map((event) => (
        <li key={event.id}>
          <span className={styles.eventTime}>{event.at && Number.isFinite(Date.parse(event.at)) ? <time dateTime={event.at}>{recordedTime(event.at)}</time> : 'Time unavailable'}</span>
          <div><strong>{event.label}</strong>{event.detail && <p className="small muted">{event.detail}</p>}</div>
        </li>
      ))}
    </ol>
  );
}

export default function PatrolHome() {
  return (
    <Shell role="patrol">
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <Patrol />
      </Suspense>
    </Shell>
  );
}

function Patrol() {
  const { data, now, markNoticeMailed } = useStore();
  const [closedError, setClosedError] = useState<string | null>(null);
  const open = data.emergencies.filter((e) => e.status === 'open')
    .sort((a, b) => (incidentDeadline(a.lastSeenAt, now)?.getTime() ?? 0) - (incidentDeadline(b.lastSeenAt, now)?.getTime() ?? 0));
  const closed = data.emergencies.filter((e) => e.status === 'closed');
  const [openId, setOpenId] = useState<string | null>(null);
  // A notification opens straight to the search it's about.
  const fromNotification = useSearchParams().get('search');
  useEffect(() => {
    if (fromNotification) setOpenId(fromNotification);
  }, [fromNotification]);
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
              <span className="small muted">Unknown times first for verification, then earliest escalation deadline</span>
            </div>
            <div className={styles.incidentGrid}>
              {open.map((e) => {
                const c = data.children.find((x) => x.id === e.childId);
                const name = c ? fullName(c) : 'Child information unavailable';
                const deadline = incidentDeadline(e.lastSeenAt, now);
                const minutesLeft = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / 60_000) : Infinity;
                const overdue = !!deadline && deadline.getTime() <= now.getTime();
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
                        {!deadline ? 'Time unavailable — verify last seen' : overdue ? 'Overdue · escalation action required' : urgent ? `Urgent · ${minutesLeft} min left` : `${minutesLeft} min to escalation`}
                      </span>
                      <span className={`chip ${acks.length ? 'ok' : 'warn'}`} data-testid="incident-ack-status">
                        {acks.length ? `Acknowledged · ${acks.length} ${acks.length === 1 ? 'patroller' : 'patrollers'}` : 'Unacknowledged'}
                      </span>
                    </div>
                    <dl className={styles.incidentFacts}>
                      <div><dt>Last seen</dt><dd>{e.lastSeenPlace} · {deadline ? <time dateTime={e.lastSeenAt}>{timeLabel(e.lastSeenAt)}</time> : 'Time unavailable'}</dd></div>
                      <div><dt>Reported by</dt><dd>{userName(data, e.reportedBy)}</dd></div>
                      <div><dt>Escalation deadline</dt><dd>{deadline ? <time dateTime={deadline.toISOString()}>{timeLabel(deadline.toISOString())}</time> : 'Time unavailable — verify last seen'}</dd></div>
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
            <thead><tr><th>Child</th><th>Closed</th><th>Outcome</th><th>Notice to family</th><th>Activity</th></tr></thead>
            <tbody>
              {closed.map((e) => {
                const c = data.children.find((x) => x.id === e.childId)!;
                return (
                  <tr key={e.id}>
                    <td>{c.firstName} {c.lastName.charAt(0)}.</td>
                    <td>{recordedTime(e.closedAt)}</td>
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
                    <td><details><summary>Recorded activity</summary><IncidentActivity em={e} /></details></td>
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
  const { data, me, now, acknowledge, shareWithPolice, markNoticeMailed, closeSearch, logAccess, guardianLink } = useStore();
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

  const deadline = incidentDeadline(em.lastSeenAt, now);
  const msLeft = deadline ? deadline.getTime() - now.getTime() : NaN;
  const minsLeft = Math.ceil(msLeft / 60_000);
  const minsMissing = deadline ? Math.max(0, Math.floor((now.getTime() - new Date(em.lastSeenAt).getTime()) / 60_000)) : null;

  return (
    <div id="patrol-incident-detail" className={styles.detail} data-testid="search-screen">
      <div className="banner danger" style={{ fontSize: '1.1rem' }}>
        MISSING CHILD: {fullName(child)}, age {ageOn(child.birthDate, TODAY)} · {minsMissing === null ? 'last-seen time needs verification' : `missing ${minsMissing} min`}
      </div>
      {error && <div className="banner danger" data-testid="search-save-error">{error}</div>}

        <section className={`card ${styles.snapshot}`} aria-label="Safety Snapshot" data-testid="safety-snapshot">
          <div className={styles.snapshotHeading}>
            <div><h2>Safety Snapshot</h2><p className={styles.snapshotName}>{fullName(child)} <span className="chip">Bib {child.bib}</span></p></div>
            <span className={`chip ${acks.length ? 'ok' : 'warn'}`} data-testid="snapshot-response-status">{acks.length ? 'Patrol acknowledged' : 'Reported · awaiting acknowledgement'}</span>
          </div>
          <div className={styles.lastKnown} data-testid="search-last-seen">
            <h3>Last-known location</h3>
            <p><strong>{em.lastSeenPlace || 'Location not recorded'}</strong></p>
            <p className="small">Last seen: {deadline ? <time dateTime={em.lastSeenAt}>{timeLabel(em.lastSeenAt)}</time> : 'Time unavailable — verify last seen'}</p>
          </div>
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
          <p className="small muted" data-testid="snapshot-distinguishing">Distinguishing details: Not recorded in this preview.</p>
          <p className="small muted">Reported by {userName(data, em.reportedBy)}</p>
          <h3>Group</h3>
          <p data-testid="search-group">{group ? `${group.name} · instructor ${userName(data, group.instructorId)}` : 'No group'}</p>
          <div className={styles.snapshotDeadline}>
            <span>Escalation deadline: <strong>{deadline ? timeLabel(deadline.toISOString()) : 'Time unavailable — verify last seen'}</strong></span>
            <span className={`chip ${!deadline || minsLeft <= 10 ? 'danger' : ''}`} data-testid="snapshot-urgency">{!deadline ? 'Verify timing now' : msLeft <= 0 ? 'Overdue · action required' : minsLeft <= 10 ? 'Urgent · action due soon' : `${minsLeft} min remaining`}</span>
          </div>
        </section>

      <section className={`card ${styles.responseControls}`} aria-label="Patrol acknowledgement">
        <div data-testid="acks">
          <h2>Patrol acknowledgement</h2>
          {acks.length === 0 ? <p className="muted">No patrollers have acknowledged yet.</p> : (
            <ul className={styles.acknowledgements}>
              {acks.map((a) => <li key={a.patrollerId}>{userName(data, a.patrollerId)} <span className="small muted">· {recordedTime(a.at)}</span></li>)}
            </ul>
          )}
        </div>
        {!iAcked && <button className="primary" type="button" disabled={saving} onClick={() => void save(() => acknowledge(em.id))} data-testid="acknowledge">I’m on it</button>}
      </section>

      <div className={styles.detailGrid}>
        <section className="card" data-testid="search-countdown">
          <h2>Escalation</h2>
          <h3>{deadline ? `Call police by ${timeLabel(deadline.toISOString())}` : 'Time unavailable — verify last seen'}</h3>
          <div className="big-number" role="timer" aria-label="Time to escalation deadline" data-testid="escalation-timer" style={{ color: minsLeft <= 10 ? 'var(--danger)' : undefined }}>
            {!deadline ? 'Verify escalation timing now' : msLeft > 0 ? `${countdown(msLeft)} remaining` : `Overdue by ${countdown(msLeft)}`}
          </div>
          {deadline && msLeft <= 0 && <p className="field-error">Call police now and contact the family. These are human actions; the app does not make calls.</p>}
          <p className="small muted">60 minutes after last seen, or 4 p.m., whichever comes first. Call the family at the same time.</p>
          {!em.sharedWithPoliceAt ? (
            <button type="button" disabled={saving} onClick={() => void save(() => shareWithPolice(em.id))} data-testid="share-police">Record: details shared with police</button>
          ) : (
            <div className="stack">
              <div className="banner warn" data-testid="police-shared">Shared with police at {recordedTime(em.sharedWithPoliceAt)}</div>
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
          {alerts.length === 0 ? <p className="muted">No medical alerts.</p> : alerts.map((a) => (
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

      <section className="card" aria-label="Incident activity">
        <h2>Recorded activity</h2>
        <p className="small muted">Recorded events only. Acknowledgement does not confirm notification delivery or when a search started.</p>
        <IncidentActivity em={em} />
      </section>

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
