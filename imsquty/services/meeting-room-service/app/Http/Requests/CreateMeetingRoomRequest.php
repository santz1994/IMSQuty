<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateMeetingRoomRequest extends FormRequest
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
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:meeting_rooms,code',
            'location_id' => 'nullable|integer',
            'floor' => 'nullable|string|max:50',
            'building' => 'nullable|string|max:100',
            'capacity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'facilities' => 'nullable|array',
            'equipment' => 'nullable|array',
            'hourly_rate' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:available,maintenance,unavailable',
            'image' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }
}
