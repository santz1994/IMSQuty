<?php

namespace App\Http\Requests\WarrantyType;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Update Warranty Type Request
 * 
 * Validation rules for updating an existing warranty type
 */
class UpdateWarrantyTypeRequest extends FormRequest
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
                'sometimes',
                'required',
                'string',
                'max:200'
            ],
            'duration_months' => [
                'nullable',
                'integer',
                'min:1'
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
            'name.required' => 'Warranty type name is required',
            'name.max' => 'Warranty type name cannot exceed 255 characters',
            'default_duration_months.integer' => 'Duration must be a valid number',
            'default_duration_months.min' => 'Duration cannot be negative',
            'default_duration_months.max' => 'Duration cannot exceed 999 months',
            'is_active.boolean' => 'Active status must be true or false'
        ];
    }
}
