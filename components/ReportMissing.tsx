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
  const already = openSearchFor(data, child.id);

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
              if (!place.trim()) return;
              reportMissing(child.id, place.trim(), time);
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
              <input id="rm-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} data-testid="report-missing-time" />
            </div>
            <button className="big danger" type="submit" disabled={!place.trim()} data-testid="report-missing-send">Alert ski patrol now</button>
            <button className="ghost" type="button" onClick={onClose} style={{ width: '100%', marginTop: 8 }}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}
