import { NextResponse } from 'next/server';
import { getAllSourceHealth } from '@/lib/sourceHealth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    service: 'oculix-source-health',
    timestamp: new Date().toISOString(),
    sources: getAllSourceHealth(),
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
