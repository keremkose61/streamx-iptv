<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class UserDevice extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'device_uuid',
        'device_name',
        'platform',
        'last_active_at',
    ];

    protected $casts = [
        'last_active_at' => 'datetime',
    ];
}
