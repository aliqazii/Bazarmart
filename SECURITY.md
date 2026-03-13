# Security Policy

## Supported Scope

Security reports related to authentication, authorization, payments, order flow, sensitive data exposure, or admin-only functionality are in scope.

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Instead:

1. Document the issue clearly.
2. Include reproduction steps, affected routes/pages, and impact.
3. Share the report privately with the repository owner.

## Disclosure Guidance

- Avoid posting credentials, tokens, or private environment values.
- Wait for confirmation and remediation before public disclosure.

## Best Practices for Maintainers

- Rotate secrets immediately if exposed.
- Revoke compromised tokens or SMTP/API keys.
- Review authentication, payment, and admin routes after any security fix.