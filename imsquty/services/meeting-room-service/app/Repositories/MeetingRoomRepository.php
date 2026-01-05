<?php

namespace App\Repositories;

use App\Models\MeetingRoom;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Shared\Repositories\BaseRepository;

class MeetingRoomRepository extends BaseRepository
{
    /**
     * Specify Model class name
     *
     * @return string
     */
    protected function model(): string
    {
        return MeetingRoom::class;
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
