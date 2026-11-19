<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use App\Models\Channel;
use App\Services\SafeHttpClient;
use App\Services\PlaylistParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class PlaylistController extends Controller
{
    public function index(Request $request)
    {
        $playlists = Playlist::withCount('channels')->latest()->get();

        return response()->json([
            'playlists' => $playlists,
        ]);
    }

    public function store(Request $request, SafeHttpClient $httpClient, PlaylistParserService $parser)
    {
        $user = $request->user();
        $subscription = $user->activeSubscription;
        $maxPlaylists = $subscription->max_playlists ?? 1;

        $currentCount = Playlist::where('user_id', $user->id)->count();
        if ($currentCount >= $maxPlaylists) {
            return response()->json([
                'message' => "Mevcut paketinizin ({$subscription->tier}) izin verdiği maksimum playlist sınırına ({$maxPlaylists}) ulaştınız.",
            ], 403);
        }

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'source_type' => ['required', 'in:url,file'],
            'source_url' => ['required_if:source_type,url', 'nullable', 'url'],
            'file' => ['required_if:source_type,file', 'nullable', 'file', 'max:51200'], // max 50MB
        ]);

        $content = '';
        $sourceUrl = null;

        if ($request->source_type === 'url') {
            $sourceUrl = $request->input('source_url');
            try {
                $response = $httpClient->get($sourceUrl, [], 30);
                if (!$response->successful()) {
                    return response()->json(['message' => 'Playlist URL adresinden veri alınamadı. HTTP Kod: ' . $response->status()], 422);
                }
                $content = $response->body();
            } catch (Exception $e) {
                return response()->json(['message' => 'Playlist URL çekilemedi: ' . $e->getMessage()], 422);
            }
        } else {
            $file = $request->file('file');
            $content = file_get_contents($file->getRealPath());
        }

        $parsed = $parser->parse($content);

        if ($parsed['total'] === 0) {
            return response()->json([
                'message' => 'Girilen kaynakta geçerli bir IPTV kanalı bulunamadı. M3U formatını kontrol edin.',
                'warnings' => $parsed['warnings'],
            ], 422);
        }

        return DB::transaction(function () use ($user, $request, $sourceUrl, $parsed) {
            $playlist = Playlist::create([
                'user_id' => $user->id,
                'title' => $request->title,
                'source_type' => $request->source_type,
                'source_url' => $sourceUrl,
                'channel_count' => $parsed['total'],
                'last_synced_at' => now(),
                'status' => 'active',
            ]);

            // Batch insert channels in chunks of 500 for optimal MySQL performance
            $now = now();
            $channelRows = [];
            foreach ($parsed['channels'] as $ch) {
                $channelRows[] = [
                    'playlist_id' => $playlist->id,
                    'user_id' => $user->id,
                    'name' => $ch['name'],
                    'group_title' => substr($ch['group_title'], 0, 191),
                    'stream_url' => $ch['stream_url'],
                    'logo_url' => $ch['logo_url'],
                    'epg_channel_id' => $ch['epg_channel_id'] ? substr($ch['epg_channel_id'], 0, 191) : null,
                    'order_index' => $ch['order_index'],
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if (count($channelRows) >= 500) {
                    Channel::withoutGlobalScopes()->insert($channelRows);
                    $channelRows = [];
                }
            }

            if (!empty($channelRows)) {
                Channel::withoutGlobalScopes()->insert($channelRows);
            }

            return response()->json([
                'message' => 'Playlist başarıyla yüklendi ve kanallar ayrıştırıldı.',
                'playlist' => $playlist->fresh(),
                'total_channels' => $parsed['total'],
                'groups' => $parsed['groups'],
            ], 201);
        });
    }

    public function show($id)
    {
        $playlist = Playlist::withCount('channels')->findOrFail($id);

        return response()->json([
            'playlist' => $playlist,
        ]);
    }

    public function destroy($id)
    {
        $playlist = Playlist::findOrFail($id);
        $playlist->delete();

        return response()->json([
            'message' => 'Playlist ve bağlı tüm kanallar başarıyla silindi.',
        ]);
    }

    public function sync($id, SafeHttpClient $httpClient, PlaylistParserService $parser)
    {
        $playlist = Playlist::findOrFail($id);

        if ($playlist->source_type !== 'url' || empty($playlist->source_url)) {
            return response()->json(['message' => 'Yalnızca URL kaynaklı playlistler otomatik senkronize edilebilir.'], 400);
        }

        try {
            $response = $httpClient->get($playlist->source_url, [], 30);
            if (!$response->successful()) {
                return response()->json(['message' => 'Playlist URL çekilemedi. HTTP: ' . $response->status()], 422);
            }
            $content = $response->body();
        } catch (Exception $e) {
            return response()->json(['message' => 'Senkronizasyon hatası: ' . $e->getMessage()], 422);
        }

        $parsed = $parser->parse($content);

        return DB::transaction(function () use ($playlist, $parsed) {
            // Remove old channels
            Channel::withoutGlobalScopes()->where('playlist_id', $playlist->id)->delete();

            $now = now();
            $channelRows = [];
            foreach ($parsed['channels'] as $ch) {
                $channelRows[] = [
                    'playlist_id' => $playlist->id,
                    'user_id' => $playlist->user_id,
                    'name' => $ch['name'],
                    'group_title' => substr($ch['group_title'], 0, 191),
                    'stream_url' => $ch['stream_url'],
                    'logo_url' => $ch['logo_url'],
                    'epg_channel_id' => $ch['epg_channel_id'] ? substr($ch['epg_channel_id'], 0, 191) : null,
                    'order_index' => $ch['order_index'],
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if (count($channelRows) >= 500) {
                    Channel::withoutGlobalScopes()->insert($channelRows);
                    $channelRows = [];
                }
            }

            if (!empty($channelRows)) {
                Channel::withoutGlobalScopes()->insert($channelRows);
            }

            $playlist->update([
                'channel_count' => $parsed['total'],
                'last_synced_at' => now(),
                'status' => 'active',
            ]);

            return response()->json([
                'message' => 'Playlist başarıyla güncellendi.',
                'playlist' => $playlist->fresh(),
                'total_channels' => $parsed['total'],
            ]);
        });
    }
}
