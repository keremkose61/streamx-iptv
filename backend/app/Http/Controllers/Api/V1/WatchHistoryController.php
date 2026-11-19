<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WatchHistory;
use App\Models\Channel;
use Illuminate\Http\Request;

class WatchHistoryController extends Controller
{
    public function index(Request $request)
    {
        $history = WatchHistory::with('channel')
            ->orderBy('watched_at', 'desc')
            ->paginate(50);

        return response()->json($history);
    }

    public function record(Request $request, $channelId)
    {
        $user = $request->user();
        Channel::findOrFail($channelId);

        $record = WatchHistory::updateOrCreate(
            ['user_id' => $user->id, 'channel_id' => $channelId],
            ['watched_at' => now()]
        );

        return response()->json([
            'message' => 'İzleme geçmişi güncellendi.',
            'history' => $record,
        ]);
    }

    public function clear(Request $request)
    {
        $user = $request->user();
        WatchHistory::where('user_id', $user->id)->delete();

        return response()->json([
            'message' => 'İzleme geçmişiniz temizlendi.',
        ]);
    }
}
