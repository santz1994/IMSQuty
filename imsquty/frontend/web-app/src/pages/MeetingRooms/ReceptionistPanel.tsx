import {
  Block,
  CheckCircle,
  EventAvailable,
  MeetingRoom,
  PersonAdd,
  Schedule,
  Warning,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material'
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { add, format, isToday, parseISO } from 'date-fns'
import id from 'date-fns/locale/id'
import React, { useCallback, useEffect, useState } from 'react'
import { useMeetingRoomsWithBookings } from '../../hooks/useMeetingRooms'
import meetingRoomService, { CreateBookingData } from '../../services/MeetingRoomService'

/**
 * RECEPTIONIST PANEL
 * Quick booking interface for front desk staff
 * Features:
 * - Quick walk-in booking
 * - Today's schedule overview
 * - Room status management
 * - Emergency actions
 */

interface QuickBookingForm {
  room_id: number | ''
  guest_name: string
  contact_number: string
  start_time: Date | null
  duration: number // in hours
  attendees: number
}

const ReceptionistPanel: React.FC = () => {
  const { rooms, bookings, loading, fetchRooms, fetchBookings } = useMeetingRoomsWithBookings()
  const [selectedDate] = useState(new Date())
  const [quickBookingOpen, setQuickBookingOpen] = useState(false)
  const [blockRoomOpen, setBlockRoomOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')

  const [formData, setFormData] = useState<QuickBookingForm>({
    room_id: '',
    guest_name: '',
    contact_number: '',
    start_time: null,
    duration: 1,
    attendees: 1,
  })

  const [selectedRoomForBlock, setSelectedRoomForBlock] = useState<number | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchRooms()
    fetchBookings()
  }, [fetchRooms, fetchBookings])

  // Get today's bookings sorted by time
  const todaysBookings = bookings
    .filter((b) => isToday(parseISO(b.start_time)))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  // Get current bookings (happening now)
  const currentBookings = todaysBookings.filter((b) => {
    const now = new Date()
    const start = parseISO(b.start_time)
    const end = parseISO(b.end_time)
    return now >= start && now <= end && b.status === 'approved'
  })

  // Get upcoming bookings (next 2 hours)
  const upcomingBookings = todaysBookings.filter((b) => {
    const now = new Date()
    const start = parseISO(b.start_time)
    const twoHoursLater = add(now, { hours: 2 })
    return start > now && start <= twoHoursLater && b.status === 'approved'
  })

  // Check room availability right now
  const getAvailableRooms = useCallback(() => {
    return rooms.filter((room) => {
      const hasCurrentBooking = currentBookings.some((b) => b.room_id === room.id)
      return !hasCurrentBooking
    })
  }, [rooms, currentBookings])

  // Quick booking submission
  const handleQuickBooking = async () => {
    try {
      if (!formData.room_id || !formData.guest_name || !formData.start_time) {
        setErrorMessage('Please fill all required fields')
        return
      }

      const endTime = add(formData.start_time, { hours: formData.duration })

      const bookingData: CreateBookingData = {
        room_id: formData.room_id as number,
        title: `Walk-in: ${formData.guest_name}`,
        description: `Contact: ${formData.contact_number}\nWalk-in booking by receptionist`,
        start_time: formData.start_time.toISOString(),
        end_time: endTime.toISOString(),
        attendees: formData.attendees,
        purpose: 'Walk-in',
      }

      const response = await meetingRoomService.createBooking(bookingData)

      if (response.success) {
        setSuccessMessage('Walk-in booking created successfully!')
        setQuickBookingOpen(false)
        fetchBookings()
        // Reset form
        setFormData({
          room_id: '',
          guest_name: '',
          contact_number: '',
          start_time: null,
          duration: 1,
          attendees: 1,
        })
      } else {
        setErrorMessage(response.message || 'Failed to create booking')
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating booking')
      console.error(error)
    }
  }

  // Block room for maintenance
  const handleBlockRoom = async () => {
    if (!selectedRoomForBlock || !blockReason.trim()) {
      setErrorMessage('Please select room and provide reason')
      return
    }

    try {
      // Create blocking booking (6 hours from now)
      const now = new Date()
      const bookingData: CreateBookingData = {
        room_id: selectedRoomForBlock,
        title: 'ROOM BLOCKED - Maintenance',
        description: `Reason: ${blockReason}\nBlocked by: Receptionist`,
        start_time: now.toISOString(),
        end_time: add(now, { hours: 6 }).toISOString(),
        attendees: 0,
        purpose: 'Maintenance',
      }

      const response = await meetingRoomService.createBooking(bookingData)

      if (response.success) {
        setSuccessMessage('Room blocked successfully!')
        setBlockRoomOpen(false)
        setSelectedRoomForBlock(null)
        setBlockReason('')
        fetchBookings()
      } else {
        setErrorMessage(response.message || 'Failed to block room')
      }
    } catch (error) {
      setErrorMessage('An error occurred')
      console.error(error)
    }
  }

  const availableRooms = getAvailableRooms()

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            <MeetingRoom sx={{ mr: 1, verticalAlign: 'middle' }} />
            Receptionist Panel
          </Typography>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
          >
            <ToggleButton value="overview">Overview</ToggleButton>
            <ToggleButton value="detailed">Detailed</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<PersonAdd />}
              onClick={() => setQuickBookingOpen(true)}
              sx={{ py: 2 }}
            >
              Quick Walk-in Booking
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              color="error"
              size="large"
              fullWidth
              startIcon={<Block />}
              onClick={() => setBlockRoomOpen(true)}
              sx={{ py: 2 }}
            >
              Block Room (Maintenance)
            </Button>
          </Grid>
        </Grid>

        {/* Room Status Overview */}
        <Grid container spacing={3}>
          {/* Available Rooms */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                avatar={<CheckCircle color="success" />}
                title={`Available Now (${availableRooms.length})`}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <List dense>
                  {availableRooms.length === 0 ? (
                    <Typography color="text.secondary">No rooms available</Typography>
                  ) : (
                    availableRooms.map((room) => (
                      <ListItem key={room.id}>
                        <ListItemText
                          primary={room.name}
                          secondary={`Capacity: ${room.capacity} people`}
                        />
                        <Chip label="FREE" color="success" size="small" />
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Current Bookings */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                avatar={<EventAvailable color="primary" />}
                title={`In Use Now (${currentBookings.length})`}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <List dense>
                  {currentBookings.length === 0 ? (
                    <Typography color="text.secondary">No current bookings</Typography>
                  ) : (
                    currentBookings.map((booking) => {
                      const room = rooms.find((r) => r.id === booking.room_id)
                      return (
                        <ListItem key={booking.id}>
                          <ListItemText
                            primary={room?.name || 'Unknown Room'}
                            secondary={`${booking.title} - Until ${format(parseISO(booking.end_time), 'HH:mm')}`}
                          />
                          <Chip label="IN USE" color="primary" size="small" />
                        </ListItem>
                      )
                    })
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Bookings */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                avatar={<Schedule color="warning" />}
                title={`Upcoming (2h) (${upcomingBookings.length})`}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <List dense>
                  {upcomingBookings.length === 0 ? (
                    <Typography color="text.secondary">No upcoming bookings</Typography>
                  ) : (
                    upcomingBookings.map((booking) => {
                      const room = rooms.find((r) => r.id === booking.room_id)
                      return (
                        <ListItem key={booking.id}>
                          <ListItemText
                            primary={room?.name || 'Unknown Room'}
                            secondary={`${booking.title} - ${format(parseISO(booking.start_time), 'HH:mm')}`}
                          />
                          <Chip
                            label={format(parseISO(booking.start_time), 'HH:mm')}
                            color="warning"
                            size="small"
                          />
                        </ListItem>
                      )
                    })
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Full Schedule */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title={`Today's Schedule (${format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id })})`} />
              <Divider />
              <CardContent>
                {todaysBookings.length === 0 ? (
                  <Typography color="text.secondary">No bookings for today</Typography>
                ) : (
                  <Stack spacing={1}>
                    {todaysBookings.map((booking) => {
                      const room = rooms.find((r) => r.id === booking.room_id)
                      const statusColor =
                        booking.status === 'approved'
                          ? 'success'
                          : booking.status === 'pending'
                            ? 'warning'
                            : 'error'

                      return (
                        <Paper key={booking.id} sx={{ p: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                {format(parseISO(booking.start_time), 'HH:mm')} -{' '}
                                {format(parseISO(booking.end_time), 'HH:mm')}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="subtitle1">{room?.name || 'Unknown'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2">{booking.title}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {booking.attendees} attendees
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <Chip
                                label={booking.status.toUpperCase()}
                                color={statusColor}
                                size="small"
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      )
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Booking Dialog */}
        <Dialog open={quickBookingOpen} onClose={() => setQuickBookingOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <PersonAdd sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quick Walk-in Booking
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Meeting Room *</InputLabel>
                <Select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value as number })}
                  label="Meeting Room *"
                >
                  {availableRooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name} (Capacity: {room.capacity})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Guest Name *"
                fullWidth
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              />

              <TextField
                label="Contact Number"
                fullWidth
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              />

              <DateTimePicker
                label="Start Time *"
                value={formData.start_time}
                onChange={(date) => setFormData({ ...formData, start_time: date })}
                ampm={false}
                minDateTime={new Date()}
              />

              <FormControl fullWidth>
                <InputLabel>Duration (hours) *</InputLabel>
                <Select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value as number })}
                  label="Duration (hours) *"
                >
                  {[1, 2, 3, 4, 6, 8].map((hour) => (
                    <MenuItem key={hour} value={hour}>
                      {hour} hour{hour > 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Number of Attendees *"
                type="number"
                fullWidth
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQuickBookingOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleQuickBooking}>
              Create Booking
            </Button>
          </DialogActions>
        </Dialog>

        {/* Block Room Dialog */}
        <Dialog open={blockRoomOpen} onClose={() => setBlockRoomOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Block sx={{ mr: 1, verticalAlign: 'middle' }} color="error" />
            Block Room for Maintenance
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="warning">
                <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                This will block the room for 6 hours
              </Alert>

              <FormControl fullWidth>
                <InputLabel>Select Room *</InputLabel>
                <Select
                  value={selectedRoomForBlock || ''}
                  onChange={(e) => setSelectedRoomForBlock(e.target.value as number)}
                  label="Select Room *"
                >
                  {rooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Reason for Blocking *"
                fullWidth
                multiline
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., AC maintenance, cleaning, repair..."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBlockRoomOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleBlockRoom}>
              Block Room
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}

export default ReceptionistPanel
