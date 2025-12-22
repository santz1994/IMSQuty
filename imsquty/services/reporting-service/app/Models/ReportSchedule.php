<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReportSchedule extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'name',
        'report_type',
        'frequency',
        'parameters',
        'format',
        'recipients',
        'is_active',
        'last_run_at',
        'next_run_at',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'parameters' => 'array',
        'recipients' => 'array',
        'is_active' => 'boolean',
        'last_run_at' => 'datetime',
        'next_run_at' => 'datetime'
    ];

    const FREQUENCY_DAILY = 'Daily';
    const FREQUENCY_WEEKLY = 'Weekly';
    const FREQUENCY_MONTHLY = 'Monthly';
    const FREQUENCY_QUARTERLY = 'Quarterly';
    const FREQUENCY_YEARLY = 'Yearly';

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDueForExecution($query)
    {
        return $query->where('is_active', true)
                    ->where('next_run_at', '<=', now());
    }
}
