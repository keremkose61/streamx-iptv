<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class UserSetting extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'parental_control_enabled',
        'parental_pin_hash',
        'preferred_player',
        'buffer_length_seconds',
        'theme',
        'language',
        'ui_preferences',
    ];

    protected $casts = [
        'parental_control_enabled' => 'boolean',
        'buffer_length_seconds' => 'integer',
        'ui_preferences' => 'array',
    ];
}
