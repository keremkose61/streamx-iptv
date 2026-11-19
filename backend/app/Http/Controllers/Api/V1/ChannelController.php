<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use Illuminate\Http\Request;

class ChannelController extends Controller
{
    public function index(Request $request)
    {
        $query = Channel::query();

        if ($request->filled('playlist_id')) {
            $query->where('playlist_id', $request->playlist_id);
        }

        if ($request->filled('group')) {
            $query->where('group_title', $request->group);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('group_title', 'LIKE', "%{$term}%");
            });
        }

        $perPage = min((int)$request->input('per_page', 50), 100);
        $channels = $query->orderBy('order_index')->paginate($perPage);

        return response()->json($channels);
    }

    public function groups(Request $request)
    {
        $query = Channel::query();

        if ($request->filled('playlist_id')) {
            $query->where('playlist_id', $request->playlist_id);
        }

        $groups = $query->select('group_title', \DB::raw('count(*) as total'))
            ->groupBy('group_title')
            ->orderBy('group_title')
            ->get();

        return response()->json([
            'groups' => $groups,
        ]);
    }

    public function show($id)
    {
        $channel = Channel::findOrFail($id);

        return response()->json([
            'channel' => $channel,
        ]);
    }
}
