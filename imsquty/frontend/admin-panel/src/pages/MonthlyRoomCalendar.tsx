import {
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  Refresh as RefreshIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import axios from 'axios';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../components/layouts/AdminLayout';

interface MeetingRoom {
  id: number;
  name: string;
  capacity: number;
  location: string;
  is_active: boolean;
}

interface Booking {
  id: number;
  meeting_room_id: number;
  user_id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'blocked';
  attendees_count: number;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface DayStatus {
  date: Date;
  bookings: Booking[];
  status: 'available' | 'partially-booked' | 'fully-booked' | 'blocked';
  bookingCount: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const MonthlyRoomCalendar: React.FC = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<number | 'all'>('all');
  const [selectedDayDialog, setSelectedDayDialog] = useState<{
    open: boolean;
    room: MeetingRoom | null;
    date: Date | null;
    bookings: Booking[];
  }>({
    open: false,
    room: null,
    date: null,
    bookings: [],
  });

  // Fetch data
  const fetchRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/api/v1/meeting-rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setRooms(response.data.data.filter((r: MeetingRoom) => r.is_active));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rooms');
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/api/v1/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, [fetchRooms, fetchBookings]);

  // Get days in current month
  const getDaysInMonth = useCallback((): Date[] => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get day status for a specific room and date
  const getDayStatus = (roomId: number, date: Date): DayStatus => {
    const dayBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.start_time);
      return (
        b.meeting_room_id === roomId &&
        isSameDay(bookingDate, date) &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected'
      );
    });

    const hasBlocked = dayBookings.some((b) => b.status === 'blocked');
    const approvedCount = dayBookings.filter((b) => b.status === 'approved').length;

    let status: DayStatus['status'] = 'available';
    if (hasBlocked) {
      status = 'blocked';
    } else if (approvedCount >= 8) {
      // Assume 8+ bookings means fully booked (all day slots)
      status = 'fully-booked';
    } else if (approvedCount > 0) {
      status = 'partially-booked';
    }

    return {
      date,
      bookings: dayBookings,
      status,
      bookingCount: dayBookings.length,
    };
  };

  // Get cell background color
  const getCellColor = (status: DayStatus['status']): string => {
    switch (status) {
      case 'available':
        return '#e8f5e9'; // Light green
      case 'partially-booked':
        return '#fff9c4'; // Light yellow
      case 'fully-booked':
        return '#ffccbc'; // Light orange
      case 'blocked':
        return '#e0e0e0'; // Gray
      default:
        return '#ffffff';
    }
  };

  // Get cell border color
  const getCellBorderColor = (status: DayStatus['status']): string => {
    switch (status) {
      case 'available':
        return '#4caf50'; // Green
      case 'partially-booked':
        return '#ffc107'; // Yellow
      case 'fully-booked':
        return '#ff5722'; // Orange
      case 'blocked':
        return '#9e9e9e'; // Gray
      default:
        return '#e0e0e0';
    }
  };

  // Handle cell click
  const handleCellClick = (room: MeetingRoom, date: Date, dayStatus: DayStatus) => {
    setSelectedDayDialog({
      open: true,
      room,
      date,
      bookings: dayStatus.bookings,
    });
  };

  // Navigation
  const navigatePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const navigateNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter rooms
  const displayRooms = selectedRoom === 'all' ? rooms : rooms.filter((r) => r.id === selectedRoom);

  const days = getDaysInMonth();

  return (
    <AdminLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Meeting Room Monthly Calendar
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          View room availability across the entire month at a glance
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Controls */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Room Filter</InputLabel>
            <Select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value as number | 'all')} label="Room Filter">
              <MenuItem value="all">All Rooms</MenuItem>
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box flex={1} />

          <Button startIcon={<RefreshIcon />} onClick={fetchBookings} disabled={loading}>
            Refresh
          </Button>
        </Stack>

        {/* Navigation */}
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
          <IconButton onClick={navigatePrevMonth}>
            <ChevronLeft />
          </IconButton>
          <Button variant="outlined" startIcon={<TodayIcon />} onClick={goToToday}>
            Today
          </Button>
          <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={navigateNextMonth}>
            <ChevronRight />
          </IconButton>
        </Stack>

        {/* Legend */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip
            label="Available"
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', borderColor: '#4caf50', border: 1 }}
          />
          <Chip
            label="Partially Booked"
            size="small"
            sx={{ bgcolor: '#fff9c4', color: '#f57c00', borderColor: '#ffc107', border: 1 }}
          />
          <Chip
            label="Fully Booked"
            size="small"
            sx={{ bgcolor: '#ffccbc', color: '#d32f2f', borderColor: '#ff5722', border: 1 }}
          />
          <Chip label="Blocked" size="small" sx={{ bgcolor: '#e0e0e0', color: '#616161', borderColor: '#9e9e9e', border: 1 }} />
        </Stack>

        {/* Calendar Matrix */}
        <Paper sx={{ overflow: 'auto' }}>
          <Box sx={{ minWidth: 1200 }}>
            {/* Header Row - Days */}
            <Grid container sx={{ borderBottom: 2, borderColor: 'divider', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 1 }}>
              <Grid item xs={1.5} sx={{ p: 1, borderRight: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight="bold">
                  Room / Date
                </Typography>
              </Grid>
              {days.map((day) => (
                <Grid
                  key={day.toISOString()}
                  item
                  xs={(12 - 1.5) / days.length}
                  sx={{
                    p: 0.5,
                    borderRight: 1,
                    borderColor: 'divider',
                    bgcolor: isToday(day) ? 'primary.light' : 'grey.100',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">
                    {format(day, 'd')}
                  </Typography>
                  <Typography variant="caption" display="block" fontSize="0.65rem">
                    {format(day, 'EEE')}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Room Rows */}
            {loading && displayRooms.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>Loading...</Typography>
              </Box>
            ) : (
              displayRooms.map((room) => (
                <Grid key={room.id} container sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  {/* Room Name */}
                  <Grid item xs={1.5} sx={{ p: 1, borderRight: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {room.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {room.location} • Cap: {room.capacity}
                    </Typography>
                  </Grid>

                  {/* Day Cells */}
                  {days.map((day) => {
                    const dayStatus = getDayStatus(room.id, day);
                    return (
                      <Grid
                        key={day.toISOString()}
                        item
                        xs={(12 - 1.5) / days.length}
                        sx={{
                          p: 0.5,
                          borderRight: 1,
                          borderColor: 'divider',
                          bgcolor: getCellColor(dayStatus.status),
                          cursor: 'pointer',
                          minHeight: 50,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          '&:hover': {
                            opacity: 0.7,
                            boxShadow: 'inset 0 0 0 2px ' + getCellBorderColor(dayStatus.status),
                          },
                        }}
                        onClick={() => handleCellClick(room, day, dayStatus)}
                      >
                        <Tooltip
                          title={
                            <Box>
                              <Typography variant="caption" fontWeight="bold">
                                {room.name} - {format(day, 'd MMM yyyy')}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {dayStatus.status === 'available'
                                  ? 'Available all day'
                                  : dayStatus.status === 'blocked'
                                    ? 'Room blocked'
                                    : `${dayStatus.bookingCount} booking(s)`}
                              </Typography>
                            </Box>
                          }
                        >
                          <Box textAlign="center">
                            {dayStatus.bookingCount > 0 && (
                              <Typography variant="caption" fontWeight="bold" color={dayStatus.status === 'blocked' ? 'text.disabled' : 'text.primary'}>
                                {dayStatus.bookingCount}
                              </Typography>
                            )}
                          </Box>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                </Grid>
              ))
            )}
          </Box>
        </Paper>

        {/* Day Details Dialog */}
        <Dialog
          open={selectedDayDialog.open}
          onClose={() => setSelectedDayDialog({ ...selectedDayDialog, open: false })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarMonth />
              <Box>
                <Typography variant="h6">
                  {selectedDayDialog.room?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedDayDialog.date && format(selectedDayDialog.date, 'EEEE, d MMMM yyyy')}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent>
            {selectedDayDialog.bookings.length === 0 ? (
              <Alert severity="info">No bookings for this day. Room is available.</Alert>
            ) : (
              <Stack spacing={2}>
                {selectedDayDialog.bookings.map((booking) => (
                  <Paper key={booking.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {booking.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
                        </Typography>
                        {booking.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {booking.description}
                          </Typography>
                        )}
                        {booking.user && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Booked by: {booking.user.first_name} {booking.user.last_name}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={booking.status.toUpperCase()}
                        size="small"
                        color={
                          booking.status === 'approved'
                            ? 'success'
                            : booking.status === 'pending'
                              ? 'warning'
                              : booking.status === 'blocked'
                                ? 'default'
                                : 'error'
                        }
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedDayDialog({ ...selectedDayDialog, open: false })}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default MonthlyRoomCalendar;
