import { describe, expect, it } from 'vitest';
import { ageSecondsFrom, classifyFreshness, confidenceFrom, createFreshnessSnapshot, formatAge } from './freshness';

describe('freshness contract', () => {
  const now = Date.parse('2026-08-27T00:00:00.000Z');

  it('classifies live, delayed and stale data explicitly', () => {
    expect(classifyFreshness(30)).toBe('LIVE');
    expect(classifyFreshness(300)).toBe('DELAYED');
    expect(classifyFreshness(901)).toBe('STALE');
    expect(classifyFreshness(null)).toBe('UNKNOWN');
  });

  it('computes non-negative age from a timestamp', () => {
    expect(ageSecondsFrom('2026-08-26T23:59:00.000Z', now)).toBe(60);
    expect(ageSecondsFrom('invalid', now)).toBeNull();
    expect(ageSecondsFrom('2026-08-27T00:01:00.000Z', now)).toBe(0);
  });

  it('does not manufacture confidence when no evidence exists', () => {
    expect(confidenceFrom(null, null)).toBeNull();
    expect(createFreshnessSnapshot(null, { source: 'test' }, now).confidence).toBeNull();
  });

  it('combines age and source reliability into bounded confidence', () => {
    const snapshot = createFreshnessSnapshot('2026-08-26T23:59:30.000Z', { source: 'test', reliability: 0.8 }, now);
    expect(snapshot.freshness).toBe('LIVE');
    expect(snapshot.confidence).toBeGreaterThan(0.7);
    expect(snapshot.confidence).toBeLessThanOrEqual(0.8);
  });

  it('formats age in both interface languages', () => {
    expect(formatAge(42, 'ar')).toBe('منذ 42 ث');
    expect(formatAge(3600, 'en')).toBe('1h ago');
  });
});
