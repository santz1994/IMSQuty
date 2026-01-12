import { CheckCircle, Event, People, Schedule } from '@mui/icons-material'
import { Box, Card, CardContent, Chip, Grid, Paper, Typography } from '@mui/material'
import { format, isAfter, isBefore, isWithinInterval, parseISO } from 'date-fns'
import id from 'date-fns/locale/id'
import React, { useEffect, useState } from 'react'
import { useMeetingRoomsWithBookings } from '../../hooks/useMeetingRooms'

/**
 * LCD DISPLAY DASHBOARD
 * Large screen display for meeting room status outside each room
 * Features:
 * - Current room status (Available/In Use/Reserved Soon)
 * - Current/Next booking info
 * - Real-time clock
 * - Today's schedule
 * - Optimized for landscape LCD displays (1920x1080)
 */

interface RoomLCDDisplayProps {
  roomId: number // Specific room for this LCD
  autoRefresh?: number // Auto-refresh interval in seconds (default: 30s)
}

const RoomLCDDisplay: React.FC<RoomLCDDisplayProps> = ({ roomId, autoRefresh = 30 }) => {
  const { rooms, bookings, fetchRooms, fetchBookings } = useMeetingRoomsWithBookings()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Auto refresh data
  useEffect(() => {
    fetchRooms()
    fetchBookings()

    const interval = setInterval(() => {
      fetchBookings()
    }, autoRefresh * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchRooms, fetchBookings])

  // Update clock every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(clockInterval)
  }, [])

  const room = rooms.find((r) => r.id === roomId)

  // Get today's bookings for this room
  const todaysBookings = bookings
    .filter((b) => b.room_id === roomId)
    .filter((b) => {
      const bookingDate = parseISO(b.start_time)
      return format(bookingDate, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd')
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  // Get current booking (happening right now)
  const currentBooking = todaysBookings.find((b) => {
    const start = parseISO(b.start_time)
    const end = parseISO(b.end_time)
    return isWithinInterval(currentTime, { start, end }) && b.status === 'approved'
  })

  // Get next booking
  const nextBooking = todaysBookings.find((b) => {
    const start = parseISO(b.start_time)
    return isAfter(start, currentTime) && b.status === 'approved'
  })

  // Determine room status
  let status: 'available' | 'in-use' | 'reserved-soon' = 'available'
  let statusColor = '#4caf50' // Green
  let statusText = 'TERSEDIA'

  if (currentBooking) {
    status = 'in-use'
    statusColor = '#f44336' // Red
    statusText = 'SEDANG DIGUNAKAN'
  } else if (nextBooking) {
    const nextStart = parseISO(nextBooking.start_time)
    const minutesUntilNext = Math.floor((nextStart.getTime() - currentTime.getTime()) / 1000 / 60)

    if (minutesUntilNext <= 15) {
      status = 'reserved-soon'
      statusColor = '#ff9800' // Orange
      statusText = 'AKAN DIGUNAKAN SEGERA'
    }
  }

  if (!room) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
        }}
      >
        <Typography variant="h3" color="error">
          Room not found
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header - Room Name & Clock */}
      <Paper
        sx={{
          bgcolor: '#1a1a1a',
          color: '#fff',
          p: 4,
          borderRadius: 0,
          borderBottom: `8px solid ${statusColor}`,
        }}
        elevation={3}
      >
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item xs={8}>
            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {room.name}
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.8 }}>
              Kapasitas: {room.capacity} Orang | Lantai {room.floor || 1}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'right' }}>
            <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
              {format(currentTime, 'HH:mm:ss')}
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.8 }}>
              {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Status Display */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: statusColor,
          p: 6,
          transition: 'background-color 0.5s ease',
        }}
      >
        {/* Status Icon */}
        <Box sx={{ mb: 4 }}>
          {status === 'available' && <CheckCircle sx={{ fontSize: 180, color: '#fff' }} />}
          {status === 'in-use' && <People sx={{ fontSize: 180, color: '#fff' }} />}
          {status === 'reserved-soon' && <Schedule sx={{ fontSize: 180, color: '#fff' }} />}
        </Box>

        {/* Status Text */}
        <Typography
          variant="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: '5rem',
            mb: 4,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {statusText}
        </Typography>

        {/* Current Booking Info */}
        {currentBooking && (
          <Card sx={{ minWidth: 800, bgcolor: 'rgba(255,255,255,0.95)', mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ mb: 2, color: '#333' }}>
                <Event sx={{ mr: 1, verticalAlign: 'middle' }} />
                Meeting Saat Ini:
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#000', mb: 2 }}>
                {currentBooking.title}
              </Typography>
              <Typography variant="h5" sx={{ color: '#666', mb: 1 }}>
                📅 {format(parseISO(currentBooking.start_time), 'HH:mm')} -{' '}
                {format(parseISO(currentBooking.end_time), 'HH:mm')}
              </Typography>
              <Typography variant="h5" sx={{ color: '#666' }}>
                👥 {currentBooking.attendees} Peserta
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Next Booking Info */}
        {!currentBooking && nextBooking && (
          <Card sx={{ minWidth: 800, bgcolor: 'rgba(255,255,255,0.95)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ mb: 2, color: '#333' }}>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Meeting Berikutnya:
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#000', mb: 2 }}>
                {nextBooking.title}
              </Typography>
              <Typography variant="h5" sx={{ color: '#666', mb: 1 }}>
                📅 {format(parseISO(nextBooking.start_time), 'HH:mm')} -{' '}
                {format(parseISO(nextBooking.end_time), 'HH:mm')}
              </Typography>
              <Typography variant="h5" sx={{ color: '#666' }}>
                👥 {nextBooking.attendees} Peserta
              </Typography>
              <Typography variant="h6" sx={{ color: '#ff9800', mt: 2 }}>
                ⏰ Dimulai dalam{' '}
                {Math.floor((parseISO(nextBooking.start_time).getTime() - currentTime.getTime()) / 1000 / 60)}{' '}
                menit
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Footer - Today's Schedule */}
      <Paper
        sx={{
          bgcolor: '#1a1a1a',
          color: '#fff',
          p: 3,
          borderRadius: 0,
          maxHeight: '25vh',
          overflowY: 'auto',
        }}
        elevation={3}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          📅 Jadwal Hari Ini
        </Typography>
        <Grid container spacing={2}>
          {todaysBookings.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ opacity: 0.6 }}>
                Tidak ada booking untuk hari ini
              </Typography>
            </Grid>
          ) : (
            todaysBookings.slice(0, 6).map((booking, index) => {
              const isPast = isBefore(parseISO(booking.end_time), currentTime)
              const isCurrent = currentBooking?.id === booking.id

              return (
                <Grid item xs={12} sm={6} md={4} key={booking.id}>
                  <Box
                    sx={{
                      p: 2,
                      borderLeft: `4px solid ${isCurrent ? '#f44336' : isPast ? '#666' : '#2196f3'
                        }`,
                      bgcolor: isCurrent ? 'rgba(244,67,54,0.1)' : 'transparent',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {format(parseISO(booking.start_time), 'HH:mm')} -{' '}
                      {format(parseISO(booking.end_time), 'HH:mm')}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: isPast ? 0.5 : 1 }}>
                      {booking.title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {booking.attendees} peserta
                    </Typography>
                    {isCurrent && (
                      <Chip
                        label="SEDANG BERLANGSUNG"
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </Grid>
              )
            })
          )}
        </Grid>
      </Paper>
    </Box>
  )
}

/**
 * All Rooms LCD Display (for central display/lobby)
 * Shows status of all meeting rooms at a glance
 */
export const AllRoomsLCDDisplay: React.FC = () => {
  const { rooms, bookings, fetchRooms, fetchBookings } = useMeetingRoomsWithBookings()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchRooms()
    fetchBookings()

    const interval = setInterval(() => {
      fetchBookings()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchRooms, fetchBookings])

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(clockInterval)
  }, [])

  const getRoomStatus = (roomId: number) => {
    const roomBookings = bookings.filter(
      (b) => b.room_id === roomId && b.status === 'approved'
    )

    const currentBooking = roomBookings.find((b) => {
      const start = parseISO(b.start_time)
      const end = parseISO(b.end_time)
      return isWithinInterval(currentTime, { start, end })
    })

    if (currentBooking) {
      return {
        status: 'in-use' as const,
        color: '#f44336',
        text: 'SEDANG DIGUNAKAN',
        booking: currentBooking,
      }
    }

    const nextBooking = roomBookings
      .filter((b) => isAfter(parseISO(b.start_time), currentTime))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]

    if (nextBooking) {
      const minutesUntil = Math.floor(
        (parseISO(nextBooking.start_time).getTime() - currentTime.getTime()) / 1000 / 60
      )
      if (minutesUntil <= 15) {
        return {
          status: 'reserved-soon' as const,
          color: '#ff9800',
          text: `TERSEDIA (${minutesUntil}m lagi)`,
          booking: nextBooking,
        }
      }
    }

    return {
      status: 'available' as const,
      color: '#4caf50',
      text: 'TERSEDIA',
      booking: null,
    }
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: '#0a0a0a',
        color: '#fff',
        p: 4,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
          📍 STATUS RUANG MEETING
        </Typography>
        <Typography variant="h4" sx={{ opacity: 0.8 }}>
          {format(currentTime, 'EEEE, dd MMMM yyyy - HH:mm:ss', { locale: id })}
        </Typography>
      </Box>

      {/* Rooms Grid */}
      <Grid container spacing={3}>
        {rooms.map((room) => {
          const { status, color, text, booking } = getRoomStatus(room.id)

          return (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: color,
                  color: '#fff',
                  transition: 'all 0.3s ease',
                }}
                elevation={6}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {room.name}
                  </Typography>

                  <Chip
                    label={text}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontSize: '1rem',
                      height: '40px',
                      mb: 2,
                    }}
                  />

                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    👥 Kapasitas: {room.capacity} orang
                  </Typography>

                  {booking && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {booking.title}
                      </Typography>
                      <Typography variant="body2">
                        ⏰ {format(parseISO(booking.start_time), 'HH:mm')} -{' '}
                        {format(parseISO(booking.end_time), 'HH:mm')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default RoomLCDDisplay
