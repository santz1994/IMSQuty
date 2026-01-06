import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormCheckboxField, FormField, FormGroup, FormSelectField } from '../components/FormField';
describe('FormField Components', () => {
    describe('FormField', () => {
        it('should render text input', () => {
            render(_jsx(FormField, { label: "Test Field", name: "test" }));
            const input = screen.getByLabelText('Test Field');
            expect(input).toBeInTheDocument();
        });
        it('should display required asterisk', () => {
            render(_jsx(FormField, { label: "Required Field", name: "test", required: true }));
            expect(screen.getByText('*')).toBeInTheDocument();
        });
        it('should display error message', () => {
            render(_jsx(FormField, { label: "Test Field", name: "test", error: "This field is required" }));
            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });
        it('should be disabled when disabled prop is true', () => {
            render(_jsx(FormField, { label: "Test Field", name: "test", disabled: true }));
            const input = screen.getByLabelText('Test Field');
            expect(input.disabled).toBe(true);
        });
        it('should accept input value', async () => {
            const user = userEvent.setup();
            render(_jsx(FormField, { label: "Test Field", name: "test" }));
            const input = screen.getByLabelText('Test Field');
            await user.type(input, 'test value');
            expect(input.value).toBe('test value');
        });
        it('should support different input types', () => {
            const { rerender } = render(_jsx(FormField, { label: "Email", name: "email", type: "email" }));
            let input = screen.getByLabelText('Email');
            expect(input.type).toBe('email');
            rerender(_jsx(FormField, { label: "Password", name: "password", type: "password" }));
            input = screen.getByLabelText('Password');
            expect(input.type).toBe('password');
        });
    });
    describe('FormSelectField', () => {
        const options = [
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
        ];
        it('should render select with options', () => {
            render(_jsx(FormSelectField, { label: "Select Field", name: "select", options: options }));
            expect(screen.getByLabelText('Select Field')).toBeInTheDocument();
            options.forEach(option => {
                expect(screen.getByText(option.label)).toBeInTheDocument();
            });
        });
        it('should display error message', () => {
            render(_jsx(FormSelectField, { label: "Select Field", name: "select", options: options, error: "Please select an option" }));
            expect(screen.getByText('Please select an option')).toBeInTheDocument();
        });
        it('should select option on change', async () => {
            const user = userEvent.setup();
            const { getByRole } = render(_jsx(FormSelectField, { label: "Select Field", name: "select", options: options }));
            const select = getByRole('combobox');
            await user.selectOptions(select, '2');
            expect(select).toHaveValue('2');
        });
    });
    describe('FormCheckboxField', () => {
        it('should render checkbox', () => {
            render(_jsx(FormCheckboxField, { label: "Accept Terms", name: "terms" }));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).toBeInTheDocument();
        });
        it('should toggle checkbox', async () => {
            const user = userEvent.setup();
            render(_jsx(FormCheckboxField, { label: "Accept Terms", name: "terms" }));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox.checked).toBe(false);
            await user.click(checkbox);
            expect(checkbox.checked).toBe(true);
        });
        it('should be disabled when disabled prop is true', () => {
            render(_jsx(FormCheckboxField, { label: "Accept Terms", name: "terms", disabled: true }));
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox.disabled).toBe(true);
        });
        it('should display error message', () => {
            render(_jsx(FormCheckboxField, { label: "Accept Terms", name: "terms", error: "You must accept the terms" }));
            expect(screen.getByText('You must accept the terms')).toBeInTheDocument();
        });
    });
    describe('FormGroup', () => {
        it('should render children', () => {
            render(_jsxs(FormGroup, { children: [_jsx("div", { children: "Child 1" }), _jsx("div", { children: "Child 2" })] }));
            expect(screen.getByText('Child 1')).toBeInTheDocument();
            expect(screen.getByText('Child 2')).toBeInTheDocument();
        });
        it('should have proper spacing', () => {
            const { container } = render(_jsx(FormGroup, { spacing: 3, children: _jsx("div", { children: "Child" }) }));
            const stack = container.querySelector('[class*="MuiStack"]');
            expect(stack).toHaveStyle({ gap: expect.any(String) });
        });
    });
});
