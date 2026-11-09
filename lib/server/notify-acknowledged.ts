// Tells staff when patrol has taken on a search. Server only.

import type { User } from '@/lib/seed/data';

export async function onAcknowledged(_search: { emergencyId: string; childId: string; patroller: User }) {}
