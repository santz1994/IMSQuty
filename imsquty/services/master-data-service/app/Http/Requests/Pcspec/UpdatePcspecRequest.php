<?php

namespace App\Http\Requests\Pcspec;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Update PC Specification Request
 * 
 * Validation rules for updating an existing PC specification template
 */
class UpdatePcspecRequest extends FormRequest
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
            'cpu' => [
                'nullable',
                'string',
                'max:100'
            ],
            'ram_gb' => [
                'nullable',
                'integer',
                'min:1'
            ],
            'storage' => [
                'nullable',
                'string',
                'max:100'
            ],
            'gpu' => [
                'nullable',
                'string',
                'max:100'
            ],
            'motherboard' => [
                'nullable',
                'string',
                'max:100'
            ],
            'psu' => [
                'nullable',
                'string',
                'max:100'
            ],
            'case_type' => [
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
            'name.required' => 'PC specification name is required',
            'name.max' => 'PC specification name cannot exceed 255 characters',
            'cpu.max' => 'CPU specification cannot exceed 255 characters',
            'ram.max' => 'RAM specification cannot exceed 100 characters',
            'hdd.max' => 'HDD specification cannot exceed 100 characters',
            'gpu.max' => 'GPU specification cannot exceed 255 characters',
            'os.max' => 'OS specification cannot exceed 255 characters',
            'is_active.boolean' => 'Active status must be true or false'
        ];
    }
}
