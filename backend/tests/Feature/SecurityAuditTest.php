<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Playlist;
use App\Models\Channel;
use App\Models\UserFavorite;
use App\Models\WatchHistory;
use App\Models\UserSetting;
use App\Services\SafeHttpClient;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SecurityAuditTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 1. SSRF Protection: Tests IP bypass variations and cloud metadata protection
     */
    public function test_ssrf_protection_blocks_ip_variations_and_metadata(): void
    {
        $safeClient = new SafeHttpClient();

        $dangerousIps = [
            '127.0.0.1',
            '127.1.2.3',
            '10.0.0.1',
            '172.16.0.1',
            '192.168.1.1',
            '169.254.169.254', // AWS, GCP, Azure metadata
            '0.0.0.0',
            '::1',
        ];

        foreach ($dangerousIps as $ip) {
            $this->assertTrue(
                $safeClient->isForbiddenIp($ip),
                "Failed asserting that {$ip} is blocked as forbidden."
            );
        }
    }

    /**
     * 2. SSRF Protection: Tests URL scheme validation
     */
    public function test_ssrf_rejects_dangerous_protocols_and_internal_targets(): void
    {
        $safeClient = new SafeHttpClient();

        $forbiddenUrls = [
            'file:///etc/passwd',
            'gopher://127.0.0.1:6379/_flushall',
            'dict://127.0.0.1:11211/stat',
            'php://filter/read=convert.base64-encode/resource=index.php',
            'http://127.0.0.1:8000/api/v1',
            'http://169.254.169.254/latest/meta-data/',
        ];

        foreach ($forbiddenUrls as $url) {
            $caught = false;
            try {
                $safeClient->validateUrl($url);
            } catch (Exception $e) {
                $caught = true;
            }
            $this->assertTrue($caught, "Expected URL '{$url}' to be rejected by SafeHttpClient.");
        }
    }

    /**
     * 3. Auth Security: Token revocation on logout
     */
    public function test_token_is_revoked_on_logout(): void
    {
        $user = User::factory()->create([
            'email' => 'logout.test@streamx.tv',
            'password' => Hash::make('Secret123!'),
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'logout.test@streamx.tv',
            'password' => 'Secret123!',
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('token');
        $this->assertNotEmpty($token);

        // Fetch profile with valid token
        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(200);

        // Logout
        $logoutResponse = $this->withToken($token)
            ->postJson('/api/v1/auth/logout');
        $logoutResponse->assertStatus(200);

        // Flush in-memory guard cache to verify persistent token deletion
        $this->app['auth']->forgetGuards();

        // The revoked token should no longer be valid
        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }

    /**
     * 4. RBAC Authorization: Standard user is denied access to admin endpoints
     */
    public function test_standard_user_cannot_access_admin_dashboard(): void
    {
        $normalUser = User::factory()->create([
            'role' => 'user',
        ]);

        $this->actingAs($normalUser)
            ->getJson('/api/v1/admin/stats')
            ->assertStatus(403);

        $this->actingAs($normalUser)
            ->getJson('/api/v1/admin/users')
            ->assertStatus(403);
    }

    /**
     * 5. RBAC Authorization: Admin user is permitted to access admin endpoints
     */
    public function test_admin_user_can_access_admin_dashboard(): void
    {
        $adminUser = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->actingAs($adminUser)
            ->getJson('/api/v1/admin/stats')
            ->assertStatus(200)
            ->assertJsonStructure([
                'stats' => ['total_users', 'total_playlists', 'total_channels', 'total_devices', 'subscriptions'],
                'system' => ['php_version', 'laravel_version'],
            ]);
    }

    /**
     * 6. Multi-Tenant Isolation: User A cannot access User B's channels
     */
    public function test_tenant_isolation_on_channels(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $playlistB = Playlist::withoutGlobalScopes()->create([
            'user_id' => $userB->id,
            'title' => 'User B Private Playlist',
            'source_type' => 'url',
            'source_url' => 'https://example.com/b.m3u8',
            'status' => 'active',
        ]);

        $channelB = Channel::create([
            'user_id' => $userB->id,
            'playlist_id' => $playlistB->id,
            'name' => 'User B Private Channel',
            'stream_url' => 'https://example.com/live/b.m3u8',
            'group_title' => 'VIP',
        ]);

        // User A queries /channels
        $this->actingAs($userA);
        $res = $this->getJson('/api/v1/channels');
        $res->assertStatus(200);
        $channelIds = collect($res->json('data'))->pluck('id')->all();

        $this->assertNotContains(
            $channelB->id,
            $channelIds,
            'User A was able to see User B\'s private channel!'
        );
    }

    /**
     * 7. Multi-Tenant Isolation: User A cannot see User B's favorites
     */
    public function test_tenant_isolation_on_favorites(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $playlistB = Playlist::withoutGlobalScopes()->create([
            'user_id' => $userB->id,
            'title' => 'User B Playlist',
            'source_type' => 'url',
            'source_url' => 'https://example.com/b.m3u8',
            'status' => 'active',
        ]);

        $channelB = Channel::create([
            'user_id' => $userB->id,
            'playlist_id' => $playlistB->id,
            'name' => 'Kanal B',
            'stream_url' => 'https://example.com/b.m3u8',
        ]);

        UserFavorite::create([
            'user_id' => $userB->id,
            'channel_id' => $channelB->id,
        ]);

        $this->actingAs($userA);
        $res = $this->getJson('/api/v1/favorites');
        $res->assertStatus(200);
        $favIds = collect($res->json('favorites'))->pluck('channel_id')->all();

        $this->assertNotContains($channelB->id, $favIds);
    }

    /**
     * 8. Multi-Tenant Isolation: User A cannot see User B's watch history
     */
    public function test_tenant_isolation_on_watch_history(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $playlistB = Playlist::withoutGlobalScopes()->create([
            'user_id' => $userB->id,
            'title' => 'User B Playlist',
            'source_type' => 'url',
            'source_url' => 'https://example.com/b.m3u8',
            'status' => 'active',
        ]);

        $channelB = Channel::create([
            'user_id' => $userB->id,
            'playlist_id' => $playlistB->id,
            'name' => 'Kanal B',
            'stream_url' => 'https://example.com/b.m3u8',
        ]);

        WatchHistory::create([
            'user_id' => $userB->id,
            'channel_id' => $channelB->id,
            'duration_seconds' => 120,
            'last_watched_at' => now(),
        ]);

        $this->actingAs($userA);
        $res = $this->getJson('/api/v1/history');
        $res->assertStatus(200);
        $historyIds = collect($res->json('history'))->pluck('channel_id')->all();

        $this->assertNotContains($channelB->id, $historyIds);
    }

    /**
     * 9. Parental Control PIN: verification endpoint security
     */
    public function test_parental_pin_verification(): void
    {
        $user = User::factory()->create();
        UserSetting::create([
            'user_id' => $user->id,
            'parental_pin_hash' => Hash::make('4321'),
            'theme' => 'dark',
            'buffer_length_seconds' => 30,
        ]);

        $this->actingAs($user);

        // Wrong PIN
        $failRes = $this->postJson('/api/v1/settings/verify-pin', ['pin' => '9999']);
        $failRes->assertStatus(403)
            ->assertJson(['verified' => false]);

        // Correct PIN
        $passRes = $this->postJson('/api/v1/settings/verify-pin', ['pin' => '4321']);
        $passRes->assertStatus(200)
            ->assertJson(['verified' => true]);
    }
}
