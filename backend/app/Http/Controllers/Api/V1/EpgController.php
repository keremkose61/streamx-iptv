<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EpgSource;
use App\Models\EpgProgram;
use App\Models\Channel;
use App\Services\SafeHttpClient;
use App\Services\EpgParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class EpgController extends Controller
{
    public function sources(Request $request)
    {
        $sources = EpgSource::withCount('programs')->latest()->get();

        return response()->json([
            'sources' => $sources,
        ]);
    }

    public function storeSource(Request $request, SafeHttpClient $httpClient, EpgParserService $parser)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'source_type' => ['required', 'in:url,file'],
            'xml_url' => ['required_if:source_type,url', 'nullable', 'url'],
            'file' => ['required_if:source_type,file', 'nullable', 'file', 'max:51200'],
        ]);

        $xmlContent = '';
        $xmlUrl = null;

        if ($request->source_type === 'url') {
            $xmlUrl = $request->xml_url;
            try {
                $response = $httpClient->get($xmlUrl, [], 30);
                if (!$response->successful()) {
                    return response()->json(['message' => 'EPG XML verisi çekilemedi. HTTP: ' . $response->status()], 422);
                }
                $xmlContent = $response->body();
            } catch (Exception $e) {
                return response()->json(['message' => 'EPG indirme hatası: ' . $e->getMessage()], 422);
            }
        } else {
            $xmlContent = file_get_contents($request->file('file')->getRealPath());
        }

        $parsed = $parser->parse($xmlContent);

        if ($parsed['total'] === 0) {
            return response()->json(['message' => 'XMLTV dosyasında geçerli program kaydı bulunamadı.'], 422);
        }

        return DB::transaction(function () use ($request, $xmlUrl, $parsed) {
            $user = $request->user();

            $source = EpgSource::create([
                'user_id' => $user->id,
                'title' => $request->title,
                'xml_url' => $xmlUrl ?: 'local_file',
                'last_parsed_at' => now(),
                'status' => 'active',
            ]);

            $now = now();
            $programRows = [];

            foreach ($parsed['programs'] as $prog) {
                $programRows[] = [
                    'epg_source_id' => $source->id,
                    'channel_id_ref' => $prog['channel_id_ref'],
                    'title' => $prog['title'],
                    'description' => $prog['description'],
                    'start_time' => $prog['start_time'],
                    'end_time' => $prog['end_time'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if (count($programRows) >= 500) {
                    EpgProgram::insert($programRows);
                    $programRows = [];
                }
            }

            if (!empty($programRows)) {
                EpgProgram::insert($programRows);
            }

            return response()->json([
                'message' => 'EPG kaynağı başarıyla eklendi ve programlar ayrıştırıldı.',
                'source' => $source->fresh(),
                'total_programs' => $parsed['total'],
            ], 201);
        });
    }

    public function destroySource($id)
    {
        $source = EpgSource::findOrFail($id);
        $source->delete();

        return response()->json([
            'message' => 'EPG kaynağı ve programları silindi.',
        ]);
    }

    public function channelSchedule($channelId)
    {
        $channel = Channel::findOrFail($channelId);

        $refId = $channel->epg_channel_id ?: $channel->name;

        $programs = EpgProgram::where('channel_id_ref', $refId)
            ->where('end_time', '>=', now()->subHours(2))
            ->where('start_time', '<=', now()->addHours(24))
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'channel' => $channel,
            'programs' => $programs,
        ]);
    }

    public function nowAndNext(Request $request)
    {
        $now = now();
        $channels = Channel::select('id', 'name', 'group_title', 'logo_url', 'epg_channel_id')
            ->get();

        $refIds = $channels->pluck('epg_channel_id')->filter()->unique()->values();

        $currentPrograms = EpgProgram::whereIn('channel_id_ref', $refIds)
            ->where('start_time', '<=', $now)
            ->where('end_time', '>', $now)
            ->get()
            ->keyBy('channel_id_ref');

        $nextPrograms = EpgProgram::whereIn('channel_id_ref', $refIds)
            ->where('start_time', '>=', $now)
            ->orderBy('start_time')
            ->get()
            ->groupBy('channel_id_ref')
            ->map(fn($list) => $list->first());

        $result = [];
        foreach ($channels as $ch) {
            $ref = $ch->epg_channel_id;
            $result[] = [
                'channel_id' => $ch->id,
                'name' => $ch->name,
                'current' => $ref && isset($currentPrograms[$ref]) ? $currentPrograms[$ref] : null,
                'next' => $ref && isset($nextPrograms[$ref]) ? $nextPrograms[$ref] : null,
            ];
        }

        return response()->json([
            'schedule' => $result,
        ]);
    }
}
