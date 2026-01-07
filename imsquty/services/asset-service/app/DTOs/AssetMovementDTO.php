<?php

namespace App\DTOs;

class AssetMovementDTO
{
    public function __construct(
        public readonly string $asset_id,
        public readonly int $from_location_id,
        public readonly int $to_location_id,
        public readonly string $movement_date,
        public readonly int $moved_by,
        public readonly ?string $reason = null,
        public readonly ?string $notes = null,
    ) {}

    public static function fromRequest(array $data, string $assetId): self
    {
        return new self(
            asset_id: $assetId,
            from_location_id: (int) $data['from_location_id'],
            to_location_id: (int) $data['to_location_id'],
            movement_date: $data['movement_date'] ?? now()->toDateTimeString(),
            moved_by: (int) ($data['moved_by'] ?? auth()->id()),
            reason: $data['reason'] ?? null,
            notes: $data['notes'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'asset_id' => $this->asset_id,
            'from_location_id' => $this->from_location_id,
            'to_location_id' => $this->to_location_id,
            'movement_date' => $this->movement_date,
            'moved_by' => $this->moved_by,
            'reason' => $this->reason,
            'notes' => $this->notes,
        ];
    }
}
