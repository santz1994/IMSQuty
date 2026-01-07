<?php

namespace App\Http\Controllers;

use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

/**
 * Availability Controller
 * 
 * Handles room availability checking and scheduling
 */
class AvailabilityController extends Controller
{
    use ApiResponses;

    protected AvailabilityService $availabilityService;

    public function __construct(AvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }

    /**
     * Check availability for a specific room
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'room_id' => 'required|integer',
                'start_time' => 'required|date',
                'end_time' => 'required|date|after:start_time',
            ]);

            $result = $this->availabilityService->checkAvailability(
                $validated['room_id'],
                $validated['start_time'],
                $validated['end_time']
            );

            return $this->successResponse($result, 'Availability check completed');
        } catch (\Exception $e) {
            return $this->errorResponse('Availability check failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Find available rooms based on criteria
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function findAvailableRooms(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_time' => 'required|date',
                'end_time' => 'required|date|after:start_time',
                'min_capacity' => 'nullable|integer|min:1',
                'required_facilities' => 'nullable|array',
            ]);

            $result = $this->availabilityService->findAvailableRooms(
                $validated['start_time'],
                $validated['end_time'],
                $validated['min_capacity'] ?? 1,
                $validated['required_facilities'] ?? []
            );

            return $this->successResponse($result, 'Available rooms retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Search failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get room schedule for a specific date
     * 
     * @param Request $request
     * @param int $roomId
     * @return JsonResponse
     */
    public function getRoomSchedule(Request $request, int $roomId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'date' => 'required|date',
            ]);

            $result = $this->availabilityService->getRoomSchedule(
                $roomId,
                $validated['date']
            );

            return $this->successResponse($result, 'Room schedule retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve schedule: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get availability matrix for multiple rooms
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getAvailabilityMatrix(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'room_ids' => 'required|array',
                'room_ids.*' => 'integer',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
            ]);

            $result = $this->availabilityService->getAvailabilityMatrix(
                $validated['room_ids'],
                $validated['start_date'],
                $validated['end_date']
            );

            return $this->successResponse($result, 'Availability matrix retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve availability matrix: ' . $e->getMessage(), 500);
        }
    }
}
