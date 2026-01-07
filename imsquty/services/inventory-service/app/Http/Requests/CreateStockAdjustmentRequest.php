<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateStockAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'adjustment_type' => 'required|in:increase,decrease',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'reference_number' => 'nullable|string|max:100'
        ];
    }

    public function messages(): array
    {
        return [
            'inventory_item_id.required' => 'Item is required',
            'inventory_item_id.exists' => 'Item not found',
            'adjustment_type.required' => 'Adjustment type is required',
            'adjustment_type.in' => 'Adjustment type must be increase or decrease',
            'quantity.required' => 'Quantity is required',
            'quantity.integer' => 'Quantity must be a number',
            'quantity.min' => 'Quantity must be at least 1',
            'reason.required' => 'Reason is required',
            'reason.max' => 'Reason cannot exceed 500 characters'
        ];
    }
}
