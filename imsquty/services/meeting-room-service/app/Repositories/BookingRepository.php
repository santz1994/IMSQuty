<?php

namespace App\Repositories;

use App\Models\MeetingRoomBooking;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class BookingRepository
{
    /**
     * Get all bookings with pagination.
     */
    public function getAll(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = MeetingRoomBooking::with(['meetingRoom', 'user', 'approver']);

        // Apply filters
        if (isset($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (isset($filters['meeting_room_id'])) {
            $query->where('meeting_room_id', $filters['meeting_room_id']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->byDateRange($filters['start_date'], $filters['end_date']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('start_time', 'desc')->paginate($perPage);
    }

    /**
     * Find booking by ID.
     */
    public function findById(int $id): ?MeetingRoomBooking
    {
        return MeetingRoomBooking::with(['meetingRoom', 'user', 'approver'])->find($id);
    }

    /**
     * Get user's bookings.
     */
    public function getUserBookings(int $userId, bool $upcomingOnly = false): Collection
    {
        $query = MeetingRoomBooking::with(['meetingRoom'])
            ->where('user_id', $userId);

        if ($upcomingOnly) {
            $query->upcoming();
        }

        return $query->orderBy('start_time', 'desc')->get();
    }

    /**
     * Get today's bookings.
     */
    public function getTodayBookings(): Collection
    {
        return MeetingRoomBooking::with(['meetingRoom', 'user'])
            ->today()
            ->active()
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get upcoming bookings.
     */
    public function getUpcomingBookings(int $days = 7): Collection
    {
        $endDate = Carbon::now()->addDays($days);

        return MeetingRoomBooking::with(['meetingRoom', 'user'])
            ->where('start_time', '>=', now())
            ->where('start_time', '<=', $endDate)
            ->active()
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Check for booking conflicts.
     */
    public function checkConflicts(int $roomId, $startTime, $endTime, int $excludeBookingId = null): bool
    {
        $query = MeetingRoomBooking::where('meeting_room_id', $roomId)
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

        return $query->exists();
    }

    /**
     * Create a new booking.
     */
    public function create(array $data): MeetingRoomBooking
    {
        return MeetingRoomBooking::create($data);
    }

    /**
     * Update a booking.
     */
    public function update(int $id, array $data): bool
    {
        $booking = $this->findById($id);

        if (!$booking) {
            return false;
        }

        return $booking->update($data);
    }

    /**
     * Delete a booking (soft delete).
     */
    public function delete(int $id): bool
    {
        $booking = $this->findById($id);

        if (!$booking) {
            return false;
        }

        return $booking->delete();
    }

    /**
     * Approve a booking.
     */
    public function approve(int $id, int $approvedBy): bool
    {
        $booking = $this->findById($id);

        if (!$booking) {
            return false;
        }

        return $booking->update([
            'status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);
    }

    /**
     * Reject a booking.
     */
    public function reject(int $id, int $rejectedBy, string $reason): bool
    {
        $booking = $this->findById($id);

        if (!$booking) {
            return false;
        }

        return $booking->update([
            'status' => 'rejected',
            'approved_by' => $rejectedBy,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Cancel a booking.
     */
    public function cancel(int $id, string $reason): bool
    {
        $booking = $this->findById($id);

        if (!$booking || !$booking->canBeCancelled()) {
            return false;
        }

        return $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
        ]);
    }

    /**
     * Get booking statistics.
     */
    public function getStatistics(array $filters = []): array
    {
        $query = MeetingRoomBooking::query();

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->byDateRange($filters['start_date'], $filters['end_date']);
        }

        $totalBookings = (clone $query)->count();
        $pendingBookings = (clone $query)->byStatus('pending')->count();
        $approvedBookings = (clone $query)->byStatus('approved')->count();
        $completedBookings = (clone $query)->byStatus('completed')->count();
        $cancelledBookings = (clone $query)->whereIn('status', ['cancelled', 'rejected'])->count();

        return [
            'total_bookings' => $totalBookings,
            'pending_bookings' => $pendingBookings,
            'approved_bookings' => $approvedBookings,
            'completed_bookings' => $completedBookings,
            'cancelled_bookings' => $cancelledBookings,
            'completion_rate' => $totalBookings > 0 ? round(($completedBookings / $totalBookings) * 100, 2) : 0,
        ];
    }
}
