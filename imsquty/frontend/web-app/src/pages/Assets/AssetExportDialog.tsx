import { Download, FileDownload } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import axios from 'axios'
import { useState } from 'react'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
}

interface ExportOptions {
  format: 'excel' | 'csv'
  includeInactive: boolean
  statusFilter: 'all' | 'active' | 'maintenance' | 'inactive'
  locationFilter: 'all' | string
}

export default function AssetExportDialog({ open, onClose }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [options, setOptions] = useState<ExportOptions>({
    format: 'excel',
    includeInactive: false,
    statusFilter: 'all',
    locationFilter: 'all',
  })

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)

    try {
      // Build query parameters
      const params = new URLSearchParams()
      if (options.statusFilter !== 'all') {
        params.append('status', options.statusFilter)
      }
      if (options.locationFilter !== 'all') {
        params.append('location', options.locationFilter)
      }
      if (!options.includeInactive) {
        params.append('exclude_inactive', 'true')
      }

      const endpoint =
        options.format === 'excel'
          ? `${API_BASE}/api/v1/assets/import-export/export/excel?${params.toString()}`
          : `${API_BASE}/api/v1/assets/import-export/export/csv?${params.toString()}`

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      const timestamp = new Date().toISOString().split('T')[0]
      const filename =
        options.format === 'excel'
          ? `assets_export_${timestamp}.xlsx`
          : `assets_export_${timestamp}.csv`

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Close dialog after successful export
      handleClose()
    } catch (error: any) {
      console.error('Export error:', error)
      setExportError(error.response?.data?.message || 'Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    setExportError(null)
    setOptions({
      format: 'excel',
      includeInactive: false,
      statusFilter: 'all',
      locationFilter: 'all',
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FileDownload />
          <Typography variant="h6">Export Assets</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Format Selection */}
          <FormControl fullWidth>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={options.format}
              label="Export Format"
              onChange={(e) => setOptions({ ...options, format: e.target.value as 'excel' | 'csv' })}
            >
              <MenuItem value="excel">Excel (.xlsx)</MenuItem>
              <MenuItem value="csv">CSV (.csv)</MenuItem>
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={options.statusFilter}
              label="Filter by Status"
              onChange={(e) => setOptions({ ...options, statusFilter: e.target.value as any })}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="maintenance">Maintenance Only</MenuItem>
              <MenuItem value="inactive">Inactive Only</MenuItem>
            </Select>
          </FormControl>

          {/* Location Filter */}
          <FormControl fullWidth>
            <InputLabel>Filter by Location</InputLabel>
            <Select
              value={options.locationFilter}
              label="Filter by Location"
              onChange={(e) => setOptions({ ...options, locationFilter: e.target.value })}
            >
              <MenuItem value="all">All Locations</MenuItem>
              <MenuItem value="warehouse">Warehouse</MenuItem>
              <MenuItem value="office">Office</MenuItem>
              <MenuItem value="storage">Storage</MenuItem>
            </Select>
          </FormControl>

          {/* Include Options */}
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeInactive}
                  onChange={(e) => setOptions({ ...options, includeInactive: e.target.checked })}
                />
              }
              label="Include Inactive Assets"
            />
          </FormGroup>

          {/* Info Alert */}
          <Alert severity="info">
            <Typography variant="body2">
              The exported file will include all fields: Asset Tag, Name, Serial Number, Category, Location, Status, Purchase Date, and more.
            </Typography>
          </Alert>

          {/* Error Alert */}
          {exportError && <Alert severity="error">{exportError}</Alert>}

          {/* Loading State */}
          {isExporting && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CircularProgress size={30} sx={{ mb: 1 }} />
              <Typography variant="body2">Generating export file...</Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={20} /> : <Download />}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
