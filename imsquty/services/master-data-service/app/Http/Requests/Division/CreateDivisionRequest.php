<?php

namespace App\Http\Requests\Division;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Create Division Request
 * 
 * Validation rules for creating a new division
 */
class CreateDivisionRequest extends FormRequest
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
                'max:50',
                'unique:divisions,code'
            ],
            'description' => [
                'nullable',
                'string'
            ],
            'parent_id' => [
                'nullable',
                'integer',
                'exists:divisions,id'
            ],
            'manager_id' => [
                'nullable',
                'integer',
                'exists:users,id'
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
            'name.required' => 'Division name is required',
            'name.max' => 'Division name cannot exceed 255 characters',
            'code.required' => 'Division code is required',
            'code.max' => 'Division code cannot exceed 50 characters',
            'code.unique' => 'This division code already exists',
            'parent_id.exists' => 'Selected parent division does not exist',
            'manager_id.exists' => 'Selected manager does not exist',
            'is_active.boolean' => 'Active status must be true or false'
        ];
    }
}
