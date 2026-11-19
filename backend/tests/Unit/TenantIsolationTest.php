<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Playlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_only_see_their_own_playlists(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        // Create playlist for User A
        $playlistA = Playlist::withoutGlobalScopes()->create([
            'user_id' => $userA->id,
            'title' => "User A's Playlist",
            'source_type' => 'url',
            'source_url' => 'https://example.com/a.m3u8',
            'status' => 'active',
        ]);

        // Create playlist for User B
        $playlistB = Playlist::withoutGlobalScopes()->create([
            'user_id' => $userB->id,
            'title' => "User B's Playlist",
            'source_type' => 'url',
            'source_url' => 'https://example.com/b.m3u8',
            'status' => 'active',
        ]);

        // Act as User A
        $this->actingAs($userA);
        $userAPlaylists = Playlist::all();

        $this->assertCount(1, $userAPlaylists);
        $this->assertEquals($playlistA->id, $userAPlaylists->first()->id);
        $this->assertFalse($userAPlaylists->contains('id', $playlistB->id));

        // Act as User B
        $this->actingAs($userB);
        $userBPlaylists = Playlist::all();

        $this->assertCount(1, $userBPlaylists);
        $this->assertEquals($playlistB->id, $userBPlaylists->first()->id);
        $this->assertFalse($userBPlaylists->contains('id', $playlistA->id));
    }
}
