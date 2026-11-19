<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PlaylistController;
use App\Http\Controllers\Api\V1\ChannelController;

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

    // Protected Playlist & Channel routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('playlists', PlaylistController::class);
        Route::post('playlists/{id}/sync', [PlaylistController::class, 'sync']);

        Route::get('channels', [ChannelController::class, 'index']);
        Route::get('channels/groups', [ChannelController::class, 'groups']);
        Route::get('channels/{id}', [ChannelController::class, 'show']);
    });
});
