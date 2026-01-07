<?php

namespace App\Services;

use App\Repositories\MeetingRoomRepository;
use App\Repositories\BookingRepository;
use Carbon\Carbon;

class AvailabilityService
{
    protected MeetingRoomRepository $meetingRoomRepository;
    protected BookingRepository $bookingRepository;

    public function __construct(
        MeetingRoomRepository $meetingRoomRepository,
        BookingRepository $bookingRepository
    ) {
        $this->meetingRoomRepository = $meetingRoomRepository;
        $this->bookingRepository = $bookingRepository;
    }

    /**
     * Check availability for a specific room and time
     */
    public function checkAvailability(int $roomId, string $startTime, string $endTime): array
    {
        $room = $this->meetingRoomRepository->findById($roomId);
        
        if (!$room) {
            return [
                'available' => false,
                'message' => 'Meeting room not found',
            ];
        }

        if (!$room->is_active) {
            return [
                'available' => false,
                'message' => 'Meeting room is not active',
            ];
        }

        // Check for conflicting bookings
        $conflicts = \DB::table('room_bookings')
            ->where('meeting_room_id', $roomId)
            ->whereIn('status', ['Confirmed', 'In-Progress'])
            ->where(function($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                      ->orWhereBetween('end_time', [$startTime, $endTime])
                      ->orWhere(function($q) use ($startTime, $endTime) {
                          $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                      });
            })
            ->exists();

        if ($conflicts) {
            return [
                'available' => false,
                'message' => 'Time slot is already booked',
            ];
        }

        return [
            'available' => true,
            'message' => 'Time slot is available',
            'room' => $room,
        ];
    }

    /**
     * Find available rooms for a specific time and capacity
     */
    public function findAvailableRooms(string $startTime, string $endTime, int $minCapacity = 1, array $requiredFacilities = []): array
    {
        // Get all active rooms
        $rooms = $this->meetingRoomRepository->getAvailableRooms();

        // Filter by capacity
        if ($minCapacity > 1) {
            $rooms = $rooms->filter(function($room) use ($minCapacity) {
                return $room->capacity >= $minCapacity;
            });
        }

        // Filter by facilities
        if (!empty($requiredFacilities)) {
            $rooms = $rooms->filter(function($room) use ($requiredFacilities) {
                $roomFacilities = is_array($room->facilities) ? $room->facilities : json_decode($room->facilities, true) ?? [];
                foreach ($requiredFacilities as $facility) {
                    if (!in_array($facility, $roomFacilities)) {
                        return false;
                    }
                }
                return true;
            });
        }

        // Check availability for each room
        $availableRooms = [];
        foreach ($rooms as $room) {
            $availability = $this->checkAvailability($room->id, $startTime, $endTime);
            if ($availability['available']) {
                $availableRooms[] = $room;
            }
        }

        return [
            'available_rooms' => $availableRooms,
            'total_found' => count($availableRooms),
            'search_criteria' => [
                'start_time' => $startTime,
                'end_time' => $endTime,
                'min_capacity' => $minCapacity,
                'required_facilities' => $requiredFacilities,
            ],
        ];
    }

    /**
     * Get room schedule for a specific date
     */
    public function getRoomSchedule(int $roomId, string $date): array
    {
        $bookings = \DB::table('room_bookings')
            ->where('meeting_room_id', $roomId)
            ->whereDate('start_time', $date)
            ->whereIn('status', ['Confirmed', 'In-Progress', 'Pending'])
            ->orderBy('start_time')
            ->get();

        $room = $this->meetingRoomRepository->findById($roomId);

        return [
            'room' => $room,
            'date' => $date,
            'bookings' => $bookings,
            'total_bookings' => count($bookings),
        ];
    }

    /**
     * Get availability matrix for multiple rooms and days
     */
    public function getAvailabilityMatrix(array $roomIds, string $startDate, string $endDate): array
    {
        $matrix = [];
        
        $currentDate = Carbon::parse($startDate);
        $endDate = Carbon::parse($endDate);

        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');
            $matrix[$dateStr] = [];

            foreach ($roomIds as $roomId) {
                $bookings = \DB::table('room_bookings')
                    ->where('meeting_room_id', $roomId)
                    ->whereDate('start_time', $dateStr)
                    ->whereIn('status', ['Confirmed', 'In-Progress'])
                    ->count();

                $matrix[$dateStr][$roomId] = [
                    'bookings_count' => $bookings,
                    'has_availability' => $bookings < 10, // Assuming max 10 bookings per day per room
                ];
            }

            $currentDate->addDay();
        }

        return [
            'matrix' => $matrix,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'room_ids' => $roomIds,
        ];
    }
}
