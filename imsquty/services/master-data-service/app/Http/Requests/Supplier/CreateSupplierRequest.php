<?php

namespace App\Http\Requests\Supplier;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Create Supplier Request
 * 
 * Validation rules for creating a new supplier
 */
class CreateSupplierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:200'
            ],
            'code' => [
                'required',
                'string',
                'max:20',
                'unique:suppliers,code'
            ],
            'contact_person' => [
                'nullable',
                'string',
                'max:100'
            ],
            'phone' => [
                'nullable',
                'string',
                'max:50'
            ],
            'email' => [
                'nullable',
                'email',
                'max:100'
            ],
            'address' => [
                'nullable',
                'string',
                'max:255'
            ],
            'city' => [
                'nullable',
                'string',
                'max:100'
            ],
            'state' => [
                'nullable',
                'string',
                'max:100'
            ],
            'country' => [
                'nullable',
                'string',
                'max:100'
            ],
            'postal_code' => [
                'nullable',
                'string',
                'max:20'
            ],
            'website' => [
                'nullable',
                'string',
                'max:255'
            ],
            'description' => [
                'nullable',
                'string'
            ],
            'is_active' => [
                'nullable',
                'boolean'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Supplier name is required',
            'name.max' => 'Supplier name cannot exceed 255 characters',
            'code.required' => 'Supplier code is required',
            'code.max' => 'Supplier code cannot exceed 50 characters',
            'code.unique' => 'This supplier code already exists',
            'contact_person.max' => 'Contact person name cannot exceed 255 characters',
            'email.email' => 'Email must be a valid email address',
            'email.max' => 'Email cannot exceed 255 characters',
            'phone.max' => 'Phone number cannot exceed 20 characters',
            'city.max' => 'City name cannot exceed 100 characters',
            'country.max' => 'Country name cannot exceed 100 characters',
            'tax_id.max' => 'Tax ID cannot exceed 50 characters',
            'payment_terms.max' => 'Payment terms cannot exceed 100 characters',
            'is_active.boolean' => 'Active status must be true or false'
        ];
    }
}
