import { TextFieldProps } from '@mui/material';
import React from 'react';
import { Control, FieldError, FieldValues, Path } from 'react-hook-form';
export interface FormFieldProps extends Omit<TextFieldProps, 'error'> {
    label: string;
    error?: FieldError;
    required?: boolean;
    helperText?: string;
    disabled?: boolean;
}
/**
 * FormField Component - Reusable form field with error display
 * Integrates with react-hook-form for validation
 * Uses Material-UI styling for consistency
 */
export declare const FormField: React.ForwardRefExoticComponent<Omit<FormFieldProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface FormSelectFieldProps {
    label: string;
    options: Array<{
        label: string;
        value: string | number;
    }>;
    error?: FieldError;
    required?: boolean;
    disabled?: boolean;
    helperText?: string;
    value?: string | number;
    onChange?: (value: string | number) => void;
}
/**
 * FormSelectField Component - Reusable select field with error display
 * For dropdown selections in forms
 */
export declare const FormSelectField: React.ForwardRefExoticComponent<FormSelectFieldProps & React.RefAttributes<HTMLDivElement>>;
/**
 * ControlledFormSelect Component - Select field with react-hook-form Controller
 * Use this for proper integration with react-hook-form
 */
export interface ControlledFormSelectProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>> {
    control: Control<TFieldValues>;
    name: TName;
    label: string;
    options: Array<{
        label: string;
        value: string | number;
    }>;
    error?: FieldError;
    required?: boolean;
    disabled?: boolean;
}
export declare const ControlledFormSelect: React.ForwardRefExoticComponent<ControlledFormSelectProps<any, any> & React.RefAttributes<HTMLDivElement>>;
export interface FormCheckboxFieldProps {
    label: string;
    error?: FieldError;
    disabled?: boolean;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}
/**
 * FormCheckboxField Component - Reusable checkbox field
 */
export declare const FormCheckboxField: React.ForwardRefExoticComponent<FormCheckboxFieldProps & React.RefAttributes<HTMLDivElement>>;
export interface FormGroupProps {
    children: React.ReactNode;
    spacing?: number;
}
/**
 * FormGroup Component - Wrapper for organizing form fields
 * Provides consistent spacing between fields
 */
export declare const FormGroup: React.FC<FormGroupProps>;
export default FormField;
