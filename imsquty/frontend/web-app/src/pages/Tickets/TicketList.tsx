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
import { useTickets } from '../../hooks/useTickets'

interface Ticket {
  id: number
  ticket_number: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_by: string
  assigned_to?: string
  created_date: string
  due_date: string
}

const priorityColor = (priority: Ticket['priority']): any => {
  switch (priority) {
    case 'high': return 'error'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'default'
  }
}

const statusColor = (status: Ticket['status']): any => {
  switch (status) {
    case 'open': return 'error'
    case 'in_progress': return 'info'
    case 'resolved': return 'success'
    case 'closed': return 'default'
    default: return 'default'
  }
}

export default function TicketList() {
  const navigate = useNavigate()
  // ✅ REAL API DATA - No mock data
  const { tickets, loading, error, fetchTickets, createTicket, updateTicket, deleteTicket } = useTickets(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [formData, setFormData] = useState<{
    ticket_number: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    created_by: string
    assigned_to: string
    due_date: string
  }>({
    ticket_number: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    created_by: '',
    assigned_to: '',
    due_date: '',
  })

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedTickets = filteredTickets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleAddTicket = () => {
    setEditingTicket(null)
    setFormData({
      ticket_number: '',
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      created_by: '',
      assigned_to: '',
      due_date: '',
    })
    setOpenDialog(true)
  }

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket)
    setFormData({
      ticket_number: ticket.ticket_number,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      created_by: ticket.created_by,
      assigned_to: ticket.assigned_to || '',
      due_date: ticket.due_date,
    })
    setOpenDialog(true)
  }

  const handleSaveTicket = async () => {
    try {
      if (editingTicket) {
        await updateTicket(editingTicket.id, formData)
      } else {
        await createTicket(formData)
      }
      setOpenDialog(false)
      await fetchTickets()
    } catch (err) {
      console.error('Failed to save ticket:', err)
      alert('Failed to save ticket. Please try again.')
    }
  }

  const handleDeleteTicket = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(id)
        await fetchTickets()
      } catch (err) {
        console.error('Failed to delete ticket:', err)
        alert('Failed to delete ticket. Please try again.')
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
        <Button variant="contained" onClick={() => fetchTickets()}>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Tickets</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTicket}
          >
            New Ticket
          </Button>
        </Box>

        <TextField
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          size="small"
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Ticket #</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id} hover>
                  <TableCell>{ticket.ticket_number}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.priority.toUpperCase()}
                      color={priorityColor(ticket.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status.toUpperCase().replace('_', ' ')}
                      color={statusColor(ticket.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{ticket.created_by}</TableCell>
                  <TableCell>{ticket.assigned_to || '-'}</TableCell>
                  <TableCell>{ticket.due_date}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditTicket(ticket)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTicket(ticket.id)}
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
          count={filteredTickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Stack>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Ticket Number"
              value={formData.ticket_number}
              onChange={(e) => setFormData({ ...formData, ticket_number: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={3}
            />
            <TextField
              label="Priority"
              select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              fullWidth
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </TextField>
            <TextField
              label="Status"
              select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              fullWidth
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </TextField>
            <TextField
              label="Created By"
              value={formData.created_by}
              onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Assigned To"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTicket} variant="contained">
            {editingTicket ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
