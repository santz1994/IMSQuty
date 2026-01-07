<?php

namespace App\DTOs;

class CreateAssetDTO
{
    public function __construct(
        public readonly string $asset_tag,
        public readonly string $name,
        public readonly string $serial_number,
        public readonly int $asset_type_id,
        public readonly int $model_id,
        public readonly int $division_id,
        public readonly int $location_id,
        public readonly int $supplier_id,
        public readonly string $purchase_date,
        public readonly int $warranty_months,
        public readonly int $warranty_type_id,
        public readonly string $invoice_id,
        public readonly string $purchase_order_id,
        public readonly ?int $manufacturer_id = null,
        public readonly ?string $ip_address = null,
        public readonly ?string $mac_address = null,
        public readonly ?int $status_id = null,
        public readonly ?int $assigned_to = null,
        public readonly ?float $cost = null,
        public readonly ?string $notes = null,
        public readonly ?string $qr_code = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            asset_tag: $data['asset_tag'],
            name: $data['name'],
            serial_number: $data['serial_number'],
            asset_type_id: (int) $data['asset_type_id'],
            model_id: (int) $data['model_id'],
            division_id: (int) $data['division_id'],
            location_id: (int) $data['location_id'],
            supplier_id: (int) $data['supplier_id'],
            purchase_date: $data['purchase_date'],
            warranty_months: (int) $data['warranty_months'],
            warranty_type_id: (int) $data['warranty_type_id'],
            invoice_id: $data['invoice_id'],
            purchase_order_id: $data['purchase_order_id'],
            manufacturer_id: isset($data['manufacturer_id']) ? (int) $data['manufacturer_id'] : null,
            ip_address: $data['ip_address'] ?? null,
            mac_address: $data['mac_address'] ?? null,
            status_id: isset($data['status_id']) ? (int) $data['status_id'] : null,
            assigned_to: isset($data['assigned_to']) ? (int) $data['assigned_to'] : null,
            cost: isset($data['cost']) ? (float) $data['cost'] : null,
            notes: $data['notes'] ?? null,
            qr_code: $data['qr_code'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'asset_tag' => $this->asset_tag,
            'name' => $this->name,
            'serial_number' => $this->serial_number,
            'asset_type_id' => $this->asset_type_id,
            'model_id' => $this->model_id,
            'division_id' => $this->division_id,
            'location_id' => $this->location_id,
            'supplier_id' => $this->supplier_id,
            'purchase_date' => $this->purchase_date,
            'warranty_months' => $this->warranty_months,
            'warranty_type_id' => $this->warranty_type_id,
            'invoice_id' => $this->invoice_id,
            'purchase_order_id' => $this->purchase_order_id,
            'manufacturer_id' => $this->manufacturer_id,
            'ip_address' => $this->ip_address,
            'mac_address' => $this->mac_address,
            'status_id' => $this->status_id,
            'assigned_to' => $this->assigned_to,
            'cost' => $this->cost,
            'notes' => $this->notes,
            'qr_code' => $this->qr_code,
        ];
    }
}
