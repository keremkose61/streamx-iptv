<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Subscription;
use App\Models\UserSetting;
use App\Models\Playlist;
use App\Models\Channel;
use App\Models\UserFavorite;
use App\Models\WatchHistory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@streamx.tv'],
            [
                'name' => 'StreamX Administrator',
                'password' => Hash::make('Password123!'),
                'role' => 'admin',
            ]
        );

        Subscription::firstOrCreate(
            ['user_id' => $admin->id],
            [
                'tier' => 'pro',
                'max_playlists' => 999,
                'max_devices' => 99,
                'expires_at' => now()->addYear(),
            ]
        );

        UserSetting::firstOrCreate(
            ['user_id' => $admin->id],
            [
                'theme' => 'dark',
                'language' => 'tr',
                'preferred_player' => 'auto',
                'buffer_length_seconds' => 30,
                'parental_pin_hash' => Hash::make('1234'),
            ]
        );

        // 2. Demo User
        $demo = User::firstOrCreate(
            ['email' => 'demo@streamx.tv'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('Password123!'),
                'role' => 'user',
            ]
        );

        Subscription::firstOrCreate(
            ['user_id' => $demo->id],
            [
                'tier' => 'premium',
                'max_playlists' => 5,
                'max_devices' => 3,
                'expires_at' => now()->addMonths(6),
            ]
        );

        UserSetting::firstOrCreate(
            ['user_id' => $demo->id],
            [
                'theme' => 'dark',
                'language' => 'tr',
                'preferred_player' => 'auto',
                'buffer_length_seconds' => 30,
                'parental_pin_hash' => Hash::make('0000'),
            ]
        );

        // 3. Demo Playlist for Demo User
        $playlist = Playlist::withoutGlobalScopes()->firstOrCreate(
            ['user_id' => $demo->id, 'title' => 'Ulusal & Popüler Kanallar'],
            [
                'source_type' => 'url',
                'source_url' => 'https://raw.githubusercontent.com/streamx/sample/main/channels.m3u',
                'channel_count' => 8,
                'status' => 'active',
                'last_synced_at' => now(),
            ]
        );

        $channelsData = [
            [
                'name' => 'TRT 1 HD',
                'group_title' => 'GENEL',
                'stream_url' => 'https://tv-trt1.medya.trt.com.tr/master.m3u8',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/TRT_1_logo.svg/300px-TRT_1_logo.svg.png',
            ],
            [
                'name' => 'TRT Haber HD',
                'group_title' => 'HABER',
                'stream_url' => 'https://tv-trthaber.medya.trt.com.tr/master.m3u8',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/TRT_Haber_logo.svg/300px-TRT_Haber_logo.svg.png',
            ],
            [
                'name' => 'TRT Spor HD',
                'group_title' => 'SPOR',
                'stream_url' => 'https://tv-trtspor.medya.trt.com.tr/master.m3u8',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/TRT_Spor_logo.svg/300px-TRT_Spor_logo.svg.png',
            ],
            [
                'name' => 'TRT World HD',
                'group_title' => 'HABER',
                'stream_url' => 'https://tv-trtworld.medya.trt.com.tr/master.m3u8',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/TRT_World_logo.svg/300px-TRT_World_logo.svg.png',
            ],
            [
                'name' => 'Red Bull TV 4K',
                'group_title' => 'SPOR',
                'stream_url' => 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Red_Bull_TV_logo.svg/300px-Red_Bull_TV_logo.svg.png',
            ],
            [
                'name' => 'Nature Wildlife HD',
                'group_title' => 'BELGESEL',
                'stream_url' => 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                'logo_url' => null,
            ],
            [
                'name' => 'Big Buck Bunny 1080p',
                'group_title' => 'SINEMA',
                'stream_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'logo_url' => null,
            ],
            [
                'name' => 'Tears of Steel Sci-Fi',
                'group_title' => 'SINEMA',
                'stream_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                'logo_url' => null,
            ],
        ];

        $firstChannel = null;
        foreach ($channelsData as $c) {
            $created = Channel::withoutGlobalScopes()->firstOrCreate(
                [
                    'playlist_id' => $playlist->id,
                    'name' => $c['name'],
                ],
                [
                    'user_id' => $demo->id,
                    'group_title' => $c['group_title'],
                    'stream_url' => $c['stream_url'],
                    'logo_url' => $c['logo_url'],
                ]
            );

            if (!$firstChannel) {
                $firstChannel = $created;
            }
        }

        // 4. Sample Favorite & History for Demo
        if ($firstChannel) {
            UserFavorite::firstOrCreate([
                'user_id' => $demo->id,
                'channel_id' => $firstChannel->id,
            ]);

            WatchHistory::firstOrCreate(
                [
                    'user_id' => $demo->id,
                    'channel_id' => $firstChannel->id,
                ],
                [
                    'watched_at' => now(),
                ]
            );
        }
    }
}
