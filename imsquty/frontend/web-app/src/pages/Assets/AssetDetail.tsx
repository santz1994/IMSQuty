import { ArrowBack, Save } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAsset, updateAsset } from '../../store/slices/assetSlice'
import { fetchActiveDivisions } from '../../store/slices/divisionSlice'
import { fetchActiveLocations } from '../../store/slices/locationSlice'
import { fetchActiveManufacturers } from '../../store/slices/manufacturerSlice'
import { fetchActiveWarrantyTypes } from '../../store/slices/warrantyTypeSlice'

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { currentAsset, loading, error } = useAppSelector(
    (state) => state.asset,
  )
  const { divisions } = useAppSelector((state) => state.division)
  const { locations } = useAppSelector((state) => state.location)
  const { manufacturers } = useAppSelector((state) => state.manufacturer)
  const { warrantyTypes } = useAppSelector((state) => state.warrantyType)
  const [formData, setFormData] = useState(currentAsset)

  useEffect(() => {
    if (id) {
      dispatch(fetchAsset(parseInt(id)))
      dispatch(fetchActiveDivisions() as any)
      dispatch(fetchActiveLocations() as any)
      dispatch(fetchActiveManufacturers() as any)
      dispatch(fetchActiveWarrantyTypes() as any)
    }
  }, [id, dispatch])

  useEffect(() => {
    if (currentAsset) {
      setFormData(currentAsset)
    }
  }, [currentAsset])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData && id) {
      dispatch(updateAsset({ id: parseInt(id), data: formData }))
      navigate('/assets')
    }
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!formData) return <Alert severity="warning">Asset not found</Alert>

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
          Asset Details: {formData.asset_tag}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Asset Tag"
                name="asset_tag"
                value={formData.asset_tag}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Serial Number"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IP Address"
                name="ip_address"
                value={formData.ip_address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Division</InputLabel>
                <Select
                  name="division_id"
                  label="Division"
                  value={formData?.division_id || ''}
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
                  value={formData?.location_id || ''}
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
                  value={formData?.model_id || ''}
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
                  value={formData?.warranty_type_id || ''}
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
                value={formData?.notes}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                startIcon={<Save />}
              >
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}

export default AssetDetail
