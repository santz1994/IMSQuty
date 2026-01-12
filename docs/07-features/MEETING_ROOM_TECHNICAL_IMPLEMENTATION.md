# 🚀 MEETING ROOM ENHANCEMENT - TECHNICAL IMPLEMENTATION GUIDE

**Status:** Ready for implementation  
**Complexity:** Medium (4-6 weeks for all features)  
**Priority:** TIER 1 Features (High - 2 weeks)

---

## 📋 TABLE OF CONTENTS

1. [Timeline View Component](#timeline-view)
2. [Room Status Dashboard](#room-status)
3. [Advanced Booking Filters](#booking-filters)
4. [Notification System](#notifications)
5. [API Endpoints Required](#api-endpoints)
6. [Database Schema Updates](#database-schema)

---

## 📅 TIMELINE VIEW COMPONENT

### Overview
Horizontal timeline showing room bookings with real-time updates.

### Location
```
frontend/web-app/src/pages/MeetingRooms/TimelineView.tsx
```

### Architecture

```tsx
// Component Structure
TimelineView
├── TimelineHeader (date navigation, view selector)
├── TimelineControls (filter, search, view type)
├── TimelineContainer
│   ├── RoomRow (for each room)
│   │   └── TimeSlot (30-min interval, draggable)
│   │       └── BookingCard (color-coded status)
│   └── TimeAxis (hour/day labels)
└── TimelineFooter (legend, stats)

// Props Interface
interface TimelineViewProps {
  selectedDate: Date
  roomIds?: number[]
  viewType: 'day' | 'week' | 'month'
  onBookingClick: (booking: Booking) => void
}
```

### Key Features

#### 1. **Time Axis**
```tsx
// Display hours (0:00 - 23:00 or 6:00 - 20:00)
// 30-minute or 15-minute intervals
// Sticky header for scrolling

const TimeAxis: React.FC = () => {
  const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM - 9 PM
  
  return (
    <Box sx={{ display: 'flex', borderBottom: '2px solid #ddd' }}>
      {hours.map(hour => (
        <Box key={hour} sx={{ width: '60px', fontSize: '12px' }}>
          {`${String(hour).padStart(2, '0')}:00`}
        </Box>
      ))}
    </Box>
  );
};
```

#### 2. **Room Rows**
```tsx
// One row per room
// Show room name, capacity, location
// Virtual scrolling for many rooms

interface RoomRowProps {
  room: MeetingRoom
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
  onDropBooking: (booking: Booking, newTime: Date) => void
}

const RoomRow: React.FC<RoomRowProps> = ({ room, bookings, onBookingClick, onDropBooking }) => {
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100px', borderBottom: '1px solid #eee' }}>
      {/* Room info */}
      <Box sx={{ width: '200px', padding: '8px', borderRight: '1px solid #ddd' }}>
        <Typography variant="subtitle2">{room.name}</Typography>
        <Typography variant="caption">{room.capacity} people</Typography>
      </Box>
      
      {/* Timeline with bookings */}
      <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
        {bookings.map(booking => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onClick={() => onBookingClick(booking)}
            draggable={booking.status === 'approved'}
            onDragEnd={(newTime) => onDropBooking(booking, newTime)}
          />
        ))}
      </Box>
    </Box>
  );
};
```

#### 3. **Booking Card**
```tsx
interface BookingCardProps {
  booking: Booking
  onClick: () => void
  draggable?: boolean
  onDragEnd: (newTime: Date) => void
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onClick, draggable, onDragEnd }) => {
  const statusColors = {
    pending: '#FFC107',    // Amber
    approved: '#4CAF50',   // Green
    rejected: '#F44336',   // Red
    blocked: '#9C27B0',    // Purple
  };
  
  const durationMinutes = (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 60000;
  const widthPercent = (durationMinutes / (15 * 60)) * 100; // 15 hours total
  
  return (
    <Box
      draggable={draggable}
      onClick={onClick}
      sx={{
        position: 'absolute',
        backgroundColor: statusColors[booking.status],
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: draggable ? 'grab' : 'pointer',
        fontSize: '12px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        left: calculateLeft(booking.start_time),
        width: `${widthPercent}%`,
        '&:hover': {
          opacity: 0.8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        },
      }}
      onDragEnd={(e) => {
        const newTime = calculateTimeFromPosition(e.clientX);
        onDragEnd(newTime);
      }}
    >
      {booking.title} ({formatTime(booking.start_time)})
    </Box>
  );
};
```

#### 4. **Redux Integration**
```typescript
// store/slices/timelineSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchTimelineBookings = createAsyncThunk(
  'timeline/fetchBookings',
  async ({ startDate, endDate, roomIds }: FetchParams) => {
    const response = await client.get('/meeting-rooms/bookings', {
      params: {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        room_ids: roomIds?.join(','),
      },
    });
    return response.data.data;
  }
);

const timelineSlice = createSlice({
  name: 'timeline',
  initialState: {
    bookings: [],
    loading: false,
    error: null,
    selectedDate: new Date(),
    viewType: 'day' as 'day' | 'week' | 'month',
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimelineBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchTimelineBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
        state.loading = false;
      })
      .addCase(fetchTimelineBookings.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});
```

---

## 🏢 ROOM STATUS DASHBOARD

### Overview
Real-time grid showing all rooms with color-coded availability status.

### Location
```
frontend/web-app/src/pages/MeetingRooms/RoomStatusDashboard.tsx
```

### Component Structure

```tsx
interface RoomStatusDashboardProps {
  autoRefresh?: boolean
  refreshInterval?: number // ms
}

const RoomStatusDashboard: React.FC<RoomStatusDashboardProps> = ({ 
  autoRefresh = true, 
  refreshInterval = 30000 
}) => {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [filter, setFilter] = useState<{
    floor?: string;
    capacity?: number;
    amenities?: string[];
  }>({});

  // Fetch room status every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchRoomStatuses();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, []);

  const fetchRoomStatuses = async () => {
    const response = await client.get('/meeting-rooms/status', {
      params: filter,
    });
    setRooms(response.data.data);
  };

  return (
    <Box>
      <RoomStatusFilters onFilter={setFilter} />
      <RoomStatusGrid rooms={rooms} />
    </Box>
  );
};
```

### Room Status Card

```tsx
interface RoomStatusCardProps {
  room: RoomStatus
}

const RoomStatusCard: React.FC<RoomStatusCardProps> = ({ room }) => {
  const statusConfig = {
    available: { color: '#4CAF50', icon: CheckCircle, label: 'Available' },
    occupied: { color: '#F44336', icon: Block, label: 'Occupied' },
    blocked: { color: '#9C27B0', icon: Lock, label: 'Blocked' },
    maintenance: { color: '#FF9800', icon: Build, label: 'Maintenance' },
  };

  const config = statusConfig[room.status];

  return (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        {/* Status Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: config.color,
              mr: 1,
            }}
          />
          <Typography variant="body2">{config.label}</Typography>
        </Box>

        {/* Room Info */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          {room.name}
        </Typography>

        <Divider sx={{ my: 1 }} />

        {/* Details */}
        <Typography variant="body2">
          👥 Capacity: {room.capacity}
        </Typography>
        <Typography variant="body2">
          📍 {room.floor} Floor
        </Typography>

        {/* Current Booking Info */}
        {room.status === 'occupied' && (
          <Box sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Typography variant="caption">
              <strong>{room.currentBooking?.bookedBy}</strong>
            </Typography>
            <Typography variant="caption" display="block">
              {room.currentBooking?.title}
            </Typography>
            <Typography variant="caption" color="error">
              Until {formatTime(room.currentBooking?.endTime)}
            </Typography>
          </Box>
        )}

        {/* Quick Book Button */}
        {room.status === 'available' && (
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => onQuickBook(room)}
          >
            Book Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## 🔍 ADVANCED BOOKING FILTERS

### Implementation

```tsx
interface BookingFilter {
  capacity?: number;
  amenities?: string[];
  floor?: string;
  availability?: 'next1h' | 'next2h' | 'next4h' | 'today' | 'week';
  sortBy?: 'distance' | 'capacity' | 'name';
  favorites?: boolean;
}

const AdvancedFilters: React.FC<{
  onFilter: (filter: BookingFilter) => void;
}> = ({ onFilter }) => {
  const [filters, setFilters] = useState<BookingFilter>({});
  const [savedPresets, setSavedPresets] = useState<{
    name: string;
    filters: BookingFilter;
  }[]>([]);

  const handleSavePreset = async (presetName: string) => {
    const newPreset = { name: presetName, filters };
    setSavedPresets([...savedPresets, newPreset]);
    // Also save to localStorage
    localStorage.setItem('roomFilterPresets', JSON.stringify(savedPresets));
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Capacity Filter */}
      <FormControl sx={{ mr: 2, minWidth: 120 }}>
        <InputLabel>Capacity</InputLabel>
        <Select
          value={filters.capacity || ''}
          onChange={(e) => setFilters({ ...filters, capacity: e.target.value as number })}
        >
          <MenuItem value="">Any</MenuItem>
          <MenuItem value={5}>5+ people</MenuItem>
          <MenuItem value={10}>10+ people</MenuItem>
          <MenuItem value={20}>20+ people</MenuItem>
          <MenuItem value={50}>50+ people</MenuItem>
        </Select>
      </FormControl>

      {/* Amenities Filter */}
      <FormControl sx={{ mr: 2, minWidth: 200 }}>
        <InputLabel>Amenities</InputLabel>
        <Select
          multiple
          value={filters.amenities || []}
          onChange={(e) => setFilters({ ...filters, amenities: e.target.value as string[] })}
        >
          <MenuItem value="projector">Projector</MenuItem>
          <MenuItem value="whiteboard">Whiteboard</MenuItem>
          <MenuItem value="video_conferencing">Video Conferencing</MenuItem>
          <MenuItem value="air_conditioning">Air Conditioning</MenuItem>
          <MenuItem value="wifi">WiFi</MenuItem>
        </Select>
      </FormControl>

      {/* Availability Filter */}
      <FormControl sx={{ mr: 2, minWidth: 150 }}>
        <InputLabel>Availability</InputLabel>
        <Select
          value={filters.availability || ''}
          onChange={(e) => setFilters({ ...filters, availability: e.target.value as any })}
        >
          <MenuItem value="next1h">Next 1 Hour</MenuItem>
          <MenuItem value="next2h">Next 2 Hours</MenuItem>
          <MenuItem value="next4h">Next 4 Hours</MenuItem>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="week">This Week</MenuItem>
        </Select>
      </FormControl>

      {/* Save Preset Button */}
      <Button
        variant="outlined"
        onClick={() => {
          const presetName = prompt('Name this filter preset:');
          if (presetName) handleSavePreset(presetName);
        }}
      >
        Save Filter
      </Button>

      {/* Saved Presets */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Saved Filters:</Typography>
        {savedPresets.map((preset) => (
          <Chip
            key={preset.name}
            label={preset.name}
            onClick={() => {
              setFilters(preset.filters);
              onFilter(preset.filters);
            }}
            sx={{ mr: 1 }}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={() => onFilter(filters)}
        sx={{ mt: 2 }}
      >
        Apply Filters
      </Button>
    </Box>
  );
};
```

---

## 🔔 NOTIFICATION SYSTEM

### Architecture

```
Frontend Notifications
├── In-App Toast (temporary, dismissible)
├── Notification Center (persistent list)
├── Email Notifications (digest, important events)
└── Push Notifications (browser/mobile)

Backend Integration
├── Event Service (publishes events)
├── Notification Service (sends notifications)
└── WebSocket (real-time delivery)
```

### Frontend Implementation

```tsx
// Notification Types
interface Notification {
  id: string;
  type: 'booking_approved' | 'booking_rejected' | 'booking_created' | 'room_blocked' | 'maintenance';
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  createdAt: Date;
}

// Redux Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [] as Notification[],
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      state.unreadCount++;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount--;
      }
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(n => n.id !== action.payload);
    },
  },
});

// WebSocket Integration
const useNotificationSocket = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socket.on('booking_approved', (data) => {
      dispatch(addNotification({
        id: generateId(),
        type: 'booking_approved',
        title: 'Booking Approved',
        message: `Your booking for ${data.roomName} has been approved`,
        icon: <CheckCircle sx={{ color: 'green' }} />,
        actionUrl: `/meeting-rooms/calendar`,
        actionLabel: 'View',
        read: false,
        createdAt: new Date(),
      }));
    });

    return () => socket.disconnect();
  }, [dispatch]);
};

// Notification Center Component
const NotificationCenter: React.FC = () => {
  const { items, unreadCount } = useAppSelector(state => state.notifications);
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{ position: 'relative' }}
      >
        <Bell />
        {unreadCount > 0 && (
          <Badge badgeContent={unreadCount} color="error" />
        )}
      </IconButton>

      <Popover
        open={open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: '400px', maxHeight: '500px', overflow: 'auto' }}>
          {items.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="textSecondary">No notifications</Typography>
            </Box>
          ) : (
            items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          )}
        </Box>
      </Popover>
    </>
  );
};
```

---

## 🔌 API ENDPOINTS REQUIRED

### Meeting Room Service

```javascript
// Timeline Endpoints
GET /api/v1/meeting-rooms/bookings
  - Query: start_date, end_date, room_ids (optional)
  - Response: Booking[]

