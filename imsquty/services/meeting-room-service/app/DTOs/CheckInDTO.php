<?php

namespace App\DTOs;

class CheckInDTO
{
    public function __construct(
        public readonly string $booking_id,
        public readonly string $check_in_time,
        public readonly int $actual_attendees,
        public readonly ?string $notes = null,
        public readonly ?int $checked_in_by = null,
    ) {}

    public static function fromRequest(array $data, string $bookingId): self
    {
        return new self(
            booking_id: $bookingId,
            check_in_time: $data['check_in_time'] ?? now()->toDateTimeString(),
            actual_attendees: (int) $data['actual_attendees'],
            notes: $data['notes'] ?? null,
            checked_in_by: (int) ($data['checked_in_by'] ?? auth()->id()),
        );
    }

    public function toArray(): array
    {
        return [
            'booking_id' => $this->booking_id,
            'check_in_time' => $this->check_in_time,
            'actual_attendees' => $this->actual_attendees,
            'notes' => $this->notes,
            'checked_in_by' => $this->checked_in_by,
            'status' => 'In-Progress',
        ];
    }
}
