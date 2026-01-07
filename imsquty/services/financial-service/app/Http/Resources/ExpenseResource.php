<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Expense Resource
 * 
 * Transforms Expense model to JSON response
 */
class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'budget_id' => $this->budget_id,
            'budget' => $this->when($this->relationLoaded('budget'), [
                'id' => $this->budget?->id,
                'name' => $this->budget?->name,
                'category' => $this->budget?->category,
            ]),
            'category' => $this->category,
            'description' => $this->description,
            'amount' => (float) $this->amount,
            'expense_date' => $this->expense_date->toIso8601String(),
            'receipt_number' => $this->receipt_number,
            'vendor' => $this->vendor,
            'status' => $this->status,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
