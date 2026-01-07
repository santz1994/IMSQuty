<?php

namespace App\DTOs;

class CreateTicketDTO
{
    public function __construct(
        public string $description,
        public string $symptoms,
        public string $severity, // low, medium, high, critical
        public string $category,
        public ?int $assetId = null,
        public ?string $assetTag = null,
        public ?string $priority = 'normal', // low, normal, high, urgent
        public ?int $reportedByUserId = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            description: $data['description'],
            symptoms: $data['symptoms'] ?? '',
            severity: $data['severity'] ?? 'medium',
            category: $data['category'] ?? '',
            assetId: $data['asset_id'] ?? null,
            assetTag: $data['asset_tag'] ?? null,
            priority: $data['priority'] ?? 'normal',
            reportedByUserId: auth()->id(),
        );
    }

    public function toArray(): array
    {
        return [
            'description' => $this->description,
            'symptoms' => $this->symptoms,
            'severity' => $this->severity,
            'category' => $this->category,
            'asset_id' => $this->assetId,
            'asset_tag' => $this->assetTag,
            'priority' => $this->priority,
            'reported_by_user_id' => $this->reportedByUserId ?? auth()->id(),
        ];
    }
}
