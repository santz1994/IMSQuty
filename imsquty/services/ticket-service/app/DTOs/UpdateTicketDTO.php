<?php

namespace App\DTOs;

class UpdateTicketDTO
{
    public function __construct(
        public ?string $description = null,
        public ?string $symptoms = null,
        public ?string $severity = null,
        public ?string $priority = null,
        public ?string $category = null,
        public ?string $status = null,
        public ?int $assignedToUserId = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            description: $data['description'] ?? null,
            symptoms: $data['symptoms'] ?? null,
            severity: $data['severity'] ?? null,
            priority: $data['priority'] ?? null,
            category: $data['category'] ?? null,
            status: $data['status'] ?? null,
            assignedToUserId: $data['assigned_to_user_id'] ?? null,
        );
    }

    public function toArray(): array
    {
        $data = [];
        
        if ($this->description !== null) $data['description'] = $this->description;
        if ($this->symptoms !== null) $data['symptoms'] = $this->symptoms;
        if ($this->severity !== null) $data['severity'] = $this->severity;
        if ($this->priority !== null) $data['priority'] = $this->priority;
        if ($this->category !== null) $data['category'] = $this->category;
        if ($this->status !== null) $data['status'] = $this->status;
        if ($this->assignedToUserId !== null) $data['assigned_to_user_id'] = $this->assignedToUserId;

        return $data;
    }
}
