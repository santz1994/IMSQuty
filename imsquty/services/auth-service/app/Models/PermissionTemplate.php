<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * PermissionTemplate Model
 * 
 * Predefined permission sets for quick role creation
 * 
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property array $permission_ids
 * @property bool $is_public
 * @property int $created_by
 * @property int $usage_count
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class PermissionTemplate extends Model
{
    protected $table = 'permission_templates';
    
    protected $fillable = [
        'name',
        'description',
        'permission_ids',
        'is_public',
        'created_by',
        'usage_count',
        'is_active'
    ];
    
    protected $casts = [
        'permission_ids' => 'array',
        'is_public' => 'boolean',
        'created_by' => 'integer',
        'usage_count' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
    
    /**
     * Get the user who created the template
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    /**
     * Get the permissions included in this template
     */
    public function permissions(): BelongsToMany
    {
        $permissionIds = $this->permission_ids ?? [];
        return Permission::whereIn('id', $permissionIds);
    }
    
    /**
     * Scope: Active templates only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    /**
     * Scope: Public templates only
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }
    
    /**
     * Scope: By creator
     */
    public function scopeCreatedBy($query, int $userId)
    {
        return $query->where('created_by', $userId);
    }
    
    /**
     * Get permission count
     */
    public function getPermissionCountAttribute(): int
    {
        return count($this->permission_ids ?? []);
    }
}
