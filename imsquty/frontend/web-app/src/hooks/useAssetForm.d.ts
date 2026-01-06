import { SubmitHandler } from 'react-hook-form';
import * as yup from 'yup';
/**
 * Asset Form Validation Schema
 * Defines all validation rules for asset form fields
 */
export declare const assetValidationSchema: yup.ObjectSchema<{
    asset_tag: string;
    name: string;
    serial_number: string;
    asset_type_id: number;
    division_id: number;
    location_id: number;
    manufacturer_id: number;
    warranty_type_id: number;
    purchase_date: Date;
    warranty_expiry_date: Date;
    cost: number;
    status: string;
    notes: string | undefined;
}, yup.AnyObject, {
    asset_tag: undefined;
    name: undefined;
    serial_number: undefined;
    asset_type_id: undefined;
    division_id: undefined;
    location_id: undefined;
    manufacturer_id: undefined;
    warranty_type_id: undefined;
    purchase_date: undefined;
    warranty_expiry_date: undefined;
    cost: undefined;
    status: undefined;
    notes: undefined;
}, "">;
export type AssetFormData = yup.InferType<typeof assetValidationSchema>;
/**
 * useAssetForm Hook
 * Encapsulates asset form logic using react-hook-form with yup validation
 */
export declare const useAssetForm: (defaultValues?: Partial<AssetFormData>) => {
    register: import("react-hook-form").UseFormRegister<{
        notes?: string | undefined;
        asset_tag: string;
        name: string;
        serial_number: string;
        asset_type_id: number;
        division_id: number;
        location_id: number;
        purchase_date: Date;
        warranty_type_id: number;
        status: string;
        manufacturer_id: number;
        warranty_expiry_date: Date;
        cost: number;
    }>;
    handleSubmit: import("react-hook-form").UseFormHandleSubmit<{
        notes?: string | undefined;
        asset_tag: string;
        name: string;
        serial_number: string;
        asset_type_id: number;
        division_id: number;
        location_id: number;
        purchase_date: Date;
        warranty_type_id: number;
        status: string;
        manufacturer_id: number;
        warranty_expiry_date: Date;
        cost: number;
    }, {
        notes?: string | undefined;
        asset_tag: string;
        name: string;
        serial_number: string;
        asset_type_id: number;
        division_id: number;
        location_id: number;
        purchase_date: Date;
        warranty_type_id: number;
        status: string;
        manufacturer_id: number;
        warranty_expiry_date: Date;
        cost: number;
    }>;
    errors: import("react-hook-form").FieldErrors<{
        notes?: string | undefined;
        asset_tag: string;
        name: string;
        serial_number: string;
        asset_type_id: number;
        division_id: number;
        location_id: number;
        purchase_date: Date;
        warranty_type_id: number;
        status: string;
        manufacturer_id: number;
        warranty_expiry_date: Date;
        cost: number;
    }>;
    isSubmitting: boolean;
    isValid: boolean;
    formValues: {
        notes?: string | undefined;
        asset_tag: string;
        name: string;
        serial_number: string;
        asset_type_id: number;
        division_id: number;
        location_id: number;
        purchase_date: Date;
        warranty_type_id: number;
        status: string;
        manufacturer_id: number;
        warranty_expiry_date: Date;
        cost: number;
    };
    reset: import("react-hook-form").UseFormReset<{
        notes?: string | undefined;
        asset_tag: string;
        name: string;
        serial_number: string;
        asset_type_id: number;
        division_id: number;
        location_id: number;
        purchase_date: Date;
        warranty_type_id: number;
        status: string;
        manufacturer_id: number;
        warranty_expiry_date: Date;
        cost: number;
    }>;
    setValue: import("react-hook-form").UseFormSetValue<{
        notes?: string | undefined;
        asset_tag: string;
        name: string;
        serial_number: string;
        asset_type_id: number;
        division_id: number;
        location_id: number;
        purchase_date: Date;
        warranty_type_id: number;
        status: string;
        manufacturer_id: number;
        warranty_expiry_date: Date;
        cost: number;
    }>;
    control: import("react-hook-form").Control<{
        notes?: string | undefined;
        asset_tag: string;
        name: string;
        serial_number: string;
        asset_type_id: number;
        division_id: number;
        location_id: number;
        purchase_date: Date;
        warranty_type_id: number;
        status: string;
        manufacturer_id: number;
        warranty_expiry_date: Date;
        cost: number;
    }, any, {
        notes?: string | undefined;
        asset_tag: string;
        name: string;
        serial_number: string;
        asset_type_id: number;
        division_id: number;
        location_id: number;
        purchase_date: Date;
        warranty_type_id: number;
        status: string;
        manufacturer_id: number;
        warranty_expiry_date: Date;
        cost: number;
    }>;
};
/**
 * Hook for form submission handling
 * Returns submit handler with error management
 */
export declare const useAssetFormSubmit: (onSuccess: (data: AssetFormData) => Promise<void>) => SubmitHandler<{
    notes?: string | undefined;
    asset_tag: string;
    name: string;
    serial_number: string;
    asset_type_id: number;
    division_id: number;
    location_id: number;
    purchase_date: Date;
    warranty_type_id: number;
    status: string;
    manufacturer_id: number;
    warranty_expiry_date: Date;
    cost: number;
}>;
export default useAssetForm;
