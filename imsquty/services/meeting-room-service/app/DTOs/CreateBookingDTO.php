<?php

namespace App\DTOs;

class CreateBookingDTO
{
    public function __construct(
        public readonly string $meeting_room_id,
        public readonly int $user_id,
        public readonly string $title,
        public readonly string $start_time,
        public readonly string $end_time,
        public readonly int $attendees_count,
        public readonly ?string $purpose = null,
        public readonly ?string $notes = null,
        public readonly ?array $equipment_needed = null,
        public readonly ?string $status = 'Pending', // Pending, Approved, Rejected, Cancelled, Completed
        public readonly ?bool $is_recurring = false,
        public readonly ?string $recurrence_pattern = null, // daily, weekly, monthly
        public readonly ?string $recurrence_end_date = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            meeting_room_id: $data['meeting_room_id'],
            user_id: (int) ($data['user_id'] ?? auth()->id()),
            title: $data['title'],
            start_time: $data['start_time'],
            end_time: $data['end_time'],
            attendees_count: (int) $data['attendees_count'],
            purpose: $data['purpose'] ?? null,
            notes: $data['notes'] ?? null,
            equipment_needed: $data['equipment_needed'] ?? null,
            status: $data['status'] ?? 'Pending',
            is_recurring: (bool) ($data['is_recurring'] ?? false),
            recurrence_pattern: $data['recurrence_pattern'] ?? null,
            recurrence_end_date: $data['recurrence_end_date'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'meeting_room_id' => $this->meeting_room_id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'attendees_count' => $this->attendees_count,
            'purpose' => $this->purpose,
            'notes' => $this->notes,
            'equipment_needed' => $this->equipment_needed ? json_encode($this->equipment_needed) : null,
            'status' => $this->status,
            'is_recurring' => $this->is_recurring,
            'recurrence_pattern' => $this->recurrence_pattern,
            'recurrence_end_date' => $this->recurrence_end_date,
        ];
    }

    public function isValidTimeRange(): bool
    {
        $start = \Carbon\Carbon::parse($this->start_time);
        $end = \Carbon\Carbon::parse($this->end_time);
        
        return $end->greaterThan($start);
    }

    public function getDurationInMinutes(): int
    {
        $start = \Carbon\Carbon::parse($this->start_time);
        $end = \Carbon\Carbon::parse($this->end_time);
        
        return $start->diffInMinutes($end);
    }
}
