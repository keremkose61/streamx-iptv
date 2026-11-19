<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PlaylistController;
use App\Http\Controllers\Api\V1\ChannelController;
use App\Http\Controllers\Api\V1\EpgController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\WatchHistoryController;
use App\Http\Controllers\Api\V1\DeviceController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;

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

        // Favorites
        Route::get('favorites', [FavoriteController::class, 'index']);
        Route::post('favorites/{channelId}', [FavoriteController::class, 'toggle']);

        // Watch History
        Route::get('history', [WatchHistoryController::class, 'index']);
        Route::post('history/{channelId}', [WatchHistoryController::class, 'record']);
        Route::delete('history', [WatchHistoryController::class, 'clear']);

        // Devices
        Route::get('devices', [DeviceController::class, 'index']);
        Route::delete('devices/{id}', [DeviceController::class, 'destroy']);

        // Settings & Parental Control
        Route::get('settings', [SettingsController::class, 'show']);
        Route::put('settings', [SettingsController::class, 'update']);
        Route::post('settings/verify-pin', [SettingsController::class, 'verifyPin']);

        // Subscriptions & Licensing
        Route::get('subscriptions/plans', [SubscriptionController::class, 'plans']);
        Route::get('subscriptions/current', [SubscriptionController::class, 'current']);
        Route::post('subscriptions/checkout', [SubscriptionController::class, 'checkout']);
        Route::post('subscriptions/upgrade', [SubscriptionController::class, 'upgrade']);

        // Admin Management Panel
        Route::prefix('admin')->middleware('admin')->group(function () {
            Route::get('stats', [AdminDashboardController::class, 'stats']);
            Route::get('users', [AdminUserController::class, 'index']);
            Route::put('users/{id}', [AdminUserController::class, 'update']);
            Route::delete('users/{id}', [AdminUserController::class, 'destroy']);
        });
    });
});
