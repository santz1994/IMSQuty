import { act, renderHook } from '@testing-library/react'
import { useAssetForm } from '../hooks/useAssetForm'
import { useTicketForm } from '../hooks/useTicketForm'

describe('Validation Hooks', () => {
  describe('useAssetForm', () => {
    it('should validate asset_tag field', async () => {
      const { result } = renderHook(() => useAssetForm())

      await act(async () => {
        try {
          await result.current.schema.validateAt('asset_tag', { asset_tag: '' })
        } catch (error: any) {
          expect(error.message).toContain('required')
        }
      })
    })

    it('should validate asset_tag minimum length', async () => {
      const { result } = renderHook(() => useAssetForm())

      await act(async () => {
        try {
          await result.current.schema.validateAt('asset_tag', { asset_tag: 'AB' })
        } catch (error: any) {
          expect(error.message).toContain('at least')
        }
      })
    })

    it('should validate asset_tag maximum length', async () => {
      const { result } = renderHook(() => useAssetForm())

      await act(async () => {
        try {
          await result.current.schema.validateAt('asset_tag', {
            asset_tag: 'A'.repeat(51),
          })
        } catch (error: any) {
          expect(error.message).toContain('maximum')
        }
      })
    })

    it('should validate asset_type_id as positive number', async () => {
      const { result } = renderHook(() => useAssetForm())

      await act(async () => {
        try {
          await result.current.schema.validateAt('asset_type_id', { asset_type_id: -1 })
        } catch (error: any) {
          expect(error.message).toContain('positive')
        }
      })
    })

    it('should validate required fields', async () => {
      const { result } = renderHook(() => useAssetForm())

      await act(async () => {
        try {
          await result.current.schema.validate({
            asset_tag: '',
            name: '',
            serial_number: '',
          })
        } catch (error: any) {
          expect(error.errors.length).toBeGreaterThan(0)
        }
      })
    })

    it('should pass valid asset data', async () => {
      const { result } = renderHook(() => useAssetForm())

      const validData = {
        asset_tag: 'ASSET-001',
        name: 'Test Asset',
        serial_number: 'SN-12345',
        asset_type_id: 1,
        division_id: 1,
        location_id: 1,
        manufacturer_id: 1,
        warranty_type_id: 1,
        purchase_date: '2025-01-01',
        warranty_expiry_date: '2026-01-01',
        cost: 1000,
        notes: 'Test notes',
      }

      await act(async () => {
        const validated = await result.current.schema.validate(validData)
        expect(validated).toEqual(validData)
      })
    })
  })

  describe('useTicketForm', () => {
    it('should validate ticket_number field', async () => {
      const { result } = renderHook(() => useTicketForm())

      await act(async () => {
        try {
          await result.current.schema.validateAt('ticket_number', { ticket_number: '' })
        } catch (error: any) {
          expect(error.message).toContain('required')
        }
      })
    })

    it('should validate title minimum length', async () => {
      const { result } = renderHook(() => useTicketForm())

      await act(async () => {
        try {
          await result.current.schema.validateAt('title', { title: 'X' })
        } catch (error: any) {
          expect(error.message).toContain('at least')
        }
      })
    })

    it('should validate priority_id as positive number', async () => {
      const { result } = renderHook(() => useTicketForm())

      await act(async () => {
        try {
          await result.current.schema.validateAt('priority_id', { priority_id: 0 })
        } catch (error: any) {
          expect(error.message).toContain('positive')
        }
      })
    })

    it('should pass valid ticket data', async () => {
      const { result } = renderHook(() => useTicketForm())

      const validData = {
        ticket_number: 'TKT-001',
        title: 'Server Down',
        description: 'Server is not responding',
        priority_id: 1,
        status_id: 1,
        assigned_to: 1,
        due_date: '2025-02-01',
        tags: 'urgent,server',
      }

      await act(async () => {
        const validated = await result.current.schema.validate(validData)
        expect(validated).toEqual(validData)
      })
    })

    it('should validate all required fields', async () => {
      const { result } = renderHook(() => useTicketForm())

      await act(async () => {
        try {
          await result.current.schema.validate({
            ticket_number: '',
            title: '',
            description: '',
          })
        } catch (error: any) {
          expect(error.errors.length).toBeGreaterThan(0)
        }
      })
    })
  })
})
