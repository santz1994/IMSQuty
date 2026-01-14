<?php

namespace App\Services;

use App\Repositories\BookingRepository;
use App\DTOs\CheckInDTO;
use App\DTOs\CheckOutDTO;
use App\DTOs\BookingFeedbackDTO;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class BookingWorkflowService
{
    protected BookingRepository $bookingRepository;
    protected EmailService $emailService;

    public function __construct(BookingRepository $bookingRepository, EmailService $emailService)
    {
        $this->bookingRepository = $bookingRepository;
        $this->emailService = $emailService;
    }

    /**
     * Check-in to a booking
     */
    public function checkIn(int $bookingId, CheckInDTO $dto): array
    {
        $booking = $this->bookingRepository->findById($bookingId);
        
        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        // Validate booking status
        if ($booking->status !== 'Confirmed') {
            return [
                'success' => false,
                'message' => 'Only confirmed bookings can be checked in',
            ];
        }

        // Check if already checked in
        if ($booking->check_in_time) {
            return [
                'success' => false,
                'message' => 'Booking already checked in',
            ];
        }

        // Update booking with check-in info
        $updated = $this->bookingRepository->update($bookingId, [
            'check_in_time' => $dto->check_in_time ?? Carbon::now(),
            'actual_attendees' => $dto->actual_attendees,
            'status' => 'In-Progress',
        ]);

        return [
            'success' => true,
            'message' => 'Check-in successful',
            'data' => $updated,
        ];
    }

    /**
     * Check-out from a booking
     */
    public function checkOut(int $bookingId, CheckOutDTO $dto): array
    {
        $booking = $this->bookingRepository->findById($bookingId);
        
        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        // Validate booking status
        if ($booking->status !== 'In-Progress') {
            return [
                'success' => false,
                'message' => 'Only in-progress bookings can be checked out',
            ];
        }

        // Check if already checked out
        if ($booking->check_out_time) {
            return [
                'success' => false,
                'message' => 'Booking already checked out',
            ];
        }

        // Update booking with check-out info
        $updated = $this->bookingRepository->update($bookingId, [
            'check_out_time' => $dto->check_out_time ?? Carbon::now(),
            'condition_notes' => $dto->condition_notes,
            'issues_reported' => $dto->issues_reported,
            'equipment_damaged' => $dto->equipment_damaged,
            'status' => 'Completed',
        ]);

        return [
            'success' => true,
            'message' => 'Check-out successful',
            'data' => $updated,
        ];
    }

    /**
     * Submit booking feedback
     */
    public function submitFeedback(int $bookingId, BookingFeedbackDTO $dto): array
    {
        $booking = $this->bookingRepository->findById($bookingId);
        
        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        // Validate booking status
        if ($booking->status !== 'Completed') {
            return [
                'success' => false,
                'message' => 'Only completed bookings can receive feedback',
            ];
        }

        // Store feedback (assuming feedback table exists)
        $feedback = [
            'booking_id' => $bookingId,
            'user_id' => $dto->user_id,
            'rating' => $dto->rating,
            'cleanliness_rating' => $dto->cleanliness_rating,
            'equipment_rating' => $dto->equipment_rating,
            'comment' => $dto->comment,
            'would_recommend' => $dto->would_recommend,
            'issues' => json_encode($dto->issues),
            'created_at' => Carbon::now(),
        ];

        // Store in database (you may need to create BookingFeedback model)
        \DB::table('room_booking_feedback')->insert($feedback);

        return [
            'success' => true,
            'message' => 'Feedback submitted successfully',
            'data' => $feedback,
        ];
    }

    /**
     * Approve booking (for managers)
     */
    public function approve(int $bookingId, int $approvedBy): array
    {
        $booking = $this->bookingRepository->findById($bookingId);
        
        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        if ($booking->status !== 'Pending') {
            return [
                'success' => false,
                'message' => 'Only pending bookings can be approved',
            ];
        }

        // Get approver details
        $approver = User::find($approvedBy);
        if (!$approver) {
            Log::warning('Approver user not found', ['user_id' => $approvedBy]);
            $approver = null;
        }

        // Update booking status
        $updated = $this->bookingRepository->update($bookingId, [
            'status' => 'Confirmed',
            'approved_by' => $approvedBy,
            'approved_at' => Carbon::now(),
        ]);

        // Send approval email to all participants
        if ($approver && $updated) {
            try {
                $this->emailService->sendBookingApproved($updated, $approver);
            } catch (\Exception $e) {
                Log::error('Failed to send approval email', [
                    'booking_id' => $bookingId,
                    'error' => $e->getMessage(),
                ]);
                // Don't fail the approval if email fails
            }
        }

        return [
            'success' => true,
            'message' => 'Booking approved successfully',
            'data' => $updated,
        ];
    }

    /**
     * Reject booking (for managers)
     */
    public function reject(int $bookingId, int $rejectedBy, string $reason): array
    {
        $booking = $this->bookingRepository->findById($bookingId);
        
        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        if ($booking->status !== 'Pending') {
            return [
                'success' => false,
                'message' => 'Only pending bookings can be rejected',
            ];
        }

        // Get rejecter details
        $rejecter = User::find($rejectedBy);
        if (!$rejecter) {
            Log::warning('Rejecter user not found', ['user_id' => $rejectedBy]);
            $rejecter = null;
        }

        // Update booking status
        $updated = $this->bookingRepository->update($bookingId, [
            'status' => 'Rejected',
            'rejection_reason' => $reason,
            'rejected_by' => $rejectedBy,
            'rejected_at' => Carbon::now(),
        ]);

        // Send rejection email to all participants
        if ($rejecter && $updated) {
            try {
                $this->emailService->sendBookingRejected($updated, $rejecter, $reason);
            } catch (\Exception $e) {
                Log::error('Failed to send rejection email', [
                    'booking_id' => $bookingId,
                    'error' => $e->getMessage(),
                ]);
                // Don't fail the rejection if email fails
            }
        }

        return [
            'success' => true,
            'message' => 'Booking rejected',
            'data' => $updated,
        ];
    }

    /**
     * Cancel booking (by user or admin)
     */
    public function cancel(int $bookingId, string $reason): array
    {
        $booking = $this->bookingRepository->findById($bookingId);
        
        if (!$booking) {
            return [
                'success' => false,
                'message' => 'Booking not found',
            ];
        }

        if (in_array($booking->status, ['Completed', 'Cancelled'])) {
            return [
                'success' => false,
                'message' => 'Cannot cancel completed or already cancelled bookings',
            ];
        }

        $updated = $this->bookingRepository->update($bookingId, [
            'status' => 'Cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at' => Carbon::now(),
        ]);

        return [
            'success' => true,
            'message' => 'Booking cancelled successfully',
            'data' => $updated,
        ];
    }
}
