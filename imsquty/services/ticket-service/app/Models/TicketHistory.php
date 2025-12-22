<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketHistory extends Model
{
    use HasFactory;

    protected $table = 'ticket_history';

    protected $fillable = [
        'ticket_id',
        'field_changed',
        'old_value',
        'new_value',
        'changed_by_user_id',
        'changed_at',
        'change_type',
        'event_type',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    // Relationships
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }

    // Scopes
    public function scopeFieldChange($query)
    {
        return $query->where('change_type', 'field_change');
    }

    public function scopeStatusChange($query)
    {
        return $query->where('change_type', 'status_change');
    }
}
