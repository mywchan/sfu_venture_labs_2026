// Shows the medical alerts and consent forms saved in Piezas.
//   npm run data:medical
//   npm run data:reset-medical   (permanently deletes them, for re-testing with made-up children)
import { Piezas } from '@piezas/sdk';

const reset = process.argv[2] === 'reset';
const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY });
const required = { type: 'text', required: true };
// Keep these fields in step with lib/server/medical.ts.
const { kk_medical_alert: alert, kk_medical_answer: answer, kk_consent: consent } = await piezas.defineEntities(
  {
    kk_medical_alert: { fields: { childId: required, shortAlert: required, details: { type: 'text' }, medicationLocation: required, severity: required, seedId: { type: 'text' } } },
    kk_medical_answer: { fields: { childId: required, noMedicalConditions: { type: 'boolean', required: true } } },
    kk_consent: { fields: { childId: required, signedBy: required, signedDate: required, photoConsent: { type: 'boolean', required: true }, signedByUserId: required } },
  },
  { onDrift: 'ignore' },
);

async function listAll(entity) {
  const all = [];
  for (let offset = 0; ; offset += 100) {
    const page = await entity.list({ limit: 100, offset });
    all.push(...page.data);
    if (page.data.length < 100) return all;
  }
}

const [alerts, answers, consents] = await Promise.all([listAll(alert), listAll(answer), listAll(consent)]);

if (reset) {
  for (const [entity, rows] of [[alert, alerts], [answer, answers], [consent, consents]]) {
    for (const row of rows) await entity.delete(row.id);
  }
  console.log(`\nCleared ${alerts.length} alerts, ${answers.length} medical answers and ${consents.length} consent forms.\n`);
  process.exit(0);
}

console.log(`\nMedical alerts saved in Piezas: ${alerts.length}`);
if (alerts.length) console.table(alerts.map(({ data: d, updatedAt }) => ({ child: d.childId, alert: d.shortAlert, 'how serious': d.severity, medication: d.medicationLocation, saved: updatedAt })));
console.log(`\nMedical answers saved in Piezas: ${answers.length}`);
if (answers.length) console.table(answers.map(({ data: d }) => ({ child: d.childId, 'no conditions': d.noMedicalConditions })));
console.log(`\nConsent forms saved in Piezas: ${consents.length}`);
if (consents.length) console.table(consents.map(({ data: d }) => ({ child: d.childId, 'signed by': d.signedBy, date: d.signedDate, photo: d.photoConsent })));
console.log('');
