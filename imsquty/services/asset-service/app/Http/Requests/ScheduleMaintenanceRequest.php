<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Schedule Maintenance Request
 * 
 * Validation rules for scheduling asset maintenance.
 */
class ScheduleMaintenanceRequest extends FormRequest
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
            'maintenance_type' => 'required|in:repair,cleaning,upgrade,inspection',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'cost' => 'nullable|numeric|min:0',
            'performed_by' => 'nullable|integer|exists:users,id',
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
            'maintenance_type.required' => 'Maintenance type is required.',
            'maintenance_type.in' => 'Maintenance type must be repair, cleaning, upgrade, or inspection.',
            'title.required' => 'Maintenance title is required.',
            'scheduled_at.required' => 'Scheduled date is required.',
            'scheduled_at.after' => 'Scheduled date must be in the future.',
            'cost.numeric' => 'Cost must be a number.',
            'cost.min' => 'Cost cannot be negative.',
            'performed_by.exists' => 'Selected technician does not exist.',
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
            'maintenance_type' => 'maintenance type',
            'scheduled_at' => 'scheduled date',
            'performed_by' => 'technician',
        ];
    }
}
