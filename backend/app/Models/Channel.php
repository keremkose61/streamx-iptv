<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class Channel extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'playlist_id',
        'user_id',
        'name',
        'group_title',
        'stream_url',
        'logo_url',
        'epg_channel_id',
        'order_index',
        'is_active',
    ];

    protected $casts = [
        'order_index' => 'integer',
        'is_active' => 'boolean',
    ];

    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }
}
