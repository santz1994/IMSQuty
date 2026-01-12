# Meeting Room Booking System - Comprehensive Ideas & Implementation Guide

## 📋 Current Implementation Status

### ✅ Already Implemented Features

#### Backend (Laravel API)
- **Meeting Room Management** (MeetingRoomController)
  - CRUD operations for rooms
  - Room availability checking
  - Room statistics
  - Find available rooms by time slot

- **Booking Management** (BookingController)
  - Create, read, update, delete bookings
  - Approve/Reject workflow
  - Cancel bookings
  - Get user's bookings
  - Today's bookings
  - Upcoming bookings
  - Booking statistics

- **Booking Workflow** (BookingWorkflowController)
  - Check-in functionality
  - Check-out functionality
  - Feedback submission
  - Approval/Rejection with reasons

- **Database Schema**
  - `meeting_rooms` table
  - `room_bookings` table with statuses: pending, confirmed, in-progress, completed, cancelled
  - Check-in/check-out timestamps
  - Recurring bookings support
  - Participants tracking

#### Frontend (React + TypeScript)
- **BookingCalendar** - Week/day/month calendar view with time slots
- **BookingApprovals** - Approval management for managers
- **ReceptionistPanel** - Quick booking interface for front desk
- **RoomLCDDisplay** - Real-time room status display for LCD screens outside rooms

---

## 🎯 Your Requirements Analysis

### Requirement #1: User Booking with Approval Workflow ✅ PARTIALLY IMPLEMENTED
**Current Status:** Backend fully implemented, frontend needs minor enhancements

**What Exists:**
- Users can create bookings (BookingDialog component)
- Bookings start with 'pending' status
- Approval workflow exists in backend (approve/reject endpoints)
- BookingApprovals page for managers to review

**What Needs Enhancement:**
1. **Permission-based approval routing**
   - Define which roles can approve (e.g., Manager, Director, Receptionist)
   - Add permission check in frontend before showing approve/reject buttons
   - Suggested permission: `approve-meeting-bookings`

2. **Email/notification system**
   - Send email to approvers when booking is created
   - Notify user when booking is approved/rejected
   - Send reminder 15 minutes before meeting

3. **Multi-level approval (optional)**
   - For VIP rooms or large meetings, require multiple approvals
   - Approval chain: User → Manager → Director

---

### Requirement #2: Receptionist Override & Blocking ⚠️ NEEDS IMPLEMENTATION
**Current Status:** ReceptionistPanel exists but lacks override/blocking features

**What Needs to Be Built:**

#### A. Emergency Booking Override
Allow receptionist to override existing bookings for urgent situations.

**Implementation:**
```typescript
// Frontend: Add to ReceptionistPanel.tsx
interface EmergencyOverride {
  booking_id: number
  override_reason: string
  new_room_id?: number // Optional: move to different room
  notify_original_booker: boolean
}

// New button in ReceptionistPanel
<Button 
  variant="contained" 
  color="error"
  onClick={handleEmergencyOverride}
>
  Emergency Override
</Button>
```

**Backend: Add to BookingController**
```php
public function emergencyOverride(Request $request, int $bookingId): JsonResponse
{
    $request->validate([
        'override_reason' => 'required|string',
        'new_room_id' => 'nullable|exists:meeting_rooms,id',
        'notify_original_booker' => 'boolean',
    ]);
    
    // Check receptionist permission
    if (!auth()->user()->hasPermissionTo('emergency-override-booking')) {
        return $this->errorResponse('Unauthorized', 403);
    }
    
    $result = $this->bookingService->emergencyOverride(
        $bookingId,
        $request->override_reason,
        $request->new_room_id
    );
    
    // Send notification to original booker if requested
    if ($request->notify_original_booker) {
        // Notify via email/notification
    }
    
    return $this->successResponse($result);
}
```

#### B. Room Blocking Feature
Allow receptionist to block rooms for maintenance, VIP events, or urgent meetings.

