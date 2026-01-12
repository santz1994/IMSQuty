import { Add, Delete, Edit, Search } from '@mui/icons-material'
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
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useInvoices } from '../../hooks/useFinancial'

const FinancialList: React.FC = () => {
  const { invoices, loading, error, fetchInvoices, createInvoice, deleteInvoice } = useInvoices(true)
  const [transactions, setTransactions] = React.useState(invoices.map(inv => ({
    id: inv.id,
    date: inv.issue_date,
    description: inv.vendor_name,
    amount: inv.amount,
    type: 'expense',
    category: 'Invoice',
    status: inv.status
  })))
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({ date: '', description: '', amount: '', type: 'expense', category: '', status: 'draft' })

  const filtered = transactions.filter(tx => tx.description.toLowerCase().includes(searchQuery.toLowerCase()))
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleSave = async () => {
    await createInvoice({
      vendor_name: formData.description,
      amount: parseFloat(formData.amount),
      currency: 'USD',
      issue_date: formData.date,
      due_date: formData.date
    })
    setOpenDialog(false)
    setFormData({ date: '', description: '', amount: '', type: 'expense', category: '', status: 'draft' })
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button onClick={fetchInvoices}>Retry</Button>}>{error}</Alert></Box>

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Financial Management</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
            New Transaction
          </Button>
        </Box>

        <TextField
          placeholder="Search transactions..."
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
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length > 0 ? paginated.map(tx => (
                <TableRow key={tx.id} hover>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell align="right" sx={{ color: tx.type === 'expense' ? 'red' : 'green', fontWeight: 'bold' }}>
                    {tx.type === 'expense' ? '-' : '+'} ${tx.amount}
                  </TableCell>
                  <TableCell><Chip label={tx.type.toUpperCase()} size="small" /></TableCell>
                  <TableCell><Chip label={tx.status.toUpperCase()} color={tx.status === 'paid' ? 'success' : 'warning'} size="small" /></TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="info"><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setTransactions(transactions.filter(t => t.id !== tx.id))}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography color="textSecondary">No transactions found</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filtered.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }} />
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Transaction</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              <TextField label="Description" fullWidth value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <TextField label="Amount" type="number" fullWidth value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              <TextField label="Category" fullWidth value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
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

export default FinancialList
