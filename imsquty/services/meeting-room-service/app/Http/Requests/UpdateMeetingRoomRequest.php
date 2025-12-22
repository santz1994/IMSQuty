<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMeetingRoomRequest extends FormRequest
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
        $roomId = $this->route('id');
        
        return [
            'name' => 'sometimes|string|max:100',
            'code' => 'sometimes|string|max:20|unique:meeting_rooms,code,' . $roomId,
            'location_id' => 'nullable|integer',
            'floor' => 'nullable|string|max:50',
            'building' => 'nullable|string|max:100',
            'capacity' => 'sometimes|integer|min:1',
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
