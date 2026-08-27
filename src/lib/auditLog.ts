export type AuditEventName = 'recon.request' | 'recon.blocked' | 'recon.completed' | 'recon.failed';

export interface AuditEvent {
  id: string;
  event: AuditEventName;
  timestamp: string;
  clientHash: string;
  targetHash?: string;
  scanType?: string;
  durationMs?: number;
  outcome?: 'accepted' | 'blocked' | 'success' | 'failure';
  reason?: string;
}

const MAX_EVENTS = 500;
const events: AuditEvent[] = [];

function shortHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function recordAuditEvent(input: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  const event: AuditEvent = {
    ...input,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  events.push(event);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  return event;
}

export function auditHash(value: string): string {
  return shortHash(value.trim().toLowerCase());
}

export function readAuditEvents(limit = 100): AuditEvent[] {
  return events.slice(Math.max(0, events.length - Math.min(limit, MAX_EVENTS)));
}

export function clearAuditEvents(): void {
  events.splice(0, events.length);
}
