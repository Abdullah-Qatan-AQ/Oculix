export type FreshnessState = 'LIVE' | 'DELAYED' | 'STALE' | 'UNKNOWN';
export type FreshnessLanguage = 'ar' | 'en';

export interface FreshnessSnapshot {
  source: string;
  fetchedAt: string | null;
  ageSeconds: number | null;
  freshness: FreshnessState;
  confidence: number | null;
  maxLiveAgeSeconds: number;
  staleAfterSeconds: number;
}

export interface FreshnessPolicy {
  maxLiveAgeSeconds?: number;
  staleAfterSeconds?: number;
  source?: string;
  reliability?: number | null;
}

const DEFAULT_MAX_LIVE_AGE_SECONDS = 120;
const DEFAULT_STALE_AFTER_SECONDS = 900;

export function ageSecondsFrom(fetchedAt: string | null | undefined, now = Date.now()): number | null {
  if (!fetchedAt) return null;
  const timestamp = Date.parse(fetchedAt);
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((now - timestamp) / 1000));
}

export function classifyFreshness(ageSeconds: number | null, policy: Pick<FreshnessPolicy, 'maxLiveAgeSeconds' | 'staleAfterSeconds'> = {}): FreshnessState {
  if (ageSeconds === null) return 'UNKNOWN';
  const liveAge = Math.max(1, policy.maxLiveAgeSeconds ?? DEFAULT_MAX_LIVE_AGE_SECONDS);
  const staleAge = Math.max(liveAge, policy.staleAfterSeconds ?? DEFAULT_STALE_AFTER_SECONDS);
  if (ageSeconds <= liveAge) return 'LIVE';
  if (ageSeconds <= staleAge) return 'DELAYED';
  return 'STALE';
}

export function confidenceFrom(ageSeconds: number | null, reliability: number | null = null, policy: Pick<FreshnessPolicy, 'maxLiveAgeSeconds' | 'staleAfterSeconds'> = {}): number | null {
  if (ageSeconds === null && reliability === null) return null;
  const liveAge = Math.max(1, policy.maxLiveAgeSeconds ?? DEFAULT_MAX_LIVE_AGE_SECONDS);
  const staleAge = Math.max(liveAge + 1, policy.staleAfterSeconds ?? DEFAULT_STALE_AFTER_SECONDS);
  const freshnessFactor = ageSeconds === null ? 0.5 : Math.max(0, Math.min(1, 1 - Math.max(0, ageSeconds - liveAge) / (staleAge - liveAge)));
  const reliabilityFactor = reliability === null ? 1 : Math.max(0, Math.min(1, reliability));
  return Number((freshnessFactor * reliabilityFactor).toFixed(3));
}

export function createFreshnessSnapshot(fetchedAt: string | null | undefined, policy: FreshnessPolicy = {}, now = Date.now()): FreshnessSnapshot {
  const maxLiveAgeSeconds = Math.max(1, policy.maxLiveAgeSeconds ?? DEFAULT_MAX_LIVE_AGE_SECONDS);
  const staleAfterSeconds = Math.max(maxLiveAgeSeconds, policy.staleAfterSeconds ?? DEFAULT_STALE_AFTER_SECONDS);
  const ageSeconds = ageSecondsFrom(fetchedAt, now);
  return {
    source: policy.source ?? 'unknown',
    fetchedAt: fetchedAt ?? null,
    ageSeconds,
    freshness: classifyFreshness(ageSeconds, { maxLiveAgeSeconds, staleAfterSeconds }),
    confidence: confidenceFrom(ageSeconds, policy.reliability ?? null, { maxLiveAgeSeconds, staleAfterSeconds }),
    maxLiveAgeSeconds,
    staleAfterSeconds,
  };
}

export function formatAge(ageSeconds: number | null, language: FreshnessLanguage): string {
  if (ageSeconds === null) return language === 'ar' ? 'غير معروف' : 'unknown';
  if (ageSeconds < 60) return language === 'ar' ? `منذ ${ageSeconds} ث` : `${ageSeconds}s ago`;
  const minutes = Math.floor(ageSeconds / 60);
  if (minutes < 60) return language === 'ar' ? `منذ ${minutes} د` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return language === 'ar' ? `منذ ${hours} س` : `${hours}h ago`;
  return language === 'ar' ? `منذ ${Math.floor(hours / 24)} يوم` : `${Math.floor(hours / 24)}d ago`;
}

export function freshnessLabel(state: FreshnessState, language: FreshnessLanguage): string {
  if (language === 'ar') return { LIVE: 'مباشر', DELAYED: 'متأخر', STALE: 'متقادم', UNKNOWN: 'غير معروف' }[state];
  return state;
}
