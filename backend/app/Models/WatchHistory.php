<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class WatchHistory extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'channel_id',
        'watched_at',
    ];

    protected $casts = [
        'watched_at' => 'datetime',
    ];

    public function channel()
    {
        return $this->belongsTo(Channel::class);
    }
}
