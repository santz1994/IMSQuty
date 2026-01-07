<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Invoice Resource
 * 
 * Transforms Invoice model to JSON response
 */
class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'amount' => (float) $this->amount,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,
            'remaining_amount' => (float) $this->remaining_amount,
            'due_date' => $this->due_date->toIso8601String(),
            'paid_date' => $this->paid_date?->toIso8601String(),
            'status' => $this->status,
            'is_overdue' => $this->isOverdue(),
            'notes' => $this->notes,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
