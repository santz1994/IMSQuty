<?php

namespace App\Repositories;

use App\Models\MeetingRoom;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class MeetingRoomRepository
{
    /**
     * Get all meeting rooms with pagination.
     */
    public function getAll(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = MeetingRoom::query();

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['location_id'])) {
            $query->where('location_id', $filters['location_id']);
        }

        if (isset($filters['min_capacity'])) {
            $query->where('capacity', '>=', $filters['min_capacity']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('code', 'like', "%{$filters['search']}%")
                    ->orWhere('building', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    /**
     * Find meeting room by ID.
     */
    public function findById(int $id): ?MeetingRoom
    {
        return MeetingRoom::with(['bookings' => function ($query) {
            $query->active()->upcoming();
        }])->find($id);
    }

    /**
     * Find meeting room by code.
     */
    public function findByCode(string $code): ?MeetingRoom
    {
        return MeetingRoom::where('code', $code)->first();
    }

    /**
     * Get available rooms for a specific time period.
     */
    public function findAvailableRooms($startTime, $endTime, int $minCapacity = null): Collection
    {
        $query = MeetingRoom::available();

        if ($minCapacity) {
            $query->byCapacity($minCapacity);
        }

        $rooms = $query->get();

        // Filter rooms that are actually available for the time period
        return $rooms->filter(function ($room) use ($startTime, $endTime) {
            return $room->isAvailableForPeriod($startTime, $endTime);
        });
    }

    /**
     * Check if a room is available for a specific time period.
     */
    public function checkAvailability(int $roomId, $startTime, $endTime, int $excludeBookingId = null): bool
    {
        $room = $this->findById($roomId);

        if (!$room) {
            return false;
        }

        return $room->isAvailableForPeriod($startTime, $endTime, $excludeBookingId);
    }

    /**
     * Create a new meeting room.
     */
    public function create(array $data): MeetingRoom
    {
        return MeetingRoom::create($data);
    }

    /**
     * Update a meeting room.
     */
    public function update(int $id, array $data): bool
    {
        $room = $this->findById($id);

        if (!$room) {
            return false;
        }

        return $room->update($data);
    }

    /**
     * Delete a meeting room (soft delete).
     */
    public function delete(int $id): bool
    {
        $room = $this->findById($id);

        if (!$room) {
            return false;
        }

        return $room->delete();
    }

    /**
     * Get upcoming bookings for a room.
     */
    public function getUpcomingBookings(int $roomId): Collection
    {
        $room = $this->findById($roomId);

        if (!$room) {
            return collect();
        }

        return $room->upcoming_bookings;
    }

    /**
     * Get statistics for a meeting room.
     */
    public function getStatistics(int $roomId): array
    {
        $room = $this->findById($roomId);

        if (!$room) {
            return [];
        }

        $totalBookings = $room->bookings()->count();
        $activeBookings = $room->activeBookings()->count();
        $completedBookings = $room->bookings()->byStatus('completed')->count();
        $cancelledBookings = $room->bookings()->whereIn('status', ['cancelled', 'rejected'])->count();

        return [
            'total_bookings' => $totalBookings,
            'active_bookings' => $activeBookings,
            'completed_bookings' => $completedBookings,
            'cancelled_bookings' => $cancelledBookings,
            'utilization_rate' => $totalBookings > 0 ? round(($completedBookings / $totalBookings) * 100, 2) : 0,
        ];
    }
}
