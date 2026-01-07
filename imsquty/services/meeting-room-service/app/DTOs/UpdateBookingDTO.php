<?php

namespace App\DTOs;

class UpdateBookingDTO
{
    public function __construct(
        public readonly ?string $title = null,
        public readonly ?string $start_time = null,
        public readonly ?string $end_time = null,
        public readonly ?int $attendees_count = null,
        public readonly ?string $purpose = null,
        public readonly ?string $notes = null,
        public readonly ?array $equipment_needed = null,
        public readonly ?string $status = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            title: $data['title'] ?? null,
            start_time: $data['start_time'] ?? null,
            end_time: $data['end_time'] ?? null,
            attendees_count: isset($data['attendees_count']) ? (int) $data['attendees_count'] : null,
            purpose: $data['purpose'] ?? null,
            notes: $data['notes'] ?? null,
            equipment_needed: $data['equipment_needed'] ?? null,
            status: $data['status'] ?? null,
        );
    }

    public function toArray(): array
    {
        $data = [];

        if ($this->title !== null) $data['title'] = $this->title;
        if ($this->start_time !== null) $data['start_time'] = $this->start_time;
        if ($this->end_time !== null) $data['end_time'] = $this->end_time;
        if ($this->attendees_count !== null) $data['attendees_count'] = $this->attendees_count;
        if ($this->purpose !== null) $data['purpose'] = $this->purpose;
        if ($this->notes !== null) $data['notes'] = $this->notes;
        if ($this->equipment_needed !== null) $data['equipment_needed'] = json_encode($this->equipment_needed);
        if ($this->status !== null) $data['status'] = $this->status;

        return $data;
    }
}
