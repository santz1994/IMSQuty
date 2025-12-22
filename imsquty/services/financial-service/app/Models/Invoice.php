<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'invoice_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'amount',
        'tax',
        'total',
        'due_date',
        'paid_date',
        'status',
        'notes',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date'
    ];

    const STATUS_DRAFT = 'Draft';
    const STATUS_PENDING = 'Pending';
    const STATUS_PAID = 'Paid';
    const STATUS_OVERDUE = 'Overdue';
    const STATUS_CANCELLED = 'Cancelled';

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_OVERDUE)
                    ->orWhere(function($q) {
                        $q->where('status', self::STATUS_PENDING)
                          ->where('due_date', '<', now());
                    });
    }

    public function getRemainingAmountAttribute(): float
    {
        return $this->total - $this->amount;
    }

    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_PENDING && $this->due_date->isPast();
    }
}
