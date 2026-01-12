import {
  CheckCircle as ApproveIcon,
  Event as EventIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
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
  Typography
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel } from '@mui/x-data-grid'
import React, { useCallback, useEffect, useState } from 'react'
import { useBookings, useMeetingRooms } from '../../hooks/useMeetingRooms'
import meetingRoomService, { Booking } from '../../services/MeetingRoomService'

interface BookingFilters {
  status: string
  room_id: number | 'all'
  date_from: string
  date_to: string
}

const BookingApprovals: React.FC = () => {
  const { rooms, loading: roomsLoading, fetchRooms } = useMeetingRooms(true)
  const { bookings, loading: bookingsLoading, error, fetchBookings } = useBookings(true)

  const [filters, setFilters] = useState<BookingFilters>({
    status: 'pending',
    room_id: 'all',
    date_from: '',
    date_to: '',
  })

  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([])
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
    if (!confirm(`Approve booking for ${booking.title}?`)) return

    setProcessing(true)
    setErrorMessage(null)

    try {
      // Assuming API has approve endpoint
      const response = await meetingRoomService.approveBooking(booking.id)
      if (response.success) {
        setSuccessMessage('Booking approved successfully!')
        await fetchBookings()
      } else {
        setErrorMessage(response.message || 'Failed to approve booking')
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while approving booking')
    } finally {
      setProcessing(false)
    }
  }

  // Handle reject single booking
  const handleReject = async () => {
    if (!selectedBooking) return
    if (!rejectionReason.trim()) {
      setErrorMessage('Please provide a rejection reason')
      return
    }

    setProcessing(true)
    setErrorMessage(null)

    try {
      // Assuming API has reject endpoint
      const response = await meetingRoomService.rejectBooking(selectedBooking.id, rejectionReason.trim())
      if (response.success) {
        setSuccessMessage('Booking rejected successfully!')
        await fetchBookings()
        setRejectDialogOpen(false)
        setRejectionReason('')
        setSelectedBooking(null)
      } else {
        setErrorMessage(response.message || 'Failed to reject booking')
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while rejecting booking')
    } finally {
      setProcessing(false)
    }
  }

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) return
    if (!confirm(`Approve ${selectedRows.length} booking(s)?`)) return

    setProcessing(true)
    setErrorMessage(null)

    try {
      const promises = selectedRows.map((id) =>
        meetingRoomService.approveBooking(Number(id))
      )
      await Promise.all(promises)
      setSuccessMessage(`${selectedRows.length} booking(s) approved successfully!`)
      await fetchBookings()
      setSelectedRows([])
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred during bulk approval')
    } finally {
      setProcessing(false)
    }
  }

  // Handle bulk reject
  const handleBulkReject = async () => {
    if (selectedRows.length === 0) return
    if (!rejectionReason.trim()) {
      setErrorMessage('Please provide a rejection reason for bulk rejection')
      return
    }
    if (!confirm(`Reject ${selectedRows.length} booking(s)?`)) return

    setProcessing(true)
    setErrorMessage(null)

    try {
      const promises = selectedRows.map((id) =>
        meetingRoomService.rejectBooking(Number(id), rejectionReason.trim())
      )
      await Promise.all(promises)
      setSuccessMessage(`${selectedRows.length} booking(s) rejected successfully!`)
      await fetchBookings()
      setSelectedRows([])
      setRejectionReason('')
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred during bulk rejection')
    } finally {
      setProcessing(false)
    }
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setErrorMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, errorMessage])

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'room_name',
      headerName: 'Room',
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const room = rooms.find((r) => r.id === params.row.room_id)
        return room?.name || 'Unknown'
      },
    },
    {
      field: 'title',
      headerName: 'Meeting Title',
      width: 250,
      flex: 1,
    },
    {
      field: 'start_time',
      headerName: 'Date & Time',
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const date = new Date(params.value)
        return (
          <Box>
            <Typography variant="body2">{date.toLocaleDateString('id-ID')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
              {new Date(params.row.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        )
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
      field: 'purpose',
      headerName: 'Purpose',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
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

  const loading = roomsLoading || bookingsLoading || processing

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">Booking Approvals</Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchRooms()
              fetchBookings()
            }}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Success/Error Messages */}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Filters */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={2}>
            <FilterIcon color="action" />
            <Typography variant="subtitle2">Filters:</Typography>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} label="Status">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Room</InputLabel>
              <Select value={filters.room_id} onChange={(e) => setFilters({ ...filters, room_id: e.target.value as any })} label="Room">
                <MenuItem value="all">All Rooms</MenuItem>
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="From Date"
              type="date"
              size="small"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="To Date"
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
              <Button
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => setRejectDialogOpen(true)}
                disabled={processing}
              >
                Bulk Reject
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

        {/* Data Grid */}
        <Paper>
          <DataGrid
            rows={filteredBookings()}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(selection) => setSelectedRows(selection)}
            rowSelectionModel={selectedRows}
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            loading={loading}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </Paper>
      </Stack>

      {/* View Booking Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon color="primary" />
            <Typography variant="h6">Booking Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Room
                </Typography>
                <Typography variant="body1">{rooms.find((r) => r.id === selectedBooking.room_id)?.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Title
                </Typography>
                <Typography variant="body1">{selectedBooking.title}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">{selectedBooking.description || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Start Time
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedBooking.start_time).toLocaleString('id-ID')}
                </Typography>
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
            label="Rejection Reason *"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={selectedRows.length > 0 ? handleBulkReject : handleReject} disabled={processing || !rejectionReason.trim()}>
            {processing ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BookingApprovals
