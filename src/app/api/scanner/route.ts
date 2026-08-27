import { NextResponse } from 'next/server';
import { validateHost, isRateLimited, getClientIp } from '@/lib/ssrf-guard';
import { auditHash, recordAuditEvent } from '@/lib/auditLog';

/**
 * OCULIX — Scanner Proxy (Hardened)
 * Rate-limited, target-validated, scope-restricted
 */

const SCANNER_URL = process.env.SCANNER_URL || '';
const SCANNER_KEY = process.env.SCANNER_KEY || '';
const MAX_TARGET_LENGTH = 253;
const MAX_RESPONSE_BYTES = 512 * 1024;

// The string-based regex previously here matched only literal dotted-quad
// IPv4, missed every IPv6 form, and never resolved hostnames — so an attacker
// could bypass it with `target=metadata.example.com` (DNS A → 169.254.169.254),
// `target=2130706433` (decimal 127.0.0.1), or `target=::1`. Validation now
// canonicalises the input and resolves hostnames before deciding. See
// `src/lib/ssrf-guard.ts`.

// ── ALLOWED SCAN TYPES (safe subset only) ──
const ALLOWED_SCANS: Record<string, { endpoint: string; timeout: number }> = {
  quick:      { endpoint: '/scan/quick',      timeout: 15000 },
  ssl:        { endpoint: '/scan/ssl',        timeout: 10000 },
  headers:    { endpoint: '/scan/headers',    timeout: 10000 },
  rdns:       { endpoint: '/scan/rdns',       timeout: 8000  },
  subdomains: { endpoint: '/scan/subdomains', timeout: 15000 },
  tech:       { endpoint: '/scan/tech',       timeout: 15000 },
  whois:      { endpoint: '/scan/whois',      timeout: 10000 },
  geoloc:     { endpoint: '/scan/geoloc',     timeout: 8000  },
  vuln:       { endpoint: '/scan/vuln',       timeout: 90000 },
};

// REMOVED from public access: deep, ports, banner, traceroute
// These are dangerous in an unauthenticated context:
//   deep     → scans 65,535 ports (DDoS amplifier)
//   banner   → harvests software versions from targets using our IP
//   traceroute → reveals hosting infrastructure
//   ports    → arbitrary port range scanning

export async function GET(req: Request) {
  const startedAt = Date.now();
  const clientIp = getClientIp(req);
  const clientHash = auditHash(clientIp);
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('target')?.trim();
  const scanType = searchParams.get('type') || 'quick';

  // 1. Check scanner is configured
  if (!SCANNER_KEY) {
    return NextResponse.json({ error: 'Scanner not configured', hint: 'Set SCANNER_URL and SCANNER_KEY in .env' }, { status: 503 });
  }

  // 2. Rate limit by client IP
  if (isRateLimited(clientIp, 5, 60_000)) {
    recordAuditEvent({ event: 'recon.blocked', clientHash, scanType, outcome: 'blocked', reason: 'rate limit exceeded' });
    return NextResponse.json({
      error: 'Rate limit exceeded',
      detail: `Maximum 5 scans per minute. Please wait before scanning again.`,
    }, { status: 429 });
  }

  // 3. Validate params
  if (!target) {
    recordAuditEvent({ event: 'recon.blocked', clientHash, scanType, outcome: 'blocked', reason: 'missing target' });
    return NextResponse.json({ error: 'Missing target parameter' }, { status: 400 });
  }

  if (target.length > MAX_TARGET_LENGTH) {
    recordAuditEvent({ event: 'recon.blocked', clientHash, scanType, targetHash: auditHash(target), outcome: 'blocked', reason: 'target too long' });
    return NextResponse.json({ error: 'Target is too long', detail: `Maximum target length is ${MAX_TARGET_LENGTH} characters.` }, { status: 400 });
  }

  recordAuditEvent({ event: 'recon.request', clientHash, scanType, targetHash: auditHash(target), outcome: 'accepted' });

  // 4. Block private/internal targets (DNS-resolves before deciding so a
  //    hostname pointing at a reserved range is rejected, and IPv6 + non-
  //    canonical IPv4 forms are no longer free bypasses).
  const guard = await validateHost(target);
  if (!guard.ok) {
    recordAuditEvent({ event: 'recon.blocked', clientHash, scanType, targetHash: auditHash(target), outcome: 'blocked', reason: guard.reason });
    return NextResponse.json({
      error: 'Target blocked',
      detail: `Target validation failed: ${guard.reason}`,
    }, { status: 403 });
  }

  // 5. Validate scan type (only safe scans allowed)
  const scanConfig = ALLOWED_SCANS[scanType];
  if (!scanConfig) {
    recordAuditEvent({ event: 'recon.blocked', clientHash, scanType, targetHash: auditHash(target), outcome: 'blocked', reason: 'scan type unavailable' });
    return NextResponse.json({
      error: 'Scan type not available',
      detail: `"${scanType}" is restricted. Available: ${Object.keys(ALLOWED_SCANS).join(', ')}`,
      available_scans: Object.keys(ALLOWED_SCANS),
    }, { status: 403 });
  }

  // 6. Execute scan with tight timeout
  try {
    const params = new URLSearchParams({ key: SCANNER_KEY, target });
    const res = await fetch(`${SCANNER_URL}${scanConfig.endpoint}?${params.toString()}`, {
      headers: { accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(scanConfig.timeout),
    });
    const body = await res.arrayBuffer();
    if (body.byteLength > MAX_RESPONSE_BYTES) {
      recordAuditEvent({ event: 'recon.failed', clientHash, scanType, targetHash: auditHash(target), durationMs: Date.now() - startedAt, outcome: 'failure', reason: 'scanner response exceeded size limit' });
      return NextResponse.json({ error: 'Scanner response too large' }, { status: 502 });
    }
    let data: unknown;
    try {
      data = JSON.parse(new TextDecoder().decode(body));
    } catch {
      recordAuditEvent({ event: 'recon.failed', clientHash, scanType, targetHash: auditHash(target), durationMs: Date.now() - startedAt, outcome: 'failure', reason: 'scanner returned invalid JSON' });
      return NextResponse.json({ error: 'Scanner returned invalid JSON' }, { status: 502 });
    }
    recordAuditEvent({ event: 'recon.completed', clientHash, scanType, targetHash: auditHash(target), durationMs: Date.now() - startedAt, outcome: res.ok ? 'success' : 'failure', reason: res.ok ? undefined : `scanner status ${res.status}` });
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    recordAuditEvent({ event: 'recon.failed', clientHash, scanType, targetHash: auditHash(target), durationMs: Date.now() - startedAt, outcome: 'failure', reason: e?.name === 'TimeoutError' ? 'scanner timeout' : 'scanner unreachable' });
    return NextResponse.json({
      error: 'Scanner unreachable',
      detail: e.message,
    }, { status: 502 });
  }
}
