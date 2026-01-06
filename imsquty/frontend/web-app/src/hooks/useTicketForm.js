import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
/**
 * Ticket Form Validation Schema
 * Defines all validation rules for ticket form fields
 */
export const ticketValidationSchema = yup.object().shape({
    ticket_number: yup
        .string()
        .required('Ticket number is required')
        .min(3, 'Ticket number must be at least 3 characters')
        .max(50, 'Ticket number must not exceed 50 characters'),
    title: yup
        .string()
        .required('Title is required')
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must not exceed 200 characters'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must not exceed 1000 characters'),
    priority: yup
        .string()
        .required('Priority is required')
        .oneOf(['Low', 'Medium', 'High', 'Critical'], 'Invalid priority selected'),
    status: yup
        .string()
        .required('Status is required')
        .oneOf(['Open', 'In Progress', 'Pending Info', 'Resolved', 'Closed'], 'Invalid status selected'),
    assigned_to: yup
        .number()
        .optional()
        .positive('Please select a valid user')
        .typeError('Please select a valid user'),
    due_date: yup
        .date()
        .required('Due date is required')
        .typeError('Please select a valid date'),
    asset_id: yup
        .number()
        .optional()
        .positive('Please select a valid asset')
        .typeError('Please select a valid asset'),
    tags: yup
        .string()
        .optional()
        .max(200, 'Tags must not exceed 200 characters'),
});
/**
 * useTicketForm Hook
 * Encapsulates ticket form logic using react-hook-form with yup validation
 */
export const useTicketForm = (defaultValues) => {
    const { register, handleSubmit, formState: { errors, isSubmitting, isValid }, watch, reset, setValue, } = useForm({
        resolver: yupResolver(ticketValidationSchema),
        mode: 'onBlur',
        defaultValues: {
            priority: 'Medium',
            status: 'Open',
            ...defaultValues,
        },
    });
    const formValues = watch();
    return {
        register,
        handleSubmit,
        errors,
        isSubmitting,
        isValid,
        formValues,
        reset,
        setValue,
    };
};
/**
 * Hook for form submission handling
 * Returns submit handler with error management
 */
export const useTicketFormSubmit = (onSuccess) => {
    const handleFormSubmit = async (data) => {
        try {
            await onSuccess(data);
        }
        catch (error) {
            console.error('Form submission error:', error);
            throw error;
        }
    };
    return handleFormSubmit;
};
export default useTicketForm;
