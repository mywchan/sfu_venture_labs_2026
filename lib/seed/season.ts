// Presentation data (dev branch): a repeatable, entirely made-up 2026-27 season.
// The figures come from the Kestrel Kids case: 312 children registered for
// 2026-27, 72 instructors, 18 patrollers plus a director, and groups of at most
// six, levels 1 to 6, ages 5 to 12. The Saturday/Sunday split of those 312 isn't
// in the brief, so it follows last season's 220/180 ratio. Last season's 400
// children are history and aren't here. The same seed always gives the same people.

import type { Attendance, Child, ChildPerson, ConsentForm, Data, Group, GroupMember, MedicalAlert, ParentAccount, Person, User } from './data';

export const SEASON = { children: 312, saturday: 172, sunday: 140, instructors: 72, patrol: 19, maxGroup: 6 };

const SUNDAY_ROSTER = 'day-sunday-roster'; // the app runs one day's roster at a time: Saturday's

const FIRST = ['Aaliyah','Aarav','Abigail','Adam','Adrian','Aiden','Akira','Alice','Amara','Amelia','Amir','Ana','Anders','Andrea','Anika','Arjun','Asher','Astrid','Beatrice','Benjamin','Bianca','Blake','Brooke','Caleb','Camille','Carter','Cecilia','Charlotte','Chen','Daria','David','Delilah','Diego','Dominic','Eleanor','Elena','Eli','Elias','Elise','Ellie','Elliot','Emilia','Erin','Esme','Eva','Evan','Felix','Fiona','Gabriel','Georgia','Grace','Hana','Harper','Hazel','Henry','Hugo','Ian','Imani','Ines','Iris','Isaac','Ivy','Jade','Jasper','Jonah','Josephine','Julian','Juliet','Kai','Kira','Layla','Leo','Levi','Lucia','Luna','Maddox','Maeve','Malik','Marco','Mila','Miles','Mina','Nadia','Naomi','Nathan','Nico','Nora','Olivia','Omar','Oscar','Penelope','Quinn','Rafael','Reza','Riley','Rosa','Rowan','Ruby','Ryan','Sami','Sara','Sebastian','Sienna','Simon','Sophie','Stella','Tariq','Tessa','Thea','Theo','Tobias','Valentina','Victor','Violet','Wren','Xavier','Yara','Yusuf','Zain','Zoey'] as const;

const LAST = ['Abara','Adeyemi','Agarwal','Almeida','Andersson','Arsenault','Bakshi','Banerjee','Beaulieu','Bergeron','Bhullar','Brandt','Cardoso','Castillo','Chaudhry','Cheung','Cho','Cormier','Costa','Dang','Davies','Delgado','Dhillon','Doucet','Eriksen','Espinoza','Farah','Fernandez','Fisher','Fontaine','Fujimoto','Gill','Gonzales','Grewal','Gupta','Hansen','Hassan','Hoang','Holloway','Huang','Ibrahim','Ito','Jensen','Johal','Joshi','Kang','Kapoor','Kim','Kovacs','Kumar','Lam','Larsen','Laurent','Lau','Leung','Lin','Lopez','MacDonald','Malik','Marchand','Mehta','Mendoza','Mitchell','Nair','Nasser','Ng','Nielsen','Novak','Obi','Oliveira','Ortiz','Park','Pereira','Pham','Popov','Rai','Ramos','Reid','Rios','Roy','Saito','Sandhu','Sato','Schmidt','Shah','Sharma','Silva','Smith','Sohal','Stewart','Suzuki','Tan','Taylor','Torres','Tran','Vargas','Walker','Wang','Watson','Weber','Yamamoto','Yang','Young','Zhang','Zhou'] as const;

const COLOURS = ['Red','Orange','Yellow','Green','Teal','Blue','Navy','Purple','Pink','White','Grey','Black'] as const;
const PATTERNS = ['Blue with white stripes','Pink and purple camo','Black with neon green zip','Red and white ski team','Grey with orange sleeves','Teal with yellow hood'] as const;

