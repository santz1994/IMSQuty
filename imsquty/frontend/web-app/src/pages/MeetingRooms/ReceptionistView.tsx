import {
  Download as DownloadIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface Booking {
  id: string
  room_id: string
  user_id: string
  start_time: string
  end_time: string
  purpose: string
  status: string
  attendees_count: number
  participant_emails: string
  created_at: string
  updated_at: string
  room?: {
    id: string
    name: string
    capacity: number
    floor: string
    equipment: string
  }
  requester?: {
    id: string
    name: string
    email: string
  }
}

interface PaginatedResponse {
  data: Booking[]
  total: number
  per_page: number
  current_page: number
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ReceptionistView: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [dateFilter, setDateFilter] = useState<string>('')
  const [roomFilter, setRoomFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'all' | 'today' | 'week'>('all')

  // Fetch approved bookings from API
  const fetchApprovedBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      let queryParams = `?status=confirmed&page=${page}&per_page=${pageSize}`

      if (dateFilter) {
        queryParams += `&date=${dateFilter}`
      }

      if (roomFilter) {
        queryParams += `&room_id=${roomFilter}`
      }

      const response = await axios.get(`${API_BASE}/api/v1/bookings${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = response.data as PaginatedResponse
      setBookings(data.data || [])
      setFilteredBookings(data.data || [])
      setTotalItems(data.total || 0)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch approved bookings. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  // Initial load and page changes
  useEffect(() => {
    fetchApprovedBookings()
  }, [page, pageSize, dateFilter, roomFilter, viewMode])

  // Handle view details
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setViewDetailsOpen(true)
  }

  // Handle print
  const handlePrint = (booking?: Booking) => {
    const bookingToPrint = booking || selectedBooking
    if (!bookingToPrint) return

    const printContent = `
      <html>
        <head>
          <title>Booking Details - ${bookingToPrint.room?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; margin-top: 10px; }
            .value { margin-left: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background-color: #f0f0f0; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Meeting Room Booking Details</h1>
            <p>Printed: ${new Date().toLocaleString()}</p>
          </div>

          <div class="section">
            <div class="label">Meeting Room:</div>
            <div class="value">${bookingToPrint.room?.name || 'N/A'}</div>

            <div class="label">Requester:</div>
            <div class="value">${bookingToPrint.requester?.name || 'N/A'} (${bookingToPrint.requester?.email || 'N/A'})</div>

            <div class="label">Date & Time:</div>
            <div class="value">
              ${new Date(bookingToPrint.start_time).toLocaleString()} - ${new Date(bookingToPrint.end_time).toLocaleTimeString()}
            </div>

            <div class="label">Attendees:</div>
            <div class="value">${bookingToPrint.attendees_count} people</div>

            <div class="label">Purpose:</div>
            <div class="value">${bookingToPrint.purpose || 'N/A'}</div>

            <div class="label">Participants (Email):</div>
            <div class="value">
              ${bookingToPrint.participant_emails
        ? bookingToPrint.participant_emails.split(',').join('<br/>')
        : 'None'
      }
            </div>

            <div class="label">Room Details:</div>
            <div class="value">
              Capacity: ${bookingToPrint.room?.capacity || 'N/A'} | 
              Floor: ${bookingToPrint.room?.floor || 'N/A'} | 
              Equipment: ${bookingToPrint.room?.equipment || 'None'}
            </div>

            <div class="label">Status:</div>
            <div class="value">${bookingToPrint.status}</div>
          </div>

          <div class="footer">
            <p>This booking has been approved and confirmed.</p>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Handle download calendar
  const handleDownloadCalendar = (booking: Booking) => {
    const startTime = new Date(booking.start_time)
    const endTime = new Date(booking.end_time)

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ITQuty//Meeting Room Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${booking.id}@itquty.local
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${booking.room?.name || 'Meeting Room'} - ${booking.purpose || 'Meeting'}
DESCRIPTION:${booking.purpose || 'Meeting'}\nRequester: ${booking.requester?.name || 'N/A'}\nAttendees: ${booking.attendees_count}
LOCATION:${booking.room?.name || 'N/A'}, Floor ${booking.room?.floor || 'N/A'}
ORGANIZER;CN=${booking.requester?.name || 'Organizer'}:mailto:${booking.requester?.email || 'unknown@example.com'}
${booking.participant_emails
        ? booking.participant_emails
          .split(',')
          .map((email) => `ATTENDEE:mailto:${email.trim()}`)
          .join('\n')
        : ''
      }
END:VEVENT
END:VCALENDAR`

    const element = document.createElement('a')
    element.setAttribute(
      'href',
      `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`,
    )
    element.setAttribute('download', `booking-${booking.id}.ics`)
    element.click()
  }

  // Handle export to CSV
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert('No bookings to export')
      return
    }

    const headers = [
      'Room Name',
      'Requester',
      'Email',
      'Start Time',
      'End Time',
      'Attendees',
      'Purpose',
      'Participants',
      'Status',
    ]

    const rows = filteredBookings.map((booking) => [
      booking.room?.name || '',
      booking.requester?.name || '',
      booking.requester?.email || '',
      new Date(booking.start_time).toLocaleString(),
      new Date(booking.end_time).toLocaleString(),
      booking.attendees_count,
      booking.purpose || '',
      booking.participant_emails || '',
      booking.status,
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

    const element = document.createElement('a')
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`)
    element.setAttribute('download', `bookings-${new Date().toISOString().split('T')[0]}.csv`)
    element.click()
  }

  // Get total pages
  const getTotalPages = Math.ceil(totalItems / pageSize)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          📅 Receptionist View - Approved Bookings
        </Typography>
        <Typography variant="body2" color="textSecondary">
          View all confirmed meeting room bookings and print/export booking details.
        </Typography>
      </Box>

      {/* View Mode Selection */}
      <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>View Mode</InputLabel>
                <Select
                  value={viewMode}
                  label="View Mode"
                  onChange={(e) => setViewMode(e.target.value as 'all' | 'today' | 'week')}
                >
                  <MenuItem value="all">All Bookings</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value)
                  setPage(1)
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
                label="Filter by Date"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Filter by room..."
                value={roomFilter}
                onChange={(e) => {
                  setRoomFilter(e.target.value)
                  setPage(1)
                }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={5}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchApprovedBookings}
                  size="small"
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => {
                    if (filteredBookings.length > 0) {
                      const printWindow = window.open('', '', 'width=900,height=600')
                      if (printWindow) {
                        let htmlContent = `<html><head><title>All Approved Bookings</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; }
                          table { width: 100%; border-collapse: collapse; font-size: 12px; }
                          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                          th { background-color: #f0f0f0; font-weight: bold; }
                          tr:nth-child(even) { background-color: #f9f9f9; }
                        </style></head><body>`
                        htmlContent += '<h2>All Approved Bookings</h2>'
                        htmlContent += '<table><thead><tr><th>Room</th><th>Requester</th><th>Date & Time</th><th>Attendees</th><th>Purpose</th></tr></thead><tbody>'

                        filteredBookings.forEach((booking) => {
                          htmlContent += `<tr>
                            <td>${booking.room?.name || 'N/A'}</td>
                            <td>${booking.requester?.name || 'N/A'}</td>
                            <td>${new Date(booking.start_time).toLocaleString()} - ${new Date(booking.end_time).toLocaleTimeString()}</td>
                            <td>${booking.attendees_count}</td>
                            <td>${booking.purpose || 'N/A'}</td>
                          </tr>`
                        })

                        htmlContent += '</tbody></table></body></html>'
                        printWindow.document.write(htmlContent)
                        printWindow.document.close()
                        printWindow.print()
                      }
                    }
                  }}
                  size="small"
                >
                  Print All
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                  size="small"
                >
                  Export CSV
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Bookings Table */}
      {!loading && filteredBookings.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>📍 Room</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>👤 Requester</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>📅 Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>👥 Attendees</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>📝 Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f9f9f9',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" />
                        {booking.room?.name || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{booking.requester?.name || 'N/A'}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {booking.requester?.email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(booking.start_time).toLocaleDateString()} {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        to {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" />
                        {booking.attendees_count}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {booking.purpose || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={booking.status} color="success" variant="outlined" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(booking)}
                          sx={{ fontSize: '0.7rem', padding: '4px 8px' }}
                        >
                          Details
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handlePrint(booking)}
                          startIcon={<PrintIcon fontSize="small" />}
                          sx={{ fontSize: '0.7rem', padding: '4px 8px' }}
                        >
                          Print
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDownloadCalendar(booking)}
                          startIcon={<DownloadIcon fontSize="small" />}
                          sx={{ fontSize: '0.7rem', padding: '4px 8px' }}
                        >
                          iCal
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={getTotalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Empty State */}
      {!loading && filteredBookings.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
            📭 No Approved Bookings
          </Typography>
          <Typography variant="body2" color="textSecondary">
            There are no confirmed bookings at the moment. Try adjusting your filters.
          </Typography>
        </Paper>
      )}

      {/* View Details Modal */}
      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>📋 Booking Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedBooking && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Meeting Room
              </Typography>
              <Typography variant="body2">{selectedBooking.room?.name || 'N/A'}</Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Requester
              </Typography>
              <Typography variant="body2">
                {selectedBooking.requester?.name || 'N/A'} ({selectedBooking.requester?.email || 'N/A'})
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Date & Time
              </Typography>
              <Typography variant="body2">
                {new Date(selectedBooking.start_time).toLocaleString()} -{' '}
                {new Date(selectedBooking.end_time).toLocaleTimeString()}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Attendees
              </Typography>
              <Typography variant="body2">{selectedBooking.attendees_count} people</Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Purpose
              </Typography>
              <Typography variant="body2">{selectedBooking.purpose || 'N/A'}</Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Participants (Email)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedBooking.participant_emails
                  ? selectedBooking.participant_emails.split(',').map((email, index) => (
                    <Chip
                      key={index}
                      label={email.trim()}
                      size="small"
                      variant="outlined"
                    />
                  ))
                  : <Typography variant="body2">None</Typography>}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Room Details
              </Typography>
              <Typography variant="body2">
                Capacity: {selectedBooking.room?.capacity || 'N/A'} | Floor:{' '}
                {selectedBooking.room?.floor || 'N/A'} | Equipment:{' '}
                {selectedBooking.room?.equipment || 'None'}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Status
              </Typography>
              <Chip label={selectedBooking.status} color="success" variant="outlined" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => selectedBooking && handleDownloadCalendar(selectedBooking)}
            startIcon={<DownloadIcon />}
          >
            Download iCal
          </Button>
          <Button
            onClick={() => selectedBooking && handlePrint(selectedBooking)}
            startIcon={<PrintIcon />}
          >
            Print
          </Button>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ReceptionistView
