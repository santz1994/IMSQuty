<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Budget Resource
 * 
 * Transforms Budget model to JSON response
 */
class BudgetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'allocated_amount' => (float) $this->allocated_amount,
            'spent_amount' => (float) $this->spent_amount,
            'remaining_amount' => (float) ($this->allocated_amount - $this->spent_amount),
            'utilization_percentage' => round($this->utilization_percentage, 2),
            'period_start' => $this->period_start->toIso8601String(),
            'period_end' => $this->period_end->toIso8601String(),
            'is_active' => $this->is_active,
            'expenses_count' => $this->whenLoaded('expenses', fn() => $this->expenses->count()),
            'expenses' => ExpenseResource::collection($this->whenLoaded('expenses')),
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
