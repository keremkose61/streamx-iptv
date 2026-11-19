<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class EpgSource extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'title',
        'xml_url',
        'last_parsed_at',
        'status',
    ];

    protected $casts = [
        'last_parsed_at' => 'datetime',
    ];

    public function programs()
    {
        return $this->hasMany(EpgProgram::class);
    }
}
