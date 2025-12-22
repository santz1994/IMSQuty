<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

/**
 * Auditable Trait
 * 
 * Automatically tracks created_by, updated_by, deleted_by
 * For ISO 27001, GDPR, SOC 2 compliance
 */
trait Auditable
{
    /**
     * Boot the trait
     */
    protected static function bootAuditable(): void
    {
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
                $model->updated_by = Auth::id();
            }
        });

        static::updating(function ($model) {
            if (Auth::check()) {
                $model->updated_by = Auth::id();
            }
        });

        static::deleting(function ($model) {
            // Only set deleted_by if the column exists in the table
            if (Auth::check() && method_exists($model, 'runSoftDelete') && 
                in_array('deleted_by', $model->getFillable())) {
                $model->deleted_by = Auth::id();
                $model->save();
            }
        });
    }

    /**
     * Get the creator user
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get the updater user
     */
    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    /**
     * Get the deleter user
     */
    public function deleter()
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by');
    }
}
