import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select as MuiSelect, Stack, TextField, } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
/**
 * FormField Component - Reusable form field with error display
 * Integrates with react-hook-form for validation
 * Uses Material-UI styling for consistency
 */
export const FormField = React.forwardRef(({ label, error, required = false, helperText, disabled = false, type = 'text', ...rest }, ref) => {
    const errorMessage = error?.message || helperText || '';
    const hasError = !!error;
    return (_jsx(TextField, { ref: ref, label: label, type: type, variant: "outlined", fullWidth: true, required: required, disabled: disabled, error: hasError, helperText: errorMessage, ...rest }));
});
FormField.displayName = 'FormField';
/**
 * FormSelectField Component - Reusable select field with error display
 * For dropdown selections in forms
 */
export const FormSelectField = React.forwardRef(({ label, options, error, required = false, disabled = false, helperText, value = '', onChange, }, ref) => {
    const errorMessage = error?.message || helperText || '';
    const hasError = !!error;
    return (_jsxs(FormControl, { ref: ref, fullWidth: true, error: hasError, disabled: disabled, required: required, children: [_jsx(InputLabel, { children: label }), _jsxs(MuiSelect, { value: value, label: label, onChange: (e) => onChange?.(e.target.value), children: [_jsx(MenuItem, { value: "", children: _jsxs("em", { children: ["-- Select ", label, " --"] }) }), options.map((option) => (_jsx(MenuItem, { value: option.value, children: option.label }, option.value)))] }), hasError && _jsx(FormHelperText, { children: errorMessage })] }));
});
FormSelectField.displayName = 'FormSelectField';
export const ControlledFormSelect = React.forwardRef(({ control, name, label, options, error, required = false, disabled = false, }, ref) => {
    const errorMessage = error?.message || '';
    const hasError = !!error;
    return (_jsx(Controller, { control: control, name: name, render: ({ field }) => (_jsxs(FormControl, { ref: ref, fullWidth: true, error: hasError, disabled: disabled, required: required, children: [_jsx(InputLabel, { children: label }), _jsxs(MuiSelect, { ...field, label: label, value: field.value || '', children: [_jsx(MenuItem, { value: "", children: _jsxs("em", { children: ["-- Select ", label, " --"] }) }), options.map((option) => (_jsx(MenuItem, { value: option.value, children: option.label }, option.value)))] }), hasError && _jsx(FormHelperText, { children: errorMessage })] })) }));
});
ControlledFormSelect.displayName = 'ControlledFormSelect';
/**
 * FormCheckboxField Component - Reusable checkbox field
 */
export const FormCheckboxField = React.forwardRef(({ label, error, disabled = false, checked = false, onChange }, ref) => {
    return (_jsx(FormControlLabel, { ref: ref, control: _jsx(Checkbox, { checked: checked, onChange: (e) => onChange?.(e.target.checked), disabled: disabled }), label: label }));
});
FormCheckboxField.displayName = 'FormCheckboxField';
/**
 * FormGroup Component - Wrapper for organizing form fields
 * Provides consistent spacing between fields
 */
export const FormGroup = ({ children, spacing = 2, }) => (_jsx(Stack, { spacing: spacing, children: children }));
export default FormField;
