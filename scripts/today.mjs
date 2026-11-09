// Shows today's check-ins and the emergency log, straight from Piezas.
//   npm run data:today
//   npm run data:reset-today   (permanently deletes the preview day's records, for re-testing)
import { Piezas } from '@piezas/sdk';

const LESSON_DAY = 'day-2026-12-12'; // the preview's made-up day; other days are never touched
const reset = process.argv[2] === 'reset';
const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY });
const t = { type: 'text' };
const required = { type: 'text', required: true };

// Keep these fields in step with lib/server/today.ts.
const { kk_attendance: attendance, kk_pickup_refusal: refusal, kk_emergency: emergency, kk_patrol_ack: ack } = await piezas.defineEntities(
  {
    kk_attendance: {
      fields: { childId: required, lessonDayId: required, checkInAt: t, checkedInBy: t, jacket: t, pants: t, helmet: t, clothingFixedBy: t, clothingFixedAt: t, pickupAt: t, pickedUpBy: t, pickedUpName: t, releasedBy: t },
    },
    kk_pickup_refusal: { fields: { childId: required, lessonDayId: required, nameGiven: required, at: required, staffId: required } },
    kk_emergency: {
      fields: {
        childId: required, lessonDayId: required, reportedBy: required, reportedAt: required, lastSeenPlace: required, lastSeenAt: required,
        jacket: t, pants: t, helmet: t, status: required, sharedWithPoliceAt: t, sharedWithPoliceBy: t, noticeMailed: { type: 'boolean' }, closedAt: t, closedBy: t, outcome: t,
      },
    },
    kk_patrol_ack: { fields: { emergencyId: required, patrollerId: required, at: required } },
  },
  { onDrift: 'ignore' },
);

async function listAll(entity, filter) {
  const all = [];
  for (let offset = 0; ; offset += 100) {
    const page = await entity.list({ limit: 100, offset, filter });
    all.push(...page.data);
    if (page.data.length < 100) return all;
  }
}

const day = { lessonDayId: LESSON_DAY };
const [attendanceRows, refusalRows, emergencyRows, ackRows] = await Promise.all([listAll(attendance, day), listAll(refusal, day), listAll(emergency, day), listAll(ack, {})]);
const emergencyIds = new Set(emergencyRows.map((e) => e.id));
const dayAcks = ackRows.filter((a) => emergencyIds.has(a.data.emergencyId));

if (reset) {
  for (const [entity, rows] of [[attendance, attendanceRows], [refusal, refusalRows], [ack, dayAcks], [emergency, emergencyRows]]) {
    for (const row of rows) await entity.delete(row.id);
  }
  console.log(`\nCleared the preview day: ${attendanceRows.length} check-ins, ${refusalRows.length} refused pickups, ${emergencyRows.length} searches, ${dayAcks.length} acknowledgements.\n`);
  process.exit(0);
}

console.log(`\nCheck-ins and pickups saved in Piezas: ${attendanceRows.length}`);
if (attendanceRows.length) {
  console.table(attendanceRows.map(({ data: d }) => ({ child: d.childId, 'checked in': d.checkInAt?.slice(11, 16) ?? '', by: d.checkedInBy ?? '', jacket: d.jacket, pants: d.pants, helmet: d.helmet, 'went home': d.pickupAt?.slice(11, 16) ?? '', with: d.pickedUpName ?? '', released: d.releasedBy ?? '' })));
}
console.log(`\nRefused pickups saved in Piezas: ${refusalRows.length}`);
if (refusalRows.length) console.table(refusalRows.map(({ data: d }) => ({ child: d.childId, 'name given': d.nameGiven, at: d.at.slice(11, 16), staff: d.staffId })));
console.log(`\nEmergency log saved in Piezas: ${emergencyRows.length}`);
if (emergencyRows.length) {
  console.table(emergencyRows.map((e) => ({ child: e.data.childId, status: e.data.status, 'reported by': e.data.reportedBy, 'last seen': e.data.lastSeenPlace, at: e.data.lastSeenAt.slice(11, 16), 'on it': dayAcks.filter((a) => a.data.emergencyId === e.id).map((a) => a.data.patrollerId).join(', '), outcome: e.data.outcome ?? '', saved: e.updatedAt })));
}
console.log('');
