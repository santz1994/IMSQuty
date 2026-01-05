<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateNotificationRequest;
use App\Http\Requests\SendNotificationRequest;
use App\Http\Resources\NotificationResource;
use App\Http\Resources\NotificationCollection;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

/**
 * Notification Controller
 * 
 * Handles notification management endpoints
 */
class NotificationController extends Controller
{
    use ApiResponses;

    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * List notifications
     * GET /api/v1/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['user_id', 'type', 'status', 'channel', 'start_date', 'end_date', 'search']);
        
        $notifications = $this->notificationService->getAll($perPage, $filters);
        
        return $this->successResponse(
            new NotificationCollection($notifications),
            'Notifications retrieved successfully'
        );
    }

    /**
     * Show notification
     * GET /api/v1/notifications/{id}
     */
    public function show(int $id): JsonResponse
    {
        $notification = $this->notificationService->getById($id);
        
        if (!$notification) {
            return $this->notFoundResponse('Notification not found');
        }
        
        return $this->successResponse(
            new NotificationResource($notification),
            'Notification retrieved successfully'
        );
    }

    /**
     * Create notification
     * POST /api/v1/notifications
     */
    public function store(CreateNotificationRequest $request): JsonResponse
    {
        $notification = $this->notificationService->create($request->validated());
        
        return $this->createdResponse(
            new NotificationResource($notification),
            'Notification created successfully'
        );
    }

    /**
     * Send notification immediately
     * POST /api/v1/notifications/{id}/send
     */
    public function send(int $id): JsonResponse
    {
        $result = $this->notificationService->send($id);
        
        if (!$result) {
            return $this->errorResponse('Failed to send notification', 400);
        }
        
        return $this->successResponse(null, 'Notification sent successfully');
    }

    /**
     * Process pending notifications
     * POST /api/v1/notifications/process-pending
     */
    public function processPending(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 100);
        $sent = $this->notificationService->processPending($limit);
        
        return $this->successResponse(
            ['sent' => $sent],
            "{$sent} notifications processed successfully"
        );
    }

    /**
     * Retry failed notifications
     * POST /api/v1/notifications/retry-failed
     */
    public function retryFailed(Request $request): JsonResponse
    {
        $maxRetries = $request->input('max_retries', 3);
        $retried = $this->notificationService->retryFailed($maxRetries);
        
        return $this->successResponse(
            ['retried' => $retried],
            "{$retried} notifications retried successfully"
        );
    }

    /**
     * Cancel notification
     * POST /api/v1/notifications/{id}/cancel
     */
    public function cancel(int $id): JsonResponse
    {
        $result = $this->notificationService->cancel($id);
        
        if (!$result) {
            return $this->errorResponse('Failed to cancel notification', 400);
        }
        
        return $this->successResponse(null, 'Notification cancelled successfully');
    }

    /**
     * Get notification statistics
     * GET /api/v1/notifications/statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = $this->notificationService->getStatistics();
        
        return $this->successResponse($stats, 'Statistics retrieved successfully');
    }

    /**
     * Get user notifications
     * GET /api/v1/users/{userId}/notifications
     */
    public function userNotifications(int $userId, Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $notifications = $this->notificationService->getUserNotifications($userId, $perPage);
        
        return $this->successResponse(
            new NotificationCollection($notifications),
            'User notifications retrieved successfully'
        );
    }

    /**
     * Delete notification
     * DELETE /api/v1/notifications/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->notificationService->delete($id);
        
        if (!$result) {
            return $this->notFoundResponse('Notification not found');
        }
        
        return $this->deletedResponse('Notification deleted successfully');
    }
    /**
     * Update notification
     * PUT /api/v1/notifications/{id}
     */
    public function update(int $id, Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:200'],
            'message' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'priority' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array']
        ]);

        $notification = $this->notificationService->update($id, $data);
        
        if (!$notification) {
            return $this->notFoundResponse('Notification not found');
        }
        
        return $this->successResponse(
            new NotificationResource($notification),
            'Notification updated successfully'
        );
    }

    /**
     * Mark notification as read
     * POST /api/v1/notifications/{id}/read
     */
    public function markAsRead(int $id): JsonResponse
    {
        $notification = $this->notificationService->getById($id);
        
        if (!$notification) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'NOT_FOUND', 'message' => 'Notification not found'],
                'message' => 'Notification not found'
            ], 404);
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        $notification->refresh();

        return response()->json([
            'success' => true,
            'data' => new NotificationResource($notification),
            'message' => 'Notification marked as read'
        ]);
    }

    /**
     * Get unread notifications
     * GET /api/v1/notifications/unread
     */
    public function unread(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $notifications = \App\Models\Notification::where('is_read', false)->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => new NotificationCollection($notifications),
            'message' => 'Unread notifications retrieved successfully'
        ]);
    }

    /**
     * Mark all notifications as read
     * POST /api/v1/notifications/mark-all-read
     */
    public function markAllRead(): JsonResponse
    {
        $updated = \App\Models\Notification::where('is_read', false)->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'data' => ['updated_count' => $updated],
            'message' => "{$updated} notifications marked as read"
        ]);
    }}
