<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Auditable Trait
 * 
 * Automatically logs all CREATE, UPDATE, DELETE operations to audit_logs table
 * 
 * Compliance: ISO 27001, GDPR, SOC 2
 * 
 * Usage:
 * 
 * class Location extends Model
 * {
 *     use Auditable;
 * 
 *     protected $auditableEvents = ['created', 'updated', 'deleted'];
 * }
 */
trait Auditable
{
    /**
     * Boot the Auditable trait
     */
    public static function bootAuditable(): void
    {
        // Listen to model events
        static::created(function ($model) {
            $model->auditLog('CREATE');
        });

        static::updated(function ($model) {
            $model->auditLog('UPDATE');
        });

        static::deleted(function ($model) {
            $model->auditLog('DELETE');
        });

        // For soft deletes
        if (method_exists(static::class, 'restored')) {
            static::restored(function ($model) {
                $model->auditLog('RESTORE');
            });
        }

        // For force deletes
        if (method_exists(static::class, 'forceDeleted')) {
            static::forceDeleted(function ($model) {
                $model->auditLog('FORCE_DELETE');
            });
        }
    }

    /**
     * Create audit log entry
     * 
     * @param string $action
     * @return void
     */
    protected function auditLog(string $action): void
    {
        try {
            $userId = Auth::id();
            $serviceName = config('app.name', 'UnknownService');
            $resourceType = class_basename($this);
            $resourceId = $this->getKey();

            // Get old and new values
            $oldValues = null;
            $newValues = null;

            switch ($action) {
                case 'CREATE':
                    $newValues = $this->getAttributes();
                    break;

                case 'UPDATE':
                    $oldValues = $this->getOriginal();
                    $newValues = $this->getChanges();
                    
                    // If no changes, don't log
                    if (empty($newValues)) {
                        return;
                    }
                    break;

                case 'DELETE':
                case 'FORCE_DELETE':
                    $oldValues = $this->getOriginal();
                    break;

                case 'RESTORE':
                    $newValues = $this->getAttributes();
                    break;
            }

            // Remove sensitive fields from audit
            $sensitiveFields = ['password', 'remember_token', 'api_token'];
            if ($oldValues) {
                $oldValues = collect($oldValues)
                    ->except($sensitiveFields)
                    ->toArray();
            }
            if ($newValues) {
                $newValues = collect($newValues)
                    ->except($sensitiveFields)
                    ->toArray();
            }

            // Insert audit log
            DB::table('audit_logs')->insert([
                'user_id' => $userId,
                'service_name' => $serviceName,
                'action' => $action,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'old_values' => $oldValues ? json_encode($oldValues) : null,
                'new_values' => $newValues ? json_encode($newValues) : null,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'created_at' => now(),
            ]);

        } catch (\Exception $e) {
            // Log error but don't fail the main operation
            \Log::error('Audit logging failed: ' . $e->getMessage(), [
                'model' => get_class($this),
                'action' => $action,
                'resource_id' => $this->getKey() ?? 'N/A',
            ]);
        }
    }

    /**
     * Get audit logs for this model instance
     * 
     * @return \Illuminate\Support\Collection
     */
    public function getAuditLogs()
    {
        return DB::table('audit_logs')
            ->where('resource_type', class_basename($this))
            ->where('resource_id', $this->getKey())
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get recent audit logs (last 30 days) for this model
     * 
     * @param int $days
     * @return \Illuminate\Support\Collection
     */
    public function getRecentAuditLogs(int $days = 30)
    {
        return DB::table('audit_logs')
            ->where('resource_type', class_basename($this))
            ->where('resource_id', $this->getKey())
            ->where('created_at', '>=', now()->subDays($days))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get audit logs by action
     * 
     * @param string $action
     * @return \Illuminate\Support\Collection
     */
    public function getAuditLogsByAction(string $action)
    {
        return DB::table('audit_logs')
            ->where('resource_type', class_basename($this))
            ->where('resource_id', $this->getKey())
            ->where('action', $action)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get audit logs by user
     * 
     * @param int $userId
     * @return \Illuminate\Support\Collection
     */
    public function getAuditLogsByUser(int $userId)
    {
        return DB::table('audit_logs')
            ->where('resource_type', class_basename($this))
            ->where('resource_id', $this->getKey())
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get who created this record
     * 
     * @return object|null
     */
    public function getCreatedByAudit()
    {
        return DB::table('audit_logs')
            ->where('resource_type', class_basename($this))
            ->where('resource_id', $this->getKey())
            ->where('action', 'CREATE')
            ->orderBy('created_at', 'asc')
            ->first();
    }

    /**
     * Get who last updated this record
     * 
     * @return object|null
     */
    public function getLastUpdatedByAudit()
    {
        return DB::table('audit_logs')
            ->where('resource_type', class_basename($this))
            ->where('resource_id', $this->getKey())
            ->where('action', 'UPDATE')
            ->orderBy('created_at', 'desc')
            ->first();
    }

    /**
     * Check if record has been modified by specific user
     * 
     * @param int $userId
     * @return bool
     */
    public function wasModifiedByUser(int $userId): bool
    {
        return DB::table('audit_logs')
            ->where('resource_type', class_basename($this))
            ->where('resource_id', $this->getKey())
            ->where('user_id', $userId)
            ->whereIn('action', ['CREATE', 'UPDATE', 'DELETE'])
            ->exists();
    }
}
