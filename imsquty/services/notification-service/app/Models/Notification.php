<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Notification Model
 * 
 * Represents a notification sent to users
 * Supports multiple channels: email, sms, push, database
 * 
 * @property int $id
 * @property int $user_id
 * @property string $type Email|SMS|Push|Database
 * @property string $channel
 * @property string $subject
 * @property string $body
 * @property array|null $data Additional data
 * @property string $status Pending|Sent|Failed|Cancelled
 * @property \DateTime|null $scheduled_at
 * @property \DateTime|null $sent_at
 * @property string|null $error_message
 * @property int $retry_count
 * @property int|null $priority
 * @property string|null $template_code
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 * @property \DateTime|null $deleted_at
 */
class Notification extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'message',
        'type',
        'channel',
        'priority',
        'status',
        'recipient_id',
        'recipient_email',
        'recipient_phone',
        'is_read',
        'read_at',
        'sent_at',
        'failed_at',
        'error_message',
        'metadata',
        'created_by',
        'updated_by'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'metadata' => 'json',
        'read_at' => 'datetime',
        'sent_at' => 'datetime',
        'failed_at' => 'datetime',
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Notification types
     */
    const TYPE_EMAIL = 'Email';
    const TYPE_SMS = 'SMS';
    const TYPE_PUSH = 'Push';
    const TYPE_DATABASE = 'Database';

    /**
     * Notification statuses
     */
    const STATUS_PENDING = 'Pending';
    const STATUS_SENT = 'Sent';
    const STATUS_FAILED = 'Failed';
    const STATUS_CANCELLED = 'Cancelled';

    /**
     * Notification channels
     */
    const CHANNEL_EMAIL = 'email';
    const CHANNEL_SMS = 'sms';
    const CHANNEL_PUSH = 'push';
    const CHANNEL_DATABASE = 'database';

    /**
     * Priority levels
     */
    const PRIORITY_LOW = 1;
    const PRIORITY_NORMAL = 2;
    const PRIORITY_HIGH = 3;
    const PRIORITY_URGENT = 4;

    /**
     * Get the user who will receive the notification
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Scope: Pending notifications
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Sent notifications
     */
    public function scopeSent($query)
    {
        return $query->where('status', self::STATUS_SENT);
    }

    /**
     * Scope: Failed notifications
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope: By type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: By channel
     */
    public function scopeByChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    /**
     * Scope: Scheduled for sending
     */
    public function scopeScheduled($query)
    {
        return $query->whereNotNull('scheduled_at')
                    ->where('scheduled_at', '<=', now())
                    ->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: High priority
     */
    public function scopeHighPriority($query)
    {
        return $query->where('priority', '>=', self::PRIORITY_HIGH);
    }

    /**
     * Scope: Ready to send (pending + scheduled time passed or no schedule)
     */
    public function scopeReadyToSend($query)
    {
        return $query->where('status', self::STATUS_PENDING)
                    ->where(function($q) {
                        $q->whereNull('scheduled_at')
                          ->orWhere('scheduled_at', '<=', now());
                    });
    }

    /**
     * Mark notification as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => self::STATUS_SENT,
            'sent_at' => now()
        ]);
    }

    /**
     * Mark notification as failed
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'error_message' => $errorMessage,
            'retry_count' => $this->retry_count + 1
        ]);
    }

    /**
     * Check if notification can be retried
     */
    public function canRetry(int $maxRetries = 3): bool
    {
        return $this->status === self::STATUS_FAILED && $this->retry_count < $maxRetries;
    }

    /**
     * Check if notification is scheduled
     */
    public function isScheduled(): bool
    {
        return !is_null($this->scheduled_at) && $this->scheduled_at->isFuture();
    }

    /**
     * Get priority name
     */
    public function getPriorityNameAttribute(): string
    {
        return match($this->priority) {
            self::PRIORITY_URGENT => 'Urgent',
            self::PRIORITY_HIGH => 'High',
            self::PRIORITY_NORMAL => 'Normal',
            self::PRIORITY_LOW => 'Low',
            default => 'Normal'
        };
    }
}
