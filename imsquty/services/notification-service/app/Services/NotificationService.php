<?php

namespace App\Services;

use App\Models\Notification;
use App\Repositories\NotificationRepository;
use App\Repositories\NotificationTemplateRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

/**
 * Notification Service
 * 
 * Business logic for notification management and sending
 */
class NotificationService
{
    public function __construct(
        private NotificationRepository $notificationRepository,
        private NotificationTemplateRepository $templateRepository,
        private EmailService $emailService,
        private SMSService $smsService,
        private PushService $pushService
    ) {}

    /**
     * Get all notifications
     */
    public function getAll(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->notificationRepository->getAll($perPage, $filters);
    }

    /**
     * Get notification by ID
     */
    public function getById(int $id): ?Notification
    {
        return $this->notificationRepository->findById($id);
    }

    /**
     * Create notification
     */
    public function create(array $data): Notification
    {
        // If template_code provided, use template
        if (!empty($data['template_code'])) {
            $template = $this->templateRepository->findByCode($data['template_code']);
            
            if ($template) {
                $variables = $data['variables'] ?? [];
                $data['subject'] = $template->compileSubject($variables);
                $data['body'] = $template->compile($variables);
                $data['type'] = $template->type;
                $data['channel'] = $template->channel;
            }
        }

        // Set defaults
        $data['status'] = $data['status'] ?? Notification::STATUS_PENDING;
        $data['priority'] = $data['priority'] ?? Notification::PRIORITY_NORMAL;
        $data['retry_count'] = 0;

        $notification = $this->notificationRepository->create($data);

        Log::info('Notification created', [
            'notification_id' => $notification->id,
            'user_id' => $notification->user_id,
            'type' => $notification->type
        ]);

        return $notification;
    }

    /**
     * Send notification immediately
     */
    public function send(int $id): bool
    {
        $notification = $this->getById($id);
        
        if (!$notification) {
            return false;
        }

        if ($notification->status !== Notification::STATUS_PENDING) {
            return false;
        }

        try {
            // Dispatch based on channel
            $result = match($notification->channel) {
                Notification::CHANNEL_EMAIL => $this->sendEmail($notification),
                Notification::CHANNEL_SMS => $this->sendSms($notification),
                Notification::CHANNEL_PUSH => $this->sendPush($notification),
                Notification::CHANNEL_DATABASE => $this->sendDatabase($notification),
                default => false
            };

            if ($result) {
                $this->notificationRepository->markAsSent($id);
                
                Log::info('Notification sent successfully', [
                    'notification_id' => $id,
                    'channel' => $notification->channel
                ]);
                
                return true;
            } else {
                $this->notificationRepository->markAsFailed($id, 'Send failed');
                return false;
            }
        } catch (\Exception $e) {
            $this->notificationRepository->markAsFailed($id, $e->getMessage());
            
            Log::error('Notification send failed', [
                'notification_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Process pending notifications
     */
    public function processPending(int $limit = 100): int
    {
        $notifications = $this->notificationRepository->getReadyToSend($limit);
        $sent = 0;

        foreach ($notifications as $notification) {
            if ($this->send($notification->id)) {
                $sent++;
            }
        }

        Log::info('Processed pending notifications', [
            'total' => $notifications->count(),
            'sent' => $sent
        ]);

        return $sent;
    }

    /**
     * Retry failed notifications
     */
    public function retryFailed(int $maxRetries = 3): int
    {
        $notifications = $this->notificationRepository->getRetryable($maxRetries);
        $retried = 0;

        foreach ($notifications as $notification) {
            // Reset status to pending for retry
            $this->notificationRepository->update($notification->id, [
                'status' => Notification::STATUS_PENDING
            ]);

            if ($this->send($notification->id)) {
                $retried++;
            }
        }

        return $retried;
    }

    /**
     * Cancel notification
     */
    public function cancel(int $id): bool
    {
        $notification = $this->getById($id);
        
        if (!$notification || $notification->status !== Notification::STATUS_PENDING) {
            return false;
        }

        return $this->notificationRepository->update($id, [
            'status' => Notification::STATUS_CANCELLED
        ]);
    }

    /**
     * Get statistics
     */
    public function getStatistics(): array
    {
        return $this->notificationRepository->getStatistics();
    }

    /**
     * Get user notifications
     */
    public function getUserNotifications(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->notificationRepository->getUserNotifications($userId, $perPage);
    }

    /**
     * Update notification
     */
    public function update(int $id, array $data): ?Notification
    {
        $notification = $this->getById($id);
        if (!$notification) {
            return null;
        }
        
        $this->notificationRepository->update($id, $data);
        return $this->getById($id); // Refresh from DB
    }

    /**
     * Delete notification
     */
    public function delete(int $id): bool
    {
        return $this->notificationRepository->delete($id);
    }

    /**
     * Send email notification
     */
    private function sendEmail(Notification $notification): bool
    {
        return $this->emailService->send($notification);
    }

    /**
     * Send SMS notification
     */
    private function sendSms(Notification $notification): bool
    {
        return $this->smsService->send($notification);
    }

    /**
     * Send push notification
     */
    private function sendPush(Notification $notification): bool
    {
        return $this->pushService->send($notification);
    }

    /**
     * Save database notification
     */
    private function sendDatabase(Notification $notification): bool
    {
        // Database notification is already stored, just mark as sent
        return true;
    }
}
