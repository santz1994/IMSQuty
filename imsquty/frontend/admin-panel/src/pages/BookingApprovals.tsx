import {
  CheckCircle as ApproveIcon,
  Event as EventIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel } from '@mui/x-data-grid'
import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface MeetingRoom {
  id: number
  name: string
  location: string
  capacity: number
}

interface Booking {
  id: number
  room_id: number
  room_name?: string
  user_id: number
  user_name?: string
  title: string
  purpose: string
  start_time: string
  end_time: string
  attendees: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: number
  approved_at?: string
  rejection_reason?: string
  created_at: string
}

interface BookingFilters {
  status: string
  room_id: number | 'all'
  date_from: string
  date_to: string
}

const BookingApprovals: React.FC = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Filters
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'pending',
    room_id: 'all',
    date_from: '',
    date_to: '',
  })

  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([])
  const [processing, setProcessing] = useState(false)

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_BASE_URL}/api/v1/meeting-rooms`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.data.success) {
        setRooms(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching rooms:', err)
    }
  }, [])

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_BASE_URL}/api/v1/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.data.success) {
        setBookings(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch bookings')
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      setError(err.response?.data?.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
    fetchBookings()
  }, [fetchRooms, fetchBookings])

  // Filter bookings
  const filteredBookings = useCallback(() => {
    return bookings.filter((booking) => {
      const matchesStatus = filters.status === 'all' || booking.status === filters.status
      const matchesRoom = filters.room_id === 'all' || booking.room_id === filters.room_id

      let matchesDateFrom = true
      let matchesDateTo = true

      if (filters.date_from) {
        matchesDateFrom = new Date(booking.start_time) >= new Date(filters.date_from)
      }

      if (filters.date_to) {
        matchesDateTo = new Date(booking.start_time) <= new Date(filters.date_to)
      }

      return matchesStatus && matchesRoom && matchesDateFrom && matchesDateTo
    })
  }, [bookings, filters])

  // Handle approve single booking
  const handleApprove = async (booking: Booking) => {
    if (!confirm(`Approve booking for "${booking.title}"?`)) return

    setProcessing(true)
    setError(null)

    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/bookings/${booking.id}/approve`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      )

      if (response.data.success) {
        setSuccessMessage('Booking approved successfully!')
        await fetchBookings()
      } else {
        setError(response.data.message || 'Failed to approve booking')
      }
    } catch (err: any) {
      console.error('Error approving booking:', err)
      setError(err.response?.data?.message || 'Failed to approve booking')
    } finally {
      setProcessing(false)
    }
  }

  // Handle reject booking
  const handleReject = async () => {
    if (!selectedBooking) return
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/bookings/${selectedBooking.id}/reject`,
        { reason: rejectionReason.trim() },
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      )

      if (response.data.success) {
        setSuccessMessage('Booking rejected successfully!')
        await fetchBookings()
        setRejectDialogOpen(false)
        setRejectionReason('')
        setSelectedBooking(null)
      } else {
        setError(response.data.message || 'Failed to reject booking')
      }
    } catch (err: any) {
      console.error('Error rejecting booking:', err)
      setError(err.response?.data?.message || 'Failed to reject booking')
    } finally {
      setProcessing(false)
    }
  }

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) return
    if (!confirm(`Approve ${selectedRows.length} booking(s)?`)) return

    setProcessing(true)
    setError(null)

    try {
      const token = localStorage.getItem('access_token')
      const promises = selectedRows.map((id) =>
        axios.post(
          `${API_BASE_URL}/api/v1/bookings/${id}/approve`,
          {},
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        )
      )

      await Promise.all(promises)
      setSuccessMessage(`${selectedRows.length} booking(s) approved successfully!`)
      await fetchBookings()
      setSelectedRows([])
    } catch (err: any) {
      console.error('Error bulk approving:', err)
      setError('Failed to approve some bookings')
    } finally {
      setProcessing(false)
    }
  }

  // Auto-hide messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'title',
      headerName: 'Meeting Title',
      width: 200,
      flex: 1,
    },
    {
      field: 'room_name',
      headerName: 'Room',
      width: 150,
    },
    {
      field: 'user_name',
      headerName: 'Requested By',
      width: 150,
    },
    {
      field: 'start_time',
      headerName: 'Start Time',
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        return new Date(params.value).toLocaleString('id-ID')
      },
    },
    {
      field: 'end_time',
      headerName: 'End Time',
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        return new Date(params.value).toLocaleString('id-ID')
      },
    },
    {
      field: 'attendees',
      headerName: 'Attendees',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string
        return (
          <Chip
            label={status.toUpperCase()}
            size="small"
            color={
              status === 'approved'
                ? 'success'
                : status === 'pending'
                  ? 'warning'
                  : status === 'rejected'
                    ? 'error'
                    : 'default'
            }
          />
        )
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const booking = params.row as Booking
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedBooking(booking)
                  setViewDialogOpen(true)
                }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {booking.status === 'pending' && (
              <>
                <Tooltip title="Approve">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleApprove(booking)}
                    disabled={processing}
                  >
                    <ApproveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedBooking(booking)
                      setRejectDialogOpen(true)
                    }}
                    disabled={processing}
                  >
                    <RejectIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        )
      },
    },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">
            <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Booking Approvals
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBookings}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <FilterIcon color="action" />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Room</InputLabel>
              <Select
                value={filters.room_id}
                label="Room"
                onChange={(e) => setFilters({ ...filters, room_id: e.target.value as number | 'all' })}
              >
                <MenuItem value="all">All Rooms</MenuItem>
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date From"
              type="date"
              size="small"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Date To"
              type="date"
              size="small"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={() => setFilters({ status: 'pending', room_id: 'all', date_from: '', date_to: '' })}
            >
              Clear
            </Button>
          </Stack>
        </Paper>

        {/* Bulk Actions */}
        {selectedRows.length > 0 && (
          <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Typography variant="subtitle2">{selectedRows.length} booking(s) selected</Typography>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={handleBulkApprove}
                disabled={processing}
              >
                Bulk Approve
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Statistics */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4">{bookings.filter((b) => b.status === 'pending').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h4" color="success.main">
                  {bookings.filter((b) => b.status === 'approved').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h4" color="error.main">
                  {bookings.filter((b) => b.status === 'rejected').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h4">{bookings.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* DataGrid */}
        <Paper sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={filteredBookings()}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection)
            }}
            rowSelectionModel={selectedRows}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
          />
        </Paper>
      </Stack>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Booking ID
                </Typography>
                <Typography variant="body1">#{selectedBooking.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Meeting Title
                </Typography>
                <Typography variant="body1">{selectedBooking.title}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Room
                </Typography>
                <Typography variant="body1">{selectedBooking.room_name || `Room #${selectedBooking.room_id}`}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Requested By
                </Typography>
                <Typography variant="body1">{selectedBooking.user_name || `User #${selectedBooking.user_id}`}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Start Time
                </Typography>
                <Typography variant="body1">{new Date(selectedBooking.start_time).toLocaleString('id-ID')}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  End Time
                </Typography>
                <Typography variant="body1">{new Date(selectedBooking.end_time).toLocaleString('id-ID')}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Attendees
                </Typography>
                <Typography variant="body1">{selectedBooking.attendees} people</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Purpose
                </Typography>
                <Typography variant="body1">{selectedBooking.purpose || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedBooking.status.toUpperCase()}
                  size="small"
                  color={
                    selectedBooking.status === 'approved'
                      ? 'success'
                      : selectedBooking.status === 'pending'
                        ? 'warning'
                        : selectedBooking.status === 'rejected'
                          ? 'error'
                          : 'default'
                  }
                />
              </Box>
              {selectedBooking.rejection_reason && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Rejection Reason
                  </Typography>
                  <Typography variant="body1" color="error">
                    {selectedBooking.rejection_reason}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedBooking?.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => {
                  setViewDialogOpen(false)
                  selectedBooking && handleApprove(selectedBooking)
                }}
                disabled={processing}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => {
                  setViewDialogOpen(false)
                  setRejectDialogOpen(true)
                }}
                disabled={processing}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Booking</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason (Required)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this booking..."
            helperText={`${rejectionReason.length} characters`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRejectDialogOpen(false)
            setRejectionReason('')
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={!rejectionReason.trim() || processing}
          >
            Reject Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BookingApprovals
