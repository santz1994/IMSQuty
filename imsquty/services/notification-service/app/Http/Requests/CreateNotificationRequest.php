<?php

namespace App\Http\Requests;

use App\Models\Notification;
use Illuminate\Foundation\Http\FormRequest;

class CreateNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string'],
            'type' => ['required', 'string'],
            'channel' => ['required', 'string'],
            'priority' => ['nullable', 'string'],
            'recipient_id' => ['required', 'integer', 'exists:users,id'],
            'recipient_email' => ['nullable', 'email', 'max:100'],
            'recipient_phone' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array']
        ];
    }
}
