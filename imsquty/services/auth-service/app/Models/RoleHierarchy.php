<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * RoleHierarchy Model
 * 
 * Manages parent-child relationships between roles for permission inheritance
 * 
 * @property int $id
 * @property int $parent_role_id
 * @property int $child_role_id
 * @property int $inheritance_strength (0-100 percentage)
 * @property string|null $notes
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class RoleHierarchy extends Model
{
    protected $table = 'role_hierarchy';
    
    protected $fillable = [
        'parent_role_id',
        'child_role_id',
        'inheritance_strength',
        'notes',
        'is_active'
    ];
    
    protected $casts = [
        'parent_role_id' => 'integer',
        'child_role_id' => 'integer',
        'inheritance_strength' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
    
    /**
     * Get the parent role
     */
    public function parentRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'parent_role_id');
    }
    
    /**
     * Get the child role
     */
    public function childRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'child_role_id');
    }
    
    /**
     * Scope: Active hierarchies only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
