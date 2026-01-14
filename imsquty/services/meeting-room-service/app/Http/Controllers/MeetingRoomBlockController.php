<?php

namespace App\Http\Controllers;

use App\Models\MeetingRoom;
use App\Models\MeetingRoomBooking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Traits\ApiResponses;
use Carbon\Carbon;

class MeetingRoomBlockController extends Controller
{
    use ApiResponses;

    /**
     * Block a meeting room for maintenance or other purposes
     */
    public function block(Request $request, int $roomId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'block_reason' => 'required|string|max:500',
            'block_type' => 'required|in:maintenance,vip,urgent,other',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'cancel_existing_bookings' => 'boolean',
            'notify_affected_users' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $room = MeetingRoom::find($roomId);
        if (!$room) {
            return $this->notFoundResponse('Meeting room not found');
        }

        DB::beginTransaction();
        try {
            // Create a blocking "booking" with special status
            $blockBooking = MeetingRoomBooking::create([
                'meeting_room_id' => $roomId,
                'user_id' => Auth::id(),
                'title' => 'BLOCKED: ' . ucfirst($request->block_type),
                'description' => $request->block_reason,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => 'blocked',
                'attendees_count' => 0,
                'is_recurring' => false,
            ]);

            // Find conflicting bookings
            $conflictingBookings = MeetingRoomBooking::where('meeting_room_id', $roomId)
                ->whereNotIn('status', ['cancelled', 'rejected', 'blocked'])
                ->where(function ($query) use ($request) {
                    $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                        ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                        ->orWhere(function ($q) use ($request) {
                            $q->where('start_time', '<=', $request->start_time)
                              ->where('end_time', '>=', $request->end_time);
                        });
                })
                ->get();

            $cancelledCount = 0;
            if ($request->input('cancel_existing_bookings', false) && $conflictingBookings->count() > 0) {
                foreach ($conflictingBookings as $booking) {
                    $booking->update([
                        'status' => 'cancelled',
                        'cancellation_reason' => "Room blocked for {$request->block_type}: {$request->block_reason}",
                        'cancelled_at' => now(),
                        'cancelled_by' => Auth::id(),
                    ]);
                    $cancelledCount++;

                    // TODO: Send notification to affected users
                    if ($request->input('notify_affected_users', true)) {
                        // Notification logic here
                    }
                }
            }

            DB::commit();

            return $this->successResponse([
                'block_booking' => $blockBooking,
                'cancelled_bookings_count' => $cancelledCount,
                'conflicting_bookings' => $conflictingBookings->count(),
            ], "Meeting room blocked successfully. {$cancelledCount} bookings were cancelled.");

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to block room: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Unblock a meeting room
     */
    public function unblock(Request $request, int $roomId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'unblock_reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $room = MeetingRoom::find($roomId);
        if (!$room) {
            return $this->notFoundResponse('Meeting room not found');
        }

        DB::beginTransaction();
        try {
            // Find and remove future blocks
            $removedBlocks = MeetingRoomBooking::where('meeting_room_id', $roomId)
                ->where('status', 'blocked')
                ->where('end_time', '>', now())
                ->delete();

            DB::commit();

            return $this->successResponse([
                'removed_blocks_count' => $removedBlocks,
            ], "Meeting room unblocked successfully. {$removedBlocks} blocks removed.");

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to unblock room: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get list of currently blocked rooms
     */
    public function getBlockedRooms(Request $request): JsonResponse
    {
        $includeExpired = $request->boolean('include_expired', false);

        $query = MeetingRoomBooking::with(['meetingRoom', 'user'])
            ->where('status', 'blocked');

        if (!$includeExpired) {
            $query->where('end_time', '>', now());
        }

        $blockedBookings = $query->orderBy('start_time')->get();

        return $this->successResponse([
            'blocked_rooms' => $blockedBookings,
            'count' => $blockedBookings->count(),
        ], 'Blocked rooms retrieved successfully');
    }

    /**
     * Get blocking details for a specific room
     */
    public function getRoomBlocks(int $roomId): JsonResponse
    {
        $room = MeetingRoom::find($roomId);
        if (!$room) {
            return $this->notFoundResponse('Meeting room not found');
        }

        $blocks = MeetingRoomBooking::with('user')
            ->where('meeting_room_id', $roomId)
            ->where('status', 'blocked')
            ->where('end_time', '>', now())
            ->orderBy('start_time')
            ->get();

        return $this->successResponse([
            'room' => $room,
            'blocks' => $blocks,
            'is_currently_blocked' => $blocks->where('start_time', '<=', now())
                ->where('end_time', '>=', now())
                ->count() > 0,
        ], 'Room blocks retrieved successfully');
    }
}
