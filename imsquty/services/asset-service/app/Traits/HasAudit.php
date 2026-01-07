<?php

namespace App\Traits;

use App\Models\AuditLog;

trait HasAudit
{
    protected static function bootHasAudit()
    {
        static::created(function ($model) {
            static::logAudit('create', $model, null, $model->getAttributes());
        });

        static::updated(function ($model) {
            static::logAudit('update', $model, $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function ($model) {
            static::logAudit('delete', $model, $model->getAttributes(), null);
        });
    }

    protected static function logAudit(string $action, $model, ?array $oldValues, ?array $newValues): void
    {
        try {
            $userId = auth()->id() ?? null;
            $userName = auth()->user()?->name ?? 'System';

            AuditLog::create([
                'model' => get_class($model),
                'model_id' => $model->getKey(),
                'action' => $action,
                'user_id' => $userId,
                'user_name' => $userName,
                'user_ip' => request()->ip(),
                'old_values' => $oldValues ? json_encode($oldValues) : null,
                'new_values' => $newValues ? json_encode($newValues) : null,
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            // Silently fail if audit logging fails
            report($e);
        }
    }
}
