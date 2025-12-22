<?php

namespace App\Http\Requests;

use App\Models\InventoryItem;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1', 'max:999999'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // For reduce-stock, validate sufficient quantity
            if ($this->isMethod('post') && str_contains($this->path(), 'reduce-stock')) {
                $itemId = $this->route('id');
                $item = InventoryItem::find($itemId);
                
                if ($item && $item->quantity < $this->input('quantity')) {
                    $validator->errors()->add('quantity', 'Insufficient stock. Available: ' . $item->quantity);
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'quantity.required' => 'Quantity is required',
            'quantity.integer' => 'Quantity must be an integer',
            'quantity.min' => 'Quantity must be at least 1',
        ];
    }
}
