# Database Schema Design

## Architecture Principles
- Storage Engine: MySQL 8+ with utf8mb4 encoding.
- Multi-tenancy: Every user resource is strictly scoped by `user_id`.
- Foreign Keys: Cascading deletes applied where ownership hierarchy requires.
- Indexing: Composite indexes on high-frequency query filters (`user_id, status`, `playlist_id, group_name`).

## Core Tables Specification

### 1. `users`
- `id` (BIGINT, PK, Auto Increment)
- `name` (VARCHAR 255)
- `email` (VARCHAR 255, Unique)
- `password` (VARCHAR 255, Hashed)
- `role` (ENUM: 'user', 'admin', Default 'user')
- `created_at`, `updated_at` (TIMESTAMP)

### 2. `subscriptions`
- `id` (BIGINT, PK, Auto Increment)
- `user_id` (BIGINT, FK -> users.id)
- `tier` (ENUM: 'free', 'premium', 'pro')
- `max_playlists` (INT, Default 1)
- `max_devices` (INT, Default 1)
- `expires_at` (TIMESTAMP, Nullable)

### 3. `playlists`
- `id` (BIGINT, PK, Auto Increment)
- `user_id` (BIGINT, FK -> users.id, Indexed)
- `title` (VARCHAR 255)
- `source_type` (ENUM: 'url', 'file')
- `source_url` (TEXT, Nullable)
- `sync_frequency_hours` (INT, Default 24)
- `last_synced_at` (TIMESTAMP, Nullable)
- `channel_count` (INT, Default 0)
- `status` (ENUM: 'active', 'parsing', 'error')

### 4. `channels`
- `id` (BIGINT, PK, Auto Increment)
- `playlist_id` (BIGINT, FK -> playlists.id, Cascading Delete, Indexed)
- `user_id` (BIGINT, FK -> users.id, Indexed)
- `name` (VARCHAR 255)
- `group_title` (VARCHAR 255, Indexed)
- `stream_url` (TEXT)
- `logo_url` (TEXT, Nullable)
- `epg_channel_id` (VARCHAR 255, Nullable)
- `order_index` (INT, Default 0)

### 5. `epg_sources`
- `id` (BIGINT, PK, Auto Increment)
- `user_id` (BIGINT, FK -> users.id, Indexed)
- `title` (VARCHAR 255)
- `xml_url` (TEXT)
- `last_parsed_at` (TIMESTAMP, Nullable)

### 6. `epg_programs`
- `id` (BIGINT, PK, Auto Increment)
- `epg_source_id` (BIGINT, FK -> epg_sources.id, Cascading Delete)
- `channel_id_ref` (VARCHAR 255, Indexed)
- `title` (VARCHAR 255)
- `description` (TEXT, Nullable)
- `start_time` (TIMESTAMP, Indexed)
- `end_time` (TIMESTAMP, Indexed)

### 7. `user_favorites`
- `id` (BIGINT, PK, Auto Increment)
- `user_id` (BIGINT, FK -> users.id, Indexed)
- `channel_id` (BIGINT, FK -> channels.id, Cascading Delete)
- Unique constraint: `(user_id, channel_id)`

### 8. `watch_histories`
- `id` (BIGINT, PK, Auto Increment)
- `user_id` (BIGINT, FK -> users.id, Indexed)
- `channel_id` (BIGINT, FK -> channels.id, Cascading Delete)
- `watched_at` (TIMESTAMP)

### 9. `user_devices`
- `id` (BIGINT, PK, Auto Increment)
- `user_id` (BIGINT, FK -> users.id, Indexed)
- `device_uuid` (VARCHAR 255, Unique)
- `platform` (ENUM: 'web', 'desktop', 'android', 'android_tv', 'tizen', 'webos')
- `last_active_at` (TIMESTAMP)
