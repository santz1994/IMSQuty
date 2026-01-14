<?php

namespace App\Http\Controllers;

use App\Services\BookingWorkflowService;
use App\DTOs\CheckInDTO;
use App\DTOs\CheckOutDTO;
use App\DTOs\BookingFeedbackDTO;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Traits\ApiResponses;

/**
 * Booking Workflow Controller
 * 
 * Handles booking check-in, check-out, approval, and feedback
 */
class BookingWorkflowController extends Controller
{
    use ApiResponses;

    protected BookingWorkflowService $workflowService;

    public function __construct(BookingWorkflowService $workflowService)
    {
        $this->workflowService = $workflowService;
    }

    /**
     * Check-in to a booking
     * 
     * @param Request $request
     * @param int $bookingId
     * @return JsonResponse
     */
    public function checkIn(Request $request, int $bookingId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'check_in_time' => 'nullable|date',
                'actual_attendees' => 'nullable|integer|min:1',
            ]);

            $dto = CheckInDTO::fromRequest($validated);
            $dto->booking_id = $bookingId;
            
            $result = $this->workflowService->checkIn($bookingId, $dto);

            if (!$result['success']) {
                return $this->errorResponse($result['message'], 400);
            }

            return $this->successResponse($result['data'], $result['message']);
        } catch (\Exception $e) {
            return $this->errorResponse('Check-in failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Check-out from a booking
     * 
     * @param Request $request
     * @param int $bookingId
     * @return JsonResponse
     */
    public function checkOut(Request $request, int $bookingId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'check_out_time' => 'nullable|date',
                'condition_notes' => 'nullable|string',
                'issues_reported' => 'nullable|string',
                'equipment_damaged' => 'nullable|boolean',
            ]);

            $dto = CheckOutDTO::fromRequest($validated);
            $dto->booking_id = $bookingId;
            
            $result = $this->workflowService->checkOut($bookingId, $dto);

            if (!$result['success']) {
                return $this->errorResponse($result['message'], 400);
            }

            return $this->successResponse($result['data'], $result['message']);
        } catch (\Exception $e) {
            return $this->errorResponse('Check-out failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Submit feedback for a booking
     * 
     * @param Request $request
     * @param int $bookingId
     * @return JsonResponse
     */
    public function submitFeedback(Request $request, int $bookingId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer',
                'rating' => 'required|integer|min:1|max:5',
                'cleanliness_rating' => 'nullable|string',
                'equipment_rating' => 'nullable|string',
                'comment' => 'nullable|string',
                'would_recommend' => 'nullable|boolean',
                'issues' => 'nullable|array',
            ]);

            $dto = BookingFeedbackDTO::fromRequest($validated);
            $dto->booking_id = $bookingId;
            
            $result = $this->workflowService->submitFeedback($bookingId, $dto);

            if (!$result['success']) {
                return $this->errorResponse($result['message'], 400);
            }

            return $this->createdResponse($result['data'], $result['message']);
        } catch (\Exception $e) {
            return $this->errorResponse('Feedback submission failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Approve a booking (managers only)
     * 
     * @param Request $request
     * @param int $bookingId
     * @return JsonResponse
     */
    public function approve(Request $request, int $bookingId): JsonResponse
    {
        try {
            $approvedBy = auth()->id() ?? $request->input('approved_by');
            
            $result = $this->workflowService->approve($bookingId, $approvedBy);

            if (!$result['success']) {
                return $this->errorResponse($result['message'], 400);
            }

            return $this->successResponse($result['data'], $result['message']);
        } catch (\Exception $e) {
            return $this->errorResponse('Approval failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Reject a booking (managers only)
     * 
     * @param Request $request
     * @param int $bookingId
     * @return JsonResponse
     */
    public function reject(Request $request, int $bookingId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string',
                'rejected_by' => 'nullable|integer',
            ]);

            $rejectedBy = $validated['rejected_by'] ?? auth()->id();
            
            $result = $this->workflowService->reject($bookingId, $rejectedBy, $validated['reason']);

            if (!$result['success']) {
                return $this->errorResponse($result['message'], 400);
            }

            return $this->successResponse($result['data'], $result['message']);
        } catch (\Exception $e) {
            return $this->errorResponse('Rejection failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancel a booking
     * 
     * @param Request $request
     * @param int $bookingId
     * @return JsonResponse
     */
    public function cancel(Request $request, int $bookingId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string',
            ]);
            
            $result = $this->workflowService->cancel($bookingId, $validated['reason']);

            if (!$result['success']) {
                return $this->errorResponse($result['message'], 400);
            }

            return $this->successResponse($result['data'], $result['message']);
        } catch (\Exception $e) {
            return $this->errorResponse('Cancellation failed: ' . $e->getMessage(), 500);
        }
    }
}
