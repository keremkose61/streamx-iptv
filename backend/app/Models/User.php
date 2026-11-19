<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function playlists()
    {
        return $this->hasMany(Playlist::class);
    }

    public function favorites()
    {
        return $this->hasMany(UserFavorite::class);
    }

    public function watchHistories()
    {
        return $this->hasMany(WatchHistory::class);
    }

    public function devices()
    {
        return $this->hasMany(UserDevice::class);
    }

    public function settings()
    {
        return $this->hasOne(UserSetting::class);
    }
}
