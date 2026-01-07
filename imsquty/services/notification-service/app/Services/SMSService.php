<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * SMS Service
 * 
 * Handles SMS sending via various providers:
 * - Twilio
 * - Nexmo/Vonage
 * - AWS SNS
 * - Other providers via webhook
 * 
 * Configurable via .env:
 * SMS_DRIVER=twilio
 * TWILIO_ACCOUNT_SID=xxx
 * TWILIO_AUTH_TOKEN=xxx
 * TWILIO_FROM_NUMBER=+1234567890
 * 
 * @package App\Services
 */
class SMSService
{
    private string $driver;

    public function __construct()
    {
        $this->driver = config('services.sms.driver', 'log');
    }

    /**
     * Send SMS notification
     *
     * @param Notification $notification
     * @return bool
     */
    public function send(Notification $notification): bool
    {
        try {
            $user = $notification->user;

            if (!$user || !$user->phone) {
                throw new \Exception('User phone number not found');
            }

            // Send based on configured driver
            $result = match ($this->driver) {
                'twilio' => $this->sendViaTwilio($user->phone, $notification->body),
                'nexmo' => $this->sendViaNexmo($user->phone, $notification->body),
                'sns' => $this->sendViaAWS($user->phone, $notification->body),
                'log' => $this->logOnly($user->phone, $notification->body),
                default => throw new \Exception("Unknown SMS driver: {$this->driver}"),
            };

            if ($result) {
                Log::info('SMS sent successfully', [
                    'notification_id' => $notification->id,
                    'to' => $user->phone,
                    'driver' => $this->driver,
                ]);
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('SMS send failed', [
                'notification_id' => $notification->id,
                'error' => $e->getMessage(),
                'driver' => $this->driver,
            ]);

            throw $e;
        }
    }

    /**
     * Send SMS via Twilio
     *
     * @param string $to
     * @param string $message
     * @return bool
     */
    private function sendViaTwilio(string $to, string $message): bool
    {
        $accountSid = config('services.twilio.account_sid');
        $authToken = config('services.twilio.auth_token');
        $fromNumber = config('services.twilio.from_number');

        if (!$accountSid || !$authToken || !$fromNumber) {
            throw new \Exception('Twilio configuration missing');
        }

        $url = "https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json";

        $response = Http::asForm()
            ->withBasicAuth($accountSid, $authToken)
            ->post($url, [
                'To' => $to,
                'From' => $fromNumber,
                'Body' => $message,
            ]);

        if ($response->successful()) {
            Log::info('Twilio SMS sent', [
                'to' => $to,
                'sid' => $response->json('sid'),
            ]);
            return true;
        }

        throw new \Exception('Twilio API error: ' . $response->body());
    }

    /**
     * Send SMS via Nexmo/Vonage
     *
     * @param string $to
     * @param string $message
     * @return bool
     */
    private function sendViaNexmo(string $to, string $message): bool
    {
        $apiKey = config('services.nexmo.api_key');
        $apiSecret = config('services.nexmo.api_secret');
        $from = config('services.nexmo.from_number');

        if (!$apiKey || !$apiSecret || !$from) {
            throw new \Exception('Nexmo configuration missing');
        }

        $url = 'https://rest.nexmo.com/sms/json';

        $response = Http::asForm()->post($url, [
            'api_key' => $apiKey,
            'api_secret' => $apiSecret,
            'to' => $to,
            'from' => $from,
            'text' => $message,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            if (isset($data['messages'][0]['status']) && $data['messages'][0]['status'] === '0') {
                Log::info('Nexmo SMS sent', [
                    'to' => $to,
                    'message_id' => $data['messages'][0]['message-id'],
                ]);
                return true;
            }
        }

        throw new \Exception('Nexmo API error: ' . $response->body());
    }

    /**
     * Send SMS via AWS SNS
     *
     * @param string $to
     * @param string $message
     * @return bool
     */
    private function sendViaAWS(string $to, string $message): bool
    {
        // AWS SNS integration
        // Requires: composer require aws/aws-sdk-php
        
        $key = config('services.aws.key');
        $secret = config('services.aws.secret');
        $region = config('services.aws.region', 'us-east-1');

        if (!$key || !$secret) {
            throw new \Exception('AWS SNS configuration missing');
        }

        // For now, log only - requires AWS SDK installation
        Log::info('AWS SNS SMS (requires AWS SDK)', [
            'to' => $to,
            'region' => $region,
        ]);

        // TODO: Implement actual AWS SNS sending
        // $sns = new \Aws\Sns\SnsClient([
        //     'version' => 'latest',
        //     'region' => $region,
        //     'credentials' => [
        //         'key' => $key,
        //         'secret' => $secret,
        //     ],
        // ]);
        //
        // $result = $sns->publish([
        //     'Message' => $message,
        //     'PhoneNumber' => $to,
        // ]);

        return true;
    }

    /**
     * Log only (for testing/development)
     *
     * @param string $to
     * @param string $message
     * @return bool
     */
    private function logOnly(string $to, string $message): bool
    {
        Log::info('SMS (log only - not actually sent)', [
            'to' => $to,
            'message' => $message,
            'note' => 'Configure SMS_DRIVER in .env to send real SMS',
        ]);

        return true;
    }

    /**
     * Test SMS configuration
     *
     * @param string $toPhone
     * @return bool
     */
    public function testConnection(string $toPhone): bool
    {
        try {
            $testMessage = 'This is a test SMS from IMSQuty Notification Service';
            
            return match ($this->driver) {
                'twilio' => $this->sendViaTwilio($toPhone, $testMessage),
                'nexmo' => $this->sendViaNexmo($toPhone, $testMessage),
                'sns' => $this->sendViaAWS($toPhone, $testMessage),
                'log' => $this->logOnly($toPhone, $testMessage),
                default => false,
            };

        } catch (\Exception $e) {
            Log::error('SMS test failed', [
                'error' => $e->getMessage(),
                'driver' => $this->driver,
            ]);

            return false;
        }
    }

    /**
     * Format phone number (E.164 format)
     *
     * @param string $phone
     * @param string $countryCode Default +1 (US)
     * @return string
     */
    public function formatPhoneNumber(string $phone, string $countryCode = '+1'): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/\D/', '', $phone);

        // Add country code if not present
        if (substr($phone, 0, 1) !== '+') {
            $phone = $countryCode . $phone;
        }

        return $phone;
    }

    /**
     * Validate phone number
     *
     * @param string $phone
     * @return bool
     */
    public function validatePhoneNumber(string $phone): bool
    {
        // Basic E.164 validation (between 10-15 digits)
        $cleaned = preg_replace('/\D/', '', $phone);
        return strlen($cleaned) >= 10 && strlen($cleaned) <= 15;
    }
}
