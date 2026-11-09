// Made-up information for the preview. Every name, phone number and email is
// invented (example.test addresses never receive mail). Nothing here is stored
// in Piezas yet: the preview reads this module directly.

export type Role = 'parent' | 'instructor' | 'desk' | 'patrol' | 'admin';

export type User = { id: string; name: string; email: string; role: Role };

export type Child = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  level: number; // 1 to 6
  programDay: 'Saturday' | 'Sunday';
  orderNumber: string; // online store order number, used to match the nightly spreadsheet
  bib: number;
  noMedicalConditions: boolean; // parent answered "none"
};

export type Person = { id: string; name: string; phone: string; email: string };

export type ChildPerson = {
  id: string;
  childId: string;
  personId: string;
  relationship: string;
  contactOrder: number | null; // 1 is called first; no upper limit
  canPickUp: boolean;
};

export type ParentAccount = { userId: string; childId: string };

export type Severity = 'high' | 'medium' | 'low';

export type MedicalAlert = {
  id: string;
  childId: string;
  shortAlert: string;
  details: string;
  medicationLocation: string;
  severity: Severity;
};

export type ConsentForm = { childId: string; signedBy: string; signedDate: string; photoConsent: boolean };

export type LessonDay = { id: string; date: string; programDay: 'Saturday' | 'Sunday' };

export type Group = { id: string; lessonDayId: string; name: string; level: number; instructorId: string };

export type GroupMember = { groupId: string; childId: string };

export type Attendance = {
  id: string;
  childId: string;
  lessonDayId: string;
  checkInAt: string | null;
  checkedInBy: string | null;
  jacket: string;
  pants: string;
  helmet: string;
  clothingFixedBy?: string | null; // user id of whoever last corrected the clothing
  clothingFixedAt?: string | null;
  pickupAt: string | null;
  pickedUpBy: string | null; // person id
  pickedUpName?: string | null; // their name at the time, kept even if they're later removed
  releasedBy: string | null; // user id
};

export type PickupRefusal = {
  id: string;
  childId: string;
  lessonDayId: string;
  nameGiven: string;
  at: string;
  staffId: string;
};

export type Emergency = {
  id: string;
  childId: string;
  reportedBy: string;
  lastSeenPlace: string;
  lastSeenAt: string;
  jacket: string;
  pants: string;
  helmet: string;
  status: 'open' | 'closed';
  sharedWithPoliceAt: string | null;
  noticeMailed: boolean;
  closedAt: string | null;
  outcome: string | null;
};

export type PatrolAck = { emergencyId: string; patrollerId: string; at: string };

export type AccessRecord = { id: string; userId: string; role: Role; what: string; childId: string; at: string };

export type AppNotification = {
  id: string;
  kind: string;
  message: string;
  href: string;
  actionLabel: string;
  urgent: boolean;
  createdAt: string;
  readAt: string | null;
};

export type Data = {
  users: User[];
  children: Child[];
  persons: Person[];
  childPersons: ChildPerson[];
  parentAccounts: ParentAccount[];
  medical: MedicalAlert[];
  consents: ConsentForm[];
  lessonDays: LessonDay[];
  groups: Group[];
  groupMembers: GroupMember[];
  attendance: Attendance[];
  refusals: PickupRefusal[];
  emergencies: Emergency[];
  acks: PatrolAck[];
  accessRecords: AccessRecord[];
};

// The preview pretends today is the first Saturday of lessons.
export const TODAY = '2026-12-12';
export const TODAY_LESSON_DAY = 'day-2026-12-12';

const at = (hhmm: string) => `${TODAY}T${hhmm}:00`;

export const users: User[] = [
  { id: 'u-melissa', name: 'Melissa Parr', email: 'm.parr@example.test', role: 'parent' },
  { id: 'u-jun', name: 'Jun Chen', email: 'jun.chen@example.test', role: 'parent' },
  { id: 'u-claire', name: 'Claire Moreau', email: 'claire.moreau@example.test', role: 'parent' },
  { id: 'u-fatima', name: 'Fatima Ahmed', email: 'fatima.ahmed@example.test', role: 'parent' },
  { id: 'u-sam', name: 'Sam Lee', email: 'sam.lee@example.test', role: 'instructor' },
  { id: 'u-priya', name: 'Priya Natt', email: 'priya.natt@example.test', role: 'instructor' },
  { id: 'u-jordan', name: 'Jordan Blake', email: 'jordan.blake@example.test', role: 'instructor' },
  { id: 'u-alex', name: 'Alex Rivera', email: 'alex.rivera@example.test', role: 'instructor' },
  { id: 'u-mei', name: 'Mei Tanaka', email: 'mei.tanaka@example.test', role: 'desk' },
  { id: 'u-rob', name: 'Rob Fournier', email: 'rob.fournier@example.test', role: 'patrol' },
  { id: 'u-kai', name: 'Kai Andersen', email: 'kai.andersen@example.test', role: 'patrol' },
  { id: 'u-hana', name: 'Hana Sato', email: 'hana.sato@example.test', role: 'admin' },
];

