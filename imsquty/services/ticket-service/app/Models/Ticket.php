<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_code',
        'user_id',
        'location_id',
        'ticket_status_id',
        'ticket_type_id',
        'ticket_priority_id',
        'subject',
        'description',
        'assigned_to',
        'assigned_at',
        'assignment_type',
        'sla_due',
        'first_response_at',
        'resolved_at',
        'closed',
        'is_breached',
        'asset_id',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'sla_due' => 'datetime',
        'first_response_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed' => 'datetime',
        'is_breached' => 'boolean',
    ];

    protected $appends = ['status_name', 'priority_name', 'type_name'];

    // Boot method for auto-generating ticket code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_code)) {
                $ticket->ticket_code = self::generateTicketCode();
            }
        });
    }

    // Generate unique ticket code: TKT-20251218-001
    public static function generateTicketCode(): string
    {
        $prefix = 'TKT';
        $date = now()->format('Ymd');
        $lastTicket = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastTicket ? (int)substr($lastTicket->ticket_code, -3) + 1 : 1;

        return $prefix . '-' . $date . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function status()
    {
        return $this->belongsTo(TicketsStatus::class, 'ticket_status_id');
    }

    public function priority()
    {
        return $this->belongsTo(TicketsPriority::class, 'ticket_priority_id');
    }

    public function type()
    {
        return $this->belongsTo(TicketsType::class, 'ticket_type_id');
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class)->orderBy('created_at', 'desc');
    }

    public function history()
    {
        return $this->hasMany(TicketHistory::class)->orderBy('changed_at', 'desc');
    }

    // Accessors
    public function getStatusNameAttribute()
    {
        return $this->status ? $this->status->status : null;
    }

    public function getPriorityNameAttribute()
    {
        return $this->priority ? $this->priority->priority : null;
    }

    public function getTypeNameAttribute()
    {
        return $this->type ? $this->type->type : null;
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->whereIn('status', ['New', 'Open', 'In Progress']);
        });
    }

    public function scopeClosed($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->whereIn('status', ['Resolved', 'Closed']);
        });
    }

    public function scopeBreached($query)
    {
        return $query->where('is_breached', true);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeCreatedBy($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
