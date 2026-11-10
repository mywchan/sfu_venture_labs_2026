import 'server-only';

// The made-up starting medical alerts and consent forms. They live on the server
// so nobody's browser receives them unless their role is allowed to see them.

import { children, seasonHealth, type ConsentForm, type MedicalAlert } from '@/lib/seed/data';

export const seedMedical: MedicalAlert[] = [
  {
    id: 'm-owen',
    childId: 'c-owen',
    shortAlert: 'Mild asthma: blue inhaler in jacket pocket',
    details: 'Mild asthma, worse in cold air. Two puffs of the blue inhaler (salbutamol) if wheezing. Gets cold easily.',
    medicationLocation: 'Left jacket pocket',
    severity: 'medium',
  },
  {
    id: 'm-zoe',
    childId: 'c-zoe',
    shortAlert: 'Bee sting allergy: EpiPen in backpack',
    details: 'Anaphylaxis to bee stings (rare in winter). EpiPen Jr in the front pocket of her backpack.',
    medicationLocation: 'Backpack, front pocket',
    severity: 'high',
  },
  {
    id: 'm-maya',
    childId: 'c-maya',
    shortAlert: 'Celiac: no gluten at lunch',
    details: 'Celiac disease. Packs her own lunch; must not share food. Not life-threatening but makes her very ill.',
    medicationLocation: 'None',
    severity: 'medium',
  },
  ...seasonHealth.medical, // the rest of the made-up season
];
// Ava's tree nut allergy is deliberately NOT here: her parent adds it, and it
// shows up on the instructor's list.

export const seedConsents: ConsentForm[] = [
  ...children
    .filter((c) => !['c-zoe', 'c-emma'].includes(c.id))
    .map((c) => ({ childId: c.id, signedBy: 'Parent', signedDate: '2026-11-20', photoConsent: c.id !== 'c-lily' })),
  ...seasonHealth.consents,
];