type ChildSeed = [id: string, first: string, last: string, birth: string, level: number, bib: number, noMedical: boolean];

const childSeeds: ChildSeed[] = [
  // Group A, level 3, Sam Lee
  ['c-owen', 'Owen', 'Okafor-Parr', '2017-06-14', 3, 101, false],
  ['c-ava', 'Ava', 'Moreau', '2019-03-02', 3, 102, false],
  ['c-noah', 'Noah', 'Singh', '2018-09-21', 3, 103, true],
  ['c-chloe', 'Chloe', 'Wong', '2018-01-30', 3, 104, true],
  ['c-ethan', 'Ethan', 'Brown', '2017-11-08', 3, 105, true],
  // Group B, level 1, Priya Natt
  ['c-lily', 'Lily', 'Chen', '2020-04-17', 1, 201, true],
  ['c-mateo', 'Mateo', 'Garcia', '2020-07-05', 1, 202, true],
  ['c-zoe', 'Zoe', 'Ahmed', '2020-02-11', 1, 203, false],
  ['c-liam', 'Liam', 'Murphy', '2019-12-24', 1, 204, true],
  ['c-isla', 'Isla', 'Kaur', '2020-08-19', 1, 205, true],
  ['c-ben', 'Ben', 'Li', '2020-05-03', 1, 206, true],
  // Group C, level 5, Jordan Blake
  ['c-maya', 'Maya', 'Thompson', '2015-10-12', 5, 301, false],
  ['c-lucas', 'Lucas', 'Dubois', '2016-03-28', 5, 302, true],
  ['c-aria', 'Aria', 'Patel', '2015-06-09', 5, 303, true],
  ['c-jack', 'Jack', 'Wilson', '2016-01-15', 5, 304, true],
  // Registered, not yet placed in a group
  ['c-emma', 'Emma', 'Nguyen', '2018-05-22', 2, 401, false],
];

export const children: Child[] = childSeeds.map(([id, firstName, lastName, birthDate, level, bib, noMedicalConditions], i) => ({
  id,
  firstName,
  lastName,
  birthDate,
  level,
  bib,
  noMedicalConditions,
  programDay: 'Saturday',
  orderNumber: id === 'c-owen' ? 'KM-2025-118204' : `KM-2026-${(120300 + i * 17).toString()}`,
}));