**Frontend: New component `RoomBlockDialog.tsx`**
```typescript
interface BlockRoomData {
  room_id: number
  block_type: 'maintenance' | 'vip' | 'urgent' | 'other'
  block_reason: string
  start_time: Date
  end_time: Date
  cancel_existing_bookings: boolean
  notify_affected_users: boolean
}
```

**Backend: Add to MeetingRoomController**
```php
public function blockRoom(Request $request, int $roomId): JsonResponse
{
    $request->validate([
        'block_type' => 'required|in:maintenance,vip,urgent,other',
        'block_reason' => 'required|string',
        'start_time' => 'required|date',
        'end_time' => 'required|date|after:start_time',
        'cancel_existing_bookings' => 'boolean',
    ]);
    
    // Create a special booking with status 'blocked'
    // Or update room status to 'blocked' with metadata
    
    // Cancel conflicting bookings if requested
    if ($request->cancel_existing_bookings) {
        $this->bookingService->cancelConflictingBookings(
            $roomId,
            $request->start_time,
            $request->end_time,
            $request->block_reason
        );
    }
    
    return $this->successResponse($result, 'Room blocked successfully');
}

public function unblockRoom(int $roomId): JsonResponse
{
    // Remove block and set room status back to 'available'
}
```

**Database Migration:**
```sql
ALTER TABLE meeting_rooms 
ADD COLUMN blocked_until DATETIME NULL,
ADD COLUMN block_reason TEXT NULL,
ADD COLUMN blocked_by_user_id INT NULL;
```

---

### Requirement #3: Receptionist Drag-and-Drop for Approved Bookings ⚠️ NEEDS IMPLEMENTATION
**Current Status:** BookingCalendar exists but no drag-and-drop

**Implementation Plan:**

#### A. Install React DnD Library
```bash
npm install react-dnd react-dnd-html5-backend @dnd-kit/core @dnd-kit/sortable
```

#### B. Modify BookingCalendar.tsx
```typescript
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'

// Add drag-and-drop only for receptionist role
const canDragBooking = (booking: Booking) => {
  return (
    booking.status === 'approved' && 
    hasPermission('drag-drop-bookings') // Receptionist permission
  )
}

// Draggable booking card
function DraggableBookingCard({ booking }: { booking: Booking }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: booking.id,
    data: booking,
  })
  
  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{ cursor: 'move' }}
    >
      <CardContent>
        <Typography>{booking.title}</Typography>
        <Typography variant="caption">
          {format(new Date(booking.start_time), 'HH:mm')} - 
          {format(new Date(booking.end_time), 'HH:mm')}
        </Typography>
      </CardContent>
    </Card>
  )
}

// Droppable time slot
function DroppableTimeSlot({ date, hour, roomId }: TimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${roomId}-${date}-${hour}`,
    data: { date, hour, roomId },
  })
  
  return (
    <Box
      ref={setNodeRef}
      sx={{
        border: isOver ? '2px solid blue' : '1px solid #ddd',
        backgroundColor: isOver ? '#e3f2fd' : 'white',
      }}
    >
      {/* Time slot content */}
    </Box>
  )
}

