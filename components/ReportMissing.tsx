'use client';

import { useState } from 'react';
import { fullName, hhmm, lastSeenTimeChoices, openSearchFor } from '@/lib/access';
import type { Child } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

/** One-step "report missing" sheet, used by instructors, the desk and the administrator. */
export function ReportMissing({ child, onClose, limitToSystemTime = false }: { child: Child; onClose: () => void; limitToSystemTime?: boolean }) {
  const { now, reportMissing, data } = useStore();
  // Instructors pick from a list holding only allowed times: now, back to 8:30 a.m.
  // The list is fixed when the form opens, so the chosen time can't drop out of it.
  // The desk and administrator still use the preview's demo clock, with no limit.
  const [timeChoices] = useState(() => (limitToSystemTime ? lastSeenTimeChoices(new Date()) : []));
  const [place, setPlace] = useState('');
  const [time, setTime] = useState(limitToSystemTime ? (timeChoices[0]?.value ?? '') : hhmm(now));
  const [done, setDone] = useState(false);
  const already = openSearchFor(data, child.id);
  const timeProblem = limitToSystemTime && timeChoices.length === 0;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="rm-title" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} data-testid="report-missing-sheet">
        {done || already ? (
          <>
            <div className="banner danger" data-testid="report-missing-sent">Ski patrol has been alerted.</div>
            <p>Stay where {child.firstName} was last seen if you can, and keep your radio on.</p>
            <button className="big primary" type="button" onClick={onClose}>OK</button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!place.trim() || timeProblem) return;
              reportMissing(child.id, place.trim(), time, limitToSystemTime);
              setDone(true);
            }}
          >
            <h2 id="rm-title">Report {fullName(child)} missing</h2>
            <p className="small muted">Every patroller is alerted the moment you send this.</p>
            <div className="field">
              <label htmlFor="rm-place">Where were they last seen?</label>
              <input id="rm-place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Top of the Pigeon chair" autoFocus data-testid="report-missing-place" />
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
                <input id="rm-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} data-testid="report-missing-time" />
              )}
              {timeProblem && <div className="field-error" data-testid="report-missing-time-error">Check-in starts at 8:30 a.m., so there are no times to pick yet.</div>}
            </div>
            <button className="big danger" type="submit" disabled={!place.trim() || timeProblem} data-testid="report-missing-send">Alert ski patrol now</button>
            <button className="ghost" type="button" onClick={onClose} style={{ width: '100%', marginTop: 8 }}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}
