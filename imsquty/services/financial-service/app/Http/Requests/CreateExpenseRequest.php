<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Create Expense Request
 * 
 * Validation rules for creating a new expense
 */
class CreateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'budget_id' => [
                'required',
                'integer',
                'exists:budgets,id'
            ],
            'category' => [
                'required',
                'string',
                'max:100'
            ],
            'description' => [
                'required',
                'string',
                'max:500'
            ],
            'amount' => [
                'required',
                'numeric',
                'min:0'
            ],
            'expense_date' => [
                'required',
                'date',
                'before_or_equal:today'
            ],
            'receipt_number' => [
                'nullable',
                'string',
                'max:50'
            ],
            'vendor' => [
                'nullable',
                'string',
                'max:255'
            ],
            'status' => [
                'nullable',
                Rule::in(['Pending', 'Approved', 'Rejected', 'Paid'])
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'budget_id.required' => 'Budget is required',
            'budget_id.exists' => 'Selected budget does not exist',
            'category.required' => 'Category is required',
            'description.required' => 'Description is required',
            'amount.required' => 'Amount is required',
            'amount.min' => 'Amount must be greater than or equal to 0',
            'expense_date.required' => 'Expense date is required',
            'expense_date.before_or_equal' => 'Expense date cannot be in the future',
        ];
    }
}
