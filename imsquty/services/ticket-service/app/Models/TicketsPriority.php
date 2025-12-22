<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketsPriority extends Model
{
    use HasFactory;

    protected $fillable = [
        'priority',
        'sla_hours',
        'color',
        'order',
        'is_active',
    ];

    protected $casts = [
        'sla_hours' => 'integer',
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'ticket_priority_id');
    }

    public function slaPolicies()
    {
        return $this->hasMany(SlaPolicy::class, 'ticket_priority_id');
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
}
