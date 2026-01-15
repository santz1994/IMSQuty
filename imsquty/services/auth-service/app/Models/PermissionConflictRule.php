<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PermissionConflictRule Model
 * 
 * Defines conflict relationships between permissions
 * 
 * @property int $id
 * @property int $permission_a_id
 * @property int $permission_b_id
 * @property string $conflict_type (mutual_exclusive, requires, incompatible)
 * @property string $reason
 * @property string $severity (warning, error)
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class PermissionConflictRule extends Model
{
    protected $table = 'permission_conflict_rules';
    
    protected $fillable = [
        'permission_a_id',
        'permission_b_id',
        'conflict_type',
        'reason',
        'severity',
        'is_active'
    ];
    
    protected $casts = [
        'permission_a_id' => 'integer',
        'permission_b_id' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
    
    /**
     * Get the first permission in the conflict
     */
    public function permissionA(): BelongsTo
    {
        return $this->belongsTo(Permission::class, 'permission_a_id');
    }
    
    /**
     * Get the second permission in the conflict
     */
    public function permissionB(): BelongsTo
    {
        return $this->belongsTo(Permission::class, 'permission_b_id');
    }
    
    /**
     * Scope: Active rules only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    /**
     * Scope: By conflict type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('conflict_type', $type);
    }
}
