// Prints the adults saved in this project's Piezas app, straight from Piezas.
// Run with:  npm run data:guardians
import { Piezas } from '@piezas/sdk';

const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY });

// Keep these fields in step with lib/server/guardians.ts.
const { kk_person: person, kk_child_person: childPerson } = await piezas.defineEntities(
  {
    kk_person: {
      fields: { name: { type: 'text', required: true }, phone: { type: 'phone', required: true }, email: { type: 'email' } },
    },
    kk_child_person: {
      fields: {
        childId: { type: 'text', required: true },
        personId: { type: 'text', required: true },
        relationship: { type: 'text', required: true },
        contactOrder: { type: 'integer' },
        canPickUp: { type: 'boolean', required: true },
      },
    },
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

const [links, people] = await Promise.all([listAll(childPerson), listAll(person)]);
const byId = new Map(people.map((p) => [p.id, p]));

console.log(`\nSaved in Piezas: ${people.length} people, ${links.length} links to children\n`);
if (links.length) {
  console.table(
    links.map((l) => ({
      child: l.data.childId,
      adult: byId.get(l.data.personId)?.data.name ?? '(missing)',
      relationship: l.data.relationship,
      phone: byId.get(l.data.personId)?.data.phone ?? '',
      'contact #': l.data.contactOrder ?? '',
      'can pick up': l.data.canPickUp,
      saved: l.updatedAt,
    })),
  );
}
