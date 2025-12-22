<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'auditable_type',
        'auditable_id',
        'action',
        'user_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    // Polymorphic relationship
    public function auditable()
    {
        return $this->morphTo();
    }

    // User who performed the action
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Create audit log
    public static function log(string $action, Model $model, ?array $oldValues = null, ?array $newValues = null)
    {
        return self::create([
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'action' => $action,
            'user_id' => auth()->id(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
        ]);
    }
}
