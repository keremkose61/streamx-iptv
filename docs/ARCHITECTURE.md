# Architecture Specifications

## Monorepo Modules

### Packages
- `packages/core`: Shared domain interfaces, DTOs, and serialization helpers.
- `packages/api-client`: Typed HTTP client layer for backend endpoints.
- `packages/playlist-engine`: Streaming M3U/M3U8 tokenizers and syntax validators.
- `packages/epg-engine`: XMLTV parsing utilities and timeline alignment.
- `packages/player-core`: Abstract playback adapter interfacing with underlying media engines.
- `packages/ui-components`: Accessible interface elements optimized for pointer and directional navigation.

### Applications
- `apps/web`: Single-page application built on modern web standards.
- `apps/desktop`: Native desktop shell utilizing system webview rendering.
- `apps/android`: Mobile and tablet media client.
- `apps/android-tv`: 10-foot UI application with remote-control navigation.
- `apps/samsung-tv`: Tizen platform web application package.
- `apps/lg-tv`: webOS platform web application package.
