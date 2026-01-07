<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Update Profile Request
 * 
 * Validation rules for updating user profile
 */
class UpdateProfileRequest extends FormRequest
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
            'first_name' => [
                'sometimes',
                'string',
                'max:100'
            ],
            'last_name' => [
                'sometimes',
                'string',
                'max:100'
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20'
            ],
            'bio' => [
                'nullable',
                'string',
                'max:500'
            ],
            'timezone' => [
                'nullable',
                'string',
                'timezone'
            ],
            'language' => [
                'nullable',
                'string',
                'in:en,id,ms' // English, Indonesian, Malay
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
            'first_name.max' => 'First name cannot exceed 100 characters',
            'last_name.max' => 'Last name cannot exceed 100 characters',
            'phone.max' => 'Phone number cannot exceed 20 characters',
            'bio.max' => 'Bio cannot exceed 500 characters',
            'timezone.timezone' => 'Invalid timezone',
            'language.in' => 'Language must be one of: en, id, ms'
        ];
    }
}
