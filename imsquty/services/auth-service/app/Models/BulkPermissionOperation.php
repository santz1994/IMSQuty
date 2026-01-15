<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * BulkPermissionOperation Model
 * 
 * Audit trail for bulk permission operations
 * 
 * @property int $id
 * @property string $operation_type (assign, revoke, template)
 * @property int $performed_by
 * @property array $role_ids
 * @property array $permission_ids
 * @property int $total_operations
 * @property int $successful_operations
 * @property int $failed_operations
 * @property array|null $errors
 * @property string|null $notes
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class BulkPermissionOperation extends Model
{
    protected $table = 'bulk_permission_operations';
    
    protected $fillable = [
        'operation_type',
        'performed_by',
        'role_ids',
        'permission_ids',
        'total_operations',
        'successful_operations',
        'failed_operations',
        'errors',
        'notes'
    ];
    
    protected $casts = [
        'performed_by' => 'integer',
        'role_ids' => 'array',
        'permission_ids' => 'array',
        'total_operations' => 'integer',
        'successful_operations' => 'integer',
        'failed_operations' => 'integer',
        'errors' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
    
    /**
     * Get the user who performed the operation
     */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
    
    /**
     * Check if operation was fully successful
     */
    public function wasSuccessful(): bool
    {
        return $this->failed_operations === 0;
    }
    
    /**
     * Get success rate percentage
     */
    public function getSuccessRateAttribute(): float
    {
        if ($this->total_operations === 0) {
            return 0;
        }
        
        return ($this->successful_operations / $this->total_operations) * 100;
    }
}
