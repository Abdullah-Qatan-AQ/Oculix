import { afterEach, describe, expect, it } from 'vitest';
import { clearSourceHealth, getAllSourceHealth, getSourceHealth, recordSourceCacheHit, recordSourceFailure, recordSourceRequest, recordSourceSuccess, recordSourceStale } from './sourceHealth';

afterEach(() => clearSourceHealth());

describe('source health registry', () => {
  it('records live source latency, age and reliability', () => {
    recordSourceRequest('opensky');
    recordSourceSuccess('opensky', 420, 12);
    recordSourceCacheHit('opensky');
    const health = getSourceHealth('opensky');
    expect(health.status).toBe('live');
    expect(health.latencyMs).toBe(420);
    expect(health.items).toBe(12);
    expect(health.requests).toBe(1);
    expect(health.cacheHits).toBe(1);
    expect(health.reliability).toBe(1);
    expect(health.ageSeconds).toBeGreaterThanOrEqual(0);
  });

  it('marks cached fallback as stale and preserves successful history', () => {
    recordSourceSuccess('usgs', 180, 4);
    recordSourceStale('usgs');
    const health = getSourceHealth('usgs');
    expect(health.status).toBe('stale');
    expect(health.errors).toBe(1);
    expect(health.reliability).toBe(0.5);
    expect(health.lastUpdated).toBeTruthy();
  });

  it('marks a source offline when the first refresh fails', () => {
    recordSourceRequest('firms');
    recordSourceFailure('firms', 1800, 'timeout');
    const health = getSourceHealth('firms');
    expect(health.status).toBe('offline');
    expect(health.lastError).toBe('timeout');
    expect(health.reliability).toBe(0);
  });

  it('returns sources in stable alphabetical order', () => {
    recordSourceRequest('zeta');
    recordSourceRequest('alpha');
    expect(getAllSourceHealth().map(item => item.source)).toEqual(['alpha', 'zeta']);
  });
});
