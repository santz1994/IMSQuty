<?php

namespace App\Http\Requests;

use App\Models\Report;
use Illuminate\Foundation\Http\FormRequest;

class GenerateReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:' . implode(',', [
                Report::TYPE_ASSET,
                Report::TYPE_TICKET,
                Report::TYPE_FINANCIAL,
                Report::TYPE_INVENTORY,
                Report::TYPE_USER,
                Report::TYPE_CUSTOM
            ])],
            'description' => ['nullable', 'string', 'max:1000'],
            'parameters' => ['nullable', 'array'],
            'parameters.date_from' => ['nullable', 'date'],
            'parameters.date_to' => ['nullable', 'date', 'after_or_equal:parameters.date_from'],
            'parameters.status' => ['nullable', 'string'],
            'parameters.category' => ['nullable', 'string'],
            'parameters.department_id' => ['nullable', 'integer'],
            'parameters.user_id' => ['nullable', 'integer'],
            'format' => ['required', 'string', 'in:' . implode(',', [
                Report::FORMAT_PDF,
                Report::FORMAT_EXCEL,
                Report::FORMAT_CSV,
                Report::FORMAT_JSON
            ])]
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Report name is required',
            'type.required' => 'Report type is required',
            'type.in' => 'Invalid report type selected',
            'format.required' => 'Report format is required',
            'format.in' => 'Invalid report format selected',
            'parameters.date_to.after_or_equal' => 'End date must be after or equal to start date'
        ];
    }
}
