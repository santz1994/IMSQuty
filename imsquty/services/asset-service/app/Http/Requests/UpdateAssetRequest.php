<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Update Asset Request
 * 
 * Validation rules for updating an existing asset.
 */
class UpdateAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Authorization logic here (e.g., check user permissions)
        // For now, return true - implement Spatie permission check later
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $assetId = $this->route('id');

        return [
            // Required fields
            'asset_tag' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('assets', 'asset_tag')->ignore($assetId),
            ],
            'name' => 'sometimes|required|string|max:255',
            'model_id' => 'sometimes|required|integer|exists:asset_models,id',
            'status_id' => 'sometimes|required|integer|exists:statuses,id',
            
            // Optional fields
            'serial_number' => 'nullable|string|max:100',
            'division_id' => 'nullable|integer|exists:divisions,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'supplier_id' => 'nullable|integer|exists:suppliers,id',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'warranty_months' => 'nullable|integer|min:0',
            'warranty_type_id' => 'nullable|integer|exists:warranty_types,id',
            'invoice_id' => 'nullable|integer|exists:invoices,id',
            'purchase_order_id' => 'nullable|integer|exists:purchase_orders,id',
            'ip_address' => 'nullable|ip',
            'mac_address' => 'nullable|string|max:17',
            'qr_code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('assets', 'qr_code')->ignore($assetId),
            ],
            'assigned_to' => 'nullable|integer|exists:users,id',
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
            'asset_tag.required' => 'Asset tag is required.',
            'asset_tag.unique' => 'This asset tag already exists.',
            'name.required' => 'Asset name is required.',
            'model_id.required' => 'Asset model is required.',
            'model_id.exists' => 'Selected asset model does not exist.',
            'status_id.required' => 'Asset status is required.',
            'status_id.exists' => 'Selected status does not exist.',
            'division_id.exists' => 'Selected division does not exist.',
            'location_id.exists' => 'Selected location does not exist.',
            'supplier_id.exists' => 'Selected supplier does not exist.',
            'warranty_type_id.exists' => 'Selected warranty type does not exist.',
            'invoice_id.exists' => 'Selected invoice does not exist.',
            'purchase_order_id.exists' => 'Selected purchase order does not exist.',
            'ip_address.ip' => 'Please enter a valid IP address.',
            'assigned_to.exists' => 'Selected user does not exist.',
            'qr_code.unique' => 'This QR code already exists.',
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
            'asset_tag' => 'asset tag',
            'model_id' => 'asset model',
            'status_id' => 'status',
            'division_id' => 'division',
            'location_id' => 'location',
            'supplier_id' => 'supplier',
            'warranty_type_id' => 'warranty type',
            'invoice_id' => 'invoice',
            'purchase_order_id' => 'purchase order',
            'assigned_to' => 'assigned user',
        ];
    }
}
