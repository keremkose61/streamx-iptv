<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EpgProgram extends Model
{
    protected $fillable = [
        'epg_source_id',
        'channel_id_ref',
        'title',
        'description',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function source()
    {
        return $this->belongsTo(EpgSource::class, 'epg_source_id');
    }
}
