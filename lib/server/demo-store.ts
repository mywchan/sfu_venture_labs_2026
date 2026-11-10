import 'server-only';

// Presentation version only (dev branch). While the app runs under `npm run dev`,
// records stay in this computer's memory instead of going to Piezas, so a demo can
// never read or change the data on the deployed site. Restarting the app starts
// the demo fresh. A production build ignores all of this and uses Piezas.

import { randomUUID } from 'node:crypto';
import { Piezas } from '@piezas/sdk';

export const demoMode = () => process.env.NODE_ENV !== 'production';

type Row = { id: string; title: string; data: Record<string, unknown>; status: string; tenantId: string; entityTypeId: string; tags: string[]; createdAt: string; updatedAt: string };

// Kept on globalThis because each page and route gets its own copy of this file.
const holder = globalThis as unknown as { __kkDemoTables?: Map<string, Row[]> };
const tables = (holder.__kkDemoTables ??= new Map<string, Row[]>());

let clock = 0;
const nextStamp = () => new Date(Date.now() + ++clock).toISOString();
const copy = (r: Row): Row => ({ ...r, data: { ...r.data }, tags: [...r.tags] });

function demoEntity(name: string) {
  const rows = () => {
    if (!tables.has(name)) tables.set(name, []);
    return tables.get(name)!;
  };
  return {
    async list({ limit = 100, offset = 0, filter = {} }: { limit?: number; offset?: number; filter?: Record<string, unknown> } = {}) {
      const found = rows().filter((r) => Object.entries(filter).every(([k, v]) => r.data[k] === v));
      return { data: found.slice(offset, offset + limit).map(copy), total: found.length };
    },
    async create({ title, data }: { title: string; data: Record<string, unknown> }) {
      const at = nextStamp();
      const row: Row = { id: randomUUID(), title, data: { ...data }, status: 'active', tenantId: 'presentation', entityTypeId: name, tags: [], createdAt: at, updatedAt: at };
      rows().push(row);
      return copy(row);
    },
    async update(id: string, patch: { title?: string; data?: Record<string, unknown> }) {
      const row = rows().find((r) => r.id === id);
      if (!row) throw new Error('Record not found.');
      if (patch.title) row.title = patch.title;
      if (patch.data) row.data = { ...patch.data };
      row.updatedAt = nextStamp();
      return copy(row);
    },
    async delete(id: string) {
      const list = rows();
      const at = list.findIndex((r) => r.id === id);
      if (at >= 0) list.splice(at, 1);
    },
  };
}

const presentationClient = {
  async defineEntities(definitions: Record<string, unknown>) {
    return Object.fromEntries(Object.keys(definitions).map((name) => [name, demoEntity(name)]));
  },
};

/** Where records live: this computer's memory for the presentation, Piezas otherwise. */
export function recordsClient(): Piezas {
  return demoMode() ? (presentationClient as unknown as Piezas) : new Piezas({ apiKey: process.env.PIEZAS_API_KEY! });
}
