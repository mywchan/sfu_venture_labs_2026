'use client';

import { useState } from 'react';
import { fullName, hhmm, lastSeenTimeChoices, openSearchFor } from '@/lib/access';
import type { Child } from '@/lib/seed/data';
import { useStore } from '@/lib/store';
import { useOnline } from '@/components/OfflineCopy';

/** One-step "report missing" sheet, used by instructors, the desk and the administrator. */
export function ReportMissing({ child, onClose, limitToSystemTime = false }: { child: Child; onClose: () => void; limitToSystemTime?: boolean }) {
  const { now, reportMissing, data } = useStore();
  const online = useOnline();
  // Instructors pick from a list holding only allowed times: now, back to 8:30 a.m.
  // The list is fixed when the form opens, so the chosen time can't drop out of it.
  const [timeChoices] = useState(() => (limitToSystemTime ? lastSeenTimeChoices(new Date()) : []));
  const [place, setPlace] = useState('');
  const [time, setTime] = useState(limitToSystemTime ? (timeChoices[0]?.value ?? '') : hhmm(now));
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ place?: string; time?: string }>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const already = openSearchFor(data, child.id);
  const timeProblem = limitToSystemTime && timeChoices.length === 0;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="rm-title" onClick={onClose}>
      <div className={done || already ? 'sheet sent' : 'sheet'} onClick={(e) => e.stopPropagation()} data-testid="report-missing-sheet">
        {(done || already) && <div className="sent-strip" aria-hidden="true">Sent</div>}
        {!online && <p className="banner danger" role="alert" data-testid="report-missing-offline">You are offline. No report can be sent or queued. Use your radio or the established emergency procedure now.</p>}
        {done || already ? (
          <>
            <h2 id="rm-title">Missing-child report</h2>
            <div className="banner ok" role="status" data-testid="report-missing-sent">Report saved and ski patrol alerted in the portal. Watch for their acknowledgement.</div>
            <p>Stay where {child.firstName} was last seen if you can, and keep your radio on.</p>
            <button className="big white" type="button" onClick={onClose}>OK</button>
          </>
        ) : (
          <form
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              if (!online || !navigator.onLine || sending || timeProblem) return;
              const next: typeof errors = {};
              if (!place.trim()) next.place = 'Enter where the child was last seen.';
              if (!time) next.time = 'Enter the last-seen time.';
              else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) next.time = 'Enter a valid time in hours and minutes.';
              else if (Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) > now.getHours() * 60 + now.getMinutes()) {
                next.time = 'Last-seen time cannot be later than the current time.';
              }
              setErrors(next);
              if (next.place || next.time) {
                document.getElementById(next.place ? 'rm-place' : 'rm-time')?.focus();
                return;
              }
              setSending(true);
              setError(null);
              try {
                await reportMissing(child.id, place.trim(), time);
                setDone(true); // only say patrol was alerted once it's really saved
              } catch (err) {
                setError(err instanceof Error ? err.message : 'That didn’t save.');
              } finally {
                setSending(false);
              }
            }}
          >
            <h2 id="rm-title">Report {fullName(child)} missing</h2>
            <p><span className="chip outline">{fullName(child)} · Bib {child.bib}</span></p>
            <p className="small muted">Patrol is alerted in the portal only, so use your radio as well in a real emergency.</p>
            <div className="field">
              <label htmlFor="rm-place">Where were they last seen?</label>
              <input id="rm-place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Top of the Pigeon chair" autoFocus required aria-invalid={!!errors.place} aria-describedby={errors.place ? 'rm-place-error' : undefined} data-testid="report-missing-place" />
              {errors.place && <div id="rm-place-error" className="field-error" role="alert">{errors.place}</div>}
            </div>
            <div className="field">
              <label htmlFor="rm-time">When?</label>
              {limitToSystemTime ? (
                <select id="rm-time" value={time} onChange={(e) => setTime(e.target.value)} disabled={timeProblem} data-testid="report-missing-time">
                  {timeChoices.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              ) : (
                <input id="rm-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required aria-invalid={!!errors.time} aria-describedby={errors.time ? 'rm-time-error' : undefined} data-testid="report-missing-time" />
              )}
              {timeProblem && <div className="field-error" data-testid="report-missing-time-error">Check-in starts at 8:30 a.m., so there are no times to pick yet.</div>}
              {errors.time && <div id="rm-time-error" className="field-error" role="alert" data-testid="report-missing-time-error">{errors.time}</div>}
            </div>
            {error && (
              <div className="banner danger" data-testid="report-missing-error">
                Ski patrol has NOT been alerted. Radio patrol now, then try again. ({error})
              </div>
            )}
            <button className="big danger" type="submit" disabled={!online || sending || timeProblem} data-testid="report-missing-send">{sending ? 'Alerting…' : 'Alert ski patrol now'}</button>
            <button type="button" onClick={onClose} style={{ width: '100%', marginTop: 8 }}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}
