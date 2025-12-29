import { Add, ArrowBack } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createAsset } from '../../store/slices/assetSlice'
import { fetchActiveDivisions } from '../../store/slices/divisionSlice'
import { fetchActiveLocations } from '../../store/slices/locationSlice'
import { fetchActiveManufacturers } from '../../store/slices/manufacturerSlice'
import { fetchActiveWarrantyTypes } from '../../store/slices/warrantyTypeSlice'

interface CreateAssetFormData {
  asset_tag: string
  name: string
  serial_number: string
  asset_type_id?: number
  model_id?: number
  division_id?: number
  location_id?: number
  supplier_id?: number
  purchase_date?: string
  warranty_months?: number
  warranty_type_id?: number
  invoice_id?: number
  purchase_order_id?: number
  ip_address?: string
  mac_address?: string
  status_id?: number
  assigned_to?: number
  notes?: string
}

const AssetCreate: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.asset)
  const { divisions } = useAppSelector((state) => state.division)
  const { locations } = useAppSelector((state) => state.location)
  const { manufacturers } = useAppSelector((state) => state.manufacturer)
  const { warrantyTypes } = useAppSelector((state) => state.warrantyType)
  
  const [formData, setFormData] = useState<CreateAssetFormData>({
    asset_tag: '',
    name: '',
    serial_number: '',
    notes: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Load master data on mount
  useEffect(() => {
    dispatch(fetchActiveDivisions() as any)
    dispatch(fetchActiveLocations() as any)
    dispatch(fetchActiveManufacturers() as any)
    dispatch(fetchActiveWarrantyTypes() as any)
  }, [dispatch])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.asset_tag.trim()) {
      errors.asset_tag = 'Asset Tag is required'
    }
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    if (!formData.serial_number.trim()) {
      errors.serial_number = 'Serial Number is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      dispatch(createAsset(formData))
      navigate('/assets')
    }
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/assets')}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Create New Asset
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Asset Tag"
                name="asset_tag"
                value={formData.asset_tag}
                onChange={handleChange}
                error={!!validationErrors.asset_tag}
                helperText={validationErrors.asset_tag}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Serial Number"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                error={!!validationErrors.serial_number}
                helperText={validationErrors.serial_number}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IP Address"
                name="ip_address"
                value={formData.ip_address || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Division</InputLabel>
                <Select
                  name="division_id"
                  label="Division"
                  value={formData.division_id || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      division_id: Number(e.target.value) || undefined,
                    }))
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {divisions.map((div) => (
                    <MenuItem key={div.id} value={div.id}>
                      {div.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  name="location_id"
                  label="Location"
                  value={formData.location_id || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location_id: Number(e.target.value) || undefined,
                    }))
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Manufacturer</InputLabel>
                <Select
                  name="model_id"
                  label="Manufacturer"
                  value={formData.model_id || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      model_id: Number(e.target.value) || undefined,
                    }))
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {manufacturers.map((mfr) => (
                    <MenuItem key={mfr.id} value={mfr.id}>
                      {mfr.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Warranty Type</InputLabel>
                <Select
                  name="warranty_type_id"
                  label="Warranty Type"
                  value={formData.warranty_type_id || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      warranty_type_id: Number(e.target.value) || undefined,
                    }))
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {warrantyTypes.map((wt) => (
                    <MenuItem key={wt.id} value={wt.id}>
                      {wt.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                startIcon={<Add />}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Asset'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}

export default AssetCreate
