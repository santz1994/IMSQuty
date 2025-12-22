<?php

namespace App\Http\Requests\Manufacturer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Update Manufacturer Request
 * 
 * Validation rules for updating an existing manufacturer
 */
class UpdateManufacturerRequest extends FormRequest
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
        $manufacturerId = $this->route('id');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:200'
            ],
            'code' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('manufacturers', 'code')->ignore($manufacturerId)
            ],
            'website' => [
                'nullable',
                'string',
                'max:255'
            ],
            'support_email' => [
                'nullable',
                'email',
                'max:100'
            ],
            'support_phone' => [
                'nullable',
                'string',
                'max:50'
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
            'name.required' => 'Manufacturer name is required',
            'name.max' => 'Manufacturer name cannot exceed 255 characters',
            'code.max' => 'Manufacturer code cannot exceed 50 characters',
            'code.unique' => 'This manufacturer code already exists',
            'website.url' => 'Website must be a valid URL',
            'website.max' => 'Website URL cannot exceed 255 characters',
            'support_email.email' => 'Support email must be a valid email address',
            'support_email.max' => 'Support email cannot exceed 255 characters',
            'support_phone.max' => 'Support phone cannot exceed 20 characters',
            'is_active.boolean' => 'Active status must be true or false'
        ];
    }
}
