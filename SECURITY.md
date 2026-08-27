# Security Policy

## Responsible Usage

The OCULIX Project provides Open Source Intelligence (OSINT) and cybersecurity monitoring tools designed to visualize and analyze global threat landscapes.

**By using this software, you agree to the following:**

1. **Defensive Use Only:** The tools, scripts, and intelligence capabilities provided in this repository must be used strictly for defensive, educational, and authorized monitoring purposes.
2. **Authorized Targets:** Do not use OCULIX to scan, probe, or interact with infrastructure, networks, or systems that you do not own or have explicit authorization to monitor.
3. **Compliance with Laws:** You are responsible for ensuring that your use of OCULIX complies with all applicable local, state, national, and international laws and regulations.
4. **No Malicious Intent:** Any use of OCULIX for malicious activities, offensive cyber operations, or unauthorized data harvesting is strictly prohibited.

The creators and contributors of OCULIX are not responsible for any misuse or damage caused by this software. Use it responsibly and ethically.

## RECON Security Controls

Oculix treats every user-supplied RECON target as untrusted input. The scanner gateway applies SSRF validation for private, loopback, link-local, metadata and reserved ranges; validates hostnames and DNS answers; restricts scan types; rate-limits callers; enforces a maximum target length; applies per-scan timeouts; requests JSON; rejects redirects from the scanner service; and rejects responses larger than the configured response limit.

The application records a bounded audit trail for scanner requests, blocks and failures using hashes for client and target identifiers. Raw target values and API keys are not written to the audit log. Full scanner isolation behind a separate queue/worker remains a deployment concern and must be enabled only with an appropriate server architecture.

RECON must be used only against assets for which the operator has explicit authorization. The presence of a tool in Oculix is not permission to test third-party systems, and a scanner result is not proof of a vulnerability without authorized independent verification.

## Secrets and Live Data

Provider keys belong in server-side environment variables and must never be committed to the repository or exposed to the browser. News, prices, camera feeds and other external sources can be delayed, incomplete or unavailable; users should review source, timestamp, freshness and confidence before treating a result as evidence.

## Reporting a Vulnerability

We take the security of our project seriously. If you discover a vulnerability in the OCULIX codebase, do not publish exploit details or real target data in a public issue.

Please report the issue through a private maintainer channel when available, including a reproducible description, impact, affected path, and whether the test data is synthetic. Do not include API keys, personal information, or scan results from systems you are not authorized to test.

Any change to SSRF validation, DNS handling, redirects, RECON rate limits, response-size limits or audit logging should include automated tests before release.

We appreciate responsible reports that help keep OCULIX secure for everyone.
