<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Budget extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'name',
        'category',
        'allocated_amount',
        'spent_amount',
        'period_start',
        'period_end',
        'is_active',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'allocated_amount' => 'decimal:2',
        'spent_amount' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date',
        'is_active' => 'boolean'
    ];

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getUtilizationPercentageAttribute(): float
    {
        if ($this->allocated_amount == 0) return 0;
        return ($this->spent_amount / $this->allocated_amount) * 100;
    }
}
