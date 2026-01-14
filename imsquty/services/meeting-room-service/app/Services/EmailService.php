<?php

namespace App\Services;

use App\Models\MeetingRoomBooking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Email Service
 * 
 * Handles email notifications for meeting room bookings
 * Integrates with notification-service on port 8010
 */
class EmailService
{
    protected string $notificationServiceUrl;
    protected int $apiTimeout = 30;

    public function __construct()
    {
        $this->notificationServiceUrl = env('NOTIFICATION_SERVICE_URL', 'http://notification-service:8010');
    }

    /**
     * Send booking confirmation email to all participants
     */
    public function sendBookingConfirmation(MeetingRoomBooking $booking): bool
    {
        try {
            $requester = $booking->user;
            if (!$requester) {
                Log::warning('Booking requester not found', ['booking_id' => $booking->id]);
                return false;
            }

            $recipients = $this->getRecipientEmails($booking);
            if (empty($recipients)) {
                Log::warning('No recipients for booking confirmation', ['booking_id' => $booking->id]);
                return false;
            }

            $subject = "Meeting Room Booking Confirmation: {$booking->title}";
            $emailData = [
                'booking_id' => $booking->id,
                'title' => $booking->title,
                'room_name' => $booking->meetingRoom?->name ?? 'Unknown Room',
                'date' => $booking->start_time->format('l, F d, Y'),
                'time' => $booking->start_time->format('H:i') . ' - ' . $booking->end_time->format('H:i'),
                'purpose' => $booking->purpose,
                'attendees_count' => $booking->attendees_count,
                'requester' => $requester->name,
                'calendar_link' => $this->generateCalendarInviteLink($booking),
                'booking_reference' => 'BK-' . strtoupper(substr($booking->id, 0, 8)),
            ];

            $notification = [
                'user_id' => $requester->id,
                'type' => 'email',
                'channel' => 'email',
                'template' => 'booking_confirmation',
                'recipient_email' => $recipients,
                'subject' => $subject,
                'data' => $emailData,
                'priority' => 'normal',
                'status' => 'pending',
            ];

            $response = $this->sendNotification($notification);
            
            if ($response) {
                // Mark email as sent
                $booking->update(['email_sent' => true]);
                Log::info('Booking confirmation email queued', ['booking_id' => $booking->id]);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Error sending booking confirmation', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Send booking approved email to all participants
     */
    public function sendBookingApproved(MeetingRoomBooking $booking, User $approver, ?string $notes = null): bool
    {
        try {
            $requester = $booking->user;
            if (!$requester) {
                Log::warning('Booking requester not found', ['booking_id' => $booking->id]);
                return false;
            }

            $recipients = $this->getRecipientEmails($booking);
            if (empty($recipients)) {
                Log::warning('No recipients for approval email', ['booking_id' => $booking->id]);
                return false;
            }

            $subject = "Booking Approved: {$booking->title} at {$booking->meetingRoom?->name}";
            $emailData = [
                'booking_id' => $booking->id,
                'title' => $booking->title,
                'room_name' => $booking->meetingRoom?->name ?? 'Unknown Room',
                'date' => $booking->start_time->format('l, F d, Y'),
                'time' => $booking->start_time->format('H:i') . ' - ' . $booking->end_time->format('H:i'),
                'purpose' => $booking->purpose,
                'requester' => $requester->name,
                'approver' => $approver->name,
                'approval_notes' => $notes ?? 'No additional notes',
                'calendar_link' => $this->generateCalendarInviteLink($booking),
                'booking_reference' => 'BK-' . strtoupper(substr($booking->id, 0, 8)),
                'status_color' => '#4CAF50', // Green for approved
            ];

            $notification = [
                'user_id' => $requester->id,
                'type' => 'email',
                'channel' => 'email',
                'template' => 'booking_approved',
                'recipient_email' => $recipients,
                'subject' => $subject,
                'data' => $emailData,
                'priority' => 'high',
                'status' => 'pending',
            ];

            $response = $this->sendNotification($notification);
            
            if ($response) {
                // Mark approval email as sent
                $booking->update(['approval_email_sent' => true]);
                Log::info('Booking approval email queued', ['booking_id' => $booking->id]);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Error sending booking approval email', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Send booking rejected email to all participants
     */
    public function sendBookingRejected(MeetingRoomBooking $booking, User $rejecter, string $reason): bool
    {
        try {
            $requester = $booking->user;
            if (!$requester) {
                Log::warning('Booking requester not found', ['booking_id' => $booking->id]);
                return false;
            }

            $recipients = $this->getRecipientEmails($booking);
            if (empty($recipients)) {
                Log::warning('No recipients for rejection email', ['booking_id' => $booking->id]);
                return false;
            }

            $subject = "Booking Declined: {$booking->title}";
            $emailData = [
                'booking_id' => $booking->id,
                'title' => $booking->title,
                'room_name' => $booking->meetingRoom?->name ?? 'Unknown Room',
                'date' => $booking->start_time->format('l, F d, Y'),
                'time' => $booking->start_time->format('H:i') . ' - ' . $booking->end_time->format('H:i'),
                'purpose' => $booking->purpose,
                'requester' => $requester->name,
                'rejecter' => $rejecter->name,
                'rejection_reason' => $reason,
                'booking_reference' => 'BK-' . strtoupper(substr($booking->id, 0, 8)),
                'status_color' => '#f44336', // Red for rejected
                'support_email' => env('SUPPORT_EMAIL', 'support@imsquty.com'),
            ];

            $notification = [
                'user_id' => $requester->id,
                'type' => 'email',
                'channel' => 'email',
                'template' => 'booking_rejected',
                'recipient_email' => $recipients,
                'subject' => $subject,
                'data' => $emailData,
                'priority' => 'high',
                'status' => 'pending',
            ];

            $response = $this->sendNotification($notification);
            
            if ($response) {
                Log::info('Booking rejection email queued', ['booking_id' => $booking->id]);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Error sending booking rejection email', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Send calendar invite (.ics format) - can be attached to emails
     */
    public function generateCalendarInvite(MeetingRoomBooking $booking): string
    {
        $requester = $booking->user;
        $room = $booking->meetingRoom;

        $icsContent = "BEGIN:VCALENDAR\r\n";
        $icsContent .= "VERSION:2.0\r\n";
        $icsContent .= "PRODID:-//IMSQuty//Meeting Room Booking//EN\r\n";
        $icsContent .= "CALSCALE:GREGORIAN\r\n";
        $icsContent .= "METHOD:REQUEST\r\n";
        
        $icsContent .= "BEGIN:VEVENT\r\n";
        $icsContent .= "UID:" . $booking->id . "@imsquty.com\r\n";
        $icsContent .= "DTSTAMP:" . now()->format('Ymd\THis\Z') . "\r\n";
        $icsContent .= "DTSTART:" . $booking->start_time->format('Ymd\THis\Z') . "\r\n";
        $icsContent .= "DTEND:" . $booking->end_time->format('Ymd\THis\Z') . "\r\n";
        $icsContent .= "SUMMARY:" . $this->escapeIcsText($booking->title) . "\r\n";
        $icsContent .= "DESCRIPTION:" . $this->escapeIcsText($booking->purpose ?? 'Meeting') . "\r\n";
        $icsContent .= "LOCATION:" . $this->escapeIcsText($room?->name ?? 'TBD') . "\r\n";
        $icsContent .= "ORGANIZER;CN=" . $this->escapeIcsText($requester?->name ?? 'Organizer') . ":mailto:" . $requester?->email . "\r\n";
        
        // Add participants
        if ($booking->participant_emails) {
            foreach ($booking->participant_emails as $email) {
                $icsContent .= "ATTENDEE:mailto:" . $email . "\r\n";
            }
        }
        
        $icsContent .= "STATUS:CONFIRMED\r\n";
        $icsContent .= "SEQUENCE:0\r\n";
        $icsContent .= "END:VEVENT\r\n";
        $icsContent .= "END:VCALENDAR\r\n";

        return $icsContent;
    }

    /**
     * Get all recipient emails for a booking
     */
    protected function getRecipientEmails(MeetingRoomBooking $booking): array
    {
        $recipients = [];

        // Add requester email
        if ($booking->user && $booking->user->email) {
            $recipients[] = $booking->user->email;
        }

        // Add participant emails
        if ($booking->participant_emails && is_array($booking->participant_emails)) {
            $recipients = array_merge($recipients, $booking->participant_emails);
        }

        // Remove duplicates and filter empty values
        $recipients = array_filter(array_unique($recipients));

        return array_values($recipients);
    }

    /**
     * Generate a calendar invite link (can be used in emails)
     */
    protected function generateCalendarInviteLink(MeetingRoomBooking $booking): string
    {
        $params = [
            'title' => urlencode($booking->title),
            'start' => $booking->start_time->format('Ymd\THis'),
            'end' => $booking->end_time->format('Ymd\THis'),
            'location' => urlencode($booking->meetingRoom?->name ?? 'Meeting Room'),
            'description' => urlencode($booking->purpose ?? 'Meeting'),
            'organizer' => urlencode($booking->user?->name ?? 'Organizer'),
            'attendees' => implode(',', $booking->participant_emails ?? []),
        ];

        return env('APP_URL', 'http://localhost:5173') . '/calendar/invite?' . http_build_query($params);
    }

    /**
     * Escape text for ICS format
     */
    protected function escapeIcsText(string $text): string
    {
        $text = str_replace("\r\n", "\\n", $text);
        $text = str_replace("\n", "\\n", $text);
        $text = str_replace(",", "\\,", $text);
        $text = str_replace(";", "\\;", $text);
        return $text;
    }

    /**
     * Send notification via notification-service API
     */
    protected function sendNotification(array $notification): bool
    {
        try {
            $response = Http::timeout($this->apiTimeout)
                ->post(
                    $this->notificationServiceUrl . '/api/v1/notifications',
                    $notification
                );

            if ($response->successful()) {
                Log::debug('Notification sent to service', [
                    'status' => $response->status(),
                    'template' => $notification['template'] ?? 'unknown',
                ]);
                return true;
            }

            Log::warning('Notification service returned error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to reach notification service', [
                'url' => $this->notificationServiceUrl,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
