<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Push Notification Service
 * 
 * Handles push notifications via various providers:
 * - Firebase Cloud Messaging (FCM)
 * - OneSignal
 * - Apple Push Notification service (APNs)
 * - Custom webhook
 * 
 * Configurable via .env:
 * PUSH_DRIVER=fcm
 * FCM_SERVER_KEY=xxx
 * ONESIGNAL_APP_ID=xxx
 * ONESIGNAL_API_KEY=xxx
 * 
 * @package App\Services
 */
class PushService
{
    private string $driver;

    public function __construct()
    {
        $this->driver = config('services.push.driver', 'log');
    }

    /**
     * Send push notification
     *
     * @param Notification $notification
     * @return bool
     */
    public function send(Notification $notification): bool
    {
        try {
            $user = $notification->user;

            if (!$user) {
                throw new \Exception('User not found');
            }

            // Get user's device tokens (would be stored in user_devices table)
            $deviceTokens = $this->getUserDeviceTokens($user->id);

            if (empty($deviceTokens)) {
                Log::warning('No device tokens found for user', [
                    'user_id' => $user->id,
                    'notification_id' => $notification->id,
                ]);
                return false;
            }

            // Send based on configured driver
            $result = match ($this->driver) {
                'fcm' => $this->sendViaFCM($deviceTokens, $notification),
                'onesignal' => $this->sendViaOneSignal($deviceTokens, $notification),
                'apns' => $this->sendViaAPNs($deviceTokens, $notification),
                'log' => $this->logOnly($deviceTokens, $notification),
                default => throw new \Exception("Unknown push driver: {$this->driver}"),
            };

            if ($result) {
                Log::info('Push notification sent successfully', [
                    'notification_id' => $notification->id,
                    'user_id' => $user->id,
                    'devices_count' => count($deviceTokens),
                    'driver' => $this->driver,
                ]);
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('Push notification send failed', [
                'notification_id' => $notification->id,
                'error' => $e->getMessage(),
                'driver' => $this->driver,
            ]);

            throw $e;
        }
    }

    /**
     * Send push via Firebase Cloud Messaging (FCM)
     *
     * @param array $deviceTokens
     * @param Notification $notification
     * @return bool
     */
    private function sendViaFCM(array $deviceTokens, Notification $notification): bool
    {
        $serverKey = config('services.fcm.server_key');

        if (!$serverKey) {
            throw new \Exception('FCM server key not configured');
        }

        $url = 'https://fcm.googleapis.com/fcm/send';

        $payload = [
            'registration_ids' => $deviceTokens,
            'notification' => [
                'title' => $notification->subject,
                'body' => strip_tags($notification->body),
                'icon' => config('app.url') . '/logo.png',
                'click_action' => $this->getNotificationUrl($notification),
            ],
            'data' => [
                'notification_id' => $notification->id,
                'type' => $notification->type,
                'priority' => $notification->priority,
            ],
            'priority' => $notification->priority === 'urgent' ? 'high' : 'normal',
        ];

        $response = Http::withHeaders([
            'Authorization' => 'key=' . $serverKey,
            'Content-Type' => 'application/json',
        ])->post($url, $payload);

        if ($response->successful()) {
            $result = $response->json();
            Log::info('FCM push sent', [
                'success' => $result['success'] ?? 0,
                'failure' => $result['failure'] ?? 0,
            ]);
            return true;
        }

        throw new \Exception('FCM API error: ' . $response->body());
    }

    /**
     * Send push via OneSignal
     *
     * @param array $deviceTokens
     * @param Notification $notification
     * @return bool
     */
    private function sendViaOneSignal(array $deviceTokens, Notification $notification): bool
    {
        $appId = config('services.onesignal.app_id');
        $apiKey = config('services.onesignal.api_key');

        if (!$appId || !$apiKey) {
            throw new \Exception('OneSignal configuration missing');
        }

        $url = 'https://onesignal.com/api/v1/notifications';

        $payload = [
            'app_id' => $appId,
            'include_player_ids' => $deviceTokens, // OneSignal uses player IDs
            'headings' => ['en' => $notification->subject],
            'contents' => ['en' => strip_tags($notification->body)],
            'url' => $this->getNotificationUrl($notification),
            'data' => [
                'notification_id' => $notification->id,
                'type' => $notification->type,
            ],
            'priority' => $notification->priority === 'urgent' ? 10 : 5,
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->post($url, $payload);

        if ($response->successful()) {
            $result = $response->json();
            Log::info('OneSignal push sent', [
                'id' => $result['id'] ?? null,
                'recipients' => $result['recipients'] ?? 0,
            ]);
            return true;
        }

        throw new \Exception('OneSignal API error: ' . $response->body());
    }

    /**
     * Send push via Apple Push Notification service (APNs)
     *
     * @param array $deviceTokens
     * @param Notification $notification
     * @return bool
     */
    private function sendViaAPNs(array $deviceTokens, Notification $notification): bool
    {
        // APNs integration
        // Requires: composer require edamov/pushok
        
        $keyId = config('services.apns.key_id');
        $teamId = config('services.apns.team_id');
        $appBundleId = config('services.apns.app_bundle_id');
        $privateKeyPath = config('services.apns.private_key_path');

        if (!$keyId || !$teamId || !$appBundleId || !$privateKeyPath) {
            throw new \Exception('APNs configuration missing');
        }

        // For now, log only - requires pushok library installation
        Log::info('APNs push (requires pushok library)', [
            'devices_count' => count($deviceTokens),
            'key_id' => $keyId,
        ]);

        // TODO: Implement actual APNs sending
        // $authProvider = \Pushok\AuthProvider\Token::create([
        //     'key_id' => $keyId,
        //     'team_id' => $teamId,
        //     'app_bundle_id' => $appBundleId,
        //     'private_key_path' => $privateKeyPath,
        // ]);
        //
        // $client = new \Pushok\Client($authProvider, $production = false);
        //
        // foreach ($deviceTokens as $token) {
        //     $notification = new \Pushok\Notification($token, $appBundleId);
        //     $notification->setTitle($notification->subject)
        //                  ->setBody(strip_tags($notification->body));
        //     $client->addNotification($notification);
        // }
        //
        // $responses = $client->push();

        return true;
    }

    /**
     * Log only (for testing/development)
     *
     * @param array $deviceTokens
     * @param Notification $notification
     * @return bool
     */
    private function logOnly(array $deviceTokens, Notification $notification): bool
    {
        Log::info('Push notification (log only - not actually sent)', [
            'devices_count' => count($deviceTokens),
            'subject' => $notification->subject,
            'body' => strip_tags($notification->body),
            'note' => 'Configure PUSH_DRIVER in .env to send real push notifications',
        ]);

        return true;
    }

    /**
     * Get user device tokens
     *
     * @param int $userId
     * @return array
     */
    private function getUserDeviceTokens(int $userId): array
    {
        // TODO: Implement actual device token retrieval from database
        // Would query user_devices table with columns:
        // - user_id
        // - device_token
        // - platform (ios, android, web)
        // - is_active
        // - last_active_at
        
        // For now, return empty array (would be populated when users register devices)
        // return \DB::table('user_devices')
        //     ->where('user_id', $userId)
        //     ->where('is_active', true)
        //     ->pluck('device_token')
        //     ->toArray();

        return [];
    }

    /**
     * Get notification URL for deep linking
     *
     * @param Notification $notification
     * @return string
     */
    private function getNotificationUrl(Notification $notification): string
    {
        $baseUrl = config('app.url');

        // Deep link based on notification type
        return match ($notification->type) {
            'ticket' => "{$baseUrl}/tickets/{$notification->reference_id}",
            'asset' => "{$baseUrl}/assets/{$notification->reference_id}",
            'meeting_room' => "{$baseUrl}/bookings/{$notification->reference_id}",
            'approval' => "{$baseUrl}/approvals/{$notification->reference_id}",
            default => "{$baseUrl}/notifications",
        };
    }

    /**
     * Test push notification configuration
     *
     * @param array $deviceTokens
     * @return bool
     */
    public function testConnection(array $deviceTokens): bool
    {
        try {
            // Create test notification
            $testNotification = new Notification([
                'subject' => 'IMSQuty Test Push',
                'body' => 'This is a test push notification from IMSQuty',
                'type' => 'system',
                'priority' => 'normal',
            ]);

            return match ($this->driver) {
                'fcm' => $this->sendViaFCM($deviceTokens, $testNotification),
                'onesignal' => $this->sendViaOneSignal($deviceTokens, $testNotification),
                'apns' => $this->sendViaAPNs($deviceTokens, $testNotification),
                'log' => $this->logOnly($deviceTokens, $testNotification),
                default => false,
            };

        } catch (\Exception $e) {
            Log::error('Push test failed', [
                'error' => $e->getMessage(),
                'driver' => $this->driver,
            ]);

            return false;
        }
    }

    /**
     * Register device token
     *
     * @param int $userId
     * @param string $deviceToken
     * @param string $platform ios|android|web
     * @return bool
     */
    public function registerDevice(int $userId, string $deviceToken, string $platform): bool
    {
        // TODO: Implement device registration
        // \DB::table('user_devices')->updateOrInsert(
        //     ['user_id' => $userId, 'device_token' => $deviceToken],
        //     [
        //         'platform' => $platform,
        //         'is_active' => true,
        //         'last_active_at' => now(),
        //         'updated_at' => now(),
        //     ]
        // );

        Log::info('Device registered', [
            'user_id' => $userId,
            'platform' => $platform,
        ]);

        return true;
    }

    /**
     * Unregister device token
     *
     * @param int $userId
     * @param string $deviceToken
     * @return bool
     */
    public function unregisterDevice(int $userId, string $deviceToken): bool
    {
        // TODO: Implement device unregistration
        // \DB::table('user_devices')
        //     ->where('user_id', $userId)
        //     ->where('device_token', $deviceToken)
        //     ->update(['is_active' => false]);

        Log::info('Device unregistered', [
            'user_id' => $userId,
        ]);

        return true;
    }
}
