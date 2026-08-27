import { classifyFreshness, confidenceFrom, type FreshnessState } from './freshness';

export type SourceStatus = 'live' | 'stale' | 'degraded' | 'offline' | 'unknown';

export interface SourceHealth {
  source: string;
  status: SourceStatus;
  latencyMs: number | null;
  lastUpdated: string | null;
  ageSeconds: number | null;
  errors: number;
  requests: number;
  cacheHits: number;
  items: number | null;
  reliability: number;
  freshness: FreshnessState;
  confidence: number | null;
  lastError?: string;
}

type InternalHealth = Omit<SourceHealth, 'status' | 'ageSeconds' | 'reliability' | 'freshness' | 'confidence'> & {
  status: SourceStatus;
  lastUpdatedMs: number | null;
  successCount: number;
};

const sources = new Map<string, InternalHealth>();

function entryFor(source: string): InternalHealth {
  const existing = sources.get(source);
  if (existing) return existing;
  const created: InternalHealth = {
    source,
    status: 'unknown',
    latencyMs: null,
    lastUpdated: null,
    lastUpdatedMs: null,
    errors: 0,
    requests: 0,
    cacheHits: 0,
    items: null,
    successCount: 0,
  };
  sources.set(source, created);
  return created;
}

export function recordSourceRequest(source: string): void {
  entryFor(source).requests += 1;
}

export function recordSourceCacheHit(source: string): void {
  entryFor(source).cacheHits += 1;
}

export function recordSourceSuccess(source: string, latencyMs: number, items: number): void {
  const entry = entryFor(source);
  entry.latencyMs = Math.max(0, Math.round(latencyMs));
  entry.lastUpdatedMs = Date.now();
  entry.lastUpdated = new Date(entry.lastUpdatedMs).toISOString();
  entry.items = items;
  entry.successCount += 1;
  entry.status = 'live';
  delete entry.lastError;
}

export function recordSourceStale(source: string, reason = 'refresh failed; serving cached data'): void {
  const entry = entryFor(source);
  entry.status = 'stale';
  entry.errors += 1;
  entry.lastError = reason;
}

export function recordSourceFailure(source: string, latencyMs: number, reason = 'source unavailable'): void {
  const entry = entryFor(source);
  entry.latencyMs = Math.max(0, Math.round(latencyMs));
  entry.errors += 1;
  entry.lastError = reason;
  entry.status = entry.successCount > 0 ? 'degraded' : 'offline';
}

function toPublic(entry: InternalHealth): SourceHealth {
  const ageSeconds = entry.lastUpdatedMs === null ? null : Math.max(0, Math.round((Date.now() - entry.lastUpdatedMs) / 1000));
  let status = entry.status;
  if (ageSeconds !== null && ageSeconds > 60 * 60) status = 'stale';
  else if (ageSeconds !== null && ageSeconds > 10 * 60 && status === 'live') status = 'degraded';
  const totalOutcomes = entry.successCount + entry.errors;
  const computedFreshness = classifyFreshness(ageSeconds);
  const freshness: FreshnessState = status === 'offline' || status === 'stale' ? 'STALE' : status === 'degraded' ? 'DELAYED' : computedFreshness;
  const confidence = confidenceFrom(ageSeconds, totalOutcomes === 0 ? null : entry.successCount / totalOutcomes);
  return {
    source: entry.source,
    status,
    latencyMs: entry.latencyMs,
    lastUpdated: entry.lastUpdated,
    ageSeconds,
    errors: entry.errors,
    requests: entry.requests,
    cacheHits: entry.cacheHits,
    items: entry.items,
    reliability: totalOutcomes === 0 ? 0 : Number((entry.successCount / totalOutcomes).toFixed(3)),
    freshness,
    confidence,
    ...(entry.lastError ? { lastError: entry.lastError } : {}),
  };
}

export function getSourceHealth(source: string): SourceHealth {
  return toPublic(entryFor(source));
}

export function getAllSourceHealth(): SourceHealth[] {
  return Array.from(sources.values()).map(toPublic).sort((a, b) => a.source.localeCompare(b.source));
}

/** Test seam and operational reset for a fresh process snapshot. */
export function clearSourceHealth(): void {
  sources.clear();
}
