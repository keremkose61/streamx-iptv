# Changelog

All notable changes to the StreamX IPTV project are documented in this file.

## [1.0.0] - 2026-11-19

### Highlights
- Initial production-ready release of **StreamX IPTV**, an enterprise-grade, commercial-quality multi-platform IPTV streaming ecosystem supporting Web, Windows Desktop, Android & Android TV, Samsung Smart TV (Tizen), LG Smart TV (webOS), and backend microservices.

### Added
- **Monorepo Foundation (Stage 1):**
  - Modern monorepo layout (`apps/`, `backend/`, `packages/`, `infrastructure/`, `docs/`, `scripts/`).
  - GitHub Actions CI workflow for automated linting, testing, and multi-workspace verification.
  - Comprehensive architectural and operational documentation in `docs/`.
- **Backend & Authentication Engine (Stage 2):**
  - Laravel 11 with PHP 8.3 & MySQL 8.4 InnoDB engine.
  - Laravel Sanctum token-based authentication with token revocation on logout.
  - Strict SSRF protection via `SafeHttpClient` blocking private CIDRs, link-local, and cloud metadata IPs (`169.254.169.254`).
  - Multi-tenant data isolation using `BelongsToUser` global Eloquent scope.
- **Web Frontend Application (Stage 3):**
  - React 18 + TypeScript + Vite + Tailwind CSS dark-themed dashboard.
  - Zustand auth store with localStorage persistence and Axios interceptors for 401 handling.
  - Protected routing, responsive navigation, and authentication flows (Login/Register).
- **Streaming Playlist Engine (Stage 4):**
  - `@streamx/playlist-engine`: Streaming M3U/M3U8 parser with error resilience and EXTINF attribute extraction.
  - Safe URL download and 500-chunk batch insertion with quota enforcement.
  - Channel browser with real-time category filtering and text search.
- **Universal Player Core & Live TV (Stage 5):**
  - `@streamx/player-core`: Hardware-accelerated `HlsPlayerAdapter` with automatic error recovery and buffer tuning.
  - Live TV interface with 16:9 viewport, D-Pad/keyboard navigation, channel list drawer, and audio/quality switcher.
- **EPG Guide & Program Schedule (Stage 6):**
  - `@streamx/epg-engine`: XMLTV parser normalizing timestamps to UTC.
  - Now & Next program scheduling algorithm and interactive timeline guide.
- **User Features & Parental Controls (Stage 7):**
  - One-click favorite channel toggling.
  - Automatic watch history recording with duration tracking.
  - 4-digit parental control PIN verification (`/api/v1/settings/verify-pin`).
  - Active device management and session termination.
- **Admin Management Panel (Stage 8):**
  - Role-based middleware (`EnsureUserIsAdmin`) protecting admin endpoints.
  - Admin dashboard displaying user statistics, tier distribution, and real-time server health metrics.
  - User management panel supporting role overrides, tier adjustments, and user moderation.
- **Freemium & Subscription Licensing (Stage 9):**
  - Tier matrix (Free 0 TL, Premium 79 TL, Pro 149 TL) with quota limits.
  - Provider-agnostic `PaymentGatewayInterface` with mock and live provider integration points.
  - Pricing page with feature comparison table and quota usage indicators.
- **Windows Desktop Application (Stage 10):**
  - Native Windows client powered by Tauri v2 and WebView2 (~25MB RAM vs. 200MB+ in Electron).
  - NSIS and MSI packaging automation via `scripts/build-windows.bat`.
- **Android & Android TV Client (Stage 11):**
  - Kotlin + Jetpack Compose app supporting phones, tablets, and Android TV (Leanback 10-foot UI).
  - Powered by Google AndroidX Media3 (ExoPlayer) with custom HLS `DefaultLoadControl`.
- **Smart TV Platforms - Samsung Tizen & LG webOS (Stage 12):**
  - Samsung Smart TV: Tizen Web App (`config.xml`, `tizen-manifest.xml`), hardware remote key registration, screen saver prevention (`webapis.appcommon.setScreenSaver`).
  - LG Smart TV: webOS Web App (`appinfo.json`), Magic Remote pointer & D-Pad hybrid support, `webOSRelaunch` lifecycle.
  - Dedicated 10-foot spatial navigation engine (`spatial-navigation.js`), OSD channel banner, and direct numeric channel jumping ("CH 12").
  - Automated packaging script: `scripts/build-smarttv.bat`.
- **Security Audit & Quality Assurance (Stage 13):**
  - Exhaustive automated security test suite (`SecurityAuditTest.php` with 26 passing tests and 113 assertions).
  - Rigorous SSRF protection, tenant isolation, PIN security, and token revocation validation.
- **Production Infrastructure & Deployment (Stage 14):**
  - Docker Compose stack: PHP 8.3 FPM, Nginx, MySQL 8.4, Redis 7.
  - Production Nginx configuration with HTTP/2, Gzip compression, static asset caching, and security headers.
  - Production environment configuration template (`infrastructure/env.production.example`).
