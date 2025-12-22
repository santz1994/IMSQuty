<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

/**
 * Auditable Trait
 * 
 * Automatically logs all CREATE, UPDATE, DELETE operations to audit_logs table
 * 
 * Compliance: ISO 27001, GDPR, SOC 2
 * 
 * Usage:
 * 
 * class MeetingRoom extends Model
 * {
 *     use Auditable;
 * }
 */
trait Auditable
{
    /**
     * Boot the Auditable trait
     */
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            $model->auditLog('CREATE');
        });

        static::updated(function ($model) {
            $model->auditLog('UPDATE');
        });

        static::deleted(function ($model) {
            $model->auditLog('DELETE');
        });

        if (method_exists(static::class, 'restored')) {
            static::restored(function ($model) {
                $model->auditLog('RESTORE');
            });
        }

        if (method_exists(static::class, 'forceDeleted')) {
            static::forceDeleted(function ($model) {
                $model->auditLog('FORCE_DELETE');
            });
        }
    }

    /**
     * Create audit log entry
     */
    protected function auditLog(string $action): void
    {
        try {
            $userId = Auth::id();
            $resourceType = class_basename($this);
            $resourceId = $this->getKey();

            $oldValues = null;
            $newValues = null;

            switch ($action) {
                case 'CREATE':
                    $newValues = $this->getAttributes();
                    break;

                case 'UPDATE':
                    $oldValues = $this->getOriginal();
                    $newValues = $this->getChanges();
                    
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

            $sensitiveFields = ['password', 'remember_token', 'api_token'];
            if ($oldValues) {
                $oldValues = collect($oldValues)->except($sensitiveFields)->toArray();
            }
            if ($newValues) {
                $newValues = collect($newValues)->except($sensitiveFields)->toArray();
            }

            DB::table('audit_logs')->insert([
                'user_id' => $userId,
                'action' => $action,
                'resource' => $resourceType,
                'resource_id' => $resourceId,
                'old_values' => $oldValues ? json_encode($oldValues) : null,
                'new_values' => $newValues ? json_encode($newValues) : null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Audit logging failed: ' . $e->getMessage(), [
                'model' => get_class($this),
                'action' => $action,
                'resource_id' => $this->getKey() ?? 'N/A',
            ]);
        }
    }

    /**
     * Get audit logs for this model instance
     */
    public function getAuditLogs()
    {
        return DB::table('audit_logs')
            ->where('resource', class_basename($this))
            ->where('resource_id', $this->getKey())
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
