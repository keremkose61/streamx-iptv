# API Architecture & Endpoints (v1)

Base URL: `/api/v1`

## Authentication
Bearer token authentication using Laravel Sanctum.
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Authenticate and issue token
- `POST /api/v1/auth/logout` - Revoke token
- `GET  /api/v1/auth/me` - Current session profile

## Playlists
- `GET    /api/v1/playlists` - List user playlists
- `POST   /api/v1/playlists` - Add playlist (URL or file)
- `GET    /api/v1/playlists/{id}` - Show playlist details
- `PUT    /api/v1/playlists/{id}` - Update settings
- `DELETE /api/v1/playlists/{id}` - Remove playlist
- `POST   /api/v1/playlists/{id}/sync` - Trigger background sync

## Channels
- `GET  /api/v1/playlists/{id}/channels` - Paginated channel list (supports group filter & search)
- `GET  /api/v1/channels/{id}` - Single channel detail

## EPG (Electronic Program Guide)
- `GET /api/v1/epg/channel/{channel_id}` - Program schedule for channel
- `GET /api/v1/epg/now-next` - Current and upcoming program by channel set

## User Preferences
- `GET    /api/v1/favorites` - Get favorite channels
- `POST   /api/v1/favorites/{channel_id}` - Add channel to favorites
- `DELETE /api/v1/favorites/{channel_id}` - Remove from favorites
- `GET    /api/v1/history` - User watch history
- `POST   /api/v1/history` - Log channel view
- `GET    /api/v1/settings` - Player & interface preferences
- `PUT    /api/v1/settings` - Save preferences

## Devices
- `GET    /api/v1/devices` - Registered devices
- `POST   /api/v1/devices/pair` - Register/pair new device
- `DELETE /api/v1/devices/{id}` - De-authorize device
