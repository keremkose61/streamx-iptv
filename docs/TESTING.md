# Quality Assurance and Testing Framework

## Testing Levels
1. **Unit Tests**:
   - `packages/playlist-engine`: Parser syntax validation, error recovery, malformed M3U handling.
   - `packages/epg-engine`: XML parsing, timezone conversion, fuzzy matching algorithms.
   - `packages/player-core`: Adapter state transitions, error retry mechanisms.
   - `backend`: Eloquent model relationships, tenant isolation scopes, DTO validations.

2. **Feature & API Tests**:
   - HTTP endpoint verification, authentication assertions, role and tier limit checks.
   - SSRF protection filter tests against loopback and cloud metadata targets.

3. **End-to-End (E2E) Tests**:
   - Web interface channel switching, favorite toggling, search responsiveness.
