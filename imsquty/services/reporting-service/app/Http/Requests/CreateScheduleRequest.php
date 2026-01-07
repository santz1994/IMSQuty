<?php

namespace App\Http\Requests;

use App\Models\ReportSchedule;
use Illuminate\Foundation\Http\FormRequest;

class CreateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'report_type' => ['required', 'string', 'max:100'],
            'frequency' => ['required', 'string', 'in:' . implode(',', [
                ReportSchedule::FREQUENCY_DAILY,
                ReportSchedule::FREQUENCY_WEEKLY,
                ReportSchedule::FREQUENCY_MONTHLY,
                ReportSchedule::FREQUENCY_QUARTERLY,
                ReportSchedule::FREQUENCY_YEARLY
            ])],
            'parameters' => ['nullable', 'array'],
            'format' => ['required', 'string', 'in:PDF,Excel,CSV,JSON'],
            'recipients' => ['required', 'array', 'min:1'],
            'recipients.*' => ['email'],
            'is_active' => ['nullable', 'boolean']
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Schedule name is required',
            'report_type.required' => 'Report type is required',
            'frequency.required' => 'Frequency is required',
            'frequency.in' => 'Invalid frequency selected',
            'format.required' => 'Report format is required',
            'recipients.required' => 'At least one recipient is required',
            'recipients.min' => 'At least one recipient is required',
            'recipients.*.email' => 'All recipients must be valid email addresses'
        ];
    }
}
