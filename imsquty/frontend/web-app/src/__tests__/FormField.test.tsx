import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormCheckboxField, FormField, FormGroup, FormSelectField } from '../components/FormField'

describe('FormField Components', () => {
  describe('FormField', () => {
    it('should render text input', () => {
      render(<FormField label="Test Field" name="test" />)
      const input = screen.getByLabelText('Test Field')
      expect(input).toBeInTheDocument()
    })

    it('should display required asterisk', () => {
      render(<FormField label="Required Field" name="test" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('should display error message', () => {
      render(<FormField label="Test Field" name="test" error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<FormField label="Test Field" name="test" disabled />)
      const input = screen.getByLabelText('Test Field') as HTMLInputElement
      expect(input.disabled).toBe(true)
    })

    it('should accept input value', async () => {
      const user = userEvent.setup()
      render(<FormField label="Test Field" name="test" />)
      const input = screen.getByLabelText('Test Field') as HTMLInputElement

      await user.type(input, 'test value')
      expect(input.value).toBe('test value')
    })

    it('should support different input types', () => {
      const { rerender } = render(<FormField label="Email" name="email" type="email" />)
      let input = screen.getByLabelText('Email') as HTMLInputElement
      expect(input.type).toBe('email')

      rerender(<FormField label="Password" name="password" type="password" />)
      input = screen.getByLabelText('Password') as HTMLInputElement
      expect(input.type).toBe('password')
    })
  })

  describe('FormSelectField', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ]

    it('should render select with options', () => {
      render(<FormSelectField label="Select Field" name="select" options={options} />)
      expect(screen.getByLabelText('Select Field')).toBeInTheDocument()
      options.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument()
      })
    })

    it('should display error message', () => {
      render(
        <FormSelectField
          label="Select Field"
          name="select"
          options={options}
          error="Please select an option"
        />
      )
      expect(screen.getByText('Please select an option')).toBeInTheDocument()
    })

    it('should select option on change', async () => {
      const user = userEvent.setup()
      const { getByRole } = render(
        <FormSelectField label="Select Field" name="select" options={options} />
      )
      const select = getByRole('combobox')

      await user.selectOptions(select, '2')
      expect(select).toHaveValue('2')
    })
  })

  describe('FormCheckboxField', () => {
    it('should render checkbox', () => {
      render(<FormCheckboxField label="Accept Terms" name="terms" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should toggle checkbox', async () => {
      const user = userEvent.setup()
      render(<FormCheckboxField label="Accept Terms" name="terms" />)
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement

      expect(checkbox.checked).toBe(false)
      await user.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })

    it('should be disabled when disabled prop is true', () => {
      render(<FormCheckboxField label="Accept Terms" name="terms" disabled />)
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(checkbox.disabled).toBe(true)
    })

    it('should display error message', () => {
      render(
        <FormCheckboxField
          label="Accept Terms"
          name="terms"
          error="You must accept the terms"
        />
      )
      expect(screen.getByText('You must accept the terms')).toBeInTheDocument()
    })
  })

  describe('FormGroup', () => {
    it('should render children', () => {
      render(
        <FormGroup>
          <div>Child 1</div>
          <div>Child 2</div>
        </FormGroup>
      )
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })

    it('should have proper spacing', () => {
      const { container } = render(
        <FormGroup spacing={3}>
          <div>Child</div>
        </FormGroup>
      )
      const stack = container.querySelector('[class*="MuiStack"]')
      expect(stack).toHaveStyle({ gap: expect.any(String) })
    })
  })
})