const MEDICAL: Omit<MedicalAlert, 'id' | 'childId'>[] = [
  { shortAlert: 'Peanut allergy: EpiPen in jacket pocket', details: 'Anaphylaxis to peanuts. EpiPen Jr in the left inside pocket. Call 911 after use.', medicationLocation: 'Jacket, left inside pocket', severity: 'high' },
  { shortAlert: 'Tree nut allergy: EpiPen in backpack', details: 'Severe reaction to tree nuts. Must not share snacks.', medicationLocation: 'Backpack, front pocket', severity: 'high' },
  { shortAlert: 'Mild asthma: inhaler in jacket', details: 'Worse in cold air or after long runs. Two puffs if wheezing, then rest.', medicationLocation: 'Jacket, chest pocket', severity: 'medium' },
  { shortAlert: 'Type 1 diabetes: snacks and kit in pack', details: 'Wears a glucose monitor. Needs a snack at mid-morning. Shaky or pale means check sugar now.', medicationLocation: 'Small backpack worn on hill', severity: 'high' },
  { shortAlert: 'Epilepsy: call patrol if seizure', details: 'Seizures are rare and well controlled. Time any seizure, keep safe, call patrol.', medicationLocation: 'Rescue medication at desk', severity: 'high' },
  { shortAlert: 'Egg allergy: no shared food', details: 'Hives if exposed. Packs own lunch.', medicationLocation: 'Antihistamine in backpack', severity: 'medium' },
  { shortAlert: 'Dairy intolerance: own lunch', details: 'Stomach upset only. Not an emergency.', medicationLocation: 'None', severity: 'low' },
  { shortAlert: 'Glasses under goggles', details: 'Cannot see well without glasses. Spare pair at the desk.', medicationLocation: 'None', severity: 'low' },
  { shortAlert: 'Hard of hearing: face them to speak', details: 'Wears hearing aids, may remove them under the helmet. Get their attention visually.', medicationLocation: 'None', severity: 'medium' },
  { shortAlert: 'Recent wrist injury: avoid falls drills', details: 'Healing wrist sprain, wears a guard. Parent asks for gentle terrain.', medicationLocation: 'None', severity: 'low' },
  { shortAlert: 'Feels cold quickly: check hands often', details: 'Circulation condition. Needs warm-up breaks every hour.', medicationLocation: 'Hand warmers in jacket', severity: 'medium' },
  { shortAlert: 'Bee sting allergy: EpiPen at desk', details: 'Rare in winter. EpiPen kept at the desk in a labelled bag.', medicationLocation: 'Check-in desk', severity: 'high' },
];

function randomSource(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n: number, size = 2) => String(n).padStart(size, '0');
const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '.');

