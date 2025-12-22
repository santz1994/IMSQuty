<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketsStatus extends Model
{
    use HasFactory;

    protected $table = 'tickets_statuses';

    protected $fillable = [
        'status',
        'color',
        'order',
        'is_active',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'ticket_status_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }

    // Helper methods
    public function isOpen(): bool
    {
        return in_array($this->status, ['New', 'Open', 'In Progress']);
    }

    public function isClosed(): bool
    {
        return in_array($this->status, ['Resolved', 'Closed']);
    }
}
