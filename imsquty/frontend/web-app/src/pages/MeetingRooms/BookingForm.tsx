import {
  AccessTime,
  Description,
  Email,
  MeetingRoom,
  People
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
  FormControl,
  FormHelperText,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

interface MeetingRoom {
  id: number
  name: string
  capacity: number
  floor: string
  equipment: string
}

interface ConflictWarning {
  hasConflict: boolean
  message?: string
  conflicts?: Array<{
    id: number
    title: string
    startTime: string
    endTime: string
  }>
}

const BookingForm: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

  // Form state
  const [formData, setFormData] = useState({
    room_id: '',
    start_time: '',
    end_time: '',
    purpose: '',
    attendees_count: 1,
    participant_emails: '',
  })

  const [participantEmailList, setParticipantEmailList] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState<MeetingRoom[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [conflictWarning, setConflictWarning] = useState<ConflictWarning | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [successDialog, setSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch meeting rooms on component mount
  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setRoomsLoading(true)
      const response = await axios.get(`${API_BASE}/api/v1/meeting-rooms`)
      setRooms(response.data.data || response.data || [])
    } catch (error) {
      console.error('Failed to fetch meeting rooms:', error)
      setErrors({ general: 'Failed to load meeting rooms. Please try again.' })
    } finally {
      setRoomsLoading(false)
    }
  }

  // Check for conflicts when room, start_time, or end_time changes
  useEffect(() => {
    if (formData.room_id && formData.start_time && formData.end_time) {
      checkAvailability()
    }
  }, [formData.room_id, formData.start_time, formData.end_time])

  const checkAvailability = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/v1/availability/check`,
        {
          room_id: formData.room_id,
          start_time: formData.start_time,
          end_time: formData.end_time,
        }
      )

      if (response.data.available) {
        setConflictWarning(null)
      } else {
        setConflictWarning({
          hasConflict: true,
          message: response.data.message || 'This time slot has conflicts with existing bookings',
          conflicts: response.data.conflicts,
        })
      }
    } catch (error) {
      console.error('Failed to check availability:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleAddEmail = () => {
    if (!emailInput.trim()) return

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailInput.trim())) {
      setErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email address',
      }))
      return
    }

    // Check for duplicates
    if (participantEmailList.includes(emailInput.trim())) {
      setErrors((prev) => ({
        ...prev,
        email: 'This email is already added',
      }))
      return
    }

    setParticipantEmailList((prev) => [...prev, emailInput.trim()])
    setEmailInput('')
    setErrors((prev) => ({
      ...prev,
      email: '',
    }))
  }

  const handleRemoveEmail = (email: string) => {
    setParticipantEmailList((prev) => prev.filter((e) => e !== email))
  }

  const handleAttendeeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 1)
    setFormData((prev) => ({
      ...prev,
      attendees_count: value,
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.room_id) newErrors.room_id = 'Meeting room is required'
    if (!formData.start_time) newErrors.start_time = 'Start time is required'
    if (!formData.end_time) newErrors.end_time = 'End time is required'
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required'

    // Check if end time is after start time
    if (formData.start_time && formData.end_time) {
      const startTime = new Date(formData.start_time)
      const endTime = new Date(formData.end_time)
      if (endTime <= startTime) {
        newErrors.end_time = 'End time must be after start time'
      }
      // Check if at least 30 minutes
      const diffMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      if (diffMinutes < 30) {
        newErrors.end_time = 'Booking must be at least 30 minutes'
      }
    }

    if (conflictWarning?.hasConflict) {
      newErrors.conflict = 'This time slot has conflicts. Please choose a different time.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSubmitLoading(true)

      const bookingData = {
        room_id: parseInt(formData.room_id),
        start_time: formData.start_time,
        end_time: formData.end_time,
        purpose: formData.purpose,
        attendees_count: formData.attendees_count,
        participant_emails: participantEmailList,
      }

      const response = await axios.post(
        `${API_BASE}/api/v1/bookings`,
        bookingData
      )

      setSuccessMessage(
        `Booking created successfully! Confirmation emails have been sent to ${participantEmailList.length} participants.`
      )
      setSuccessDialog(true)

      // Reset form
      setFormData({
        room_id: '',
        start_time: '',
        end_time: '',
        purpose: '',
        attendees_count: 1,
        participant_emails: '',
      })
      setParticipantEmailList([])
      setEmailInput('')
      setErrors({})
      setConflictWarning(null)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to create booking. Please try again.'
      setErrors({ general: errorMessage })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setSuccessDialog(false)
    navigate('/meeting-room-bookings')
  }

  const selectedRoom = rooms.find((r) => r.id === parseInt(formData.room_id))
  const now = new Date().toISOString().slice(0, 16)

  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto' }}>
      <Card>
        <CardHeader
          title="Create Meeting Room Booking"
          subheader="Request a meeting room and invite participants"
        />
        <CardContent>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.general}
            </Alert>
          )}

          {conflictWarning?.hasConflict && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                ⚠️ Time Slot Conflict
              </Typography>
              <Typography variant="body2">{conflictWarning.message}</Typography>
              {conflictWarning.conflicts && conflictWarning.conflicts.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                    Existing bookings:
                  </Typography>
                  {conflictWarning.conflicts.map((conflict) => (
                    <Typography key={conflict.id} variant="caption" sx={{ display: 'block', ml: 1 }}>
                      • {conflict.title}: {conflict.startTime} - {conflict.endTime}
                    </Typography>
                  ))}
                </Box>
              )}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Meeting Room Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.room_id}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    <MeetingRoom sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Meeting Room *
                  </Typography>
                  <select
                    name="room_id"
                    value={formData.room_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        room_id: e.target.value,
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '4px',
                      border: `1px solid ${errors.room_id ? '#d32f2f' : '#bdbdbd'}`,
                      fontFamily: 'inherit',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">-- Select a room --</option>
                    {roomsLoading ? (
                      <option disabled>Loading rooms...</option>
                    ) : (
                      rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} (Capacity: {room.capacity}, Floor: {room.floor})
                        </option>
                      ))
                    )}
                  </select>
                  {errors.room_id && <FormHelperText>{errors.room_id}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Attendees Count */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Number of Attendees
                  </Typography>
                  <TextField
                    type="number"
                    name="attendees_count"
                    value={formData.attendees_count}
                    onChange={handleAttendeeCountChange}
                    inputProps={{ min: 1, max: 1000 }}
                    size="small"
                  />
                </FormControl>
              </Grid>

              {/* Room Details Display */}
              {selectedRoom && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'info.light', border: '1px solid', borderColor: 'info.main' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Selected Room Details:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">
                          Capacity
                        </Typography>
                        <Typography variant="body2">{selectedRoom.capacity} people</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">
                          Floor
                        </Typography>
                        <Typography variant="body2">{selectedRoom.floor}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="textSecondary">
                          Equipment
                        </Typography>
                        <Typography variant="body2">{selectedRoom.equipment || 'None specified'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Start Time */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.start_time}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Start Date & Time *
                  </Typography>
                  <TextField
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    inputProps={{ min: now }}
                    size="small"
                    fullWidth
                  />
                  {errors.start_time && <FormHelperText>{errors.start_time}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* End Time */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.end_time}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                    End Date & Time *
                  </Typography>
                  <TextField
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    inputProps={{ min: now }}
                    size="small"
                    fullWidth
                  />
                  {errors.end_time && <FormHelperText>{errors.end_time}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Purpose */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.purpose}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Meeting Purpose *
                  </Typography>
                  <TextField
                    multiline
                    rows={3}
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    placeholder="e.g., Team standup, Client presentation, Training session"
                    size="small"
                    fullWidth
                  />
                  {errors.purpose && <FormHelperText>{errors.purpose}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Participant Emails */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Participant Emails (Optional)
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                  Add email addresses of participants. They will receive booking confirmation with calendar invite.
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value)
                      if (errors.email) {
                        setErrors((prev) => ({
                          ...prev,
                          email: '',
                        }))
                      }
                    }}
                    placeholder="participant@example.com"
                    size="small"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddEmail()
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddEmail}
                    disabled={!emailInput.trim()}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Add Email
                  </Button>
                </Box>

                {/* Participant Email Tags */}
                {participantEmailList.length > 0 && (
                  <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {participantEmailList.map((email) => (
                        <Chip
                          key={email}
                          label={email}
                          onDelete={() => handleRemoveEmail(email)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                      {participantEmailList.length} participant(s) will receive confirmation emails
                    </Typography>
                  </Paper>
                )}
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/meeting-room-bookings')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={submitLoading || conflictWarning?.hasConflict}
                    startIcon={submitLoading ? <CircularProgress size={20} /> : null}
                  >
                    {submitLoading ? 'Creating...' : 'Create Booking'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={handleSuccessClose} maxWidth="sm" fullWidth>
        <DialogTitle>✅ Booking Created Successfully</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
            <Typography variant="body2" color="textSecondary">
              You can view and manage your bookings from the "My Bookings" section.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessClose} variant="contained">
            View My Bookings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BookingForm
