import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select as MuiSelect,
    Stack,
    TextField,
    TextFieldProps,
} from '@mui/material'
import React from 'react'
import { Control, Controller, FieldError, FieldValues, Path } from 'react-hook-form'

export interface FormFieldProps extends Omit<TextFieldProps, 'error'> {
  label: string
  error?: FieldError
  required?: boolean
  helperText?: string
  disabled?: boolean
}

/**
 * FormField Component - Reusable form field with error display
 * Integrates with react-hook-form for validation
 * Uses Material-UI styling for consistency
 */
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      error,
      required = false,
      helperText,
      disabled = false,
      type = 'text',
      ...rest
    },
    ref,
  ) => {
    const errorMessage = error?.message || helperText || ''
    const hasError = !!error

    return (
      <TextField
        ref={ref}
        label={label}
        type={type}
        variant="outlined"
        fullWidth
        required={required}
        disabled={disabled}
        error={hasError}
        helperText={errorMessage}
        {...rest}
      />
    )
  },
)

FormField.displayName = 'FormField'

export interface FormSelectFieldProps {
  label: string
  options: Array<{ label: string; value: string | number }>
  error?: FieldError
  required?: boolean
  disabled?: boolean
  helperText?: string
  value?: string | number
  onChange?: (value: string | number) => void
}

/**
 * FormSelectField Component - Reusable select field with error display
 * For dropdown selections in forms
 */
export const FormSelectField = React.forwardRef<
  HTMLDivElement,
  FormSelectFieldProps
>(
  (
    {
      label,
      options,
      error,
      required = false,
      disabled = false,
      helperText,
      value = '',
      onChange,
    },
    ref,
  ) => {
    const errorMessage = error?.message || helperText || ''
    const hasError = !!error

    return (
      <FormControl
        ref={ref}
        fullWidth
        error={hasError}
        disabled={disabled}
        required={required}
      >
        <InputLabel>{label}</InputLabel>
        <MuiSelect
          value={value}
          label={label}
          onChange={(e) => onChange?.(e.target.value)}
        >
          <MenuItem value="">
            <em>-- Select {label} --</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
        {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
      </FormControl>
    )
  },
)

FormSelectField.displayName = 'FormSelectField'

/**
 * ControlledFormSelect Component - Select field with react-hook-form Controller
 * Use this for proper integration with react-hook-form
 */
export interface ControlledFormSelectProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> {
  control: Control<TFieldValues>
  name: TName
  label: string
  options: Array<{ label: string; value: string | number }>
  error?: FieldError
  required?: boolean
  disabled?: boolean
}

export const ControlledFormSelect = React.forwardRef<
  HTMLDivElement,
  ControlledFormSelectProps<any, any>
>(
  (
    {
      control,
      name,
      label,
      options,
      error,
      required = false,
      disabled = false,
    },
    ref,
  ) => {
    const errorMessage = error?.message || ''
    const hasError = !!error

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FormControl
            ref={ref}
            fullWidth
            error={hasError}
            disabled={disabled}
            required={required}
          >
            <InputLabel>{label}</InputLabel>
            <MuiSelect
              {...field}
              label={label}
              value={field.value || ''}
            >
              <MenuItem value="">
                <em>-- Select {label} --</em>
              </MenuItem>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </MuiSelect>
            {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        )}
      />
    )
  },
)

ControlledFormSelect.displayName = 'ControlledFormSelect'

export interface FormCheckboxFieldProps {
  label: string
  error?: FieldError
  disabled?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
}

/**
 * FormCheckboxField Component - Reusable checkbox field
 */
export const FormCheckboxField = React.forwardRef<
  HTMLDivElement,
  FormCheckboxFieldProps
>(
  (
    { label, error, disabled = false, checked = false, onChange },
    ref,
  ) => {
    return (
      <FormControlLabel
        ref={ref}
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
          />
        }
        label={label}
      />
    )
  },
)

FormCheckboxField.displayName = 'FormCheckboxField'

export interface FormGroupProps {
  children: React.ReactNode
  spacing?: number
}

/**
 * FormGroup Component - Wrapper for organizing form fields
 * Provides consistent spacing between fields
 */
export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  spacing = 2,
}) => (
  <Stack spacing={spacing}>
    {children}
  </Stack>
)

export default FormField
