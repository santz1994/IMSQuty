<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Create Invoice Request
 * 
 * Validation rules for creating a new invoice
 */
class CreateInvoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'invoice_number' => [
                'required',
                'string',
                'max:50',
                'unique:invoices,invoice_number'
            ],
            'customer_name' => [
                'required',
                'string',
                'max:255'
            ],
            'customer_email' => [
                'required',
                'email',
                'max:255'
            ],
            'customer_phone' => [
                'nullable',
                'string',
                'max:20'
            ],
            'amount' => [
                'required',
                'numeric',
                'min:0'
            ],
            'tax' => [
                'nullable',
                'numeric',
                'min:0'
            ],
            'total' => [
                'required',
                'numeric',
                'min:0'
            ],
            'due_date' => [
                'required',
                'date',
                'after:today'
            ],
            'status' => [
                'nullable',
                Rule::in(['Draft', 'Pending', 'Paid', 'Overdue', 'Cancelled'])
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'invoice_number.required' => 'Invoice number is required',
            'invoice_number.unique' => 'This invoice number already exists',
            'customer_name.required' => 'Customer name is required',
            'customer_email.required' => 'Customer email is required',
            'customer_email.email' => 'Please provide a valid email address',
            'amount.required' => 'Invoice amount is required',
            'amount.min' => 'Amount must be greater than or equal to 0',
            'total.required' => 'Total amount is required',
            'due_date.required' => 'Due date is required',
            'due_date.after' => 'Due date must be after today',
        ];
    }
}
