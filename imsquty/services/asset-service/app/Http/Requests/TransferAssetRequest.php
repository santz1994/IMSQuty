<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Transfer Asset Request
 * 
 * Validation rules for transferring an asset (location/user).
 */
class TransferAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Authorization logic here (e.g., check user permissions)
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'to_location_id' => 'nullable|integer|required_without:to_user_id',
            'to_user_id' => 'nullable|integer|required_without:to_location_id',
            'location' => 'nullable|string',
            'movement_date' => 'nullable|date',
            'reason' => 'required|string|max:500',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'to_location_id.required_without' => 'Either location or user must be specified for transfer.',
            'to_location_id.exists' => 'Selected location does not exist.',
            'to_user_id.required_without' => 'Either location or user must be specified for transfer.',
            'to_user_id.exists' => 'Selected user does not exist.',
            'reason.required' => 'Transfer reason is required.',
            'movement_date.date' => 'Please enter a valid date.',
        ];
    }

    /**
     * Get custom attribute names for error messages.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'to_location_id' => 'destination location',
            'to_user_id' => 'destination user',
            'movement_date' => 'transfer date',
        ];
    }
}
