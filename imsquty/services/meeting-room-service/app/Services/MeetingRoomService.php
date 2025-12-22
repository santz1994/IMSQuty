<?php

namespace App\Services;

use App\Repositories\MeetingRoomRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class MeetingRoomService
{
    public function __construct(
        private MeetingRoomRepository $meetingRoomRepository
    ) {}

    /**
     * Get all meeting rooms with pagination and filters.
     */
    public function getAllRooms(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->meetingRoomRepository->getAll($perPage, $filters);
    }

    /**
     * Get meeting room by ID.
     */
    public function getRoomById(int $id): ?array
    {
        $room = $this->meetingRoomRepository->findById($id);

        if (!$room) {
            return null;
        }

        return [
            'room' => $room,
            'statistics' => $this->meetingRoomRepository->getStatistics($id),
        ];
    }

    /**
     * Find available rooms for a specific time period.
     */
    public function findAvailableRooms($startTime, $endTime, ?int $minCapacity = null): Collection
    {
        // Validate time range
        if ($startTime >= $endTime) {
            throw new \InvalidArgumentException('Start time must be before end time');
        }

        if ($startTime < now()) {
            throw new \InvalidArgumentException('Cannot book rooms in the past');
        }

        return $this->meetingRoomRepository->findAvailableRooms($startTime, $endTime, $minCapacity);
    }

    /**
     * Check if a room is available for booking.
     */
    public function checkAvailability(int $roomId, $startTime, $endTime, ?int $excludeBookingId = null): bool
    {
        // Validate time range
        if ($startTime >= $endTime) {
            return false;
        }

        if ($startTime < now()) {
            return false;
        }

        return $this->meetingRoomRepository->checkAvailability($roomId, $startTime, $endTime, $excludeBookingId);
    }

    /**
     * Create a new meeting room.
     */
    public function createRoom(array $data): array
    {
        // Validate unique code
        if (isset($data['code'])) {
            $existing = $this->meetingRoomRepository->findByCode($data['code']);
            if ($existing) {
                throw new \InvalidArgumentException('Room code already exists');
            }
        }

        // Validate capacity
        if (isset($data['capacity']) && $data['capacity'] < 0) {
            throw new \InvalidArgumentException('Capacity must be a positive number');
        }

        $room = $this->meetingRoomRepository->create($data);

        return [
            'success' => true,
            'message' => 'Meeting room created successfully',
            'data' => $room,
        ];
    }

    /**
     * Update a meeting room.
     */
    public function updateRoom(int $id, array $data): array
    {
        $room = $this->meetingRoomRepository->findById($id);

        if (!$room) {
            return [
                'success' => false,
                'message' => 'Meeting room not found',
            ];
        }

        // Validate unique code if changed
        if (isset($data['code']) && $data['code'] !== $room->code) {
            $existing = $this->meetingRoomRepository->findByCode($data['code']);
            if ($existing) {
                throw new \InvalidArgumentException('Room code already exists');
            }
        }

        // Validate capacity
        if (isset($data['capacity']) && $data['capacity'] < 0) {
            throw new \InvalidArgumentException('Capacity must be a positive number');
        }

        $updated = $this->meetingRoomRepository->update($id, $data);

        return [
            'success' => $updated,
            'message' => $updated ? 'Meeting room updated successfully' : 'Failed to update meeting room',
            'data' => $updated ? $this->meetingRoomRepository->findById($id) : null,
        ];
    }

    /**
     * Delete a meeting room.
     */
    public function deleteRoom(int $id): array
    {
        $room = $this->meetingRoomRepository->findById($id);

        if (!$room) {
            return [
                'success' => false,
                'message' => 'Meeting room not found',
            ];
        }

        // Check for active bookings
        $activeBookings = $room->activeBookings()->upcoming()->count();
        if ($activeBookings > 0) {
            return [
                'success' => false,
                'message' => 'Cannot delete room with active bookings',
            ];
        }

        $deleted = $this->meetingRoomRepository->delete($id);

        return [
            'success' => $deleted,
            'message' => $deleted ? 'Meeting room deleted successfully' : 'Failed to delete meeting room',
        ];
    }

    /**
     * Get room statistics.
     */
    public function getRoomStatistics(int $id): array
    {
        $room = $this->meetingRoomRepository->findById($id);

        if (!$room) {
            return [
                'success' => false,
                'message' => 'Meeting room not found',
            ];
        }

        return [
            'success' => true,
            'data' => $this->meetingRoomRepository->getStatistics($id),
        ];
    }
}
