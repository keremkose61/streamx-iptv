<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class UserFavorite extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'channel_id',
    ];

    public function channel()
    {
        return $this->belongsTo(Channel::class);
    }
}
