import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
  Today as TodayIcon,
  ViewDay as ViewDayIcon,
  ViewModule as ViewModuleIcon,
  ViewWeek as ViewWeekIcon
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useCallback, useState } from 'react'
import { useBookings, useMeetingRooms } from '../../hooks/useMeetingRooms'
import { Booking } from '../../services/MeetingRoomService'
import BookingDialog from './BookingDialog'

type ViewMode = 'day' | 'week' | 'month'

interface CalendarEvent extends Booking {
  room_name?: string
  color?: string
}

const BookingCalendar: React.FC = () => {
  const { rooms, loading: roomsLoading, error: roomsError, fetchRooms } = useMeetingRooms(true)
  const { bookings, loading: bookingsLoading, error: bookingsError, fetchBookings } = useBookings(true)

  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedRoom, setSelectedRoom] = useState<number | 'all'>('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; hour: number } | null>(null)

  // Generate calendar dates based on view mode
  const getCalendarDates = useCallback((): Date[] => {
    const dates: Date[] = []
    const start = new Date(currentDate)

    if (viewMode === 'day') {
      dates.push(start)
    } else if (viewMode === 'week') {
      // Get Monday of the week
      const day = start.getDay()
      const diff = start.getDate() - day + (day === 0 ? -6 : 1)
      start.setDate(diff)
      for (let i = 0; i < 7; i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        dates.push(date)
      }
    } else {
      // Month view
      start.setDate(1)
      const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
      for (let i = 0; i < lastDay; i++) {
        const date = new Date(start)
        date.setDate(i + 1)
        dates.push(date)
      }
    }
    return dates
  }, [currentDate, viewMode])

  // Filter bookings by selected room and date range
  const getFilteredBookings = useCallback((): CalendarEvent[] => {
    const dates = getCalendarDates()
    const startDate = dates[0]
    const endDate = dates[dates.length - 1]

    return bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.start_time)
        const matchesRoom = selectedRoom === 'all' || booking.room_id === selectedRoom
        const matchesDate = bookingDate >= startDate && bookingDate <= endDate
        return matchesRoom && matchesDate && booking.status !== 'cancelled'
      })
      .map((booking) => ({
        ...booking,
        room_name: rooms.find((r) => r.id === booking.room_id)?.name,
        color: getStatusColor(booking.status),
      }))
  }, [bookings, rooms, selectedRoom, getCalendarDates])

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
      case 'checked_in':
        return '#4caf50'
      case 'pending':
        return '#ff9800'
      case 'rejected':
        return '#f44336'
      case 'checked_out':
        return '#9e9e9e'
      default:
        return '#2196f3'
    }
  }

  // Navigate calendar
  const navigatePrev = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get title based on view mode
  const getCalendarTitle = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    }
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } else if (viewMode === 'week') {
      const dates = getCalendarDates()
      const start = dates[0]
      const end = dates[dates.length - 1]
      return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('id-ID', options)}`
    } else {
      return currentDate.toLocaleDateString('id-ID', options)
    }
  }

  // Handle time slot click (create new booking)
  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedTimeSlot({ date, hour })
    setSelectedBooking(null)
    setOpenDialog(true)
  }

  // Handle booking click (view/edit booking)
  const handleBookingClick = (booking: CalendarEvent) => {
    setSelectedBooking(booking)
    setSelectedTimeSlot(null)
    setOpenDialog(true)
  }

  // Render time grid (day/week view)
  const renderTimeGrid = () => {
    const dates = getCalendarDates()
    const hours = Array.from({ length: 11 }, (_, i) => i + 8) // 08:00 - 18:00
    const filteredBookings = getFilteredBookings()

    return (
      <Paper sx={{ overflow: 'auto', maxHeight: '70vh' }}>
        <Box sx={{ minWidth: viewMode === 'week' ? '1200px' : '800px' }}>
          {/* Header */}
          <Grid container sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.100' }}>
            <Grid item xs={1} sx={{ p: 1, borderRight: 1, borderColor: 'divider' }}>
              <Typography variant="body2" align="center" fontWeight="bold">
                Time
              </Typography>
            </Grid>
            {dates.map((date, idx) => (
              <Grid
                key={idx}
                item
                xs={(11 / dates.length) as any}
                sx={{ p: 1, borderRight: idx < dates.length - 1 ? 1 : 0, borderColor: 'divider' }}
              >
                <Typography variant="body2" align="center" fontWeight="bold">
                  {date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Time slots */}
          {hours.map((hour) => (
            <Grid container key={hour} sx={{ borderBottom: 1, borderColor: 'divider', minHeight: '80px' }}>
              <Grid
                item
                xs={1}
                sx={{
                  p: 1,
                  borderRight: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {`${hour.toString().padStart(2, '0')}:00`}
                </Typography>
              </Grid>
              {dates.map((date, idx) => {
                const cellBookings = filteredBookings.filter((booking) => {
                  const bookingDate = new Date(booking.start_time)
                  const bookingHour = bookingDate.getHours()
                  return (
                    bookingDate.toDateString() === date.toDateString() &&
                    bookingHour <= hour &&
                    new Date(booking.end_time).getHours() > hour
                  )
                })

                return (
                  <Grid
                    key={idx}
                    item
                    xs={(11 / dates.length) as any}
                    sx={{
                      p: 0.5,
                      borderRight: idx < dates.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      position: 'relative',
                    }}
                    onClick={() => handleTimeSlotClick(date, hour)}
                  >
                    {cellBookings.map((booking) => (
                      <Tooltip
                        key={booking.id}
                        title={
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {booking.title}
                            </Typography>
                            <Typography variant="caption">Room: {booking.room_name}</Typography>
                            <br />
                            <Typography variant="caption">
                              {new Date(booking.start_time).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -{' '}
                              {new Date(booking.end_time).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                          </Box>
                        }
                      >
                        <Card
                          sx={{
                            bgcolor: booking.color,
                            color: 'white',
                            mb: 0.5,
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 },
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookingClick(booking)
                          }}
                        >
                          <CardContent sx={{ p: 0.5, '&:last-child': { pb: 0.5 } }}>
                            <Typography variant="caption" noWrap fontWeight="bold">
                              {booking.title}
                            </Typography>
                            {viewMode === 'day' && (
                              <Typography variant="caption" display="block" noWrap>
                                {booking.room_name}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Tooltip>
                    ))}
                  </Grid>
                )
              })}
            </Grid>
          ))}
        </Box>
      </Paper>
    )
  }

  // Render month grid
  const renderMonthGrid = () => {
    const dates = getCalendarDates()
    const filteredBookings = getFilteredBookings()

    return (
      <Grid container spacing={1}>
        {dates.map((date, idx) => {
          const dayBookings = filteredBookings.filter(
            (booking) => new Date(booking.start_time).toDateString() === date.toDateString()
          )

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
              <Card
                sx={{
                  height: '150px',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  bgcolor: date.toDateString() === new Date().toDateString() ? 'primary.50' : 'white',
                }}
                onClick={() => {
                  setCurrentDate(date)
                  setViewMode('day')
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {date.getDate()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    {date.toLocaleDateString('id-ID', { weekday: 'long' })}
                  </Typography>
                  <Stack spacing={0.5} sx={{ maxHeight: '80px', overflow: 'auto' }}>
                    {dayBookings.map((booking) => (
                      <Chip
                        key={booking.id}
                        label={booking.title}
                        size="small"
                        sx={{ bgcolor: booking.color, color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookingClick(booking)
                        }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    )
  }

  const loading = roomsLoading || bookingsLoading
  const error = roomsError || bookingsError

  if (loading && rooms.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">Meeting Room Calendar</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            New Booking
          </Button>
        </Box>

        {error && (
          <Alert severity="error" action={<Button onClick={() => { fetchRooms(); fetchBookings(); }}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {/* Controls */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={2}>
            {/* View Mode Toggle */}
            <ToggleButtonGroup value={viewMode} exclusive onChange={(_, value) => value && setViewMode(value)} size="small">
              <ToggleButton value="day">
                <ViewDayIcon fontSize="small" sx={{ mr: 0.5 }} />
                Day
              </ToggleButton>
              <ToggleButton value="week">
                <ViewWeekIcon fontSize="small" sx={{ mr: 0.5 }} />
                Week
              </ToggleButton>
              <ToggleButton value="month">
                <ViewModuleIcon fontSize="small" sx={{ mr: 0.5 }} />
                Month
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={navigatePrev} size="small">
                <ChevronLeftIcon />
              </IconButton>
              <Button variant="outlined" startIcon={<TodayIcon />} onClick={goToToday} size="small">
                Today
              </Button>
              <IconButton onClick={navigateNext} size="small">
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Calendar Title */}
            <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
              {getCalendarTitle()}
            </Typography>

            {/* Room Filter */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Room</InputLabel>
              <Select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value as number | 'all')} label="Filter by Room">
                <MenuItem value="all">All Rooms</MenuItem>
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Refresh Button */}
            <IconButton onClick={() => { fetchRooms(); fetchBookings(); }} size="small">
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Paper>

        {/* Calendar Grid */}
        {viewMode === 'month' ? renderMonthGrid() : renderTimeGrid()}

        {/* Legend */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Status Legend:
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip label="Approved" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
            <Chip label="Pending" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
            <Chip label="Rejected" size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
            <Chip label="Checked Out" size="small" sx={{ bgcolor: '#9e9e9e', color: 'white' }} />
          </Stack>
        </Paper>
      </Stack>

      {/* Booking Dialog */}
      <BookingDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false)
          setSelectedBooking(null)
          setSelectedTimeSlot(null)
        }}
        booking={selectedBooking}
        initialDate={selectedTimeSlot?.date}
        initialHour={selectedTimeSlot?.hour}
        rooms={rooms}
        onSuccess={() => {
          fetchBookings()
          setOpenDialog(false)
          setSelectedBooking(null)
          setSelectedTimeSlot(null)
        }}
      />
    </Box>
  )
}

export default BookingCalendar
