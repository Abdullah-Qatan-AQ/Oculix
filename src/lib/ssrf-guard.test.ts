import { describe, expect, it } from 'vitest';
import { parseIPv4, validateHost } from './ssrf-guard';

describe('SSRF guard', () => {
  it('rejects private, loopback, link-local and metadata IPv4 ranges', async () => {
    for (const host of ['127.0.0.1', '10.0.0.5', '172.16.0.1', '192.168.1.1', '169.254.169.254', '0.0.0.0']) {
      await expect(validateHost(host)).resolves.toMatchObject({ ok: false });
    }
  });

  it('rejects localhost names and reserved IPv6 forms', async () => {
    await expect(validateHost('localhost')).resolves.toMatchObject({ ok: false });
    await expect(validateHost('[::1]')).resolves.toMatchObject({ ok: false });
    await expect(validateHost('fc00::1')).resolves.toMatchObject({ ok: false });
    await expect(validateHost('fe80::1')).resolves.toMatchObject({ ok: false });
  });

  it('rejects alternate numeric IPv4 encodings instead of normalising them unsafely', () => {
    expect(parseIPv4('2130706433')).toBeNull();
    expect(parseIPv4('0177.0.0.1')).toBeNull();
    expect(parseIPv4('0x7f000001')).toBeNull();
    expect(parseIPv4('127.0.0.1')).toBe('127.0.0.1');
  });
});
