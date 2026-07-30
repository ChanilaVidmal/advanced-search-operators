# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take the security of Advanced Search Operators seriously. Since this is a browser extension, it operates with elevated permissions, and we want to ensure it remains safe for all users.

If you discover a security vulnerability, please follow these steps:

1. **Do not** open a public GitHub issue
2. Email the maintainer directly with details of the vulnerability
3. Include steps to reproduce, potential impact, and any suggested fixes

You can reach the maintainer through:
- GitHub Discussions: https://github.com/chanilavidmal/advanced-search-operators/discussions
- Ko-fi: https://ko-fi.com/chanilavidmal

## What to Expect

- **Acknowledgment:** Within 48 hours of receiving your report
- **Initial Assessment:** Within 7 days
- **Fix Timeline:** Depends on severity, typically within 30 days
- **Disclosure:** We will coordinate with you on responsible disclosure timing

## Security Best Practices

This extension:
- Stores all data locally (no external servers or analytics)
- Makes no network requests except when you explicitly click search
- Uses Chrome's built-in `storage.sync` and `localStorage` APIs
- Does not collect, transmit, or share any personal data

See [PRIVACY.md](PRIVACY.md) for full details on data handling.

## Scope

Security reports related to:
- Permission escalation vulnerabilities
- XSS or injection vectors within the extension
- Data leakage through storage or network requests
- Manifest V3 security misconfigurations

Out of scope:
- Issues with third-party search engines
- Chrome browser vulnerabilities
- Social engineering attacks outside the extension
