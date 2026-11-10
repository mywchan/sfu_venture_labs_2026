import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { calculateIncidentDeadline, validateIncidentReport } from '../../lib/server/incidents/validation.ts';

const now = '2026-12-12T22:00:00Z';
const report = {
  childId: 'c-owen', lessonDayId: 'day-2026-12-12',
  lastSeenPlace: ' Top of the Pigeon chair ', lastSeenAt: '2026-12-12T13:40:00-08:00',
};

test('normalizes a fictional report without requiring identifying details', () => {
  const result = validateIncidentReport(report, now);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('Expected valid report');
  assert.deepEqual(result.value, {
    ...report, lastSeenPlace: 'Top of the Pigeon chair', lastSeenAt: '2026-12-12T21:40:00.000Z',
    jacket: null, pants: null, helmet: null, bib: null, identifyingDetails: null,
  });
});

test('accepts clothing, bib and notes and normalizes blank details to unknown', () => {
  const result = validateIncidentReport({ ...report, jacket: ' red ', pants: '', helmet: null,
    bib: 101, identifyingDetails: ' Blue backpack ' }, now);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.jacket, 'red');
    assert.equal(result.value.pants, null);
    assert.equal(result.value.bib, 101);
    assert.equal(result.value.identifyingDetails, 'Blue backpack');
  }
});

for (const input of [null, [], 'report', 1]) {
  test(`rejects a non-object report: ${JSON.stringify(input)}`, () => {
    assert.equal(validateIncidentReport(input, now).ok, false);
  });
}

for (const field of ['childId', 'lessonDayId', 'lastSeenPlace'] as const) {
  test(`requires ${field}`, () => {
    const result = validateIncidentReport({ ...report, [field]: ' ' }, now);
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.some(e => e.field === field && e.code === 'required'));
  });
}

for (const timestamp of ['', '13:40', '2026-12-12T13:40:00', '2026-02-30T13:40:00Z',
  '2026-12-12T24:00:00Z', '2026-12-12T13:40:00+14:30', '2026-12-12T13:60:00Z']) {
  test(`rejects invalid or ambiguous timestamp: ${timestamp}`, () => {
    assert.equal(validateIncidentReport({ ...report, lastSeenAt: timestamp }, now).ok, false);
  });
}

test('rejects future last seen but accepts server time equality and old overdue reports', () => {
  const future = validateIncidentReport({ ...report, lastSeenAt: '2026-12-12T22:00:01Z' }, now);
  assert.equal(future.ok, false);
  if (!future.ok) assert.ok(future.errors.some(e => e.code === 'future'));
  assert.equal(validateIncidentReport({ ...report, lastSeenAt: now }, now).ok, true);
  assert.equal(validateIncidentReport({ ...report, lastSeenAt: '2026-12-11T20:00:00Z' }, now).ok, true);
});

for (const field of ['reportedBy', 'role', 'reportedAt', 'deadlineAt', 'status', 'acknowledgements']) {
  test(`rejects client-supplied trusted field: ${field}`, () => {
    const result = validateIncidentReport({ ...report, [field]: 'forged' }, now);
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.some(e => e.code === 'unexpected'));
  });
}

test('rejects wrong types, excessive text and invalid bibs', () => {
  for (const patch of [{ jacket: 2 }, { lastSeenPlace: 'x'.repeat(301) },
    { identifyingDetails: 'x'.repeat(1001) }, { bib: -1 }, { bib: 1.5 }, { bib: '101' }, { bib: NaN }]) {
    assert.equal(validateIncidentReport({ ...report, ...patch }, now).ok, false);
  }
});

const deadlines = [
  ['winter hour limit', '2026-12-12T13:40:00-08:00', '2026-12-12T22:40:00.000Z'],
  ['winter closing limit', '2026-12-12T15:40:00-08:00', '2026-12-13T00:00:00.000Z'],
  ['summer closing limit', '2025-07-12T15:40:00-07:00', '2025-07-12T23:00:00.000Z'],
  ['after closing', '2026-12-12T16:20:00-08:00', '2026-12-13T00:00:00.000Z'],
  ['UTC date differs from Vancouver', '2026-12-13T00:20:00Z', '2026-12-13T00:00:00.000Z'],
  ['spring forward elapsed hour', '2025-03-09T01:30:00-08:00', '2025-03-09T10:30:00.000Z'],
  ['fall back first repeated hour', '2025-11-02T01:30:00-07:00', '2025-11-02T09:30:00.000Z'],
  ['fall back second repeated hour', '2025-11-02T01:30:00-08:00', '2025-11-02T10:30:00.000Z'],
  ['spring transition closing', '2025-03-09T15:30:00-07:00', '2025-03-09T23:00:00.000Z'],
  ['fall transition closing', '2025-11-02T15:30:00-08:00', '2025-11-03T00:00:00.000Z'],
] as const;
for (const [name, seen, expected] of deadlines) {
  test(`deadline: ${name}`, () => {
    assert.equal(calculateIncidentDeadline(seen, now).deadlineAt, expected);
  });
}

test('overdue begins exactly at the deadline and never moves an old deadline forward', () => {
  const seen = report.lastSeenAt;
  assert.equal(calculateIncidentDeadline(seen, '2026-12-12T22:39:59Z').isOverdue, false);
  assert.equal(calculateIncidentDeadline(seen, '2026-12-12T22:40:00Z').isOverdue, true);
  assert.deepEqual(calculateIncidentDeadline(seen, '2026-12-14T10:00:00Z'), {
    deadlineAt: '2026-12-12T22:40:00.000Z', isOverdue: true,
  });
});

test('invalid trusted server time fails explicitly', () => {
  assert.throws(() => validateIncidentReport(report, 'bad clock'), RangeError);
  assert.throws(() => calculateIncidentDeadline(report.lastSeenAt, 'bad clock'), RangeError);
  assert.throws(() => calculateIncidentDeadline('bad time', now), RangeError);
});
