<?php

namespace App\DTOs;

class UpdateAssetDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $serial_number = null,
        public readonly ?int $asset_type_id = null,
        public readonly ?int $model_id = null,
        public readonly ?int $manufacturer_id = null,
        public readonly ?int $division_id = null,
        public readonly ?int $location_id = null,
        public readonly ?int $supplier_id = null,
        public readonly ?string $purchase_date = null,
        public readonly ?int $warranty_months = null,
        public readonly ?int $warranty_type_id = null,
        public readonly ?string $invoice_id = null,
        public readonly ?string $purchase_order_id = null,
        public readonly ?string $ip_address = null,
        public readonly ?string $mac_address = null,
        public readonly ?int $status_id = null,
        public readonly ?int $assigned_to = null,
        public readonly ?float $cost = null,
        public readonly ?string $notes = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            serial_number: $data['serial_number'] ?? null,
            asset_type_id: isset($data['asset_type_id']) ? (int) $data['asset_type_id'] : null,
            model_id: isset($data['model_id']) ? (int) $data['model_id'] : null,
            manufacturer_id: isset($data['manufacturer_id']) ? (int) $data['manufacturer_id'] : null,
            division_id: isset($data['division_id']) ? (int) $data['division_id'] : null,
            location_id: isset($data['location_id']) ? (int) $data['location_id'] : null,
            supplier_id: isset($data['supplier_id']) ? (int) $data['supplier_id'] : null,
            purchase_date: $data['purchase_date'] ?? null,
            warranty_months: isset($data['warranty_months']) ? (int) $data['warranty_months'] : null,
            warranty_type_id: isset($data['warranty_type_id']) ? (int) $data['warranty_type_id'] : null,
            invoice_id: $data['invoice_id'] ?? null,
            purchase_order_id: $data['purchase_order_id'] ?? null,
            ip_address: $data['ip_address'] ?? null,
            mac_address: $data['mac_address'] ?? null,
            status_id: isset($data['status_id']) ? (int) $data['status_id'] : null,
            assigned_to: isset($data['assigned_to']) ? (int) $data['assigned_to'] : null,
            cost: isset($data['cost']) ? (float) $data['cost'] : null,
            notes: $data['notes'] ?? null,
        );
    }

    public function toArray(): array
    {
        $data = [];

        if ($this->name !== null) $data['name'] = $this->name;
        if ($this->serial_number !== null) $data['serial_number'] = $this->serial_number;
        if ($this->asset_type_id !== null) $data['asset_type_id'] = $this->asset_type_id;
        if ($this->model_id !== null) $data['model_id'] = $this->model_id;
        if ($this->manufacturer_id !== null) $data['manufacturer_id'] = $this->manufacturer_id;
        if ($this->division_id !== null) $data['division_id'] = $this->division_id;
        if ($this->location_id !== null) $data['location_id'] = $this->location_id;
        if ($this->supplier_id !== null) $data['supplier_id'] = $this->supplier_id;
        if ($this->purchase_date !== null) $data['purchase_date'] = $this->purchase_date;
        if ($this->warranty_months !== null) $data['warranty_months'] = $this->warranty_months;
        if ($this->warranty_type_id !== null) $data['warranty_type_id'] = $this->warranty_type_id;
        if ($this->invoice_id !== null) $data['invoice_id'] = $this->invoice_id;
        if ($this->purchase_order_id !== null) $data['purchase_order_id'] = $this->purchase_order_id;
        if ($this->ip_address !== null) $data['ip_address'] = $this->ip_address;
        if ($this->mac_address !== null) $data['mac_address'] = $this->mac_address;
        if ($this->status_id !== null) $data['status_id'] = $this->status_id;
        if ($this->assigned_to !== null) $data['assigned_to'] = $this->assigned_to;
        if ($this->cost !== null) $data['cost'] = $this->cost;
        if ($this->notes !== null) $data['notes'] = $this->notes;

        return $data;
    }
}
