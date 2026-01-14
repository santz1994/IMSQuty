import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import {
  Block as BlockIcon,
  ChevronLeft,
  ChevronRight,
  DragIndicator,
  Today as TodayIcon,
  ViewDay,
  ViewWeek
} from '@mui/icons-material';
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
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { addDays, addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, setHours, setMinutes, startOfWeek, subDays, subWeeks } from 'date-fns';
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
  room?: MeetingRoom;
}

type ViewMode = 'day' | 'week';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ReceptionistOverride: React.FC = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calendar state
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<number | 'all'>('all');

  // Drag state
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // Dialog states
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    open: boolean;
    booking: Booking | null;
    newStartTime: Date | null;
    newEndTime: Date | null;
    reason: string;
  }>({
    open: false,
    booking: null,
    newStartTime: null,
    newEndTime: null,
    reason: '',
  });

  const [blockDialog, setBlockDialog] = useState<{
    open: boolean;
    roomId: number | null;
    blockType: 'maintenance' | 'vip' | 'urgent' | 'other';
    reason: string;
    startTime: Date | null;
    endTime: Date | null;
    cancelExisting: boolean;
  }>({
    open: false,
    roomId: null,
    blockType: 'maintenance',
    reason: '',
    startTime: null,
    endTime: null,
    cancelExisting: false,
  });

  const [overrideDialog, setOverrideDialog] = useState<{
    open: boolean;
    bookingId: number | null;
    reason: string;
    newBooking: {
      room_id: number;
      title: string;
      start_time: Date | null;
      end_time: Date | null;
      attendees_count: number;
    };
  }>({
    open: false,
    bookingId: null,
    reason: '',
    newBooking: {
      room_id: 0,
      title: '',
      start_time: null,
      end_time: null,
      attendees_count: 1,
    },
  });

  // Fetch data
  const fetchRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/api/v1/meeting-rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setRooms(response.data.data);
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

  // Calendar navigation
  const navigatePrev = () => {
    setCurrentDate(viewMode === 'day' ? subDays(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const navigateNext = () => {
    setCurrentDate(viewMode === 'day' ? addDays(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar dates
  const getCalendarDates = (): Date[] => {
    if (viewMode === 'day') {
      return [currentDate];
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  // Get title
  const getCalendarTitle = (): string => {
    if (viewMode === 'day') {
      return format(currentDate, 'EEEE, dd MMMM yyyy');
    }
    const dates = getCalendarDates();
    return `${format(dates[0], 'dd MMM')} - ${format(dates[dates.length - 1], 'dd MMM yyyy')}`;
  };

  // Filter bookings
  const getFilteredBookings = (): Booking[] => {
    const dates = getCalendarDates();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.start_time);
      const matchesRoom = selectedRoom === 'all' || booking.meeting_room_id === selectedRoom;
      const matchesDate = dates.some((date) => isSameDay(date, bookingDate));
      return matchesRoom && matchesDate && booking.status !== 'cancelled';
    });
  };

  // Drag handlers
  const handleDragStart = (event: any) => {
    const booking = bookings.find((b) => b.id === event.active.id);
    if (booking && booking.status === 'approved') {
      setActiveBooking(booking);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveBooking(null);

    if (!event.over) return;

    const bookingId = event.active.id as number;
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking || booking.status !== 'approved') {
      setError('Only approved bookings can be rescheduled');
      return;
    }

    // Parse drop target (format: "room-{roomId}-date-{dateStr}-hour-{hour}")
    const dropData = String(event.over.id).split('-');
    if (dropData.length < 6) return;

    const targetRoomId = parseInt(dropData[1]);
    const targetDate = new Date(dropData[3]);
    const targetHour = parseInt(dropData[5]);

    // Calculate new times
    const duration = new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime();
    const newStartTime = setMinutes(setHours(targetDate, targetHour), 0);
    const newEndTime = new Date(newStartTime.getTime() + duration);

    // Open reschedule dialog
    setRescheduleDialog({
      open: true,
      booking,
      newStartTime,
      newEndTime,
      reason: `Rescheduled by receptionist from ${format(new Date(booking.start_time), 'dd MMM yyyy HH:mm')}`,
    });
  };

  // Reschedule booking
  const handleReschedule = async () => {
    if (!rescheduleDialog.booking || !rescheduleDialog.newStartTime || !rescheduleDialog.newEndTime) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/bookings/${rescheduleDialog.booking.id}/reschedule`,
        {
          start_time: rescheduleDialog.newStartTime.toISOString(),
          end_time: rescheduleDialog.newEndTime.toISOString(),
          reschedule_reason: rescheduleDialog.reason,
          notify_user: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMessage('Booking rescheduled successfully!');
        setRescheduleDialog({ open: false, booking: null, newStartTime: null, newEndTime: null, reason: '' });
        await fetchBookings();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reschedule booking');
    }
  };

  // Block room
  const handleBlockRoom = async () => {
    if (!blockDialog.roomId || !blockDialog.startTime || !blockDialog.endTime) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/meeting-rooms/${blockDialog.roomId}/block`,
        {
          block_type: blockDialog.blockType,
          block_reason: blockDialog.reason,
          start_time: blockDialog.startTime.toISOString(),
          end_time: blockDialog.endTime.toISOString(),
          cancel_existing_bookings: blockDialog.cancelExisting,
          notify_affected_users: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMessage(`Room blocked successfully! ${response.data.data.cancelled_bookings_count} bookings cancelled.`);
        setBlockDialog({
          open: false,
          roomId: null,
          blockType: 'maintenance',
          reason: '',
          startTime: null,
          endTime: null,
          cancelExisting: false,
        });
        await fetchBookings();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to block room');
    }
  };

  // Override booking
  const handleOverride = async () => {
    if (!overrideDialog.bookingId || !overrideDialog.newBooking.start_time || !overrideDialog.newBooking.end_time) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/bookings/${overrideDialog.bookingId}/override`,
        {
          override_reason: overrideDialog.reason,
          new_booking: {
            room_id: overrideDialog.newBooking.room_id,
            title: overrideDialog.newBooking.title,
            start_time: overrideDialog.newBooking.start_time.toISOString(),
            end_time: overrideDialog.newBooking.end_time.toISOString(),
            attendees_count: overrideDialog.newBooking.attendees_count,
          },
          notify_original_user: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMessage('Booking overridden successfully!');
        setOverrideDialog({
          open: false,
          bookingId: null,
          reason: '',
          newBooking: {
            room_id: 0,
            title: '',
            start_time: null,
            end_time: null,
            attendees_count: 1,
          },
        });
        await fetchBookings();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to override booking');
    }
  };

  // Render draggable booking card
  const DraggableBooking = ({ booking }: { booking: Booking }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: booking.id,
      disabled: booking.status !== 'approved',
    });

    const style = transform
      ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
      : undefined;

    return (
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        sx={{
          mb: 0.5,
          cursor: booking.status === 'approved' ? 'grab' : 'not-allowed',
          bgcolor: getStatusColor(booking.status),
          color: 'white',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <CardContent sx={{ p: 0.5, '&:last-child': { pb: 0.5 } }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {booking.status === 'approved' && <DragIndicator fontSize="small" />}
            <Box flex={1}>
              <Typography variant="caption" fontWeight="bold" noWrap>
                {booking.title}
              </Typography>
              <Typography variant="caption" display="block" noWrap>
                {format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Render droppable time slot
  const DroppableTimeSlot = ({
    date,
    hour,
    roomId,
    bookingsInSlot,
  }: {
    date: Date;
    hour: number;
    roomId: number;
    bookingsInSlot: Booking[];
  }) => {
    const dropId = `room-${roomId}-date-${format(date, 'yyyy-MM-dd')}-hour-${hour}`;
    const { setNodeRef, isOver } = useDroppable({ id: dropId });

    return (
      <Box
        ref={setNodeRef}
        sx={{
          minHeight: 60,
          p: 0.5,
          border: 1,
          borderColor: isOver ? 'primary.main' : 'divider',
          bgcolor: isOver ? 'primary.light' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        {bookingsInSlot.map((booking) => (
          <DraggableBooking key={booking.id} booking={booking} />
        ))}
      </Box>
    );
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'rejected':
        return '#f44336';
      case 'blocked':
        return '#9e9e9e';
      default:
        return '#2196f3';
    }
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const dates = getCalendarDates();
    const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 - 18:00
    const filteredBookings = getFilteredBookings();
    const displayRooms = selectedRoom === 'all' ? rooms.filter((r) => r.is_active) : rooms.filter((r) => r.id === selectedRoom);

    return (
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Paper sx={{ overflow: 'auto', maxHeight: '65vh' }}>
          <Box sx={{ minWidth: viewMode === 'week' ? 1200 : 800 }}>
            {/* Header */}
            <Grid container sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper', borderBottom: 2, borderColor: 'divider' }}>
              <Grid item xs={1.5} sx={{ p: 1, borderRight: 1, borderColor: 'divider', bgcolor: 'grey.100' }}>
                <Typography variant="body2" fontWeight="bold">
                  Room / Time
                </Typography>
              </Grid>
              {dates.map((date) => (
                <Grid key={date.toISOString()} item xs={(12 - 1.5) / dates.length} sx={{ p: 1, borderRight: 1, borderColor: 'divider', bgcolor: 'grey.100' }}>
                  <Typography variant="body2" align="center" fontWeight="bold">
                    {format(date, 'EEE dd MMM')}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Time slots */}
            {displayRooms.map((room) => (
              <Box key={room.id}>
                {hours.map((hour) => (
                  <Grid key={`${room.id}-${hour}`} container>
                    <Grid item xs={1.5} sx={{ p: 1, borderRight: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                      {hour === 8 ? (
                        <Stack>
                          <Typography variant="body2" fontWeight="bold">
                            {room.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Cap: {room.capacity}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {String(hour).padStart(2, '0')}:00
                        </Typography>
                      )}
                    </Grid>
                    {dates.map((date) => {
                      const slotStart = setMinutes(setHours(date, hour), 0);
                      const slotEnd = setMinutes(setHours(date, hour + 1), 0);
                      const bookingsInSlot = filteredBookings.filter((b) => {
                        const bookingStart = new Date(b.start_time);
                        const bookingEnd = new Date(b.end_time);
                        return (
                          b.meeting_room_id === room.id &&
                          ((bookingStart >= slotStart && bookingStart < slotEnd) ||
                            (bookingEnd > slotStart && bookingEnd <= slotEnd) ||
                            (bookingStart <= slotStart && bookingEnd >= slotEnd))
                        );
                      });

                      return (
                        <Grid key={date.toISOString()} item xs={(12 - 1.5) / dates.length} sx={{ borderRight: 1, borderBottom: 1, borderColor: 'divider' }}>
                          <DroppableTimeSlot date={date} hour={hour} roomId={room.id} bookingsInSlot={bookingsInSlot} />
                        </Grid>
                      );
                    })}
                  </Grid>
                ))}
              </Box>
            ))}
          </Box>
        </Paper>

        <DragOverlay>{activeBooking ? <DraggableBooking booking={activeBooking} /> : null}</DragOverlay>
      </DndContext>
    );
  };

  return (
    <AdminLayout>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Receptionist Override System
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Drag approved bookings to reschedule, block rooms, or override conflicting bookings
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }}>
              {successMessage}
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

            <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(e, val) => val && setViewMode(val)}>
              <ToggleButton value="day">
                <ViewDay sx={{ mr: 0.5 }} fontSize="small" />
                Day
              </ToggleButton>
              <ToggleButton value="week">
                <ViewWeek sx={{ mr: 0.5 }} fontSize="small" />
                Week
              </ToggleButton>
            </ToggleButtonGroup>

            <Box flex={1} />

            <Button variant="contained" color="error" startIcon={<BlockIcon />} onClick={() => setBlockDialog({ ...blockDialog, open: true })}>
              Block Room
            </Button>
          </Stack>

          {/* Navigation */}
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
            <IconButton onClick={navigatePrev}>
              <ChevronLeft />
            </IconButton>
            <Button variant="outlined" startIcon={<TodayIcon />} onClick={goToToday}>
              Today
            </Button>
            <Typography variant="h6" sx={{ minWidth: 250, textAlign: 'center' }}>
              {getCalendarTitle()}
            </Typography>
            <IconButton onClick={navigateNext}>
              <ChevronRight />
            </IconButton>
          </Stack>

          {/* Legend */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip label="Approved (Draggable)" sx={{ bgcolor: '#4caf50', color: 'white' }} size="small" />
            <Chip label="Pending" sx={{ bgcolor: '#ff9800', color: 'white' }} size="small" />
            <Chip label="Blocked" sx={{ bgcolor: '#9e9e9e', color: 'white' }} size="small" />
          </Stack>

          {/* Calendar */}
          {loading ? <Typography>Loading...</Typography> : renderCalendarGrid()}

          {/* Reschedule Dialog */}
          <Dialog open={rescheduleDialog.open} onClose={() => setRescheduleDialog({ ...rescheduleDialog, open: false })} maxWidth="sm" fullWidth>
            <DialogTitle>Reschedule Booking</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Alert severity="info">
                  Original: {rescheduleDialog.booking?.title} <br />
                  {rescheduleDialog.booking && format(new Date(rescheduleDialog.booking.start_time), 'dd MMM yyyy HH:mm')} -{' '}
                  {rescheduleDialog.booking && format(new Date(rescheduleDialog.booking.end_time), 'HH:mm')}
                </Alert>
                <DateTimePicker
                  label="New Start Time"
                  value={rescheduleDialog.newStartTime}
                  onChange={(date) => setRescheduleDialog({ ...rescheduleDialog, newStartTime: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DateTimePicker
                  label="New End Time"
                  value={rescheduleDialog.newEndTime}
                  onChange={(date) => setRescheduleDialog({ ...rescheduleDialog, newEndTime: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <TextField
                  label="Reschedule Reason *"
                  multiline
                  rows={3}
                  value={rescheduleDialog.reason}
                  onChange={(e) => setRescheduleDialog({ ...rescheduleDialog, reason: e.target.value })}
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRescheduleDialog({ ...rescheduleDialog, open: false })}>Cancel</Button>
              <Button variant="contained" onClick={handleReschedule}>
                Confirm Reschedule
              </Button>
            </DialogActions>
          </Dialog>

          {/* Block Room Dialog */}
          <Dialog open={blockDialog.open} onClose={() => setBlockDialog({ ...blockDialog, open: false })} maxWidth="sm" fullWidth>
            <DialogTitle>Block Meeting Room</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Room *</InputLabel>
                  <Select value={blockDialog.roomId || ''} onChange={(e) => setBlockDialog({ ...blockDialog, roomId: Number(e.target.value) })} label="Room *">
                    {rooms.map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {room.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Block Type *</InputLabel>
                  <Select value={blockDialog.blockType} onChange={(e) => setBlockDialog({ ...blockDialog, blockType: e.target.value as any })} label="Block Type *">
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="vip">VIP Event</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <DateTimePicker
                  label="Start Time *"
                  value={blockDialog.startTime}
                  onChange={(date) => setBlockDialog({ ...blockDialog, startTime: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DateTimePicker
                  label="End Time *"
                  value={blockDialog.endTime}
                  onChange={(date) => setBlockDialog({ ...blockDialog, endTime: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <TextField
                  label="Block Reason *"
                  multiline
                  rows={3}
                  value={blockDialog.reason}
                  onChange={(e) => setBlockDialog({ ...blockDialog, reason: e.target.value })}
                  fullWidth
                />
                <Alert severity="warning">
                  <Stack direction="row" alignItems="center">
                    <input
                      type="checkbox"
                      checked={blockDialog.cancelExisting}
                      onChange={(e) => setBlockDialog({ ...blockDialog, cancelExisting: e.target.checked })}
                    />
                    <Typography variant="body2" ml={1}>
                      Cancel existing bookings in this time slot
                    </Typography>
                  </Stack>
                </Alert>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBlockDialog({ ...blockDialog, open: false })}>Cancel</Button>
              <Button variant="contained" color="error" onClick={handleBlockRoom}>
                Block Room
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </LocalizationProvider>
    </AdminLayout>
  );
};

export default ReceptionistOverride;