/** Adds the rest of the season around the existing named people, without changing any of them. */
export function addSeasonData(base: Data, today: string, todayLessonDay: string): Data {
  const random = randomSource(20261116);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)];
  const chance = (p: number) => random() < p;
  const between = (low: number, high: number) => low + Math.floor(random() * (high - low + 1));

  const used = new Set([...base.users.map((u) => u.name), ...base.persons.map((p) => p.name), ...base.children.map((c) => `${c.firstName} ${c.lastName}`)]);
  const person = (last?: string) => {
    for (;;) {
      const first = pick(FIRST);
      const family = last ?? pick(LAST);
      const name = `${first} ${family}`;
      if (!used.has(name)) {
        used.add(name);
        return { first, last: family, name };
      }
    }
  };

  // Staff: bring each role up to the case's numbers.
  const staff = (count: number, role: User['role'], prefix: string): User[] =>
    Array.from({ length: count }, (_, i) => {
      const { name } = person();
      return { id: `u-${prefix}-${pad(i + 1)}`, name, email: `${slug(name)}@example.test`, role };
    });
  const countOf = (role: User['role']) => base.users.filter((u) => u.role === role).length;
  const newInstructors = staff(SEASON.instructors - countOf('instructor'), 'instructor', 'inst');
  const newPatrol = staff(SEASON.patrol - countOf('patrol'), 'patrol', 'patrol');
  const newVolunteers = staff(2, 'desk', 'volunteer'); // parent volunteers for busy mornings

  const children: Child[] = [];
  const persons: Person[] = [];
  const links: ChildPerson[] = [];
  const parents: User[] = [];
  const parentLinks: ParentAccount[] = [];
  const medical: MedicalAlert[] = [];
  const consents: ConsentForm[] = [];

  // Phone numbers in the 555-01xx range are reserved for fiction.
  const areaCodes = [236, 250, 672, 403, 587, 780, 825];
  let phones = 0;
  const phone = () => {
    const n = phones++;
    return `${areaCodes[Math.floor(n / 100)]}-555-01${pad(n % 100)}`;
  };

  const addAdult = (who: { name: string }, childIds: string[], relationship: string, contactOrder: number | null, canPickUp: boolean) => {
    const id = `p-s${pad(persons.length + 1, 4)}`;
    persons.push({ id, name: who.name, phone: phone(), email: `${slug(who.name)}.${persons.length + 1}@example.test` });
    for (const childId of childIds) links.push({ id: `cp-s${pad(links.length + 1, 4)}`, childId, personId: id, relationship, contactOrder, canPickUp });
  };

  const levelFor = (age: number) => (age <= 6 ? between(1, 2) : age <= 8 ? between(1, 4) : age <= 10 ? between(2, 5) : between(3, 6));
  const newChild = (index: number, last: string, programDay: Child['programDay']): Child => {
    const age = between(5, 12);
    const { first } = person(last);
    const number = index + 1;
    return {
      id: `c-s${pad(number, 3)}`,
      firstName: first,
      lastName: last,
      birthDate: `${2026 - age}-${pad(between(1, 10))}-${pad(between(1, 28))}`,
      level: levelFor(age),
      programDay,
      orderNumber: `KM-2026-${130000 + number * 13}`,
      bib: (programDay === 'Saturday' ? 1000 : 2000) + number,
      noMedicalConditions: false,
    };
  };

  // Families: siblings share adults; some adults have a different last name.
  const toAdd = { Saturday: SEASON.saturday - base.children.length, Sunday: SEASON.sunday };
  let index = 0;
  let households = 0;
  for (const programDay of ['Saturday', 'Sunday'] as const) {
    let added = 0;
    while (added < toAdd[programDay]) {
      households += 1;
      const familyName = pick(LAST);
      const siblings = Math.min(chance(0.16) ? (chance(0.2) ? 3 : 2) : 1, toAdd[programDay] - added);
      const kids = Array.from({ length: siblings }, () => newChild(index++, familyName, programDay));
      added += kids.length;
      children.push(...kids);
      const childIds = kids.map((k) => k.id);

      const first = person(chance(0.82) ? familyName : undefined);
      addAdult(first, childIds, pick(['Mother', 'Father', 'Parent', 'Guardian']), 1, true);
      const parentId = `u-fam-${pad(households, 3)}`;
      parents.push({ id: parentId, name: first.name, email: `${slug(first.name)}.${households}@example.test`, role: 'parent' });
      parentLinks.push(...childIds.map((childId) => ({ userId: parentId, childId })));

      if (chance(0.8)) addAdult(person(chance(0.8) ? familyName : undefined), childIds, pick(['Mother', 'Father', 'Parent', 'Step-parent']), 2, chance(0.9));
      if (chance(0.28)) addAdult(person(), childIds, pick(['Grandmother', 'Grandfather', 'Aunt', 'Uncle', 'Nanny', 'Family friend']), chance(0.4) ? 3 : null, chance(0.85));

      for (const kid of kids) {
        const roll = random();
        if (roll < 0.14) medical.push({ id: `m-s${pad(medical.length + 1, 3)}`, childId: kid.id, ...pick(MEDICAL) });
        else if (roll < 0.94) kid.noMedicalConditions = true; // the rest haven't answered yet
        if (chance(0.91)) consents.push({ childId: kid.id, signedBy: first.name, signedDate: `2026-${chance(0.5) ? '10' : '11'}-${pad(between(1, 9))}`, photoConsent: chance(0.78) });
      }
    }
  }

  // Groups: by level, never more than six. Named instructors keep their groups.
  const instructorPool = [...base.users.filter((u) => u.role === 'instructor' && !['u-sam', 'u-priya', 'u-jordan', 'u-alex'].includes(u.id)), ...newInstructors].map((u) => u.id);
  const groups: Group[] = [];
  const members: GroupMember[] = [];
  const buildGroups = (programDay: Child['programDay'], lessonDayId: string, prefix: string) => {
    for (let level = 1; level <= 6; level++) {
      const atLevel = children.filter((c) => c.programDay === programDay && c.level === level);
      for (let start = 0, n = 1; start < atLevel.length; start += SEASON.maxGroup, n++) {
        const instructorId = instructorPool.shift();
        if (!instructorId) throw new Error('Not enough instructors for the groups.');
        const id = `g-${prefix}-${level}-${n}`;
        groups.push({ id, lessonDayId, name: `Level ${level} · ${programDay.slice(0, 3)} ${n}`, level, instructorId });
        members.push(...atLevel.slice(start, start + SEASON.maxGroup).map((c) => ({ groupId: id, childId: c.id })));
      }
    }
  };
  buildGroups('Saturday', todayLessonDay, 'sat');
  buildGroups('Sunday', SUNDAY_ROSTER, 'sun');

  // This morning's check-ins for the Saturday roster, with some still to arrive.
  const clothing = () => (chance(0.16) ? pick(PATTERNS) : pick(COLOURS));
  const checkInTime = () => {
    const minutes = between(30, 89); // 8:30 to 9:29
    return `${today}T${pad(8 + Math.floor(minutes / 60))}:${pad(minutes % 60)}:00`;
  };
  const deskIds = base.users.filter((u) => u.role === 'desk').slice(0, 3).map((u) => u.id);
  const attendance: Attendance[] = children
    .filter((c) => c.programDay === 'Saturday' && chance(0.86))
    .map((c) => ({
      id: `a-${c.id}`,
      childId: c.id,
      lessonDayId: todayLessonDay,
      checkInAt: checkInTime(),
      checkedInBy: pick(deskIds),
      jacket: clothing(),
      pants: pick(COLOURS),
      helmet: pick(COLOURS),
      pickupAt: null,
      pickedUpBy: null,
      releasedBy: null,
    }));

  return {
    ...base,
    users: [...base.users, ...newInstructors, ...newPatrol, ...newVolunteers, ...parents],
    children: [...base.children, ...children],
    persons: [...base.persons, ...persons],
    childPersons: [...base.childPersons, ...links],
    parentAccounts: [...base.parentAccounts, ...parentLinks],
    medical: [...base.medical, ...medical],
    consents: [...base.consents, ...consents],
    groups: [...base.groups, ...groups],
    groupMembers: [...base.groupMembers, ...members],
    attendance: [...base.attendance, ...attendance],
  };
}