export const persons: Person[] = [
  { id: 'p-melissa', name: 'Melissa Parr', phone: '416-555-0142', email: 'm.parr@example.test' },
  { id: 'p-daniel', name: 'Daniel Okafor', phone: '604-555-0187', email: 'd.okafor@example.test' },
  { id: 'p-claire', name: 'Claire Moreau', phone: '604-555-0110', email: 'claire.moreau@example.test' },
  { id: 'p-luc', name: 'Luc Moreau', phone: '604-555-0111', email: 'luc.moreau@example.test' },
  { id: 'p-jun', name: 'Jun Chen', phone: '604-555-0123', email: 'jun.chen@example.test' },
  { id: 'p-wei', name: 'Wei Chen', phone: '604-555-0124', email: 'wei.chen@example.test' },
  { id: 'p-raj', name: 'Raj Singh', phone: '778-555-0131', email: 'raj.singh@example.test' },
  { id: 'p-anita', name: 'Anita Singh', phone: '778-555-0132', email: 'anita.singh@example.test' },
  { id: 'p-grace-w', name: 'Grace Wong', phone: '604-555-0145', email: 'grace.wong@example.test' },
  { id: 'p-tom-w', name: 'Tom Wong', phone: '604-555-0146', email: 'tom.wong@example.test' },
  { id: 'p-sara-b', name: 'Sara Brown', phone: '604-555-0151', email: 'sara.brown@example.test' },
  { id: 'p-mike-b', name: 'Mike Brown', phone: '604-555-0152', email: 'mike.brown@example.test' },
  { id: 'p-elena-g', name: 'Elena Garcia', phone: '604-555-0161', email: 'elena.garcia@example.test' },
  { id: 'p-carlos-g', name: 'Carlos Garcia', phone: '604-555-0162', email: 'carlos.garcia@example.test' },
  { id: 'p-fatima-a', name: 'Fatima Ahmed', phone: '778-555-0171', email: 'fatima.ahmed@example.test' },
  { id: 'p-sean-m', name: 'Sean Murphy', phone: '604-555-0181', email: 'sean.murphy@example.test' },
  { id: 'p-kate-m', name: 'Kate Murphy', phone: '604-555-0182', email: 'kate.murphy@example.test' },
  { id: 'p-harp-k', name: 'Harpreet Kaur', phone: '778-555-0191', email: 'harpreet.kaur@example.test' },
  { id: 'p-dev-k', name: 'Dev Kaur', phone: '778-555-0192', email: 'dev.kaur@example.test' },
  { id: 'p-yan-l', name: 'Yan Li', phone: '604-555-0201', email: 'yan.li@example.test' },
  { id: 'p-hui-l', name: 'Hui Li', phone: '604-555-0202', email: 'hui.li@example.test' },
  { id: 'p-amy-t', name: 'Amy Thompson', phone: '604-555-0211', email: 'amy.thompson@example.test' },
  { id: 'p-greg-t', name: 'Greg Thompson', phone: '604-555-0212', email: 'greg.thompson@example.test' },
  { id: 'p-julie-d', name: 'Julie Dubois', phone: '604-555-0221', email: 'julie.dubois@example.test' },
  { id: 'p-marc-d', name: 'Marc Dubois', phone: '604-555-0222', email: 'marc.dubois@example.test' },
  { id: 'p-neha-p', name: 'Neha Patel', phone: '778-555-0231', email: 'neha.patel@example.test' },
  { id: 'p-lisa-w', name: 'Lisa Wilson', phone: '604-555-0241', email: 'lisa.wilson@example.test' },
  { id: 'p-dan-w', name: 'Dan Wilson', phone: '604-555-0242', email: 'dan.wilson@example.test' },
  { id: 'p-thu-n', name: 'Thu Nguyen', phone: '604-555-0251', email: 'thu.nguyen@example.test' },
];

let cpN = 0;
const link = (childId: string, personId: string, relationship: string, contactOrder: number | null, canPickUp: boolean): ChildPerson => ({
  id: `cp-${++cpN}`,
  childId,
  personId,
  relationship,
  contactOrder,
  canPickUp,
});

export const childPersons: ChildPerson[] = [
  link('c-owen', 'p-melissa', 'Mother', 1, true),
  link('c-owen', 'p-daniel', 'Father', 2, true),
  link('c-ava', 'p-claire', 'Mother', 1, true),
  link('c-ava', 'p-luc', 'Father', 2, true),
  link('c-lily', 'p-jun', 'Mother', 1, true),
  link('c-lily', 'p-wei', 'Father', 2, true),
  link('c-noah', 'p-raj', 'Father', 1, true),
  link('c-noah', 'p-anita', 'Mother', 2, true),
  link('c-chloe', 'p-grace-w', 'Mother', 1, true),
  link('c-chloe', 'p-tom-w', 'Father', 2, true),
  link('c-ethan', 'p-sara-b', 'Mother', 1, true),
  link('c-ethan', 'p-mike-b', 'Father', 2, true),
  link('c-mateo', 'p-elena-g', 'Mother', 1, true),
  link('c-mateo', 'p-carlos-g', 'Father', 2, true),
  link('c-zoe', 'p-fatima-a', 'Mother', 1, true),
  link('c-liam', 'p-sean-m', 'Father', 1, true),
  link('c-liam', 'p-kate-m', 'Mother', 2, true),
  link('c-isla', 'p-harp-k', 'Mother', 1, true),
  link('c-isla', 'p-dev-k', 'Father', 2, true),
  link('c-ben', 'p-yan-l', 'Mother', 1, true),
  link('c-ben', 'p-hui-l', 'Grandmother', 2, true),
  link('c-maya', 'p-amy-t', 'Mother', 1, true),
  link('c-maya', 'p-greg-t', 'Father', 2, true),
  link('c-lucas', 'p-julie-d', 'Mother', 1, true),
  link('c-lucas', 'p-marc-d', 'Father', 2, true),
  link('c-aria', 'p-neha-p', 'Mother', 1, true),
  link('c-jack', 'p-lisa-w', 'Mother', 1, true),
  link('c-jack', 'p-dan-w', 'Father', 2, true),
  link('c-emma', 'p-thu-n', 'Mother', 1, true),
];

