<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Update Preferences Request
 * 
 * Validation rules for updating user preferences
 */
class UpdatePreferencesRequest extends FormRequest
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
            'theme' => [
                'nullable',
                'string',
                'in:light,dark,auto'
            ],
            'notifications_enabled' => [
                'nullable',
                'boolean'
            ],
            'email_notifications' => [
                'nullable',
                'boolean'
            ],
            'sms_notifications' => [
                'nullable',
                'boolean'
            ],
            'push_notifications' => [
                'nullable',
                'boolean'
            ],
            'language' => [
                'nullable',
                'string',
                'in:en,id,ms'
            ],
            'timezone' => [
                'nullable',
                'string',
                'timezone'
            ],
            'date_format' => [
                'nullable',
                'string',
                'in:Y-m-d,d/m/Y,m/d/Y,d-m-Y'
            ],
            'time_format' => [
                'nullable',
                'string',
                'in:H:i,h:i A'
            ],
            'items_per_page' => [
                'nullable',
                'integer',
                'min:10',
                'max:100'
            ],
            'dashboard_widgets' => [
                'nullable',
                'array'
            ],
            'dashboard_widgets.*' => [
                'string'
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
            'theme.in' => 'Theme must be one of: light, dark, auto',
            'language.in' => 'Language must be one of: en, id, ms',
            'timezone.timezone' => 'Invalid timezone',
            'date_format.in' => 'Invalid date format',
            'time_format.in' => 'Invalid time format',
            'items_per_page.min' => 'Items per page must be at least 10',
            'items_per_page.max' => 'Items per page cannot exceed 100',
        ];
    }
}
