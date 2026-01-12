import { Add, Delete, Edit } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssets } from '../../hooks/useAssets'

interface Asset {
  id: number
  asset_tag: string
  name: string
  serial_number: string
  asset_type_id: string
  status: 'active' | 'maintenance' | 'inactive'
  purchase_date: string
}

const statusChipColor = (status: Asset['status']): any => {
  switch (status) {
    case 'active': return 'success'
    case 'maintenance': return 'warning'
    case 'inactive': return 'error'
    default: return 'default'
  }
}

export default function AssetList() {
  const navigate = useNavigate()
  // ✅ REAL API DATA - No mock data
  const { assets, loading, error, fetchAssets, createAsset, updateAsset, deleteAsset } = useAssets(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [formData, setFormData] = useState<{
    asset_tag: string
    name: string
    serial_number: string
    asset_type_id: string
    status: 'active' | 'maintenance' | 'inactive'
    purchase_date: string
  }>({
    asset_tag: '',
    name: '',
    serial_number: '',
    asset_type_id: '',
    status: 'active',
    purchase_date: '',
  })

  const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.asset_tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedAssets = filteredAssets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleAddAsset = () => {
    setEditingAsset(null)
    setFormData({
      asset_tag: '',
      name: '',
      serial_number: '',
      asset_type_id: '',
      status: 'active',
      purchase_date: '',
    })
    setOpenDialog(true)
  }

  const handleEditAsset = (asset: any) => {
    setEditingAsset(asset)
    setFormData({
      asset_tag: asset.asset_tag,
      name: asset.name,
      serial_number: asset.serial_number,
      asset_type_id: asset.asset_type_id,
      status: asset.status,
      purchase_date: asset.purchase_date,
    })
    setOpenDialog(true)
  }

  const handleSaveAsset = async () => {
    try {
      const dataToSave = {
        ...formData,
        asset_type_id: parseInt(String(formData.asset_type_id))
      }
      if (editingAsset) {
        // Update existing asset via API
        await updateAsset(editingAsset.id, dataToSave)
      } else {
        // Create new asset via API
        await createAsset(dataToSave)
      }
      setOpenDialog(false)
      // Refresh list
      await fetchAssets()
    } catch (err) {
      console.error('Failed to save asset:', err)
      alert('Failed to save asset. Please try again.')
    }
  }

  const handleDeleteAsset = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAsset(id)
        // Refresh list
        await fetchAssets()
      } catch (err) {
        console.error('Failed to delete asset:', err)
        alert('Failed to delete asset. Please try again.')
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => fetchAssets()}>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Assets</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddAsset}
          >
            Add Asset
          </Button>
        </Box>

        <TextField
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          size="small"
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Asset Tag</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAssets.map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell>{asset.asset_tag}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.serial_number}</TableCell>
                  <TableCell>{asset.asset_type_id}</TableCell>
                  <TableCell>
                    <Chip
                      label={asset.status}
                      color={statusChipColor(asset.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{asset.purchase_date}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditAsset(asset)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAsset(asset.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAssets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Stack>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Asset Tag"
              value={formData.asset_tag}
              onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Serial Number"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Type"
              value={formData.asset_type_id}
              onChange={(e) => setFormData({ ...formData, asset_type_id: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Status"
              select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              fullWidth
              size="small"
              SelectProps={{
                native: true,
              }}
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </TextField>
            <TextField
              label="Purchase Date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAsset} variant="contained">
            {editingAsset ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
