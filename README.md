# StreamX

StreamX is a modular media player and playlist management architecture designed for web, desktop, and smart television environments.

## System Overview

- **Core Engine**: Unified parsers for streaming playlists and electronic program guides (EPG).
- **Backend API**: Service layer handling authentication, playlist synchronization, and profile settings.
- **Client Applications**: Lightweight frontends sharing common state and player abstractions.

## Architecture Guidelines

- Zero bundled third-party streams: The platform functions strictly as a client-side player for user-provided sources.
- Safe HTTP resolution: Backend fetch utilities enforce IP filtering to prevent server-side request forgery (SSRF).
- Data isolation: Strict per-tenant scoping across database models.

## Repository Layout

- `apps/`: Target platform application packages.
- `packages/`: Shared TypeScript engines, API clients, and UI primitives.
- `backend/`: Application service APIs.
- `docs/`: Technical specifications and security guidelines.
