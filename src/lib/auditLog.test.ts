import { afterEach, describe, expect, it } from 'vitest';
import { auditHash, clearAuditEvents, readAuditEvents, recordAuditEvent } from './auditLog';

afterEach(() => clearAuditEvents());

describe('audit log', () => {
  it('hashes identifiers deterministically without storing raw values', () => {
    const hashA = auditHash(' Example.com ');
    const hashB = auditHash('example.COM');
    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^[0-9a-f]{8}$/);
    const event = recordAuditEvent({ event: 'recon.request', clientHash: hashA, targetHash: hashA, scanType: 'quick', outcome: 'accepted' });
    expect(event).not.toHaveProperty('target', 'example.com');
    expect(event.clientHash).toBe(hashA);
  });

  it('keeps only the most recent bounded audit window', () => {
    for (let i = 0; i < 510; i += 1) recordAuditEvent({ event: 'recon.blocked', clientHash: 'client', outcome: 'blocked', reason: `reason-${i}` });
    const events = readAuditEvents(1000);
    expect(events).toHaveLength(500);
    expect(events[0].reason).toBe('reason-10');
    expect(events.at(-1)?.reason).toBe('reason-509');
  });
});
