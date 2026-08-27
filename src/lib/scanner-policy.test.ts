import { describe, expect, it } from 'vitest';
import { isAllowedScan, isResponseWithinLimit, isTargetWithinLimit, MAX_RESPONSE_BYTES, MAX_TARGET_LENGTH, scannerEndpoint } from './scanner-policy';

describe('scanner policy', () => {
  it('accepts only canonical target lengths', () => {
    expect(isTargetWithinLimit('example.com')).toBe(true);
    expect(isTargetWithinLimit('')).toBe(false);
    expect(isTargetWithinLimit('a'.repeat(MAX_TARGET_LENGTH))).toBe(true);
    expect(isTargetWithinLimit('a'.repeat(MAX_TARGET_LENGTH + 1))).toBe(false);
  });

  it('keeps dangerous scan types out of the public allowlist', () => {
    expect(isAllowedScan('quick')).toBe(true);
    expect(isAllowedScan('vuln')).toBe(true);
    expect(isAllowedScan('ports')).toBe(false);
    expect(isAllowedScan('traceroute')).toBe(false);
  });

  it('bounds scanner response memory before JSON parsing', () => {
    expect(isResponseWithinLimit(MAX_RESPONSE_BYTES)).toBe(true);
    expect(isResponseWithinLimit(MAX_RESPONSE_BYTES + 1)).toBe(false);
    expect(isResponseWithinLimit(-1)).toBe(false);
  });

  it('requires an HTTPS scanner service without credentials or path traversal', () => {
    expect(scannerEndpoint('https://scanner.example')).not.toBeNull();
    expect(scannerEndpoint('http://scanner.example')).toBeNull();
    expect(scannerEndpoint('https://user:pass@scanner.example')).toBeNull();
    expect(scannerEndpoint('https://scanner.example/../internal')).toBeNull();
  });
});