// Handle drag end
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  
  if (!over) return
  
  const booking = active.data.current as Booking
  const dropTarget = over.data.current as { date: Date; hour: number; roomId: number }
  
  // Calculate new start and end times
  const newStartTime = new Date(dropTarget.date)
  newStartTime.setHours(dropTarget.hour, 0, 0, 0)
  
  const duration = (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 1000 / 60
  const newEndTime = new Date(newStartTime.getTime() + duration * 60 * 1000)
  
  // Update booking via API (no re-approval needed for receptionist)
  updateBookingTime(booking.id, {
    room_id: dropTarget.roomId,
    start_time: newStartTime.toISOString(),
    end_time: newEndTime.toISOString(),
    skip_approval: true, // Receptionist privilege
  })
}
```

#### C. Backend Support
```php
// In BookingController
public function receptionistUpdate(Request $request, int $id): JsonResponse
{
    // Only receptionist can update without re-approval
    if (!auth()->user()->hasPermissionTo('drag-drop-bookings')) {
        return $this->errorResponse('Unauthorized', 403);
    }
    
    $request->validate([
        'room_id' => 'nullable|exists:meeting_rooms,id',
        'start_time' => 'required|date',
        'end_time' => 'required|date|after:start_time',
        'skip_approval' => 'boolean',
    ]);
    
    // Check if new time slot is available
    $isAvailable = $this->meetingRoomService->checkAvailability(
        $request->room_id,
        $request->start_time,
        $request->end_time,
        $id // Exclude current booking
    );
    
    if (!$isAvailable) {
        return $this->errorResponse('Time slot not available', 400);
    }
    
    // Update without changing approval status
    $result = $this->bookingService->updateBooking($id, [
        'room_id' => $request->room_id,
        'start_time' => $request->start_time,
        'end_time' => $request->end_time,
        'updated_by_receptionist' => auth()->id(),
        'skip_reapproval' => true,
    ]);
    
    // Log the change in audit log
    AuditLog::create([
        'user_id' => auth()->id(),
        'action' => 'receptionist_drag_drop',
        'module' => 'meeting_rooms',
        'record_id' => $id,
        'changes' => json_encode([
            'old_time' => $booking->start_time,
            'new_time' => $request->start_time,
        ]),
    ]);
    
    // Notify the original booker
    // Notification::send(...)
    
    return $this->successResponse($result);
}
```

---

### Requirement #4: Calendar View for Users ✅ IMPLEMENTED
**Current Status:** Fully working in BookingCalendar.tsx

**Existing Features:**
- Week, day, and month views
- Time slot visualization
- Color-coded booking status (pending, approved, rejected)
- Filter by room
- Create new booking by clicking time slot
- View booking details by clicking booking card

**Suggested Enhancements:**
1. **Personal calendar filter**
   - "My Bookings" toggle to show only user's bookings
   - Different color for own bookings

2. **Booking conflicts warning**
   - Show warning if user has overlapping bookings
   - Suggest alternative times

3. **Quick filters**
   - By department
   - By meeting type (internal, external, training)
   - By capacity needs

4. **Export to Google Calendar / Outlook**
   - Add .ics file download
   - Sync button for calendar integration

---

### Requirement #5: LCD Dashboard (Public Display) ✅ IMPLEMENTED + ENHANCEMENTS
**Current Status:** RoomLCDDisplay.tsx exists and shows room status

**Existing Features:**
- Real-time room status (Available, In Use, Reserved Soon)
- Current booking info
- Next booking info
- Today's schedule
- Auto-refresh every 30 seconds
- Optimized for 1920x1080 landscape displays

**Route Structure:**
- `/meeting-rooms/display/:roomId` - Single room LCD (for mounting outside each room)
- `/meeting-rooms/display-all` - All rooms overview (for reception/lobby)

**Suggested Enhancements:**

#### A. Multi-Room Dashboard (Already Planned)
Create a component to show all rooms at once for lobby display.

**New Component: `AllRoomsLCDDisplay.tsx`**
```typescript
const AllRoomsLCDDisplay: React.FC = () => {
  const { rooms, bookings, fetchRooms, fetchBookings } = useMeetingRoomsWithBookings()
  
  return (
    <Box sx={{ width: '100vw', height: '100vh', background: '#f5f5f5', p: 3 }}>
      <Grid container spacing={2}>
        {rooms.map(room => (
          <Grid item xs={12} md={6} lg={4} key={room.id}>
            <RoomStatusCard 
              room={room} 
              currentBooking={getCurrentBooking(room.id)}
              nextBooking={getNextBooking(room.id)}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Timeline view at bottom */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '200px' }}>
        <TimelineView rooms={rooms} bookings={bookings} />
      </Box>
    </Box>
  )
}
```

#### B. Timeline View (NEW FEATURE)
Add horizontal timeline showing all rooms' schedules side by side.

**New Component: `RoomTimelineView.tsx`**
```typescript
/**
 * TIMELINE VIEW
 * Shows all rooms in a horizontal timeline format
 * Similar to Google Calendar's schedule view
 */
const RoomTimelineView: React.FC = () => {
  const { rooms, bookings } = useMeetingRoomsWithBookings()
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Business hours: 7 AM - 8 PM
  const businessHours = Array.from({ length: 13 }, (_, i) => i + 7)
  
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ minWidth: 150 }}>Room</TableCell>
            {businessHours.map(hour => (
              <TableCell key={hour} sx={{ minWidth: 100 }}>
                {hour}:00
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rooms.map(room => (
            <TableRow key={room.id}>
              <TableCell>
                <Typography fontWeight="bold">{room.name}</Typography>
                <Typography variant="caption">{room.capacity} seats</Typography>
              </TableCell>
              {businessHours.map(hour => {
                const booking = getBookingAtTime(room.id, hour)
                return (
                  <TableCell 
                    key={hour}
                    sx={{
                      backgroundColor: booking 
                        ? booking.status === 'approved' ? '#4caf50' 
                        : booking.status === 'pending' ? '#ff9800'
                        : '#f44336'
                        : 'white',
                      color: booking ? 'white' : 'inherit',
                      borderLeft: isCurrentHour(hour) ? '3px solid red' : undefined,
                    }}
                  >
                    {booking && (
                      <Tooltip title={booking.title}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {format(new Date(booking.start_time), 'HH:mm')}
                          </Typography>
                          <Typography variant="caption" noWrap>
                            {booking.title}
                          </Typography>
                        </Box>
                      </Tooltip>
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
```

**Add to Routes:**
```typescript
// In App.tsx
<Route 
  path="/meeting-rooms/timeline" 
  element={<RoomTimelineView />} 
/>
```

#### C. QR Code Check-in
Add QR codes on LCD displays for quick check-in.

```typescript
// In RoomLCDDisplay.tsx
import QRCode from 'qrcode.react'

<Box sx={{ position: 'absolute', top: 20, right: 20 }}>
  <QRCode 
    value={`${window.location.origin}/meeting-rooms/check-in/${roomId}`}
    size={150}
  />
  <Typography variant="caption" textAlign="center">
    Scan to Check-In
  </Typography>
</Box>
```

#### D. Touch Screen Support
Make LCD displays interactive with touch capability.

```typescript
// Add touch buttons for quick actions
<Stack direction="row" spacing={2} sx={{ mt: 2 }}>
  <Button 
    variant="contained" 
    size="large"
    onClick={() => handleQuickBooking(30)} // 30 min quick book
    disabled={status !== 'available'}
  >
    Book Now (30 min)
  </Button>
  
  <Button 
    variant="contained" 
    size="large"
    onClick={() => handleExtendBooking(30)}
    disabled={!currentBooking}
  >
    Extend (30 min)
  </Button>
  
  <Button 
    variant="outlined" 
    size="large"
    onClick={() => handleCheckIn()}
    disabled={!currentBooking}
  >
    Check In
  </Button>
</Stack>
```

---

## 🚀 Additional Ideas & Enhancements

### 1. Smart Meeting Room Features

#### A. Auto-Release for No-Shows
Automatically release rooms if booking is not checked-in within 15 minutes of start time.

**Backend: Add to BookingWorkflowService**
```php
// Schedule job to run every 5 minutes
public function releaseNoShows(): void
{
    $noShowBookings = Booking::where('status', 'approved')
        ->where('checkin_status', 'not-checked-in')
        ->where('start_time', '<', now()->subMinutes(15))
        ->get();
    
    foreach ($noShowBookings as $booking) {
        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => 'Auto-cancelled: No-show after 15 minutes',
        ]);
        
        // Notify user
        // Make room available again
    }
}
```

#### B. Meeting Room Analytics Dashboard
Track room utilization, popular times, average meeting duration, etc.

**New Component: `RoomAnalyticsDashboard.tsx`**
```typescript
// Show metrics:
// - Room utilization rate (% of time booked vs available)
// - Most popular rooms
// - Peak booking hours
// - Average meeting duration
// - No-show rate
// - Most active departments
```

#### C. Recurring Bookings
Allow users to book recurring meetings (daily, weekly, monthly).

**Frontend: Add to BookingDialog**
```typescript
interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  repeat_on: number[] // Days of week (0-6) or day of month (1-31)
  end_date: Date
  end_after_occurrences?: number
}
```

**Backend: Already has `room_recurring_bookings` table**

#### D. Equipment Request Integration
Link with IT equipment (projectors, whiteboards, laptops, video conference).

```typescript
interface BookingEquipment {
  projector: boolean
  whiteboard: boolean
  video_conference: boolean
  laptop: boolean
  additional_notes: string
}

// Auto-assign equipment when booking approved
// Track equipment availability
```

### 2. User Experience Improvements

#### A. Booking Templates
Save frequently used booking configurations.

```typescript
interface BookingTemplate {
  id: number
  name: string
  room_id: number
  duration: number // minutes
  attendees: number
  purpose: string
  equipment_needed: string[]
}

// Quick "Book like last time" button
<Button onClick={() => applyTemplate(lastBookingTemplate)}>
  Book Similar Meeting
</Button>
```

#### B. Suggested Rooms
AI-powered room suggestions based on:
- Meeting purpose
- Number of attendees
- Required equipment
- Historical preferences
- Current availability

```typescript
const suggestedRooms = await getRoomSuggestions({
  attendees: 15,
  purpose: 'team_meeting',
  equipment: ['projector', 'whiteboard'],
  date: '2026-01-15',
  time: '14:00',
})
```

#### C. Waiting List
Allow users to join waiting list if preferred room/time is booked.

```typescript
// When booking fails due to unavailability
<Alert severity="info">
  This room is booked. 
  <Button onClick={joinWaitingList}>Join Waiting List</Button>
</Alert>

// If booking is cancelled, notify waiting list users
```

### 3. Integration Features

#### A. Email Calendar Integration
- Send .ics calendar invites
- Sync with Outlook/Google Calendar
- Auto-update when booking changes

#### B. Slack/Teams Integration
- Post meeting reminders to Slack channels
- Notify via Teams when booking approved
- Bot commands: `/book-room tomorrow 2pm 1 hour`

#### C. Badge/Card Reader Integration
- Auto check-in via employee badge swipe
- RFID access control integration
- Track actual room entry

### 4. Mobile App Features

#### A. Mobile Booking App
- Quick book on-the-go
- Push notifications for approvals/reminders
- QR code scanner for check-in
- View today's bookings

#### B. Voice Assistant
- "Alexa, book meeting room A for 2 PM today"
- "Hey Siri, extend my meeting by 30 minutes"

---

## 📊 Recommended Permissions Structure

Create these permissions in your system:

```typescript
const meetingRoomPermissions = [
  // Basic user permissions
  'view-meeting-rooms',
  'view-room-calendar',
  'create-booking',
  'view-my-bookings',
  'cancel-my-booking',
  'check-in-booking',
  
  // Manager permissions
  'approve-bookings',
  'reject-bookings',
  'view-all-bookings',
  'cancel-any-booking',
  'view-room-analytics',
  
  // Receptionist permissions
  'create-walk-in-booking',
  'drag-drop-bookings',
  'emergency-override-booking',
  'block-room',
  'unblock-room',
  'quick-book-no-approval',
  
  // Admin permissions
  'manage-meeting-rooms',
  'configure-room-settings',
  'view-system-analytics',
  'export-booking-data',
]
```

---

## 🎯 Implementation Priority

### Phase 1: Critical Features (Week 1-2)
1. ✅ Room blocking feature for receptionist
2. ✅ Emergency override functionality
3. ✅ Permission-based approval routing
4. ✅ Email notifications for bookings

### Phase 2: Enhanced UX (Week 3-4)
1. ✅ Drag-and-drop booking rescheduling
2. ✅ Timeline view component
3. ✅ All-rooms LCD dashboard
4. ✅ QR code check-in
5. ✅ Auto-release no-shows

### Phase 3: Advanced Features (Week 5-6)
1. ✅ Recurring bookings
2. ✅ Booking templates
3. ✅ Room suggestions AI
4. ✅ Analytics dashboard
5. ✅ Equipment request integration

### Phase 4: Integrations (Week 7-8)
1. ✅ Calendar sync (.ics export)
2. ✅ Slack/Teams notifications
3. ✅ Badge reader integration
4. ✅ Mobile app development

---

## 💡 Quick Wins (Implement First)

1. **Add "Block Room" button to ReceptionistPanel** (2 hours)
2. **Add permission check to approve/reject buttons** (1 hour)
3. **Create AllRoomsLCDDisplay component** (3 hours)
4. **Add QR codes to LCD displays** (1 hour)
5. **Email notifications on booking events** (4 hours)

---

## 🔧 Technical Stack Recommendations

### Frontend Libraries to Add
```json
{
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "qrcode.react": "^3.1.0",
  "date-fns-tz": "^2.0.0",
  "react-big-calendar": "^1.8.5" // Alternative calendar library
}
```

### Backend Packages to Add
```json
{
  "spatie/laravel-permission": "^5.11", // Already have
  "guzzlehttp/guzzle": "^7.8", // For external integrations
  "laravel/scout": "^10.0", // For search functionality
  "pusher/pusher-php-server": "^7.2" // Real-time updates
}
```

---

## 📝 Database Schema Enhancements

```sql
-- Add to meeting_rooms table
ALTER TABLE meeting_rooms 
ADD COLUMN blocked_until DATETIME NULL,
ADD COLUMN block_reason TEXT NULL,
ADD COLUMN blocked_by_user_id INT NULL,
ADD COLUMN qr_code VARCHAR(255) NULL,
ADD COLUMN touch_enabled BOOLEAN DEFAULT FALSE;

-- Add to room_bookings table
ALTER TABLE room_bookings
ADD COLUMN updated_by_receptionist_id INT NULL,
ADD COLUMN skip_reapproval BOOLEAN DEFAULT FALSE,
ADD COLUMN waiting_list_position INT NULL,
ADD COLUMN template_id INT NULL,
ADD COLUMN equipment_requested JSON NULL,
ADD COLUMN auto_cancelled_reason VARCHAR(255) NULL;

-- Create booking_templates table
CREATE TABLE booking_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    room_id INT NULL,
    duration_minutes INT NOT NULL,
    attendees INT NULL,
    purpose TEXT NULL,
    equipment JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create booking_waiting_list table
CREATE TABLE booking_waiting_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    priority INT DEFAULT 0,
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎬 Next Steps

Would you like me to:

1. **Implement the room blocking feature first?**
   - Add block/unblock endpoints to backend
   - Create RoomBlockDialog component
   - Add UI to ReceptionistPanel

2. **Build the drag-and-drop functionality?**
   - Install @dnd-kit library
   - Modify BookingCalendar with DnD support
   - Add receptionist update endpoint

3. **Create the timeline view component?**
   - Build RoomTimelineView.tsx
   - Add horizontal schedule display
   - Integrate with existing hooks

4. **Build the all-rooms LCD dashboard?**
   - Create AllRoomsLCDDisplay.tsx
   - Add route /meeting-rooms/display-all
   - Design multi-room grid layout

5. **Set up the permission structure?**
   - Create 15 meeting room permissions
   - Assign to appropriate roles
   - Add permission checks to frontend

Let me know which feature you'd like to tackle first, and I'll provide the complete implementation code!
