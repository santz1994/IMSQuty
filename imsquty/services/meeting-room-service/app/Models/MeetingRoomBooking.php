<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Auditable;
use App\Traits\HasUUID;
use App\Traits\HasAudit;

class MeetingRoomBooking extends Model
{
    use HasFactory, SoftDeletes, Auditable, HasUUID, HasAudit;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'meeting_room_id',
        'user_id',
        'title',
        'description',
        'purpose',
        'start_time',
        'end_time',
        'attendees_count',
        'attendees_list',
        'participant_emails',
        'email_sent',
        'approval_email_sent',
        'special_requirements',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'cancellation_reason',
        'cancelled_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'attendees_list' => 'array',
        'participant_emails' => 'array',
        'email_sent' => 'boolean',
        'approval_email_sent' => 'boolean',
        'attendees_count' => 'integer',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'approved_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the meeting room that this booking belongs to.
     */
    public function meetingRoom()
    {
        return $this->belongsTo(MeetingRoom::class);
    }

    /**
     * Get the user who created this booking.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who approved this booking.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope a query to only include upcoming bookings.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>=', now())
            ->orderBy('start_time');
    }

    /**
     * Scope a query to only include today's bookings.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('start_time', today());
    }

    /**
     * Scope a query to filter bookings by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter bookings by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('start_time', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include active bookings (not cancelled or rejected).
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['cancelled', 'rejected']);
    }

    /**
     * Check if booking has conflicts with other bookings.
     */
    public function hasConflicts($excludeSelf = true)
    {
        $query = self::where('meeting_room_id', $this->meeting_room_id)
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->where(function ($q) {
                $q->whereBetween('start_time', [$this->start_time, $this->end_time])
                    ->orWhereBetween('end_time', [$this->start_time, $this->end_time])
                    ->orWhere(function ($q2) {
                        $q2->where('start_time', '<=', $this->start_time)
                            ->where('end_time', '>=', $this->end_time);
                    });
            });

        if ($excludeSelf && $this->exists) {
            $query->where('id', '!=', $this->id);
        }

        return $query->exists();
    }

    /**
     * Get the duration of the booking in minutes.
     */
    public function getDurationAttribute()
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    /**
     * Check if booking is in the past.
     */
    public function isPast()
    {
        return $this->end_time < now();
    }

    /**
     * Check if booking is currently ongoing.
     */
    public function isOngoing()
    {
        return $this->start_time <= now() && $this->end_time >= now();
    }

    /**
     * Check if booking can be cancelled.
     */
    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'approved']) && !$this->isPast();
    }
}
