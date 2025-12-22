<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateMeetingRoomRequest;
use App\Http\Requests\UpdateMeetingRoomRequest;
use App\Http\Resources\MeetingRoomResource;
use App\Services\MeetingRoomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeetingRoomController extends Controller
{
    public function __construct(
        private MeetingRoomService $meetingRoomService
    ) {}

    /**
     * Display a listing of meeting rooms.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['status', 'location_id', 'min_capacity', 'search']);

        $rooms = $this->meetingRoomService->getAllRooms($perPage, $filters);

        return response()->json([
            'success' => true,
            'data' => MeetingRoomResource::collection($rooms),
            'meta' => [
                'current_page' => $rooms->currentPage(),
                'per_page' => $rooms->perPage(),
                'total' => $rooms->total(),
                'last_page' => $rooms->lastPage(),
            ],
        ]);
    }

    /**
     * Store a newly created meeting room.
     */
    public function store(CreateMeetingRoomRequest $request): JsonResponse
    {
        try {
            $result = $this->meetingRoomService->createRoom($request->validated());

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'data' => new MeetingRoomResource($result['data']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified meeting room.
     */
    public function show(int $id): JsonResponse
    {
        $result = $this->meetingRoomService->getRoomById($id);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Meeting room not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new MeetingRoomResource($result['room']),
            'statistics' => $result['statistics'],
        ]);
    }

    /**
     * Update the specified meeting room.
     */
    public function update(UpdateMeetingRoomRequest $request, int $id): JsonResponse
    {
        try {
            $result = $this->meetingRoomService->updateRoom($id, $request->validated());

            if (!$result['success']) {
                return response()->json($result, 404);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => new MeetingRoomResource($result['data']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove the specified meeting room.
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->meetingRoomService->deleteRoom($id);

        if (!$result['success']) {
            return response()->json($result, $result['message'] === 'Meeting room not found' ? 404 : 400);
        }

        return response()->json($result);
    }

    /**
     * Check room availability for a time period.
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $request->validate([
            'room_id' => 'required|exists:meeting_rooms,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        try {
            $isAvailable = $this->meetingRoomService->checkAvailability(
                $request->input('room_id'),
                $request->input('start_time'),
                $request->input('end_time')
            );

            return response()->json([
                'success' => true,
                'available' => $isAvailable,
                'message' => $isAvailable ? 'Room is available' : 'Room is not available for the selected time',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Find available rooms for a time period.
     */
    public function availableRooms(Request $request): JsonResponse
    {
        $request->validate([
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'min_capacity' => 'nullable|integer|min:1',
        ]);

        try {
            $rooms = $this->meetingRoomService->findAvailableRooms(
                $request->input('start_time'),
                $request->input('end_time'),
                $request->input('min_capacity')
            );

            return response()->json([
                'success' => true,
                'data' => MeetingRoomResource::collection($rooms),
                'count' => $rooms->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get room statistics.
     */
    public function statistics(int $id): JsonResponse
    {
        $result = $this->meetingRoomService->getRoomStatistics($id);

        if (!$result['success']) {
            return response()->json($result, 404);
        }

        return response()->json($result);
    }
}
