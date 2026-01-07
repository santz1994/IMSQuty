<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Update Invoice Request
 * 
 * Validation rules for updating an existing invoice
 */
class UpdateInvoiceRequest extends FormRequest
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
        $invoiceId = $this->route('invoice');
        
        return [
            'invoice_number' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('invoices', 'invoice_number')->ignore($invoiceId)
            ],
            'customer_name' => [
                'sometimes',
                'string',
                'max:255'
            ],
            'customer_email' => [
                'sometimes',
                'email',
                'max:255'
            ],
            'customer_phone' => [
                'nullable',
                'string',
                'max:20'
            ],
            'amount' => [
                'sometimes',
                'numeric',
                'min:0'
            ],
            'tax' => [
                'nullable',
                'numeric',
                'min:0'
            ],
            'total' => [
                'sometimes',
                'numeric',
                'min:0'
            ],
            'due_date' => [
                'sometimes',
                'date'
            ],
            'paid_date' => [
                'nullable',
                'date',
                'after_or_equal:created_at'
            ],
            'status' => [
                'sometimes',
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
            'invoice_number.unique' => 'This invoice number already exists',
            'customer_email.email' => 'Please provide a valid email address',
            'amount.min' => 'Amount must be greater than or equal to 0',
            'paid_date.after_or_equal' => 'Paid date cannot be before invoice creation date',
        ];
    }
}
