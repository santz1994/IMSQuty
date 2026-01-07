<?php

namespace App\DTOs;

class WarrantyDTO
{
    public function __construct(
        public readonly string $asset_id,
        public readonly int $warranty_type_id,
        public readonly int $warranty_months,
        public readonly string $start_date,
        public readonly string $expiry_date,
        public readonly ?string $vendor = null,
        public readonly ?string $warranty_number = null,
        public readonly ?string $contact_info = null,
        public readonly ?string $terms = null,
        public readonly ?string $notes = null,
    ) {}

    public static function fromRequest(array $data, string $assetId): self
    {
        $startDate = $data['start_date'];
        $warrantyMonths = (int) $data['warranty_months'];
        $expiryDate = $data['expiry_date'] ?? self::calculateExpiryDate($startDate, $warrantyMonths);

        return new self(
            asset_id: $assetId,
            warranty_type_id: (int) $data['warranty_type_id'],
            warranty_months: $warrantyMonths,
            start_date: $startDate,
            expiry_date: $expiryDate,
            vendor: $data['vendor'] ?? null,
            warranty_number: $data['warranty_number'] ?? null,
            contact_info: $data['contact_info'] ?? null,
            terms: $data['terms'] ?? null,
            notes: $data['notes'] ?? null,
        );
    }

    private static function calculateExpiryDate(string $startDate, int $months): string
    {
        $start = \Carbon\Carbon::parse($startDate);
        return $start->addMonths($months)->format('Y-m-d');
    }

    public function toArray(): array
    {
        return [
            'asset_id' => $this->asset_id,
            'warranty_type_id' => $this->warranty_type_id,
            'warranty_months' => $this->warranty_months,
            'start_date' => $this->start_date,
            'expiry_date' => $this->expiry_date,
            'vendor' => $this->vendor,
            'warranty_number' => $this->warranty_number,
            'contact_info' => $this->contact_info,
            'terms' => $this->terms,
            'notes' => $this->notes,
        ];
    }

    public function isExpiringSoon(int $daysThreshold = 30): bool
    {
        $expiry = \Carbon\Carbon::parse($this->expiry_date);
        $now = \Carbon\Carbon::now();
        
        return $expiry->diffInDays($now, false) <= $daysThreshold && $expiry->isFuture();
    }

    public function isExpired(): bool
    {
        return \Carbon\Carbon::parse($this->expiry_date)->isPast();
    }
}
