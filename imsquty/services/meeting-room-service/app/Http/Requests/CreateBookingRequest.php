<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
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
            'meeting_room_id' => 'required|exists:meeting_rooms,id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'purpose' => 'nullable|string',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'attendees_count' => 'required|integer|min:1',
            'attendees_list' => 'nullable|array',
            'special_requirements' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'meeting_room_id.required' => 'Meeting room is required',
            'meeting_room_id.exists' => 'Selected meeting room does not exist',
            'start_time.after' => 'Start time must be in the future',
            'end_time.after' => 'End time must be after start time',
            'attendees_count.min' => 'At least 1 attendee is required',
        ];
    }
}
