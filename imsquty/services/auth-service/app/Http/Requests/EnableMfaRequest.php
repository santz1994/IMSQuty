<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnableMfaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Verification code is required',
            'code.size' => 'Verification code must be 6 digits',
            'code.regex' => 'Verification code must contain only numbers',
        ];
    }
}
