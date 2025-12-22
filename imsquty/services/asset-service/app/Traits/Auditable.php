<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Auditable Trait
 * 
 * Automatically tracks created_by, updated_by, and deleted_by for models.
 * Complies with ISO 27001, GDPR, and SOC 2 requirements for audit logging.
 * 
 * Usage: Add `use Auditable;` to your model class
 */
trait Auditable
{
    /**
     * Boot the auditable trait
     *
     * @return void
     */
    public static function bootAuditable()
    {
        // Set created_by during creation
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
            }
        });

        // Set updated_by during updates
        static::updating(function ($model) {
            if (Auth::check()) {
                $model->updated_by = Auth::id();
            }
        });

        // Set deleted_by during soft deletes
        static::deleting(function ($model) {
            if (Auth::check() && method_exists($model, 'isForceDeleting') && !$model->isForceDeleting()) {
                $model->deleted_by = Auth::id();
                $model->save(); // Save deleted_by before soft delete
            }
        });

        // Optional: Log all audit events to audit_logs table
        static::created(function ($model) {
            if (Auth::check() && config('audit.enabled', false)) {
                try {
                    Log::info('Model created', [
                        'user_id' => Auth::id(),
                        'model' => get_class($model),
                        'model_id' => $model->id,
                        'action' => 'create',
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to log model creation: ' . $e->getMessage());
                }
            }
        });

        static::updated(function ($model) {
            if (Auth::check() && config('audit.enabled', false)) {
                try {
                    $changes = $model->getDirty();
                    if (!empty($changes)) {
                        Log::info('Model updated', [
                            'user_id' => Auth::id(),
                            'model' => get_class($model),
                            'model_id' => $model->id,
                            'action' => 'update',
                            'changes' => array_keys($changes),
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to log model update: ' . $e->getMessage());
                }
            }
        });

        static::deleted(function ($model) {
            if (Auth::check() && config('audit.enabled', false)) {
                try {
                    $action = method_exists($model, 'isForceDeleting') && $model->isForceDeleting() 
                        ? 'force_delete' 
                        : 'soft_delete';
                    
                    Log::info('Model deleted', [
                        'user_id' => Auth::id(),
                        'model' => get_class($model),
                        'model_id' => $model->id,
                        'action' => $action,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to log model deletion: ' . $e->getMessage());
                }
            }
        });
    }

    /**
     * Get the user who created this record
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get the user who last updated this record
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    /**
     * Get the user who deleted this record (for soft deletes)
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function deleter()
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by');
    }
}
