import 'server-only';
import process from 'node:process';
import type { Piezas } from '@piezas/sdk';
import { createPiezasClient, type TrustedPiezasSettings } from './client';

/** Reads the server's own settings. Nothing from a browser request ever reaches this. */
function loadSettings(): TrustedPiezasSettings {
  const apiBaseUrl = process.env.PIEZAS_API_URL ?? '';
  return {
    apiKey: process.env.PIEZAS_API_KEY ?? '',
    apiBaseUrl,
    usersUrl: process.env.PIEZAS_USERS_URL ?? `${apiBaseUrl}/users`,
    appId: process.env.PIEZAS_APP_ID ?? '',
    tenantId: process.env.PIEZAS_TENANT_ID ?? '',
  };
}

let server: ReturnType<typeof createPiezasClient<Piezas>> | null = null;

/** The Piezas client and the app/account it is bound to. Created on first use. */
export function piezasServer() {
  server ??= createPiezasClient<Piezas>(loadSettings());
  return server;
}
