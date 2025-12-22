<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SlaPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'ticket_priority_id',
        'ticket_type_id',
        'first_response_hours',
        'resolution_hours',
        'business_hours',
        'exclude_weekends',
        'exclude_holidays',
        'is_active',
    ];

    protected $casts = [
        'first_response_hours' => 'integer',
        'resolution_hours' => 'integer',
        'business_hours' => 'array',
        'exclude_weekends' => 'boolean',
        'exclude_holidays' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function priority()
    {
        return $this->belongsTo(TicketsPriority::class, 'ticket_priority_id');
    }

    public function type()
    {
        return $this->belongsTo(TicketsType::class, 'ticket_type_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Calculate SLA due date
    public function calculateDueDate(\DateTime $startDate = null): \DateTime
    {
        $start = $startDate ?? now();
        return $start->addHours($this->resolution_hours);
    }
}
