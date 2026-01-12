import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
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
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import id from 'date-fns/locale/id'
import React, { useCallback, useEffect, useState } from 'react'
import meetingRoomService, { Booking, CreateBookingData, MeetingRoom } from '../../services/MeetingRoomService'

interface BookingDialogProps {
  open: boolean
  onClose: () => void
  booking?: Booking | null
  initialDate?: Date
  initialHour?: number
  rooms: MeetingRoom[]
  onSuccess: () => void
}

interface FormData {
  room_id: number | ''
  title: string
  description: string
  start_time: Date | null
  end_time: Date | null
  attendees: number | ''
  purpose: string
}

interface ValidationErrors {
  room_id?: string
  title?: string
  start_time?: string
  end_time?: string
  attendees?: string
}

const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onClose,
  booking,
  initialDate,
  initialHour,
  rooms,
  onSuccess,
}) => {
  const isEditMode = Boolean(booking)

  const [formData, setFormData] = useState<FormData>({
    room_id: '',
    title: '',
    description: '',
    start_time: null,
    end_time: null,
    attendees: '',
    purpose: '',
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Initialize form data
  useEffect(() => {
    if (booking) {
      // Edit mode
      setFormData({
        room_id: booking.room_id,
        title: booking.title,
        description: booking.description || '',
        start_time: new Date(booking.start_time),
        end_time: new Date(booking.end_time),
        attendees: booking.attendees,
        purpose: booking.purpose || '',
      })
    } else if (initialDate && initialHour !== undefined) {
      // Create mode with pre-selected time slot
      const startTime = new Date(initialDate)
      startTime.setHours(initialHour, 0, 0, 0)
      const endTime = new Date(startTime)
      endTime.setHours(initialHour + 1, 0, 0, 0)

      setFormData({
        room_id: '',
        title: '',
        description: '',
        start_time: startTime,
        end_time: endTime,
        attendees: '',
        purpose: '',
      })
    } else {
      // Create mode without pre-selected time
      const now = new Date()
      const startTime = new Date(now)
      startTime.setHours(now.getHours() + 1, 0, 0, 0)
      const endTime = new Date(startTime)
      endTime.setHours(startTime.getHours() + 1, 0, 0, 0)

      setFormData({
        room_id: '',
        title: '',
        description: '',
        start_time: startTime,
        end_time: endTime,
        attendees: '',
        purpose: '',
      })
    }
  }, [booking, initialDate, initialHour, open])

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.room_id) {
      newErrors.room_id = 'Please select a meeting room'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required'
    } else {
      const now = new Date()
      const minBookingTime = new Date(now)
      minBookingTime.setHours(now.getHours() + 1)

      if (!isEditMode && formData.start_time < minBookingTime) {
        newErrors.start_time = 'Start time must be at least 1 hour from now'
      }

      const startHour = formData.start_time.getHours()
      if (startHour < 8 || startHour >= 18) {
        newErrors.start_time = 'Booking hours: 08:00 - 18:00'
      }
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required'
    } else if (formData.start_time && formData.end_time <= formData.start_time) {
      newErrors.end_time = 'End time must be after start time'
    } else {
      const duration = (formData.end_time.getTime() - (formData.start_time?.getTime() || 0)) / (1000 * 60 * 60)
      if (duration < 1) {
        newErrors.end_time = 'Minimum booking duration: 1 hour'
      } else if (duration > 8) {
        newErrors.end_time = 'Maximum booking duration: 8 hours'
      }

      const endHour = formData.end_time.getHours()
      if (endHour > 18) {
        newErrors.end_time = 'Booking must end by 18:00'
      }
    }

    if (!formData.attendees || formData.attendees < 1) {
      newErrors.attendees = 'Number of attendees is required (min: 1)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, isEditMode])

  // Check availability
  const checkAvailability = useCallback(async () => {
    if (!formData.room_id || !formData.start_time || !formData.end_time) return

    setCheckingAvailability(true)
    setAvailabilityError(null)
    setAvailabilityMessage(null)

    try {
      const response = await meetingRoomService.checkAvailability({
        room_id: formData.room_id as number,
        start_time: formData.start_time.toISOString(),
        end_time: formData.end_time.toISOString(),
      })

      if (response.success && response.data) {
        if (response.data.available) {
          setAvailabilityMessage('✓ Room is available for selected time')
        } else {
          setAvailabilityError('Room is not available. Please choose another time or room.')
        }
      }
    } catch (error: any) {
      setAvailabilityError(error.message || 'Failed to check availability')
    } finally {
      setCheckingAvailability(false)
    }
  }, [formData.room_id, formData.start_time, formData.end_time])

  // Auto-check availability when room or time changes
  useEffect(() => {
    if (formData.room_id && formData.start_time && formData.end_time) {
      const timer = setTimeout(() => {
        checkAvailability()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [formData.room_id, formData.start_time, formData.end_time, checkAvailability])

  // Handle form submit
  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    setSuccessMessage(null)

    try {
      const bookingData: CreateBookingData = {
        room_id: formData.room_id as number,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        start_time: formData.start_time!.toISOString(),
        end_time: formData.end_time!.toISOString(),
        attendees: formData.attendees as number,
        purpose: formData.purpose.trim() || undefined,
      }

      let response
      if (isEditMode) {
        response = await meetingRoomService.updateBooking(booking!.id, bookingData)
      } else {
        response = await meetingRoomService.createBooking(bookingData)
      }

      if (response.success) {
        setSuccessMessage(isEditMode ? 'Booking updated successfully!' : 'Booking created successfully!')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else {
        setAvailabilityError(response.message || 'Failed to save booking')
      }
    } catch (error: any) {
      setAvailabilityError(error.message || 'An error occurred while saving booking')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!booking) return

    if (!confirm('Are you sure you want to cancel this booking?')) return

    setLoading(true)
    try {
      const response = await meetingRoomService.cancelBooking(booking.id)
      if (response.success) {
        setSuccessMessage('Booking cancelled successfully!')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else {
        setAvailabilityError(response.message || 'Failed to cancel booking')
      }
    } catch (error: any) {
      setAvailabilityError(error.message || 'An error occurred while cancelling booking')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setErrors({})
      setAvailabilityError(null)
      setAvailabilityMessage(null)
      setSuccessMessage(null)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon color="primary" />
            <Typography variant="h6">{isEditMode ? 'Edit Booking' : 'New Booking'}</Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
        {booking && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label={booking.status.toUpperCase()}
              size="small"
              color={
                booking.status === 'approved'
                  ? 'success'
                  : booking.status === 'pending'
                    ? 'warning'
                    : booking.status === 'rejected'
                      ? 'error'
                      : 'default'
              }
            />
          </Box>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {availabilityError && (
          <Alert severity="error" sx={{ mb: 2 }} icon={<WarningIcon />}>
            {availabilityError}
          </Alert>
        )}

        {availabilityMessage && !availabilityError && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {availabilityMessage}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              {/* Room Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth error={Boolean(errors.room_id)}>
                  <InputLabel>Meeting Room *</InputLabel>
                  <Select
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value as number })}
                    label="Meeting Room *"
                    disabled={loading}
                  >
                    {rooms.map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {room.name} (Capacity: {room.capacity})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.room_id && <FormHelperText>{errors.room_id}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  label="Meeting Title *"
                  fullWidth
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={Boolean(errors.title)}
                  helperText={errors.title || `${formData.title.length}/200 characters`}
                  disabled={loading}
                />
              </Grid>

              {/* Start Time */}
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Start Time *"
                  value={formData.start_time}
                  onChange={(value) => setFormData({ ...formData, start_time: value })}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.start_time),
                      helperText: errors.start_time,
                    },
                  }}
                />
              </Grid>

              {/* End Time */}
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="End Time *"
                  value={formData.end_time}
                  onChange={(value) => setFormData({ ...formData, end_time: value })}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.end_time),
                      helperText: errors.end_time,
                    },
                  }}
                />
              </Grid>

              {/* Attendees */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Number of Attendees *"
                  type="number"
                  fullWidth
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || '' })}
                  error={Boolean(errors.attendees)}
                  helperText={errors.attendees}
                  disabled={loading}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              {/* Purpose */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Purpose"
                  fullWidth
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  disabled={loading}
                  placeholder="e.g., Team meeting, Client presentation"
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                  placeholder="Additional notes, agenda, special requirements..."
                />
              </Grid>
            </Grid>

            {/* Availability Check Status */}
            {checkingAvailability && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Checking availability...
                </Typography>
              </Box>
            )}
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {isEditMode && booking?.status === 'pending' && (
          <Button
            onClick={handleDelete}
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            disabled={loading}
            sx={{ mr: 'auto' }}
          >
            Cancel Booking
          </Button>
        )}
        <Button onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading || checkingAvailability || Boolean(availabilityError)}
        >
          {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BookingDialog
