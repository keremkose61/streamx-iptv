# Security Policy

## Core Protections

1. **SSRF Mitigation**:
   - Outbound requests to user-provided playlist or EPG URLs validate DNS records prior to connection.
   - Connections to private, loopback, or cloud provider metadata IP ranges are rejected.

2. **Credential Safety**:
   - Stream authentication parameters are stored encrypted and never exposed in unmasked form via public API endpoints.

3. **Data Segregation**:
   - Multi-tenant data structures enforce tenant identity constraints across all queries.
