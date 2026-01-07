<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Login Request Validation
 * 
 * Validates login credentials (email + password)
 * 
 * @package App\Http\Requests
 */
class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Anyone can attempt to login
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required_without:username',
                'email',
                'max:255',
                'ends_with:@quty.co.id' // Only @quty.co.id emails allowed
            ],
            'username' => [
                'required_without:email',
                'string',
                'max:255',
                'alpha_dash' // Username: letters, numbers, dashes, underscores
            ],
            'password' => [
                'required',
                'string',
                'min:' . config('auth.password_min_length', 6)
            ],
            'remember_me' => [
                'sometimes',
                'boolean'
            ]
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required',
            'email.email' => 'Please provide a valid email address',
            'email.max' => 'Email address cannot exceed 255 characters',
            'password.required' => 'Password is required',
            'password.string' => 'Password must be a valid string',
            'password.min' => 'Password must be at least :min characters',
            'remember_me.boolean' => 'Remember me must be true or false'
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param Validator $validator
     * @return void
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'details' => $validator->errors()
                ]
            ], 422)
        );
    }

    /**
     * Sanitize inputs before validation
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim($this->email ?? '')),
        ]);
    }
}
