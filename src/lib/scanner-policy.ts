export const MAX_TARGET_LENGTH = 253;
export const MAX_RESPONSE_BYTES = 512 * 1024;
export const MAX_CONCURRENT_WORK = 2;

export const ALLOWED_SCANS = {
  quick: { endpoint: '/scan/quick', timeout: 15_000 },
  ssl: { endpoint: '/scan/ssl', timeout: 10_000 },
  headers: { endpoint: '/scan/headers', timeout: 10_000 },
  rdns: { endpoint: '/scan/rdns', timeout: 8_000 },
  subdomains: { endpoint: '/scan/subdomains', timeout: 15_000 },
  tech: { endpoint: '/scan/tech', timeout: 15_000 },
  whois: { endpoint: '/scan/whois', timeout: 10_000 },
  geoloc: { endpoint: '/scan/geoloc', timeout: 8_000 },
  vuln: { endpoint: '/scan/vuln', timeout: 90_000 },
} as const;

export type AllowedScan = keyof typeof ALLOWED_SCANS;

export function scannerEndpoint(raw: string): URL | null {
  if (/(^|\/)\.\.(?:\/|$)/.test(raw)) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname.includes('..')) return null;
    return url;
  } catch { return null; }
}

export function isAllowedScan(scanType: string): scanType is AllowedScan {
  return Object.prototype.hasOwnProperty.call(ALLOWED_SCANS, scanType);
}

export function isTargetWithinLimit(target: string): boolean {
  return target.trim().length > 0 && target.trim().length <= MAX_TARGET_LENGTH;
}

export function isResponseWithinLimit(byteLength: number): boolean {
  return Number.isInteger(byteLength) && byteLength >= 0 && byteLength <= MAX_RESPONSE_BYTES;
}
