<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class Subscription extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'tier',
        'max_playlists',
        'max_devices',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'max_playlists' => 'integer',
        'max_devices' => 'integer',
    ];
}
