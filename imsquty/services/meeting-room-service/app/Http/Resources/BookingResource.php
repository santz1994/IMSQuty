<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'meeting_room' => [
                'id' => $this->meetingRoom->id,
                'name' => $this->meetingRoom->name,
                'code' => $this->meetingRoom->code,
                'capacity' => $this->meetingRoom->capacity,
            ],
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'title' => $this->title,
            'description' => $this->description,
            'purpose' => $this->purpose,
            'start_time' => $this->start_time?->toISOString(),
            'end_time' => $this->end_time?->toISOString(),
            'duration_minutes' => $this->duration,
            'attendees_count' => $this->attendees_count,
            'attendees_list' => $this->attendees_list,
            'special_requirements' => $this->special_requirements,
            'status' => $this->status,
            'approver' => $this->when($this->approver, [
                'id' => $this->approver?->id,
                'name' => $this->approver?->name,
            ]),
            'approved_at' => $this->approved_at?->toISOString(),
            'rejection_reason' => $this->rejection_reason,
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'can_be_cancelled' => $this->canBeCancelled(),
            'is_ongoing' => $this->isOngoing(),
            'is_past' => $this->isPast(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
