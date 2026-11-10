/** Transport contracts only. No browser, fixture, SDK, or persistence dependencies. */
export type IncidentTimestamp = string; // Explicit-offset ISO input; UTC ISO output.

export interface ReportIncidentInput {
  childId: string;
  lessonDayId: string;
  lastSeenPlace: string;
  lastSeenAt: IncidentTimestamp;
  jacket?: string | null;
  pants?: string | null;
  helmet?: string | null;
  bib?: number | null;
  identifyingDetails?: string | null;
}

export interface ValidatedIncidentReport {
  childId: string;
  lessonDayId: string;
  lastSeenPlace: string;
  lastSeenAt: IncidentTimestamp;
  jacket: string | null;
  pants: string | null;
  helmet: string | null;
  bib: number | null;
  identifyingDetails: string | null;
}

// Retain open/closed from the preview. Acknowledgement and search progress belong
// in events rather than changing the meaning of status === 'open'.
export type IncidentStatus = 'open' | 'closed';

export interface IncidentAcknowledgement {
  emergencyId: string;
  patrollerId: string;
  at: IncidentTimestamp;
}

/** Operational summary only; never embed medical information or contacts here. */
export interface IncidentSummary extends ValidatedIncidentReport {
  id: string;
  status: IncidentStatus;
  reportedBy: string;
  reportedAt: IncidentTimestamp;
  deadlineAt: IncidentTimestamp;
  acknowledgements: IncidentAcknowledgement[];
}

// Future event payloads will be defined with their workflows; these are extension
// points, not implemented commands or a promise of audit immutability.
export type IncidentEventKind =
  | 'reported' | 'acknowledged' | 'search-update' | 'escalation-action'
  | 'resolved' | 'sensitive-access';

export interface IncidentEventReference {
  id: string;
  emergencyId: string;
  kind: IncidentEventKind;
  actorId: string;
  at: IncidentTimestamp;
}

export interface IncidentValidationError {
  field: keyof ReportIncidentInput | '$';
  code: 'required' | 'invalid' | 'too_long' | 'future' | 'unexpected';
  message: string;
}

export type IncidentValidationResult =
  | { ok: true; value: ValidatedIncidentReport }
  | { ok: false; errors: IncidentValidationError[] };

export interface IncidentDeadline {
  deadlineAt: IncidentTimestamp;
  isOverdue: boolean;
}
