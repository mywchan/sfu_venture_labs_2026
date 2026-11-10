// Who is in which group today. Server only.

import { groupOfChild } from '@/lib/access';
import { seedData, type Data } from '@/lib/seed/data';

export async function currentRoster(): Promise<Data> {
  return seedData;
}

export function instructorOf(roster: Data, childId: string) {
  return groupOfChild(roster, childId)?.instructorId ?? null;
}
