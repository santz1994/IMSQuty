<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignTicketRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'assigned_to' => 'required|exists:users,id',
            'assignment_type' => 'sometimes|in:manual,auto,escalation',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'assigned_to.required' => 'User ID is required for assignment',
            'assigned_to.exists' => 'Selected user does not exist',
        ];
    }
}
