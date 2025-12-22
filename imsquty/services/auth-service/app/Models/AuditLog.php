<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Audit Log Model
 * 
 * Stores all system audit logs for compliance
 * (ISO 27001, GDPR, SOC 2)
 * 
 * @property int $id
 * @property int|null $user_id
 * @property string $action
 * @property string $resource
 * @property int|null $resource_id
 * @property array|null $old_values
 * @property array|null $new_values
 * @property string $ip_address
 * @property string|null $user_agent
 * @property \Illuminate\Support\Carbon $created_at
 * 
 * @package App\Models
 */
class AuditLog extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'audit_logs';

    /**
     * Indicates if the model should use updated_at timestamp.
     *
     * @var bool
     */
    const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'action',
        'resource',
        'resource_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the audit log
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
