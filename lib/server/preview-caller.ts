// TEMPORARY: real sign-in isn't built yet, so "who is asking" comes from the
// preview's made-up people. That can't be trusted on a real site, so routes
// using this don't exist outside local development. Replace `previewCaller`
// with the verified Piezas session before removing the production check.

import { seedData, type User } from '@/lib/seed/data';

export const localOnly = () => process.env.NODE_ENV === 'production';
export const notFound = () => Response.json({ error: 'Not found' }, { status: 404 });

export function previewCaller(id: unknown): User | null {
  return seedData.users.find((u) => u.id === id) ?? null;
}
