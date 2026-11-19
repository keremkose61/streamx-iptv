<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Playlist;
use App\Models\Channel;
use App\Models\Subscription;
use App\Models\UserDevice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $totalUsers = User::count();
        $totalPlaylists = Playlist::withoutGlobalScopes()->count();
        $totalChannels = Channel::withoutGlobalScopes()->count();
        $totalDevices = UserDevice::withoutGlobalScopes()->count();

        // Subscription breakdown
        $subscriptions = Subscription::withoutGlobalScopes()
            ->select('tier', DB::raw('count(*) as count'))
            ->groupBy('tier')
            ->pluck('count', 'tier')
            ->toArray();

        $recentUsers = User::with('activeSubscription')
            ->latest()
            ->take(6)
            ->get();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_playlists' => $totalPlaylists,
                'total_channels' => $totalChannels,
                'total_devices' => $totalDevices,
                'subscriptions' => [
                    'free' => $subscriptions['free'] ?? 0,
                    'premium' => $subscriptions['premium'] ?? 0,
                    'pro' => $subscriptions['pro'] ?? 0,
                ],
            ],
            'system' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_time' => now()->toIso8601String(),
                'database_status' => 'connected',
            ],
            'recent_users' => $recentUsers,
        ]);
    }
}
