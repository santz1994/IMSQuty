<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Create Budget Request
 * 
 * Validation rules for creating a new budget
 */
class CreateBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255'
            ],
            'category' => [
                'required',
                'string',
                'max:100'
            ],
            'allocated_amount' => [
                'required',
                'numeric',
                'min:0'
            ],
            'period_start' => [
                'required',
                'date'
            ],
            'period_end' => [
                'required',
                'date',
                'after:period_start'
            ],
            'is_active' => [
                'nullable',
                'boolean'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Budget name is required',
            'category.required' => 'Category is required',
            'allocated_amount.required' => 'Allocated amount is required',
            'allocated_amount.min' => 'Allocated amount must be greater than or equal to 0',
            'period_start.required' => 'Period start date is required',
            'period_end.required' => 'Period end date is required',
            'period_end.after' => 'Period end must be after period start',
        ];
    }
}
