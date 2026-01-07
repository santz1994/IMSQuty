<?php

namespace App\DTOs;

class StatusChangeDTO
{
    public function __construct(
        public string $toStatus,
        public ?string $reason = null,
        public ?int $changedByUserId = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            toStatus: $data['to_status'],
            reason: $data['reason'] ?? null,
            changedByUserId: auth()->id(),
        );
    }

    public function toArray(): array
    {
        return [
            'to_status' => $this->toStatus,
            'reason' => $this->reason,
            'changed_by_user_id' => $this->changedByUserId ?? auth()->id(),
        ];
    }
}
