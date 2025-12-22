<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * User Model (Stub for notification service)
 * 
 * This is a minimal User model stub for the notification service.
 * Full user management is handled by the user-service.
 */
class User extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'remember_token'
    ];

    /**
     * Get user's notifications
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }
}
