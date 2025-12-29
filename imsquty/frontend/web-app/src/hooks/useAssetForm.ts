import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'

/**
 * Asset Form Validation Schema
 * Defines all validation rules for asset form fields
 */
export const assetValidationSchema = yup.object().shape({
  asset_tag: yup
    .string()
    .required('Asset tag is required')
    .min(3, 'Asset tag must be at least 3 characters')
    .max(50, 'Asset tag must not exceed 50 characters'),

  name: yup
    .string()
    .required('Asset name is required')
    .min(3, 'Asset name must be at least 3 characters')
    .max(100, 'Asset name must not exceed 100 characters'),

  serial_number: yup
    .string()
    .required('Serial number is required')
    .min(3, 'Serial number must be at least 3 characters')
    .max(100, 'Serial number must not exceed 100 characters'),

  asset_type_id: yup
    .number()
    .required('Asset type is required')
    .positive('Please select a valid asset type'),

  division_id: yup
    .number()
    .required('Division is required')
    .positive('Please select a valid division'),

  location_id: yup
    .number()
    .required('Location is required')
    .positive('Please select a valid location'),

  manufacturer_id: yup
    .number()
    .required('Manufacturer is required')
    .positive('Please select a valid manufacturer'),

  warranty_type_id: yup
    .number()
    .required('Warranty type is required')
    .positive('Please select a valid warranty type'),

  purchase_date: yup
    .date()
    .required('Purchase date is required')
    .typeError('Please select a valid date'),

  warranty_expiry_date: yup
    .date()
    .required('Warranty expiry date is required')
    .typeError('Please select a valid date'),

  cost: yup
    .number()
    .required('Cost is required')
    .positive('Cost must be a positive number')
    .typeError('Cost must be a valid number'),

  status: yup
    .string()
    .required('Status is required')
    .oneOf(
      ['active', 'inactive', 'maintenance', 'retired'],
      'Invalid status selected',
    ),

  notes: yup
    .string()
    .optional()
    .max(500, 'Notes must not exceed 500 characters'),
})

export type AssetFormData = yup.InferType<typeof assetValidationSchema>

/**
 * useAssetForm Hook
 * Encapsulates asset form logic using react-hook-form with yup validation
 */
export const useAssetForm = (defaultValues?: Partial<AssetFormData>) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    reset,
    setValue,
    control,
  } = useForm<AssetFormData>({
    resolver: yupResolver(assetValidationSchema),
    mode: 'onBlur',
    defaultValues: {
      status: 'active',
      ...defaultValues,
    },
  })

  const formValues = watch()

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isValid,
    formValues,
    reset,
    setValue,
    control,
  }
}

/**
 * Hook for form submission handling
 * Returns submit handler with error management
 */
export const useAssetFormSubmit = (
  onSuccess: (data: AssetFormData) => Promise<void>,
) => {
  const handleFormSubmit: SubmitHandler<AssetFormData> = async (data) => {
    try {
      await onSuccess(data)
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    }
  }

  return handleFormSubmit
}

export default useAssetForm