export const parentAccounts: ParentAccount[] = [
  { userId: 'u-melissa', childId: 'c-owen' },
  { userId: 'u-jun', childId: 'c-lily' },
  { userId: 'u-claire', childId: 'c-ava' },
  { userId: 'u-fatima', childId: 'c-zoe' },
];

export const medical: MedicalAlert[] = [
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
];
// Ava's tree nut allergy is deliberately NOT here: in the preview, her parent
// adds it and it shows up on the instructor's list straight away.

export const consents: ConsentForm[] = children
  .filter((c) => !['c-zoe', 'c-emma'].includes(c.id))
  .map((c) => ({ childId: c.id, signedBy: 'Parent', signedDate: '2026-11-20', photoConsent: c.id !== 'c-lily' }));

export const lessonDays: LessonDay[] = [
  { id: 'day-2026-12-12', date: '2026-12-12', programDay: 'Saturday' },
  { id: 'day-2026-12-19', date: '2026-12-19', programDay: 'Saturday' },
  { id: 'day-2027-01-09', date: '2027-01-09', programDay: 'Saturday' },
];

export const groups: Group[] = [
  { id: 'g-a', lessonDayId: TODAY_LESSON_DAY, name: 'Group A', level: 3, instructorId: 'u-sam' },
  { id: 'g-b', lessonDayId: TODAY_LESSON_DAY, name: 'Group B', level: 1, instructorId: 'u-priya' },
  { id: 'g-c', lessonDayId: TODAY_LESSON_DAY, name: 'Group C', level: 5, instructorId: 'u-jordan' },
];

export const groupMembers: GroupMember[] = [
  ...['c-owen', 'c-ava', 'c-noah', 'c-chloe', 'c-ethan'].map((childId) => ({ groupId: 'g-a', childId })),
  ...['c-lily', 'c-mateo', 'c-zoe', 'c-liam', 'c-isla', 'c-ben'].map((childId) => ({ groupId: 'g-b', childId })),
  ...['c-maya', 'c-lucas', 'c-aria', 'c-jack'].map((childId) => ({ groupId: 'g-c', childId })),
];

// Most children are already checked in this morning; a few are still to come.
const checkedIn: [child: string, time: string, jacket: string, pants: string, helmet: string][] = [
  ['c-ava', '08:34', 'Purple', 'Black', 'White'],
  ['c-noah', '08:36', 'Green', 'Grey', 'Black'],
  ['c-chloe', '08:41', 'Yellow', 'Navy', 'Pink'],
  ['c-ethan', '08:44', 'Blue', 'Black', 'Black'],
  ['c-lily', '08:38', 'Pink', 'Purple', 'Pink'],
  ['c-mateo', '08:47', 'Orange', 'Black', 'Blue'],
  ['c-zoe', '08:52', 'Teal', 'White', 'White'],
  ['c-liam', '08:55', 'Black', 'Red', 'Red'],
  ['c-maya', '08:31', 'White', 'Black', 'Grey'],
  ['c-lucas', '08:40', 'Navy', 'Grey', 'Black'],
  ['c-aria', '08:58', 'Red', 'Black', 'White'],
];

export const attendance: Attendance[] = checkedIn.map(([childId, time, jacket, pants, helmet]) => ({
  id: `a-${childId}`,
  childId,
  lessonDayId: TODAY_LESSON_DAY,
  checkInAt: at(time),
  checkedInBy: 'u-mei',
  jacket,
  pants,
  helmet,
  pickupAt: null,
  pickedUpBy: null,
  releasedBy: null,
}));

export const seedData: Data = {
  users,
  children,
  persons,
  childPersons,
  parentAccounts,
  medical,
  consents,
  lessonDays,
  groups,
  groupMembers,
  attendance,
  refusals: [],
  emergencies: [],
  acks: [],
  accessRecords: [],
};
