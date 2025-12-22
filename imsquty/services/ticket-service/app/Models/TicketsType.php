<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketsType extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'ticket_type_id');
    }

    public function slaPolicies()
    {
        return $this->hasMany(SlaPolicy::class, 'ticket_type_id');
    }

    public function cannedFields()
    {
        return $this->hasMany(TicketsCannedField::class, 'ticket_type_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
