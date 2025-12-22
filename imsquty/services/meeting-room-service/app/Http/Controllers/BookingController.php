<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Http\Requests\ApproveBookingRequest;
use App\Http\Requests\RejectBookingRequest;
use App\Http\Requests\CancelBookingRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService
    ) {}

    /**
     * Display a listing of bookings.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['status', 'meeting_room_id', 'user_id', 'start_date', 'end_date', 'search']);

        $bookings = $this->bookingService->getAllBookings($perPage, $filters);

        return response()->json([
            'success' => true,
            'data' => BookingResource::collection($bookings),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
                'last_page' => $bookings->lastPage(),
            ],
        ]);
    }

    /**
     * Store a newly created booking.
     */
    public function store(CreateBookingRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id(); // Set authenticated user as creator

        $result = $this->bookingService->createBooking($data);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => new BookingResource($result['data']),
        ], 201);
    }

    /**
     * Display the specified booking.
     */
    public function show(int $id): JsonResponse
    {
        $booking = $this->bookingService->getBookingById($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new BookingResource($booking),
        ]);
    }

    /**
     * Update the specified booking.
     */
    public function update(UpdateBookingRequest $request, int $id): JsonResponse
    {
        $result = $this->bookingService->updateBooking($id, $request->validated());

        if (!$result['success']) {
            return response()->json($result, $result['message'] === 'Booking not found' ? 404 : 400);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => new BookingResource($result['data']),
        ]);
    }

    /**
     * Remove the specified booking.
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->bookingService->deleteBooking($id);

        if (!$result['success']) {
            return response()->json($result, 404);
        }

        return response()->json($result);
    }

    /**
     * Approve a booking.
     */
    public function approve(ApproveBookingRequest $request, int $id): JsonResponse
    {
        $result = $this->bookingService->approveBooking($id, Auth::id());

        if (!$result['success']) {
            return response()->json($result, $result['message'] === 'Booking not found' ? 404 : 400);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => new BookingResource($result['data']),
        ]);
    }

    /**
     * Reject a booking.
     */
    public function reject(RejectBookingRequest $request, int $id): JsonResponse
    {
        $result = $this->bookingService->rejectBooking(
            $id,
            Auth::id(),
            $request->input('rejection_reason')
        );

        if (!$result['success']) {
            return response()->json($result, $result['message'] === 'Booking not found' ? 404 : 400);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => new BookingResource($result['data']),
        ]);
    }

    /**
     * Cancel a booking.
     */
    public function cancel(CancelBookingRequest $request, int $id): JsonResponse
    {
        $result = $this->bookingService->cancelBooking(
            $id,
            $request->input('cancellation_reason')
        );

        if (!$result['success']) {
            return response()->json($result, $result['message'] === 'Booking not found' ? 404 : 400);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => new BookingResource($result['data']),
        ]);
    }

    /**
     * Get user's bookings.
     */
    public function myBookings(Request $request): JsonResponse
    {
        $upcomingOnly = $request->boolean('upcoming_only', false);
        $bookings = $this->bookingService->getUserBookings(Auth::id(), $upcomingOnly);

        return response()->json([
            'success' => true,
            'data' => BookingResource::collection($bookings),
            'count' => $bookings->count(),
        ]);
    }

    /**
     * Get today's bookings.
     */
    public function today(): JsonResponse
    {
        $bookings = $this->bookingService->getTodayBookings();

        return response()->json([
            'success' => true,
            'data' => BookingResource::collection($bookings),
            'count' => $bookings->count(),
        ]);
    }

    /**
     * Get upcoming bookings.
     */
    public function upcoming(Request $request): JsonResponse
    {
        $days = $request->input('days', 7);
        $bookings = $this->bookingService->getUpcomingBookings($days);

        return response()->json([
            'success' => true,
            'data' => BookingResource::collection($bookings),
            'count' => $bookings->count(),
        ]);
    }

    /**
     * Get booking statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $filters = $request->only(['start_date', 'end_date']);
        $result = $this->bookingService->getStatistics($filters);

        return response()->json($result);
    }
}
