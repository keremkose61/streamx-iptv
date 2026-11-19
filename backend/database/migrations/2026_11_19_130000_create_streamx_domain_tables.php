<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add role to users
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 30)->default('user')->after('password');
        });

        // Subscriptions
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('tier', 30)->default('free'); // free, premium, pro
            $table->integer('max_playlists')->default(1);
            $table->integer('max_devices')->default(1);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Playlists
        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('source_type', 20)->default('url'); // url, file
            $table->text('source_url')->nullable();
            $table->integer('sync_frequency_hours')->default(24);
            $table->timestamp('last_synced_at')->nullable();
            $table->integer('channel_count')->default(0);
            $table->string('status', 30)->default('active'); // active, parsing, error
            $table->text('error_message')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        // Channels
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('playlist_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('group_title', 191)->default('General');
            $table->text('stream_url');
            $table->text('logo_url')->nullable();
            $table->string('epg_channel_id', 191)->nullable();
            $table->integer('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'group_title']);
            $table->index(['playlist_id', 'is_active']);
        });

        // EPG Sources
        Schema::create('epg_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('xml_url');
            $table->timestamp('last_parsed_at')->nullable();
            $table->string('status', 30)->default('active');
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        // EPG Programs
        Schema::create('epg_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('epg_source_id')->constrained()->cascadeOnDelete();
            $table->string('channel_id_ref', 191);
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->timestamps();

            $table->index(['channel_id_ref', 'start_time', 'end_time']);
        });

        // Favorites
        Schema::create('user_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('channel_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'channel_id']);
        });

        // Watch History
        Schema::create('watch_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('channel_id')->constrained()->cascadeOnDelete();
            $table->timestamp('watched_at')->useCurrent();
            $table->timestamps();

            $table->index(['user_id', 'watched_at']);
        });

        // Devices
        Schema::create('user_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_uuid', 191)->unique();
            $table->string('device_name');
            $table->string('platform', 30); // web, desktop, android, android_tv, tizen, webos
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'platform']);
        });

        // User Settings
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('parental_control_enabled')->default(false);
            $table->string('parental_pin_hash')->nullable();
            $table->string('preferred_player', 50)->default('auto');
            $table->integer('buffer_length_seconds')->default(30);
            $table->string('theme', 20)->default('dark');
            $table->string('language', 10)->default('tr');
            $table->json('ui_preferences')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
        Schema::dropIfExists('user_devices');
        Schema::dropIfExists('watch_histories');
        Schema::dropIfExists('user_favorites');
        Schema::dropIfExists('epg_programs');
        Schema::dropIfExists('epg_sources');
        Schema::dropIfExists('channels');
        Schema::dropIfExists('playlists');
        Schema::dropIfExists('subscriptions');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
