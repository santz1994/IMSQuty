<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'channel' => $this->channel,
            'priority' => $this->priority,
            'status' => $this->status,
            'recipient_id' => $this->recipient_id,
            'recipient_email' => $this->recipient_email,
            'recipient_phone' => $this->recipient_phone,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at?->toISOString(),
            'sent_at' => $this->sent_at?->toISOString(),
            'failed_at' => $this->failed_at?->toISOString(),
            'error_message' => $this->error_message,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString()
        ];
    }
}
