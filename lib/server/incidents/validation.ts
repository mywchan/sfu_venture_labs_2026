import type {
  IncidentDeadline, IncidentValidationError, IncidentValidationResult,
  ReportIncidentInput,
} from '../../contracts/incidents';

const VANCOUVER = 'America/Vancouver';
const localParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: VANCOUVER, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

/** Reject timezone-less values and impossible dates rather than Date.parse rollover. */
function instant(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi, s, , zone] = match;
  const year = Number(y), month = Number(mo), day = Number(d);
  if (year < 1000 || month < 1 || month > 12 || day < 1 ||
      day > new Date(Date.UTC(year, month, 0)).getUTCDate() ||
      Number(h) > 23 || Number(mi) > 59 || Number(s) > 59) return null;
  if (zone !== 'Z') {
    const hours = Number(zone.slice(1, 3)), minutes = Number(zone.slice(4, 6));
    if (hours > 14 || minutes > 59 || (hours === 14 && minutes !== 0)) return null;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function wallTime(ms: number): number {
  const parts = Object.fromEntries(localParts.formatToParts(ms).map(p => [p.type, p.value]));
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second));
}

function fourPm(seen: number): number {
  const date = new Date(wallTime(seen));
  const target = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 16);
  // Resolve the offset at the deadline, not at last seen: a clock change can
  // occur between them. 16:00 is outside Vancouver's repeated/skipped hours.
  let candidate = target;
  for (let i = 0; i < 4; i++) {
    const delta = target - wallTime(candidate);
    if (delta === 0) return candidate;
    candidate += delta;
  }
  throw new RangeError('Unable to resolve Vancouver deadline.');
}

/** Uses supplied server time only. Due at the exact deadline counts as overdue. */
export function calculateIncidentDeadline(lastSeenAt: string, serverNow: string): IncidentDeadline {
  const seen = instant(lastSeenAt), now = instant(serverNow);
  if (seen === null || now === null) throw new RangeError('Explicit-offset timestamps are required.');
  const deadline = Math.min(seen + 60 * 60_000, fourPm(seen));
  return { deadlineAt: new Date(deadline).toISOString(), isOverdue: now >= deadline };
}

/** Input validation only. Does not establish identity, ownership or authorization. */
export function validateIncidentReport(input: unknown, serverNow: string): IncidentValidationResult {
  const now = instant(serverNow);
  if (now === null) throw new RangeError('A valid server timestamp is required.');
  const errors: IncidentValidationError[] = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, errors: [{ field: '$', code: 'invalid', message: 'Enter a report.' }] };
  }
  const row = input as Record<string, unknown>;
  const allowed = new Set(['childId', 'lessonDayId', 'lastSeenPlace', 'lastSeenAt',
    'jacket', 'pants', 'helmet', 'bib', 'identifyingDetails']);
  if (Object.keys(row).some(key => !allowed.has(key))) {
    errors.push({ field: '$', code: 'unexpected', message: 'The report contains unsupported fields.' });
  }
  function text(field: keyof ReportIncidentInput, limit: number, required = false): string | null {
    const raw = row[field];
    if (raw === undefined || raw === null || (typeof raw === 'string' && !raw.trim())) {
      if (required) errors.push({ field, code: 'required', message: 'This field is required.' });
      return null;
    }
    if (typeof raw !== 'string') {
      errors.push({ field, code: 'invalid', message: 'Enter text.' });
      return null;
    }
    const value = raw.trim();
    if (value.length > limit) errors.push({ field, code: 'too_long', message: `Use ${limit} characters or fewer.` });
    return value;
  }
  const childId = text('childId', 128, true);
  const lessonDayId = text('lessonDayId', 128, true);
  const lastSeenPlace = text('lastSeenPlace', 300, true);
  const seen = instant(row.lastSeenAt);
  if (seen === null) errors.push({ field: 'lastSeenAt', code: 'invalid', message: 'Enter a date and time with a timezone offset.' });
  else if (seen > now) errors.push({ field: 'lastSeenAt', code: 'future', message: 'Last seen cannot be in the future.' });
  const jacket = text('jacket', 100), pants = text('pants', 100), helmet = text('helmet', 100);
  const identifyingDetails = text('identifyingDetails', 1000);
  const bib = row.bib ?? null;
  if (bib !== null && (typeof bib !== 'number' || !Number.isSafeInteger(bib) || bib < 1)) {
    errors.push({ field: 'bib', code: 'invalid', message: 'Enter a positive whole bib number or leave it unknown.' });
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: {
    childId: childId!, lessonDayId: lessonDayId!, lastSeenPlace: lastSeenPlace!,
    lastSeenAt: new Date(seen!).toISOString(), jacket, pants, helmet,
    bib: bib as number | null, identifyingDetails,
  } };
}
