<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MeetingRoomResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'location_id' => $this->location_id,
            'floor' => $this->floor,
            'building' => $this->building,
            'capacity' => $this->capacity,
            'description' => $this->description,
            'facilities' => $this->facilities,
            'equipment' => $this->equipment,
            'hourly_rate' => $this->hourly_rate,
            'status' => $this->status,
            'image' => $this->image,
            'notes' => $this->notes,
            'upcoming_bookings_count' => $this->when(
                $request->route()->getName() === 'meeting-rooms.show',
                fn() => $this->activeBookings()->upcoming()->count()
            ),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
