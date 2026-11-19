<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UserFavorite;
use App\Models\Channel;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = UserFavorite::with('channel')
            ->latest()
            ->get();

        return response()->json([
            'favorites' => $favorites,
        ]);
    }

    public function toggle(Request $request, $channelId)
    {
        $user = $request->user();
        Channel::findOrFail($channelId); // Ensure channel exists

        $existing = UserFavorite::where('user_id', $user->id)
            ->where('channel_id', $channelId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'favorited' => false,
                'message' => 'Kanal favorilerden çıkarıldı.',
            ]);
        }

        UserFavorite::create([
            'user_id' => $user->id,
            'channel_id' => $channelId,
        ]);

        return response()->json([
            'favorited' => true,
            'message' => 'Kanal favorilere eklendi.',
        ], 201);
    }
}
