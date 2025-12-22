<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTicketRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'ticket_type_id' => 'required|exists:tickets_types,id',
            'ticket_priority_id' => 'required|exists:tickets_priorities,id',
            'ticket_status_id' => 'nullable|exists:tickets_statuses,id',
            'location_id' => 'nullable|exists:locations,id',
            'asset_id' => 'nullable|exists:assets,id',
            'assigned_to' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'subject.required' => 'Ticket subject is required',
            'description.required' => 'Ticket description is required',
            'ticket_type_id.required' => 'Ticket type must be selected',
            'ticket_priority_id.required' => 'Ticket priority must be selected',
            'ticket_type_id.exists' => 'Selected ticket type is invalid',
            'ticket_priority_id.exists' => 'Selected ticket priority is invalid',
        ];
    }
}
