'use client';

import { useState } from 'react';
import { fullName, openSearchFor } from '@/lib/access';
import type { Child } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

/** One-step "report missing" sheet, used by instructors, the desk and the administrator. */
export function ReportMissing({ child, onClose }: { child: Child; onClose: () => void }) {
  const { now, reportMissing, data } = useStore();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const [place, setPlace] = useState('');
  const [time, setTime] = useState(`${hh}:${mm}`);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ place?: string; time?: string }>({});
  const already = openSearchFor(data, child.id);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="rm-title" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} data-testid="report-missing-sheet">
        {done || already ? (
          <>
            <h2 id="rm-title">Missing-child report</h2>
            <div className="banner warn" role="status" data-testid="report-missing-sent">Report recorded in this preview. Check the patrol dashboard for acknowledgement.</div>
            <p>Stay where {child.firstName} was last seen if you can, and keep your radio on.</p>
            <button className="big primary" type="button" onClick={onClose}>OK</button>
          </>
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const next: typeof errors = {};
              if (!place.trim()) next.place = 'Enter where the child was last seen.';
              if (!time) next.time = 'Enter the last-seen time.';
              else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) next.time = 'Enter a valid time in hours and minutes.';
              else if (Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) > now.getHours() * 60 + now.getMinutes()) {
                next.time = 'Last-seen time cannot be later than the preview clock.';
              }
              setErrors(next);
              if (next.place || next.time) {
                document.getElementById(next.place ? 'rm-place' : 'rm-time')?.focus();
                return;
              }
              reportMissing(child.id, place.trim(), time);
              setDone(true);
            }}
          >
            <h2 id="rm-title">Report {fullName(child)} missing</h2>
            <p className="small muted">This preview records the report in this tab only. No real alert is sent. Use your radio for a real emergency.</p>
            <div className="field">
              <label htmlFor="rm-place">Where were they last seen?</label>
              <input id="rm-place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Top of the Pigeon chair" autoFocus required aria-invalid={!!errors.place} aria-describedby={errors.place ? 'rm-place-error' : undefined} data-testid="report-missing-place" />
              {errors.place && <div id="rm-place-error" className="field-error" role="alert">{errors.place}</div>}
            </div>
            <div className="field">
              <label htmlFor="rm-time">When?</label>
              <input id="rm-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required aria-invalid={!!errors.time} aria-describedby={errors.time ? 'rm-time-hint rm-time-error' : 'rm-time-hint'} data-testid="report-missing-time" />
              <div id="rm-time-hint" className="small muted">Use today's preview time, shown in the header.</div>
              {errors.time && <div id="rm-time-error" className="field-error" role="alert" data-testid="report-missing-time-error">{errors.time}</div>}
            </div>
            <button className="big danger" type="submit" data-testid="report-missing-send">Record missing-child report</button>
            <button className="ghost" type="button" onClick={onClose} style={{ width: '100%', marginTop: 8 }}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}
