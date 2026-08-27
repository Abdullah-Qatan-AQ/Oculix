import { classifyFreshness, confidenceFrom, type FreshnessState } from '@/lib/freshness';

export type WorldReportCategory = 'news' | 'earthquake' | 'fire' | 'conflict' | 'cyber' | 'weather' | 'other';

export interface WorldReportEvent {
  id: string;
  category: WorldReportCategory;
  title: string;
  source: string;
  timestamp: string;
  location: string;
  lat?: number;
  lng?: number;
  url?: string;
  freshness: FreshnessState;
  ageSeconds: number;
  confidence: number | null;
  sourceAgeSeconds: number | null;
}

export interface WorldReport {
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  coverage: string;
  events: WorldReportEvent[];
  byCategory: Record<WorldReportCategory, number>;
  byLocation: Array<{ location: string; count: number }>;
}

type AnyRecord = Record<string, any>;

function timestampOf(item: AnyRecord, category: WorldReportCategory): number | null {
  const raw = category === 'earthquake' ? item.time : item.published || item.timestamp || item.time || item.date || item.datetime || item.created_at;
  if (typeof raw === 'number') return raw < 10_000_000_000 ? raw * 1000 : raw;
  if (typeof raw === 'string' && raw.trim()) {
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function sourceTimestampOf(item: AnyRecord, fallback?: string | null): number | null {
  const raw = item.fetchedAt || item.fetched_at || item.receivedAt || item.received_at || item.updatedAt || item.updated_at || fallback;
  if (typeof raw === 'number') return raw < 10_000_000_000 ? raw * 1000 : raw;
  if (typeof raw === 'string' && raw.trim()) {
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function locationOf(item: AnyRecord): { label: string; lat?: number; lng?: number } {
  const coords = Array.isArray(item.coords) ? item.coords : null;
  const lat = Number.isFinite(Number(item.lat)) ? Number(item.lat) : coords && Number.isFinite(Number(coords[0])) ? Number(coords[0]) : undefined;
  const lng = Number.isFinite(Number(item.lng)) ? Number(item.lng) : coords && Number.isFinite(Number(coords[1])) ? Number(coords[1]) : undefined;
  const label = item.place || item.location || item.city || item.country || item.region || item.area || (lat !== undefined && lng !== undefined ? `${lat.toFixed(3)}, ${lng.toFixed(3)}` : 'Location not provided');
  return { label: String(label), lat, lng };
}

function categoryLabel(category: WorldReportCategory): string {
  return category === 'earthquake' ? 'earthquakes' : `${category}s`;
}

export function buildWorldReport(data: AnyRecord, now = Date.now()): WorldReport {
  const rows: Array<{ key: string; category: WorldReportCategory; source: string; items: AnyRecord[]; fetchedAt?: string | null }> = [
    { key: 'news', category: 'news', source: 'News feeds', items: Array.isArray(data.news) ? data.news : [], fetchedAt: data.newsMeta?.fetchedAt || null },
    { key: 'earthquakes', category: 'earthquake', source: 'USGS', items: Array.isArray(data.earthquakes) ? data.earthquakes : [] },
    { key: 'fires', category: 'fire', source: 'NASA FIRMS', items: Array.isArray(data.fires) ? data.fires : [] },
    { key: 'global_incidents', category: 'conflict', source: 'Global incident feeds', items: Array.isArray(data.global_incidents) ? data.global_incidents : [] },
    { key: 'conflicts', category: 'conflict', source: 'Conflict feeds', items: Array.isArray(data.conflicts) ? data.conflicts : [] },
    { key: 'cyber_attacks', category: 'cyber', source: 'Cyber attack feeds', items: Array.isArray(data.cyber_attacks) ? data.cyber_attacks : [] },
    { key: 'weather_alerts', category: 'weather', source: 'Weather feeds', items: Array.isArray(data.weather_alerts) ? data.weather_alerts : [] },
    { key: 'gdelt_events', category: 'other', source: 'GDELT events', items: Array.isArray(data.gdelt_events) ? data.gdelt_events : [] },
  ];
  const start = now - 24 * 60 * 60 * 1000;
  const events: WorldReportEvent[] = [];
  rows.forEach(row => row.items.forEach((item, index) => {
    const timestamp = timestampOf(item, row.category);
    if (timestamp === null || timestamp < start || timestamp > now + 5 * 60 * 1000) return;
    const ageSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));
    const sourceTimestamp = sourceTimestampOf(item, row.fetchedAt);
    const sourceAgeSeconds = sourceTimestamp === null ? null : Math.max(0, Math.floor((now - sourceTimestamp) / 1000));
    const place = locationOf(item);
    const rawTitle = item.title || item.name || item.headline || (row.category === 'earthquake' ? `M${item.magnitude ?? '?'} earthquake` : `${categoryLabel(row.category)} event`);
    const source = String(item.source || item.source_name || item.provider || row.source);
    events.push({
      id: String(item.id || item.guid || `${row.key}-${index}-${timestamp}`),
      category: row.category,
      title: String(rawTitle), source, timestamp: new Date(timestamp).toISOString(), location: place.label, lat: place.lat, lng: place.lng,
      url: item.url || item.link || item.source_url,
      freshness: classifyFreshness(sourceAgeSeconds, { maxLiveAgeSeconds: 120, staleAfterSeconds: 900 }),
      ageSeconds,
      confidence: typeof item.confidence === 'number' ? Math.max(0, Math.min(1, item.confidence)) : sourceAgeSeconds === null ? null : confidenceFrom(sourceAgeSeconds, null, { maxLiveAgeSeconds: 120, staleAfterSeconds: 900 }),
      sourceAgeSeconds,
    });
  }));
  events.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  const byCategory: Record<WorldReportCategory, number> = { news: 0, earthquake: 0, fire: 0, conflict: 0, cyber: 0, weather: 0, other: 0 };
  const locationCounts = new Map<string, number>();
  events.forEach(event => { byCategory[event.category] += 1; locationCounts.set(event.location, (locationCounts.get(event.location) || 0) + 1); });
  return {
    generatedAt: new Date(now).toISOString(), windowStart: new Date(start).toISOString(), windowEnd: new Date(now).toISOString(),
    coverage: 'Events received from the currently loaded Oculix feeds; this is not a claim of exhaustive global coverage.', events, byCategory,
    byLocation: Array.from(locationCounts, ([location, count]) => ({ location, count })).sort((a, b) => b.count - a.count).slice(0, 30),
  };
}

export function worldReportMarkdown(report: WorldReport): string {
  const lines = [
    '# Oculix — Planet Report / Last 24 Hours', '',
    `Generated: ${report.generatedAt}`, `Window: ${report.windowStart} → ${report.windowEnd}`, '',
    `Coverage: ${report.coverage}`, '', '## Summary',
    ...Object.entries(report.byCategory).filter(([, count]) => count > 0).map(([category, count]) => `- ${category}: ${count}`), '', '## Events',
    ...report.events.map(event => `- [${event.freshness}] ${event.title} — ${event.location} — ${event.source} — ${event.timestamp}${event.url ? ` — ${event.url}` : ''}`),
  ];
  return lines.join('\n');
}
