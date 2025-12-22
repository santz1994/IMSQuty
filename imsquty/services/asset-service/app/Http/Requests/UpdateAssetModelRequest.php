<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Update AssetModel Request
 * 
 * Validation rules for updating an existing asset model.
 */
class UpdateAssetModelRequest extends FormRequest
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
        $modelId = $this->route('id');

        return [
            'asset_type_id' => 'sometimes|required|integer|exists:asset_types,id',
            'asset_model' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('asset_models', 'asset_model')->ignore($modelId),
            ],
            'manufacturer_id' => 'nullable|integer|exists:manufacturers,id',
            'pcspec_id' => 'nullable|integer|exists:pc_specs,id',
            'part_number' => 'nullable|string|max:100',
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
            'asset_type_id.required' => 'Asset type is required.',
            'asset_type_id.exists' => 'Selected asset type does not exist.',
            'asset_model.required' => 'Model name is required.',
            'asset_model.unique' => 'This model name already exists.',
            'manufacturer_id.exists' => 'Selected manufacturer does not exist.',
            'pcspec_id.exists' => 'Selected PC specification does not exist.',
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
            'asset_type_id' => 'asset type',
            'asset_model' => 'model name',
            'manufacturer_id' => 'manufacturer',
            'pcspec_id' => 'PC specification',
            'part_number' => 'part number',
        ];
    }
}
