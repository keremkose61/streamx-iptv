<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class Playlist extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'title',
        'source_type',
        'source_url',
        'sync_frequency_hours',
        'last_synced_at',
        'channel_count',
        'status',
        'error_message',
    ];

    protected $casts = [
        'last_synced_at' => 'datetime',
        'sync_frequency_hours' => 'integer',
        'channel_count' => 'integer',
    ];

    public function channels()
    {
        return $this->hasMany(Channel::class);
    }
}
