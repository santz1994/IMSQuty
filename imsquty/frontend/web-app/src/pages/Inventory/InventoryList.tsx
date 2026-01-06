import { Add, Delete, Edit, Search } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
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
  Typography,
} from '@mui/material'
import React, { useState } from 'react'

const mockInventory = [
  { id: 1, name: 'USB Cables', quantity: 150, unit: 'pcs', location: 'Warehouse A', status: 'in_stock' },
  { id: 2, name: 'HDMI Cables', quantity: 85, unit: 'pcs', location: 'Warehouse B', status: 'low_stock' },
  { id: 3, name: 'Power Supplies', quantity: 0, unit: 'pcs', location: 'Warehouse A', status: 'out_of_stock' },
  { id: 4, name: 'Monitor Stands', quantity: 42, unit: 'pcs', location: 'Warehouse C', status: 'in_stock' },
]

const InventoryList: React.FC = () => {
  const [inventory, setInventory] = useState(mockInventory)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({ name: '', quantity: '', unit: '', location: '', status: 'in_stock' })

  const filtered = inventory.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleSave = () => {
    const newItem = {
      id: Math.max(...inventory.map(i => i.id), 0) + 1,
      name: formData.name,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      location: formData.location,
      status: formData.status,
    }
    setInventory([...inventory, newItem])
    setOpenDialog(false)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Inventory Management</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
            Add Item
          </Button>
        </Box>

        <TextField
          placeholder="Search inventory items..."
          fullWidth
          variant="outlined"
          size="small"
          InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'gray' }} /> }}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Item Name</strong></TableCell>
                <TableCell align="right"><strong>Quantity</strong></TableCell>
                <TableCell><strong>Unit</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length > 0 ? paginated.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status.toUpperCase()}
                      color={item.status === 'in_stock' ? 'success' : item.status === 'low_stock' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="info"><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setInventory(inventory.filter(i => i.id !== item.id))}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><Typography color="textSecondary">No items found</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
          />
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField label="Item Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <TextField label="Quantity" type="number" fullWidth value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
              <TextField label="Unit" fullWidth value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
              <TextField label="Location" fullWidth value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  )
}

export default InventoryList
