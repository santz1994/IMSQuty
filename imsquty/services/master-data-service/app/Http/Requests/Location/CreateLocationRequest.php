<?php

namespace App\Http\Requests\Location;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Create Location Request
 * 
 * Validation rules for creating a new location
 */
class CreateLocationRequest extends FormRequest
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
                'max:255'
            ],
            'code' => [
                'required',
                'string',
                'max:20',
                'unique:locations,code'
            ],
            'type' => [
                'required',
                'string',
                'max:50'
            ],
            'address' => [
                'nullable',
                'string'
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
            'phone' => [
                'nullable',
                'string',
                'max:20'
            ],
            'parent_id' => [
                'nullable',
                'integer',
                'exists:locations,id'
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
            'name.required' => 'Location name is required',
            'name.max' => 'Location name cannot exceed 255 characters',
            'code.required' => 'Location code is required',
            'code.max' => 'Location code cannot exceed 50 characters',
            'code.unique' => 'This location code already exists',
            'city.max' => 'City name cannot exceed 100 characters',
            'state.max' => 'State name cannot exceed 100 characters',
            'country.max' => 'Country name cannot exceed 100 characters',
            'postal_code.max' => 'Postal code cannot exceed 20 characters',
            'phone.max' => 'Phone number cannot exceed 20 characters',
            'parent_id.exists' => 'Selected parent location does not exist',
            'is_active.boolean' => 'Active status must be true or false'
        ];
    }
}
