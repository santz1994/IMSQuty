<?php

namespace App\DTOs;

class MaintenanceDTO
{
    public function __construct(
        public readonly string $asset_id,
        public readonly string $maintenance_type, // 'Preventive' or 'Corrective'
        public readonly string $maintenance_date,
        public readonly string $description,
        public readonly int $performed_by,
        public readonly ?string $status = 'Scheduled', // Scheduled, In-Progress, Completed, Failed
        public readonly ?string $completed_date = null,
        public readonly ?float $cost = null,
        public readonly ?string $vendor = null,
        public readonly ?string $notes = null,
        public readonly ?string $next_maintenance_date = null,
    ) {}

    public static function fromRequest(array $data, string $assetId): self
    {
        return new self(
            asset_id: $assetId,
            maintenance_type: $data['maintenance_type'],
            maintenance_date: $data['maintenance_date'],
            description: $data['description'],
            performed_by: (int) ($data['performed_by'] ?? auth()->id()),
            status: $data['status'] ?? 'Scheduled',
            completed_date: $data['completed_date'] ?? null,
            cost: isset($data['cost']) ? (float) $data['cost'] : null,
            vendor: $data['vendor'] ?? null,
            notes: $data['notes'] ?? null,
            next_maintenance_date: $data['next_maintenance_date'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'asset_id' => $this->asset_id,
            'maintenance_type' => $this->maintenance_type,
            'maintenance_date' => $this->maintenance_date,
            'description' => $this->description,
            'performed_by' => $this->performed_by,
            'status' => $this->status,
            'completed_date' => $this->completed_date,
            'cost' => $this->cost,
            'vendor' => $this->vendor,
            'notes' => $this->notes,
            'next_maintenance_date' => $this->next_maintenance_date,
        ];
    }
}
