<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BatchUpdateStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|integer',
            'items.*.notes' => 'nullable|string|max:500',
            'movement_type' => 'required|in:IN,OUT,ADJUSTMENT',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000'
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Items array is required',
            'items.*.inventory_item_id.required' => 'Item ID is required',
            'items.*.inventory_item_id.exists' => 'Item not found',
            'items.*.quantity.required' => 'Quantity is required',
            'movement_type.required' => 'Movement type is required',
            'movement_type.in' => 'Invalid movement type'
        ];
    }
}