// Status Endpoints
GET /api/v1/meeting-rooms/status
  - Query: floor, capacity, amenities
  - Response: RoomStatus[]

// Advanced Search
GET /api/v1/meeting-rooms/search
  - Query: capacity, amenities, availability, floor
  - Response: Room[]

// Notifications
POST /api/v1/notifications
  - Body: { type, userId, data }
  - Response: { success, notificationId }

GET /api/v1/notifications
  - Query: limit, offset, unread_only
  - Response: Notification[]

PUT /api/v1/notifications/:id/read
  - Response: { success }
```

---

## 💾 DATABASE SCHEMA UPDATES

```sql
-- Add to meeting_room_bookings
ALTER TABLE meeting_room_bookings ADD COLUMN recurring_pattern JSON COMMENT 'Recurrence: {type: daily|weekly|monthly, endDate: ..., count: ...}';
ALTER TABLE meeting_room_bookings ADD COLUMN parent_booking_id BIGINT COMMENT 'For recurring instances';

-- New table: maintenance
CREATE TABLE meeting_room_maintenance (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  room_id BIGINT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
  description TEXT,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New table: guests
CREATE TABLE meeting_room_guests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  status ENUM('invited', 'accepted', 'declined'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_bookings_room_time ON meeting_room_bookings(room_id, start_time, end_time);
CREATE INDEX idx_bookings_user ON meeting_room_bookings(booked_by);
CREATE INDEX idx_maintenance_room_time ON meeting_room_maintenance(room_id, start_time);
```

---

## 🚀 NEXT STEPS

1. **Implement Timeline View** (2 days)
   - Create component structure
   - Add drag-and-drop functionality
   - Integrate with Redux

2. **Build Room Status Dashboard** (1.5 days)
   - Create status cards
   - Add real-time updates
   - Implement quick book

3. **Add Advanced Filters** (1 day)
   - Create filter UI
   - Implement localStorage presets
   - Add to calendar & timeline

4. **Setup Notifications** (2 days)
   - Configure WebSocket connection
   - Create notification types
   - Build notification center

5. **Testing & Deployment** (1.5 days)
   - Test all features
   - Performance optimization
   - Deploy to production

---

**Total Estimated Time: 8 days** ✅

