<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
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
            'subject' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'ticket_type_id' => 'sometimes|exists:tickets_types,id',
            'ticket_priority_id' => 'sometimes|exists:tickets_priorities,id',
            'ticket_status_id' => 'sometimes|exists:tickets_statuses,id',
            'location_id' => 'nullable|exists:locations,id',
            'asset_id' => 'nullable|exists:assets,id',
            'assigned_to' => 'nullable|exists:users,id',
        ];
    }
}
