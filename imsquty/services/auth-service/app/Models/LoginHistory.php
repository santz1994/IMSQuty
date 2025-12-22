<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Login History Model
 * 
 * Tracks all login attempts (successful and failed)
 * 
 * @property int $id
 * @property int|null $user_id
 * @property string $email
 * @property bool $success
 * @property string $ip_address
 * @property string|null $user_agent
 * @property \Illuminate\Support\Carbon $attempted_at
 * 
 * @package App\Models
 */
class LoginHistory extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'login_history';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'email',
        'success',
        'ip_address',
        'user_agent',
        'attempted_at'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'success' => 'boolean',
            'attempted_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the login history
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
