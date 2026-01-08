<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Create User Request
 * 
 * Validation rules for creating a new user
 */
class CreateUserRequest extends FormRequest
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
            'username' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-zA-Z0-9_-]+$/',
                'unique:users,username'
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'ends_with:@quty.co.id', // Only corporate domain allowed
                'unique:users,email'
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/' // At least 1 lowercase, 1 uppercase, 1 number
            ],
            'first_name' => [
                'required',
                'string',
                'max:100'
            ],
            'last_name' => [
                'required',
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
                'nullable',
                Rule::in(['active', 'inactive', 'suspended'])
            ],
            'role' => [
                'nullable',
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
            'username.required' => 'Username is required',
            'username.unique' => 'This username is already taken',
            'username.regex' => 'Username can only contain letters, numbers, hyphens, and underscores',
            'email.required' => 'Email address is required',
            'email.unique' => 'This email address is already registered',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
        ];
    }
}
