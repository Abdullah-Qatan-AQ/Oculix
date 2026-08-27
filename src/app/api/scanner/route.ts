import { NextResponse } from 'next/server';
import { validateHost, isRateLimited, getClientIp } from '@/lib/ssrf-guard';
import { auditHash, recordAuditEvent } from '@/lib/auditLog';
import { ALLOWED_SCANS, MAX_CONCURRENT_WORK, MAX_TARGET_LENGTH, isAllowedScan, isResponseWithinLimit, isTargetWithinLimit, scannerEndpoint } from '@/lib/scanner-policy';

/**
 * OCULIX — Scanner Proxy (Hardened)
 * Rate-limited, target-validated, scope-restricted
 */

const SCANNER_URL = process.env.SCANNER_URL || '';
const SCANNER_KEY = process.env.SCANNER_KEY || '';
let activeWork = 0;

// The string-based regex previously here matched only literal dotted-quad
// IPv4, missed every IPv6 form, and never resolved hostnames — so an attacker
// could bypass it with `target=metadata.example.com` (DNS A → 169.254.169.254),
// `target=2130706433` (decimal 127.0.0.1), or `target=::1`. Validation now
// canonicalises the input and resolves hostnames before deciding. See
// `src/lib/ssrf-guard.ts`.

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
  const endpoint = scannerEndpoint(SCANNER_URL);
  if (!SCANNER_KEY || !endpoint) {
    return NextResponse.json({ error: 'Scanner not configured', hint: 'Set a valid HTTPS SCANNER_URL and SCANNER_KEY in the server environment.' }, { status: 503 });
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

  if (!isTargetWithinLimit(target)) {
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
  if (!isAllowedScan(scanType)) {
    recordAuditEvent({ event: 'recon.blocked', clientHash, scanType, targetHash: auditHash(target), outcome: 'blocked', reason: 'scan type unavailable' });
    return NextResponse.json({
      error: 'Scan type not available',
      detail: `"${scanType}" is restricted. Available: ${Object.keys(ALLOWED_SCANS).join(', ')}`,
      available_scans: Object.keys(ALLOWED_SCANS),
    }, { status: 403 });
  }

  // 6. Execute scan with tight timeout and a process-level concurrency cap.
  if (activeWork >= MAX_CONCURRENT_WORK) {
    recordAuditEvent({ event: 'recon.blocked', clientHash, scanType, targetHash: auditHash(target), outcome: 'blocked', reason: 'worker capacity reached' });
    return NextResponse.json({ error: 'Scanner busy', detail: 'Worker capacity is temporarily exhausted; retry later.' }, { status: 503 });
  }
  activeWork += 1;
  try {
    const params = new URLSearchParams({ key: SCANNER_KEY, target });
    const scanConfig = ALLOWED_SCANS[scanType];
    const res = await fetch(`${endpoint.origin}${endpoint.pathname.replace(/\/$/, '')}${scanConfig.endpoint}?${params.toString()}`, {
      headers: { accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(scanConfig.timeout),
    });
    const body = await res.arrayBuffer();
    if (!isResponseWithinLimit(body.byteLength)) {
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
  } catch (e: unknown) {
    const errorName = e instanceof Error ? e.name : '';
    recordAuditEvent({ event: 'recon.failed', clientHash, scanType, targetHash: auditHash(target), durationMs: Date.now() - startedAt, outcome: 'failure', reason: errorName === 'TimeoutError' ? 'scanner timeout' : 'scanner unreachable' });
    return NextResponse.json({ error: 'Scanner unreachable', detail: 'The isolated scanner service did not respond.' }, { status: 502 });
  } finally {
    activeWork = Math.max(0, activeWork - 1);
  }
}
