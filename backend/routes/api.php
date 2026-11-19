<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PlaylistController;
use App\Http\Controllers\Api\V1\ChannelController;
use App\Http\Controllers\Api\V1\EpgController;

Route::prefix('v1')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        // Playlists
        Route::apiResource('playlists', PlaylistController::class);
        Route::post('playlists/{id}/sync', [PlaylistController::class, 'sync']);

        // Channels
        Route::get('channels', [ChannelController::class, 'index']);
        Route::get('channels/groups', [ChannelController::class, 'groups']);
        Route::get('channels/{id}', [ChannelController::class, 'show']);

        // EPG
        Route::get('epg/sources', [EpgController::class, 'sources']);
        Route::post('epg/sources', [EpgController::class, 'storeSource']);
        Route::delete('epg/sources/{id}', [EpgController::class, 'destroySource']);
        Route::get('epg/channel/{channelId}', [EpgController::class, 'channelSchedule']);
        Route::get('epg/now-next', [EpgController::class, 'nowAndNext']);
    });
});
