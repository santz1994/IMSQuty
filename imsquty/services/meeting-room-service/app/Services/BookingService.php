<?php

namespace App\Services;

use App\Repositories\BookingRepository;
use App\Repositories\MeetingRoomRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BookingService
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private MeetingRoomRepository $meetingRoomRepository
    ) {}

    /**
     * Get all bookings with pagination and filters.
     */
    public function getAllBookings(int $perPage = 15, array $filters = [])
    {
        return $this->bookingRepository->getAll($perPage, $filters);
    }

    /**
     * Get booking by ID.
     */
    public function getBookingById(int $id)
    {
        return $this->bookingRepository->findById($id);
    }

    /**
     * Get user's bookings.
     */
    public function getUserBookings(int $userId, bool $upcomingOnly = false)
    {
        return $this->bookingRepository->getUserBookings($userId, $upcomingOnly);
    }

    /**
     * Get today's bookings.
     */
    public function getTodayBookings()
    {
        return $this->bookingRepository->getTodayBookings();
    }

    /**
     * Get upcoming bookings.
     */
    public function getUpcomingBookings(int $days = 7)
    {
        return $this->bookingRepository->getUpcomingBookings($days);
    }

    /**
     * Create a new booking with validation.
     */
    public function createBooking(array $data): array
    {
        // Validate meeting room exists
        $room = $this->meetingRoomRepository->findById($data['meeting_room_id']);
        if (!$room) {
            return [
                'success' => false,
                'message' => 'Meeting room not found',
            ];
        }

        // Validate time range
        $startTime = Carbon::parse($data['start_time']);
        $endTime = Carbon::parse($data['end_time']);

        if ($startTime >= $endTime) {
            return [
                'success' => false,
                'message' => 'Start time must be before end time',
            ];
        }

        if ($startTime < now()) {
            return [
                'success' => false,
                'message' => 'Cannot book rooms in the past',
            ];
        }

        // Validate duration (max 8 hours)
        $durationInHours = $startTime->diffInHours($endTime);
        if ($durationInHours > 8) {
            return [
                'success' => false,
                'message' => 'Booking duration cannot exceed 8 hours',
            ];
        }

        // Validate room capacity
        if (isset($data['attendees_count']) && $data['attendees_count'] > $room->capacity) {
            return [
                'success' => false,
                'message' => "Room capacity is {$room->capacity}, requested {$data['attendees_count']} attendees",
            ];
        }

        // Check for conflicts
        if ($this->bookingRepository->checkConflicts($data['meeting_room_id'], $startTime, $endTime)) {
            return [
                'success' => false,
                'message' => 'Room is not available for the selected time period',
            ];
        }

        // Check if room is available (status)
        if ($room->status !== 'available') {
            return [
                'success' => false,
                'message' => "Room is currently {$room->status}",
            ];
        }

        // Create booking
        try {
            DB::beginTransaction();

            $booking = $this->bookingRepository->create($data);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Booking created successfully',
                'data' => $booking->load(['meetingRoom', 'user']),
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return [
                'success' => false,
                'message' => 'Failed to create booking: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update a booking with validation.
     */
    public function updateBooking(int $id, array $data): array
    {
        $booking = $this->bookingRepository->findById($id);

        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        // Cannot update completed, cancelled, or rejected bookings
        if (in_array($booking->status, ['completed', 'cancelled', 'rejected'])) {
            return [
                'success' => false,
                'message' => "Cannot update {$booking->status} booking",
            ];
        }

        // Validate time range if changed
        if (isset($data['start_time']) || isset($data['end_time'])) {
            $startTime = Carbon::parse($data['start_time'] ?? $booking->start_time);
            $endTime = Carbon::parse($data['end_time'] ?? $booking->end_time);

            if ($startTime >= $endTime) {
                return [
                    'success' => false,
                    'message' => 'Start time must be before end time',
                ];
            }

            if ($startTime < now()) {
                return [
                    'success' => false,
                    'message' => 'Cannot book rooms in the past',
                ];
            }

            // Check for conflicts (excluding current booking)
            $roomId = $data['meeting_room_id'] ?? $booking->meeting_room_id;
            if ($this->bookingRepository->checkConflicts($roomId, $startTime, $endTime, $id)) {
                return [
                    'success' => false,
                    'message' => 'Room is not available for the selected time period',
                ];
            }
        }

        try {
            DB::beginTransaction();

            $updated = $this->bookingRepository->update($id, $data);

            DB::commit();

            return [
                'success' => $updated,
                'message' => $updated ? 'Booking updated successfully' : 'Failed to update booking',
                'data' => $updated ? $this->bookingRepository->findById($id) : null,
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return [
                'success' => false,
                'message' => 'Failed to update booking: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a booking.
     */
    public function deleteBooking(int $id): array
    {
        $booking = $this->bookingRepository->findById($id);

        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        $deleted = $this->bookingRepository->delete($id);

        return [
            'success' => $deleted,
            'message' => $deleted ? 'Booking deleted successfully' : 'Failed to delete booking',
        ];
    }

    /**
     * Approve a booking.
     */
    public function approveBooking(int $id, int $approvedBy): array
    {
        $booking = $this->bookingRepository->findById($id);

        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        if ($booking->status !== 'pending') {
            return [
                'success' => false,
                'message' => 'Only pending bookings can be approved',
            ];
        }

        $approved = $this->bookingRepository->approve($id, $approvedBy);

        return [
            'success' => $approved,
            'message' => $approved ? 'Booking approved successfully' : 'Failed to approve booking',
            'data' => $approved ? $this->bookingRepository->findById($id) : null,
        ];
    }

    /**
     * Reject a booking.
     */
    public function rejectBooking(int $id, int $rejectedBy, string $reason): array
    {
        $booking = $this->bookingRepository->findById($id);

        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        if ($booking->status !== 'pending') {
            return [
                'success' => false,
                'message' => 'Only pending bookings can be rejected',
            ];
        }

        $rejected = $this->bookingRepository->reject($id, $rejectedBy, $reason);

        return [
            'success' => $rejected,
            'message' => $rejected ? 'Booking rejected successfully' : 'Failed to reject booking',
            'data' => $rejected ? $this->bookingRepository->findById($id) : null,
        ];
    }

    /**
     * Cancel a booking.
     */
    public function cancelBooking(int $id, string $reason): array
    {
        $booking = $this->bookingRepository->findById($id);

        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        if (!$booking->canBeCancelled()) {
            return [
                'success' => false,
                'message' => 'This booking cannot be cancelled',
            ];
        }

        $cancelled = $this->bookingRepository->cancel($id, $reason);

        return [
            'success' => $cancelled,
            'message' => $cancelled ? 'Booking cancelled successfully' : 'Failed to cancel booking',
            'data' => $cancelled ? $this->bookingRepository->findById($id) : null,
        ];
    }

    /**
     * Get booking statistics.
     */
    public function getStatistics(array $filters = []): array
    {
        return [
            'success' => true,
            'data' => $this->bookingRepository->getStatistics($filters),
        ];
    }
}
