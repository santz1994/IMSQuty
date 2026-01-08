<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Update User Request
 * 
 * Validation rules for updating an existing user
 */
class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user'); // Get user ID from route parameter
        
        return [
            'username' => [
                'sometimes',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-zA-Z0-9_-]+$/',
                Rule::unique('users', 'username')->ignore($userId)
            ],
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                'ends_with:@quty.co.id', // Only corporate domain allowed
                Rule::unique('users', 'email')->ignore($userId)
            ],
            'password' => [
                'sometimes',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
            ],
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
            'division_id' => [
                'nullable',
                'integer',
                'exists:divisions,id'
            ],
            'status' => [
                'sometimes',
                Rule::in(['active', 'inactive', 'suspended'])
            ],
            'role' => [
                'sometimes',
                'string',
                'exists:roles,name'
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
            'username.unique' => 'This username is already taken',
            'username.regex' => 'Username can only contain letters, numbers, hyphens, and underscores',
            'email.unique' => 'This email address is already registered',
            'password.min' => 'Password must be at least 8 characters',
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        ];
    }
}
