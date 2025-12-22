<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
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
            'meeting_room_id' => 'sometimes|exists:meeting_rooms,id',
            'title' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'purpose' => 'nullable|string',
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'attendees_count' => 'sometimes|integer|min:1',
            'attendees_list' => 'nullable|array',
            'special_requirements' => 'nullable|string',
            'status' => 'sometimes|in:pending,approved,rejected,cancelled,completed',
        ];
    }
}
