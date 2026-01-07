<?php

namespace App\DTOs;

class CheckOutDTO
{
    public function __construct(
        public readonly string $booking_id,
        public readonly string $check_out_time,
        public readonly ?string $condition_notes = null,
        public readonly ?string $issues_reported = null,
        public readonly ?int $checked_out_by = null,
        public readonly ?bool $equipment_damaged = false,
    ) {}

    public static function fromRequest(array $data, string $bookingId): self
    {
        return new self(
            booking_id: $bookingId,
            check_out_time: $data['check_out_time'] ?? now()->toDateTimeString(),
            condition_notes: $data['condition_notes'] ?? null,
            issues_reported: $data['issues_reported'] ?? null,
            checked_out_by: (int) ($data['checked_out_by'] ?? auth()->id()),
            equipment_damaged: (bool) ($data['equipment_damaged'] ?? false),
        );
    }

    public function toArray(): array
    {
        return [
            'booking_id' => $this->booking_id,
            'check_out_time' => $this->check_out_time,
            'condition_notes' => $this->condition_notes,
            'issues_reported' => $this->issues_reported,
            'checked_out_by' => $this->checked_out_by,
            'equipment_damaged' => $this->equipment_damaged,
            'status' => 'Completed',
        ];
    }
}
