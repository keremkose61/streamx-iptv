<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Playlist;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class PlaylistApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Subscription::create([
            'user_id' => $this->user->id,
            'tier' => 'free',
            'max_playlists' => 1,
            'max_devices' => 1,
        ]);
    }

    public function test_user_can_upload_m3u_file(): void
    {
        $m3uContent = "#EXTM3U\n" .
            "#EXTINF:-1 tvg-id=\"tr.trt1\" tvg-logo=\"https://logo.com/trt1.png\" group-title=\"Ulusal\",TRT 1 HD\n" .
            "https://stream.example.com/trt1.m3u8\n" .
            "#EXTINF:-1 tvg-id=\"tr.spor\" group-title=\"Spor\",TRT Spor HD\n" .
            "https://stream.example.com/trtspor.m3u8\n";

        $file = UploadedFile::fake()->createWithContent('playlist.m3u', $m3uContent);

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/v1/playlists', [
            'title' => 'Turk Kanallari',
            'source_type' => 'file',
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Playlist başarıyla yüklendi ve kanallar ayrıştırıldı.',
                'total_channels' => 2,
            ]);

        $this->assertDatabaseHas('playlists', [
            'user_id' => $this->user->id,
            'title' => 'Turk Kanallari',
            'channel_count' => 2,
        ]);

        $this->assertDatabaseHas('channels', [
            'name' => 'TRT 1 HD',
            'group_title' => 'Ulusal',
        ]);
    }

    public function test_user_cannot_exceed_max_playlist_limit(): void
    {
        // First playlist
        Playlist::create([
            'user_id' => $this->user->id,
            'title' => 'First Playlist',
            'source_type' => 'url',
            'source_url' => 'https://example.com/1.m3u',
            'status' => 'active',
        ]);

        // Attempt second playlist
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/v1/playlists', [
            'title' => 'Second Playlist',
            'source_type' => 'url',
            'source_url' => 'https://example.com/2.m3u',
        ]);

        $response->assertStatus(403);
    }

    public function test_channel_filtering_and_pagination(): void
    {
        $m3uContent = "#EXTM3U\n" .
            "#EXTINF:-1 group-title=\"News\",BBC News\n" .
            "https://stream.example.com/bbc.m3u8\n" .
            "#EXTINF:-1 group-title=\"Sports\",Sky Sports\n" .
            "https://stream.example.com/sky.m3u8\n";

        $file = UploadedFile::fake()->createWithContent('test.m3u', $m3uContent);
        $this->actingAs($this->user, 'sanctum')->postJson('/api/v1/playlists', [
            'title' => 'Global TV',
            'source_type' => 'file',
            'file' => $file,
        ]);

        // Filter by group
        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/v1/channels?group=News');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('BBC News', $response->json('data.0.name'));

        // Search by keyword
        $searchRes = $this->actingAs($this->user, 'sanctum')->getJson('/api/v1/channels?search=Sky');
        $searchRes->assertStatus(200);
        $this->assertCount(1, $searchRes->json('data'));
        $this->assertEquals('Sky Sports', $searchRes->json('data.0.name'));

        // Get groups
        $groupsRes = $this->actingAs($this->user, 'sanctum')->getJson('/api/v1/channels/groups');
        $groupsRes->assertStatus(200)
            ->assertJsonStructure(['groups' => [['group_title', 'total']]]);
    }

    public function test_playlist_deletion_cascades_to_channels(): void
    {
        $m3uContent = "#EXTM3U\n#EXTINF:-1,Channel 1\nhttps://stream.example.com/1.m3u8\n";
        $file = UploadedFile::fake()->createWithContent('test.m3u', $m3uContent);

        $createRes = $this->actingAs($this->user, 'sanctum')->postJson('/api/v1/playlists', [
            'title' => 'Temp Playlist',
            'source_type' => 'file',
            'file' => $file,
        ]);

        $playlistId = $createRes->json('playlist.id');

        $this->assertDatabaseHas('channels', ['playlist_id' => $playlistId]);

        $delRes = $this->actingAs($this->user, 'sanctum')->deleteJson("/api/v1/playlists/{$playlistId}");
        $delRes->assertStatus(200);

        $this->assertDatabaseMissing('playlists', ['id' => $playlistId]);
        $this->assertDatabaseMissing('channels', ['playlist_id' => $playlistId]);
    }
}
