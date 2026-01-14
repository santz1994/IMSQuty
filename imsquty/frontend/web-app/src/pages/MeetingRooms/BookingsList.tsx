import {
  Add as AddIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

interface Booking {
  id: number
  room_id: number
  user_id: number
  room_name?: string
  start_time: string
  end_time: string
  purpose: string
  attendees_count: number
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
  participant_emails?: string[]
  email_sent?: boolean
  approval_email_sent?: boolean
  created_at: string
  updated_at: string
  rejection_reason?: string
  approval_notes?: string
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

const BookingsList: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

  // State
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    start_time: '',
    end_time: '',
    purpose: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_BASE}/api/v1/bookings/my/bookings`)
      setBookings(response.data.data || response.data || [])
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to load bookings. Please try again.'
      setError(errorMessage)
      console.error('Failed to fetch bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'confirmed':
        return 'success'
      case 'rejected':
        return 'error'
      case 'cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval'
      case 'confirmed':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const formatDateTime = (datetime: string) => {
    try {
      return new Date(datetime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return datetime
    }
  }

  const formatTime = (datetime: string) => {
    try {
      return new Date(datetime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return datetime
    }
  }

  const formatDate = (datetime: string) => {
    try {
      return new Date(datetime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return datetime
    }
  }

  const canEditBooking = (booking: Booking): boolean => {
    // Can only edit pending bookings that haven't started
    if (booking.status !== 'pending') return false
    const startTime = new Date(booking.start_time)
    return startTime > new Date()
  }

  const canCancelBooking = (booking: Booking): boolean => {
    // Can cancel pending or confirmed bookings that haven't started
    if (!['pending', 'confirmed'].includes(booking.status)) return false
    const startTime = new Date(booking.start_time)
    return startTime > new Date()
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setDetailDialogOpen(true)
  }

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking)
    setEditFormData({
      start_time: booking.start_time,
      end_time: booking.end_time,
      purpose: booking.purpose,
    })
    setEditDialogOpen(true)
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveEdit = async () => {
    if (!editingBooking) return

    try {
      setSubmitting(true)
      await axios.put(
        `${API_BASE}/api/v1/bookings/${editingBooking.id}`,
        editFormData
      )

      // Refresh bookings list
      await fetchBookings()
      setEditDialogOpen(false)
      setEditingBooking(null)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update booking.'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setCancelReason('')
    setCancelDialogOpen(true)
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    try {
      setSubmitting(true)
      await axios.delete(
        `${API_BASE}/api/v1/bookings/${selectedBooking.id}`,
        {
          data: { cancellation_reason: cancelReason },
        }
      )

      // Refresh bookings list
      await fetchBookings()
      setCancelDialogOpen(false)
      setSelectedBooking(null)
      setCancelReason('')
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to cancel booking.'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadCalendar = (booking: Booking) => {
    // Generate .ics file for calendar
    const startDate = new Date(booking.start_time)
    const endDate = new Date(booking.end_time)

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IMSQuty//Meeting Room Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:IMSQuty Meeting Room Booking
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
UID:booking-${booking.id}@imsquty.local
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${booking.purpose}
DESCRIPTION:Meeting Room: ${booking.room_name}\\nAttendees: ${booking.attendees_count}
LOCATION:${booking.room_name}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    const element = document.createElement('a')
    element.setAttribute('href', `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`)
    element.setAttribute('download', `booking-${booking.id}.ics`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const filterBookingsByStatus = (status: string | null = null) => {
    if (!status) return bookings
    return bookings.filter((b) => b.status === status)
  }

  const pendingBookings = filterBookingsByStatus('pending')
  const approvedBookings = filterBookingsByStatus('confirmed')
  const rejectedBookings = filterBookingsByStatus('rejected')
  const cancelledBookings = filterBookingsByStatus('cancelled')

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card>
        <CardHeader
          title="My Meeting Room Bookings"
          subheader={`Total: ${bookings.length} booking(s)`}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/meeting-room-bookings/create')}
              >
                New Booking
              </Button>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchBookings} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />

        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : bookings.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                No bookings yet. Create your first booking to get started!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/meeting-room-bookings/create')}
              >
                Create Your First Booking
              </Button>
            </Paper>
          ) : (
            <Box>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                aria-label="booking status tabs"
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
              >
                <Tab
                  label={`Pending (${pendingBookings.length})`}
                  id="booking-tab-0"
                  aria-controls="booking-tabpanel-0"
                />
                <Tab
                  label={`Approved (${approvedBookings.length})`}
                  id="booking-tab-1"
                  aria-controls="booking-tabpanel-1"
                />
                <Tab
                  label={`Rejected (${rejectedBookings.length})`}
                  id="booking-tab-2"
                  aria-controls="booking-tabpanel-2"
                />
                <Tab
                  label={`Cancelled (${cancelledBookings.length})`}
                  id="booking-tab-3"
                  aria-controls="booking-tabpanel-3"
                />
              </Tabs>

              {/* Pending Bookings Tab */}
              <TabPanel value={tabValue} index={0}>
                {pendingBookings.length === 0 ? (
                  <Typography color="textSecondary">No pending bookings</Typography>
                ) : (
                  <BookingsTable
                    bookings={pendingBookings}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEditClick}
                    onCancel={handleCancelClick}
                    onDownloadCalendar={handleDownloadCalendar}
                    canEdit={canEditBooking}
                    canCancel={canCancelBooking}
                  />
                )}
              </TabPanel>

              {/* Approved Bookings Tab */}
              <TabPanel value={tabValue} index={1}>
                {approvedBookings.length === 0 ? (
                  <Typography color="textSecondary">No approved bookings</Typography>
                ) : (
                  <BookingsTable
                    bookings={approvedBookings}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEditClick}
                    onCancel={handleCancelClick}
                    onDownloadCalendar={handleDownloadCalendar}
                    canEdit={canEditBooking}
                    canCancel={canCancelBooking}
                  />
                )}
              </TabPanel>

              {/* Rejected Bookings Tab */}
              <TabPanel value={tabValue} index={2}>
                {rejectedBookings.length === 0 ? (
                  <Typography color="textSecondary">No rejected bookings</Typography>
                ) : (
                  <BookingsTable
                    bookings={rejectedBookings}
                    onViewDetails={handleViewDetails}
                    onDownloadCalendar={handleDownloadCalendar}
                  />
                )}
              </TabPanel>

              {/* Cancelled Bookings Tab */}
              <TabPanel value={tabValue} index={3}>
                {cancelledBookings.length === 0 ? (
                  <Typography color="textSecondary">No cancelled bookings</Typography>
                ) : (
                  <BookingsTable
                    bookings={cancelledBookings}
                    onViewDetails={handleViewDetails}
                    onDownloadCalendar={handleDownloadCalendar}
                  />
                )}
              </TabPanel>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedBooking && (
        <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Meeting Room
                  </Typography>
                  <Typography variant="body2">{selectedBooking.room_name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedBooking.start_time)} • {formatTime(selectedBooking.start_time)} -{' '}
                    {formatTime(selectedBooking.end_time)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Purpose
                  </Typography>
                  <Typography variant="body2">{selectedBooking.purpose}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Attendees
                  </Typography>
                  <Typography variant="body2">{selectedBooking.attendees_count} people</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedBooking.status)}
                    color={getStatusColor(selectedBooking.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                {selectedBooking.participant_emails && selectedBooking.participant_emails.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Participants Notified
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {selectedBooking.participant_emails.map((email) => (
                        <Chip key={email} label={email} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  </Grid>
                )}
                {selectedBooking.rejection_reason && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', mb: 0.5 }}>
                        Rejection Reason:
                      </Typography>
                      {selectedBooking.rejection_reason}
                    </Alert>
                  </Grid>
                )}
                {selectedBooking.approval_notes && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', mb: 0.5 }}>
                        Approval Notes:
                      </Typography>
                      {selectedBooking.approval_notes}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {editingBooking && (
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Start Date & Time"
                type="datetime-local"
                name="start_time"
                value={editFormData.start_time}
                onChange={handleEditFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date & Time"
                type="datetime-local"
                name="end_time"
                value={editFormData.end_time}
                onChange={handleEditFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Purpose"
                name="purpose"
                value={editFormData.purpose}
                onChange={handleEditFormChange}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Are you sure you want to cancel this booking?
            </Typography>
            <TextField
              label="Cancellation Reason (Optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Reason for cancellation..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={submitting}>
            Keep Booking
          </Button>
          <Button
            onClick={handleCancelBooking}
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Separate component for bookings table
interface BookingsTableProps {
  bookings: Booking[]
  onViewDetails: (booking: Booking) => void
  onEdit?: (booking: Booking) => void
  onCancel?: (booking: Booking) => void
  onDownloadCalendar: (booking: Booking) => void
  canEdit?: (booking: Booking) => boolean
  canCancel?: (booking: Booking) => boolean
}

const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  onViewDetails,
  onEdit,
  onCancel,
  onDownloadCalendar,
  canEdit,
  canCancel,
}) => {
  const formatDateTime = (datetime: string) => {
    try {
      return new Date(datetime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return datetime
    }
  }

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'confirmed':
        return 'success'
      case 'rejected':
        return 'error'
      case 'cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell>Room</TableCell>
            <TableCell>Date & Time</TableCell>
            <TableCell align="center">Attendees</TableCell>
            <TableCell>Purpose</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} hover>
              <TableCell>{booking.room_name}</TableCell>
              <TableCell>{formatDateTime(booking.start_time)}</TableCell>
              <TableCell align="center">{booking.attendees_count}</TableCell>
              <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {booking.purpose}
              </TableCell>
              <TableCell align="center">
                <Chip label={booking.status} color={getStatusColor(booking.status)} size="small" />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => onViewDetails(booking)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {onEdit && canEdit && canEdit(booking) && (
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(booking)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onCancel && canCancel && canCancel(booking) && (
                    <Tooltip title="Cancel">
                      <IconButton size="small" onClick={() => onCancel(booking)} color="error">
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Download Calendar">
                    <IconButton size="small" onClick={() => onDownloadCalendar(booking)}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default BookingsList
