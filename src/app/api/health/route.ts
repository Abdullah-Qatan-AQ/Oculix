import { NextResponse } from 'next/server';
import { getAllSourceHealth } from '@/lib/sourceHealth';

export async function GET() {
  const sources = getAllSourceHealth();
  const requests = sources.reduce((sum, source) => sum + source.requests, 0);
  const cacheHits = sources.reduce((sum, source) => sum + source.cacheHits, 0);
  const errors = sources.reduce((sum, source) => sum + source.errors, 0);
  const latencies = sources.map(source => source.latencyMs).filter((value): value is number => value !== null).sort((a, b) => a - b);
  const p95LatencyMs = latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95))] : null;
  return NextResponse.json({
    status: 'operational',
    platform: 'OCULIX',
    version: '1.0.0',
    uptime: process.uptime ? Math.round(process.uptime()) : 0,
    timestamp: new Date().toISOString(),
    observability: {
      trackedSources: sources.length,
      errors,
      requests,
      cacheHits,
      cacheHitRatio: requests + cacheHits ? Number((cacheHits / (requests + cacheHits)).toFixed(3)) : 0,
      p95LatencyMs,
      staleSources: sources.filter(source => source.freshness === 'STALE').length,
      delayedSources: sources.filter(source => source.freshness === 'DELAYED').length,
    },
    sources,
    endpoints: [
      '/api/flights', '/api/satellites', '/api/earthquakes', '/api/news', '/api/gdelt', '/api/markets', '/api/frontlines', '/api/region-dossier', '/api/health/sources', '/api/scanner',
    ],
  });
}
