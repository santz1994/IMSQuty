<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Auditable;

class MeetingRoom extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'location_id',
        'floor',
        'building',
        'capacity',
        'description',
        'facilities',
        'equipment',
        'hourly_rate',
        'status',
        'image',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'facilities' => 'array',
        'equipment' => 'array',
        'hourly_rate' => 'decimal:2',
        'capacity' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the bookings for this meeting room.
     */
    public function bookings()
    {
        return $this->hasMany(MeetingRoomBooking::class);
    }

    /**
     * Get active (not cancelled/rejected) bookings for this room.
     */
    public function activeBookings()
    {
        return $this->hasMany(MeetingRoomBooking::class)
            ->whereNotIn('status', ['cancelled', 'rejected']);
    }

    /**
     * Scope a query to only include available rooms.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to filter rooms by minimum capacity.
     */
    public function scopeByCapacity($query, int $minCapacity)
    {
        return $query->where('capacity', '>=', $minCapacity);
    }

    /**
     * Scope a query to filter rooms by location.
     */
    public function scopeByLocation($query, int $locationId)
    {
        return $query->where('location_id', $locationId);
    }

    /**
     * Check if room is available for a specific time period.
     */
    public function isAvailableForPeriod($startTime, $endTime, $excludeBookingId = null)
    {
        if ($this->status !== 'available') {
            return false;
        }

        $query = $this->bookings()
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(function ($q2) use ($startTime, $endTime) {
                        $q2->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                    });
            });

        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        return $query->count() === 0;
    }

    /**
     * Get upcoming bookings (today and future).
     */
    public function getUpcomingBookingsAttribute()
    {
        return $this->bookings()
            ->where('start_time', '>=', now())
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->orderBy('start_time')
            ->get();
    }
}
