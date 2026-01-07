<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/**
 * Email Service
 * 
 * Handles email sending via various providers:
 * - Laravel Mail (SMTP, Mailgun, Postmark, Amazon SES, Sendmail)
 * - Configurable via .env: MAIL_MAILER, MAIL_HOST, MAIL_PORT, etc.
 * 
 * @package App\Services
 */
class EmailService
{
    /**
     * Send email notification
     *
     * @param Notification $notification
     * @return bool
     */
    public function send(Notification $notification): bool
    {
        try {
            $user = $notification->user;

            if (!$user || !$user->email) {
                throw new \Exception('User email not found');
            }

            // Send email using Laravel Mail
            Mail::send([], [], function ($message) use ($notification, $user) {
                $message->to($user->email, $user->full_name ?? $user->first_name)
                    ->subject($notification->subject)
                    ->html($this->getEmailHtml($notification));

                // Set from address (from .env: MAIL_FROM_ADDRESS, MAIL_FROM_NAME)
                $fromAddress = config('mail.from.address', 'noreply@imsquty.com');
                $fromName = config('mail.from.name', 'IMSQuty');
                $message->from($fromAddress, $fromName);

                // Add reply-to if configured
                if ($replyTo = config('mail.reply_to.address')) {
                    $message->replyTo($replyTo, config('mail.reply_to.name', $fromName));
                }

                // Priority handling
                if ($notification->priority === 'high') {
                    $message->priority(1); // High priority
                } elseif ($notification->priority === 'urgent') {
                    $message->priority(1);
                }
            });

            Log::info('Email sent successfully', [
                'notification_id' => $notification->id,
                'to' => $user->email,
                'subject' => $notification->subject,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Email send failed', [
                'notification_id' => $notification->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Get email HTML body
     *
     * @param Notification $notification
     * @return string
     */
    private function getEmailHtml(Notification $notification): string
    {
        $body = $notification->body;
        $footer = $this->getEmailFooter();

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$notification->subject}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f8f9fa;
            padding: 30px;
            border: 1px solid #dee2e6;
        }
        .footer {
            background-color: #343a40;
            color: #adb5bd;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            border-radius: 0 0 5px 5px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>IMSQuty Notification</h2>
    </div>
    <div class="content">
        {$body}
    </div>
    <div class="footer">
        {$footer}
    </div>
</body>
</html>
HTML;
    }

    /**
     * Get email footer
     *
     * @return string
     */
    private function getEmailFooter(): string
    {
        $appName = config('app.name', 'IMSQuty');
        $appUrl = config('app.url', 'http://localhost');
        $year = date('Y');

        return <<<HTML
<p>&copy; {$year} {$appName}. All rights reserved.</p>
<p>
    <a href="{$appUrl}" style="color: #adb5bd;">Visit our website</a> | 
    <a href="{$appUrl}/privacy" style="color: #adb5bd;">Privacy Policy</a>
</p>
<p style="font-size: 11px; color: #6c757d;">
    This is an automated notification. Please do not reply to this email.
</p>
HTML;
    }

    /**
     * Test email configuration
     *
     * @param string $toEmail
     * @return bool
     */
    public function testConnection(string $toEmail): bool
    {
        try {
            Mail::raw('This is a test email from IMSQuty Notification Service', function ($message) use ($toEmail) {
                $message->to($toEmail)
                    ->subject('IMSQuty - Email Test')
                    ->from(config('mail.from.address'), config('mail.from.name'));
            });

            return true;

        } catch (\Exception $e) {
            Log::error('Email test failed', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Queue email sending (for high volume)
     *
     * @param Notification $notification
     * @return void
     */
    public function queue(Notification $notification): void
    {
        // TODO: Implement queue job for email sending
        // dispatch(new SendEmailNotificationJob($notification));
    }
}
