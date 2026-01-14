import {
  CheckCircle as ApproveIcon,
  Visibility as DetailsIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Cancel as RejectIcon,
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
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useAppSelector } from '../../store/hooks'

interface Booking {
  id: number
  room_id: number
  user_id: number
  room_name?: string
  user_name?: string
  user_email?: string
  start_time: string
  end_time: string
  purpose: string
  attendees_count: number
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
  participant_emails?: string[]
  email_sent?: boolean
  created_at: string
  updated_at: string
}

interface ApprovalAction {
  type: 'approve' | 'reject'
  booking: Booking
  notes?: string
}

const ApprovalDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

  // State
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  // Dialog states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPendingBookings()
  }, [page])

  const fetchPendingBookings = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(
        `${API_BASE}/api/v1/bookings?status=pending&page=${page}&per_page=${pageSize}`
      )
      setBookings(response.data.data || [])
      setTotalItems(response.data.total || response.data.data?.length || 0)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to load pending bookings.'
      setError(errorMessage)
      console.error('Failed to fetch bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setDetailsDialogOpen(true)
  }

  const handleApproveClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setApprovalNotes('')
    setApproveDialogOpen(true)
  }

  const handleRejectClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedBooking) return

    try {
      setSubmitting(true)
      await axios.post(
        `${API_BASE}/api/v1/bookings/${selectedBooking.id}/approve`,
        {
          approved_by: user?.id,
          notes: approvalNotes,
        }
      )

      // Show success and refresh
      setApproveDialogOpen(false)
      await fetchPendingBookings()
      setSelectedBooking(null)
      setApprovalNotes('')
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to approve booking.'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedBooking) return

    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      setSubmitting(true)
      await axios.post(
        `${API_BASE}/api/v1/bookings/${selectedBooking.id}/reject`,
        {
          rejected_by: user?.id,
          reason: rejectionReason,
        }
      )

      // Show success and refresh
      setRejectDialogOpen(false)
      await fetchPendingBookings()
      setSelectedBooking(null)
      setRejectionReason('')
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to reject booking.'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
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

  const getTotalPages = Math.ceil(totalItems / pageSize)

  const handleDownloadCalendar = (booking: Booking) => {
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
DESCRIPTION:Requester: ${booking.user_name}\\nRoom: ${booking.room_name}\\nAttendees: ${booking.attendees_count}
LOCATION:${booking.room_name}
STATUS:PENDING
END:VEVENT
END:VCALENDAR`

    const element = document.createElement('a')
    element.setAttribute('href', `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`)
    element.setAttribute('download', `booking-approval-${booking.id}.ics`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto' }}>
      <Card>
        <CardHeader
          title="Meeting Room Booking Approvals"
          subheader={`Total Pending: ${totalItems} booking(s)`}
          action={
            <Tooltip title="Refresh">
              <IconButton onClick={fetchPendingBookings} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
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
              <Typography variant="body1" color="textSecondary">
                No pending bookings at this time. All bookings have been reviewed!
              </Typography>
            </Paper>
          ) : (
            <Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell>Requester</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell align="center">Attendees</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Participants</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} hover>
                        <TableCell>{booking.user_name}</TableCell>
                        <TableCell>{booking.room_name}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(booking.start_time)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{booking.attendees_count}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {booking.purpose}
                        </TableCell>
                        <TableCell>
                          {booking.participant_emails && booking.participant_emails.length > 0 ? (
                            <Tooltip title={booking.participant_emails.join('\n')}>
                              <Typography variant="caption">
                                {booking.participant_emails.length} participants
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              None
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(booking)}
                              >
                                <DetailsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                onClick={() => handleApproveClick(booking)}
                                color="success"
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                onClick={() => handleRejectClick(booking)}
                                color="error"
                              >
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download Calendar">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadCalendar(booking)}
                              >
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

              {getTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={getTotalPages}
                    page={page}
                    onChange={(e, newPage) => setPage(newPage)}
                  />
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedBooking && (
        <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Requester
                  </Typography>
                  <Typography variant="body2">
                    {selectedBooking.user_name} ({selectedBooking.user_email})
                  </Typography>
                </Grid>
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
                    Number of Attendees
                  </Typography>
                  <Typography variant="body2">{selectedBooking.attendees_count}</Typography>
                </Grid>
                {selectedBooking.participant_emails && selectedBooking.participant_emails.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Participants to be Notified
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {selectedBooking.participant_emails.map((email) => (
                        <Chip key={email} label={email} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', mb: 0.5 }}>
                      Email Status:
                    </Typography>
                    Initial confirmation sent: {selectedBooking.email_sent ? '✅ Yes' : '❌ No'}
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Booking</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedBooking && (
              <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedBooking.purpose}
                </Typography>
                <Typography variant="caption">
                  {formatDate(selectedBooking.start_time)} • {selectedBooking.room_name}
                </Typography>
              </Paper>
            )}
            <TextField
              label="Approval Notes (Optional)"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Add any notes for the booking requester..."
            />
            <Alert severity="success">
              <Typography variant="caption">
                ✅ Confirmation email will be sent to requester and all participants with calendar invite.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={submitting}
          >
            {submitting ? 'Approving...' : 'Approve Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Booking</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedBooking && (
              <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedBooking.purpose}
                </Typography>
                <Typography variant="caption">
                  {formatDate(selectedBooking.start_time)} • {selectedBooking.room_name}
                </Typography>
              </Paper>
            )}
            <TextField
              label="Rejection Reason *"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Explain why this booking is being rejected..."
              error={!rejectionReason.trim() && submitting}
              helperText={!rejectionReason.trim() && submitting ? 'Reason is required' : ''}
            />
            <Alert severity="warning">
              <Typography variant="caption">
                ⚠️ Rejection email will be sent to requester and all participants with this reason.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? 'Rejecting...' : 'Reject Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ApprovalDashboard
