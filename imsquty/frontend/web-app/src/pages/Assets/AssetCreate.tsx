import { Add, ArrowBack } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ControlledFormSelect, FormField, FormGroup } from '../../components/FormField'
import { useNotification } from '../../context/NotificationContext'
import { useAssetForm, useAssetFormSubmit } from '../../hooks/useAssetForm'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createAsset } from '../../store/slices/assetSlice'
import { fetchActiveDivisions } from '../../store/slices/divisionSlice'
import { fetchActiveLocations } from '../../store/slices/locationSlice'
import { fetchActiveManufacturers } from '../../store/slices/manufacturerSlice'
import { fetchActiveWarrantyTypes } from '../../store/slices/warrantyTypeSlice'

const AssetCreate: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const { loading, error: assetError } = useAppSelector(
    (state) => state.asset,
  )
  const { divisions } = useAppSelector((state) => state.division)
  const { locations } = useAppSelector((state) => state.location)
  const { manufacturers } = useAppSelector((state) => state.manufacturer)
  const { warrantyTypes } = useAppSelector((state) => state.warrantyType)

  const { register, handleSubmit, errors, isSubmitting, control } = useAssetForm()

  const submitHandler = useAssetFormSubmit(async (data) => {
    try {
      const result = await dispatch(
        createAsset({
          ...data,
          asset_type_id: Number(data.asset_type_id),
          division_id: Number(data.division_id),
          location_id: Number(data.location_id),
          manufacturer_id: Number(data.manufacturer_id),
          warranty_type_id: Number(data.warranty_type_id),
          cost: Number(data.cost),
        } as any),
      )

      if (result.payload) {
        showNotification('Asset created successfully!', 'success')
        navigate('/assets')
      } else {
        showNotification('Failed to create asset', 'error')
      }
    } catch (err) {
      console.error('Failed to create asset:', err)
      showNotification('An error occurred while creating asset', 'error')
    }
  })

  // Load master data on mount
  useEffect(() => {
    dispatch(fetchActiveDivisions() as any)
    dispatch(fetchActiveLocations() as any)
    dispatch(fetchActiveManufacturers() as any)
    dispatch(fetchActiveWarrantyTypes() as any)
  }, [dispatch])

  const onSubmit = async (data: any) => {
    await submitHandler(data)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/assets')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">Create New Asset</Typography>
      </Box>

      {assetError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {assetError}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup spacing={2.5}>
            {/* Basic Information */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Basic Information
            </Typography>

            <FormField
              label="Asset Tag"
              placeholder="e.g., AST-001"
              error={errors.asset_tag}
              required
              {...register('asset_tag')}
            />

            <FormField
              label="Asset Name"
              placeholder="e.g., Dell Laptop"
              error={errors.name}
              required
              {...register('name')}
            />

            <FormField
              label="Serial Number"
              placeholder="e.g., SN123456789"
              error={errors.serial_number}
              required
              {...register('serial_number')}
            />

            {/* Master Data Selection */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Asset Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <ControlledFormSelect
                  control={control}
                  name="division_id"
                  label="Division"
                  options={divisions.map((d) => ({ label: d.name, value: d.id }))}
                  error={errors.division_id}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <ControlledFormSelect
                  control={control}
                  name="location_id"
                  label="Location"
                  options={locations.map((l) => ({ label: l.name, value: l.id }))}
                  error={errors.location_id}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <ControlledFormSelect
                  control={control}
                  name="manufacturer_id"
                  label="Manufacturer"
                  options={manufacturers.map((m) => ({
                    label: m.name,
                    value: m.id,
                  }))}
                  error={errors.manufacturer_id}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <ControlledFormSelect
                  control={control}
                  name="warranty_type_id"
                  label="Warranty Type"
                  options={warrantyTypes.map((w) => ({
                    label: w.name,
                    value: w.id,
                  }))}
                  error={errors.warranty_type_id}
                  required
                />
              </Grid>
            </Grid>

            {/* Date & Cost Information */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Purchase Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormField
                  label="Purchase Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={errors.purchase_date}
                  required
                  {...register('purchase_date')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormField
                  label="Warranty Expiry Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={errors.warranty_expiry_date}
                  required
                  {...register('warranty_expiry_date')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormField
                  label="Cost"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  error={errors.cost}
                  required
                  {...register('cost')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <ControlledFormSelect
                  control={control}
                  name="status"
                  label="Status"
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                    { label: 'Maintenance', value: 'maintenance' },
                    { label: 'Retired', value: 'retired' },
                  ]}
                  error={errors.status}
                  required
                />
              </Grid>
            </Grid>

            {/* Additional Information */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Additional Information
            </Typography>

            <FormField
              label="Notes"
              multiline
              rows={4}
              placeholder="Enter any additional notes about this asset..."
              error={errors.notes}
              {...register('notes')}
            />

            {/* Form Actions */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Add />
                  )
                }
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Creating...' : 'Create Asset'}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/assets')}
                disabled={isSubmitting || loading}
              >
                Cancel
              </Button>
            </Box>
          </FormGroup>
        </form>
      </Paper>
    </Box>
  )
}

export default AssetCreate
