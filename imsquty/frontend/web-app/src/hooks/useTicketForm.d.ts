import { SubmitHandler } from 'react-hook-form';
import * as yup from 'yup';
/**
 * Ticket Form Validation Schema
 * Defines all validation rules for ticket form fields
 */
export declare const ticketValidationSchema: yup.ObjectSchema<{
    ticket_number: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    assigned_to: number | undefined;
    due_date: Date;
    asset_id: number | undefined;
    tags: string | undefined;
}, yup.AnyObject, {
    ticket_number: undefined;
    title: undefined;
    description: undefined;
    priority: undefined;
    status: undefined;
    assigned_to: undefined;
    due_date: undefined;
    asset_id: undefined;
    tags: undefined;
}, "">;
export type TicketFormData = yup.InferType<typeof ticketValidationSchema>;
/**
 * useTicketForm Hook
 * Encapsulates ticket form logic using react-hook-form with yup validation
 */
export declare const useTicketForm: (defaultValues?: Partial<TicketFormData>) => {
    register: import("react-hook-form").UseFormRegister<{
        assigned_to?: number | undefined;
        asset_id?: number | undefined;
        tags?: string | undefined;
        description: string;
        ticket_number: string;
        title: string;
        priority: string;
        due_date: Date;
        status: string;
    }>;
    handleSubmit: import("react-hook-form").UseFormHandleSubmit<{
        assigned_to?: number | undefined;
        asset_id?: number | undefined;
        tags?: string | undefined;
        description: string;
        ticket_number: string;
        title: string;
        priority: string;
        due_date: Date;
        status: string;
    }, {
        assigned_to?: number | undefined;
        asset_id?: number | undefined;
        tags?: string | undefined;
        description: string;
        ticket_number: string;
        title: string;
        priority: string;
        due_date: Date;
        status: string;
    }>;
    errors: import("react-hook-form").FieldErrors<{
        assigned_to?: number | undefined;
        asset_id?: number | undefined;
        tags?: string | undefined;
        description: string;
        ticket_number: string;
        title: string;
        priority: string;
        due_date: Date;
        status: string;
    }>;
    isSubmitting: boolean;
    isValid: boolean;
    formValues: {
        assigned_to?: number | undefined;
        asset_id?: number | undefined;
        tags?: string | undefined;
        description: string;
        ticket_number: string;
        title: string;
        priority: string;
        due_date: Date;
        status: string;
    };
    reset: import("react-hook-form").UseFormReset<{
        assigned_to?: number | undefined;
        asset_id?: number | undefined;
        tags?: string | undefined;
        description: string;
        ticket_number: string;
        title: string;
        priority: string;
        due_date: Date;
        status: string;
    }>;
    setValue: import("react-hook-form").UseFormSetValue<{
        assigned_to?: number | undefined;
        asset_id?: number | undefined;
        tags?: string | undefined;
        description: string;
        ticket_number: string;
        title: string;
        priority: string;
        due_date: Date;
        status: string;
    }>;
};
/**
 * Hook for form submission handling
 * Returns submit handler with error management
 */
export declare const useTicketFormSubmit: (onSuccess: (data: TicketFormData) => Promise<void>) => SubmitHandler<{
    assigned_to?: number | undefined;
    asset_id?: number | undefined;
    tags?: string | undefined;
    description: string;
    ticket_number: string;
    title: string;
    priority: string;
    due_date: Date;
    status: string;
}>;
export default useTicketForm;
