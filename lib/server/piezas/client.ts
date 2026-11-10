import 'server-only';
import process from 'node:process';
import { Piezas, type PiezasConfig } from '@piezas/sdk';

// A Node built-in dependency makes accidental client-component bundling fail.
if (typeof window !== 'undefined') throw new Error('Server module only.');

export interface TrustedPiezasSettings {
  apiKey: string;
  apiBaseUrl: string;
  usersUrl: string;
  appId: string;
  tenantId: string;
}

export interface IdentityScope { appId: string; tenantId: string }

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** No environment reads, credentials, or network activity at import time. */
export function validateSettings(settings: TrustedPiezasSettings): IdentityScope {
  if (!settings || !uuid.test(settings.appId) || !uuid.test(settings.tenantId) ||
      typeof settings.apiKey !== 'string' || !/^sk_(test|live)_[^\s]+$/.test(settings.apiKey) ||
      settings.apiBaseUrl !== 'https://api.piezas.ai' ||
      settings.usersUrl !== 'https://api.piezas.ai/users') {
    // Never include supplied values in errors.
    throw new Error('Invalid server Piezas settings.');
  }
  return { appId: settings.appId, tenantId: settings.tenantId };
}

/** Construction is explicit and lazy; it does not authenticate or define records. */
export function createPiezasClient<T = Piezas>(
  settings: TrustedPiezasSettings,
  construct: (config: PiezasConfig) => T = (config => new Piezas(config)) as (config: PiezasConfig) => T,
): { client: T; scope: IdentityScope } {
  const scope = validateSettings(settings);
  for (const name of ['PIEZAS_DEV_USER_ID', 'PIEZAS_DEV_TENANT_ID', 'SAAC_DEV_USER_ID', 'SAAC_DEV_TENANT_ID']) {
    if (process.env[name]) throw new Error('Development identity overrides are not permitted.');
  }
  // Explicit service addresses prevent ambient SDK URL overrides or localhost
  // fallbacks. Only addresses from the project's Piezas contract are allowed.
  const base = settings.apiBaseUrl;
  const config: PiezasConfig = {
    apiKey: settings.apiKey, appId: scope.appId, apiBaseUrl: base,
    usersUrl: settings.usersUrl, adminUrl: `${base}/admin`,
    entitiesUrl: `${base}/entities`, pipelineUrl: `${base}/pipeline`,
    tasksUrl: `${base}/tasks`, notificationsUrl: `${base}/notify`,
    integrationsUrl: `${base}/integrations`, workflowUrl: `${base}/workflow`,
    calendarUrl: `${base}/calendar`, messagingUrl: `${base}/messaging`,
    formsUrl: `${base}/forms`, documentsUrl: `${base}/documents`,
    reportingUrl: `${base}/reporting`, pricingUrl: `${base}/pricing`,
    discussionUrl: `${base}/discussion`, knowledgeBaseUrl: `${base}/knowledge-base`,
  };
  return { client: construct(config), scope };
}
