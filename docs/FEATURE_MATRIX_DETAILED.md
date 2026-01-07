# FEATURE MATRIX - DETAILED REQUIREMENTS

## For Each Core Feature: Damage Reporting, Asset Management, Meeting Booking

---

# FEATURE 1: DAMAGE/MALFUNCTION REPORTING (TICKETING SYSTEM)

## Required Pages/Views

### Backend Pages (API Endpoints)
```
GET    /api/v1/tickets                    - Ticket list with filtering
GET    /api/v1/tickets/{id}               - Ticket detail
POST   /api/v1/tickets                    - Create new ticket
PUT    /api/v1/tickets/{id}               - Update ticket
DELETE /api/v1/tickets/{id}               - Delete ticket
POST   /api/v1/tickets/{id}/restore       - Restore deleted
POST   /api/v1/tickets/{id}/assign        - Assign to tech
POST   /api/v1/tickets/{id}/comments      - Add comment
POST   /api/v1/tickets/{id}/status        - Change status
GET    /api/v1/tickets/stats/summary      - Statistics
```

### Frontend Pages
```
✅ Exists:
  - /tickets                (TicketList.tsx)
  - /tickets/create         (TicketCreate.tsx)
  - /tickets/{id}           (TicketDetail.tsx)

❌ Missing:
  - Ticket assignment interface
  - Comment/update interface
  - SLA tracking view
  - Ticket history timeline
  - Bulk operations
```

## Required API Endpoints

### List Tickets
```
GET /api/v1/tickets?status=open&priority=high&assigned_to=5&page=1&limit=20

Response:
{
  data: [
    {
      id: 19,
      ticket_code: "TKT-20251210-001",
      subject: "PC tidak bisa booting",
      description: "PC tidak bisa Booting",
      priority_id: 3,
      status_id: 1,
      assigned_to: 6,
      created_at: "2025-12-10T06:51:35Z",
      sla_due: "2025-12-13T06:51:35Z",
      user: {...},
      assigned_user: {...}
    }
  ],
  pagination: {page: 1, limit: 20, total: 50}
}
```

### Create Ticket
```
POST /api/v1/tickets
{
  subject: "PC tidak bisa booting",
  description: "PC tidak bisa Booting",
  priority_id: 3,
  type_id: 1,
  location_id: 1,
  asset_id: 106,
  user_id: 5
}

Response:
{
  id: 19,
  ticket_code: "TKT-20251210-001",
  status_id: 1,
  sla_due: "2025-12-13T06:51:35Z",
  assigned_to: 6,
  created_at: "2025-12-10T06:51:35Z"
}
```

### Change Status
```
POST /api/v1/tickets/{id}/status
{
  status_id: 3,
  notes: "Issue resolved",
  internal_notes: "Fixed boot sector"
}
```

### Add Comment
```
POST /api/v1/tickets/{id}/comments
{
  comment: "Checked hard drive - appears corrupted",
  is_internal: false
}
```

### Assign Ticket
```
POST /api/v1/tickets/{id}/assign
{
  assigned_to: 6,
  assignment_type: "manual"
}
```

## Required Database Tables

### tickets
```sql
id (PK), ticket_code (UNIQUE), user_id (FK), assigned_to (FK), 
assigned_at, assignment_type (auto|manual|super_admin),
sla_due, first_response_at, resolved_at,
location_id (FK), asset_id (FK), ticket_status_id (FK),
ticket_type_id (FK), ticket_priority_id (FK),
subject, description, closed, created_at, updated_at

Indexes:
- ticket_code (UNIQUE)
- status_id, priority_id, assigned_to (composite)
- user_id, created_at (composite)
- sla_due, ticket_status_id (composite)
```

### ticket_comments
```sql
id (PK), ticket_id (FK), user_id (FK), comment (TEXT),
is_internal (boolean), created_at, updated_at

Indexes:
- ticket_id, is_internal (composite)
- user_id, created_at (composite)
```

### ticket_history
```sql
id (PK), ticket_id (FK), field_changed, old_value, new_value,
changed_by_user_id (FK), changed_at, change_type,
reason, event_type, data (JSON), created_at

Indexes:
- ticket_id, event_type (composite)
- changed_at, event_type (composite)
```

### tickets_statuses
```sql
id (PK), status (UNIQUE) - "Open", "Pending", "Resolved"
```

### tickets_priorities
```sql
id (PK), priority (UNIQUE) - "Low", "Medium", "High"
```

### tickets_types
```sql
id (PK), type (UNIQUE) - "Incident", "Problem", "Loan"
```

### sla_policies
```sql
id (PK), priority_id (FK), response_time_hours (int),
resolution_time_hours (int), is_active (bool),
created_at, updated_at
```

## Required Validations & Business Logic

### Ticket Creation
```
✓ Validate: subject NOT NULL, max 255 chars
✓ Validate: description NOT NULL, min 10 chars
✓ Validate: priority_id IS IN (1, 2, 3)
✓ Validate: type_id IS IN (1, 2, 3)
✓ Validate: location_id EXISTS in locations
✓ Validate: asset_id (if provided) EXISTS and status IN (Active, Deployed)
✓ Auto-generate: ticket_code = TKT-YYYYMMDD-XXX
✓ Auto-calculate: sla_due = NOW + SlaPolicy.resolution_time_hours
✓ Auto-set: status = Open, created_at = NOW
✓ Log: ticket_history event_type = "created"
```

### Ticket Assignment
```
✓ Validate: assigned_to is valid user
✓ Validate: user has 'technician' or higher role
✓ Update: assigned_to, assigned_at, assignment_type
✓ Log: ticket_history with field_changed = "assigned_to"
✓ Trigger: Notification to assigned user
✓ Update: first_response_at = NOW if first assignment
```

### Status Transitions
```
Allowed Transitions:
Open → Pending (by assignee)
Pending → Open (by assignee)
Pending → Resolved (by assignee)
Resolved → Closed (by admin/manager)

Restricted:
❌ Cannot transition from Closed back to any state
❌ Cannot transition directly Open → Resolved
```

### Comment System
```
✓ Can add comment as any role
✓ Internal comments (is_internal=true) visible only to staff
✓ Public comments visible to ticket creator
✓ All comments logged with user_id, timestamp
✓ Trigger: Notification on new comment to other stakeholders
```

### Audit Trail
```
✓ Log on creation: user_id, created_at
✓ Log on assignment: changed_by_user_id, old_value, new_value
✓ Log on status change: old_status, new_status, reason
✓ Log on comment: comment_id, user_id, is_internal
✓ All logs in ticket_history table
```

## Required Dependencies

```
Dependencies:
- users (for user_id, assigned_to)
- locations (for location_id)
- assets (for asset_id - if ticket type is asset-related)
- sla_policies (for SLA calculation)
- notifications (for trigger notifications)

Triggers:
- On ticket create: Send notification to manager
- On assignment: Send notification to assigned technician
- On status change: Notify relevant parties
- On comment: Notify ticket watchers
```

---

# FEATURE 2: ASSET MANAGEMENT & INVENTORY

## Required Pages/Views

### Backend API Endpoints
```
GET    /api/v1/assets                     - List all
GET    /api/v1/assets/{id}                - Get detail
POST   /api/v1/assets                     - Create new
PUT    /api/v1/assets/{id}                - Update
DELETE /api/v1/assets/{id}                - Delete (soft)
POST   /api/v1/assets/{id}/restore        - Restore
POST   /api/v1/assets/{id}/assign         - Assign to user
POST   /api/v1/assets/{id}/transfer       - Transfer location
GET    /api/v1/assets/qr/{qrCode}         - Lookup by QR
GET    /api/v1/assets/warranties/expiring - Expiring warranties
GET    /api/v1/assets/statistics          - Statistics

GET    /api/v1/asset-models               - List models
POST   /api/v1/asset-models               - Create model
GET    /api/v1/asset-models/{id}          - Get model
PUT    /api/v1/asset-models/{id}          - Update model
DELETE /api/v1/asset-models/{id}          - Delete model
GET    /api/v1/asset-models/by-type/{typeId}
GET    /api/v1/asset-models/by-manufacturer/{mfgId}
```

### Frontend Pages
```
✅ Exists:
  - /assets                 (AssetList.tsx)
  - /assets/create          (AssetCreate.tsx)
  - /assets/{id}            (AssetDetail.tsx)

❌ Missing:
  - Asset transfer dialog
  - Maintenance log UI
  - QR code scanner
  - Warranty tracking view
  - Asset history timeline
  - Bulk operations
  - Import/export interface
```

## Required API Endpoints

### List Assets
```
GET /api/v1/assets?status=active&division=3&location=5&page=1&limit=20&search=PC

Query Parameters:
  status: asset status ID
  division: division ID
  location: location ID
  assigned_to: user ID
  supplier: supplier ID
  page: pagination
  limit: items per page
  search: search in asset_tag, serial_number

Response:
{
  data: [
    {
      id: 101,
      asset_tag: "QC.13.08.222.01",
      name: "Dell Latitude E5470",
      qr_code: "AST-691AB58373C7A",
      serial_number: "1",
      model: {id: 1, name: "..."},
      status: {id: 2, name: "Deployed"},
      assigned_to: 29,
      assigned_user: {id: 29, name: "John Doe"},
      location: {id: ..., name: "..."},
      warranty_end_date: "2025-08-13",
      ip_address: "192.168.1.101",
      mac_address: "00:11:22:33:44:56"
    }
  ],
  pagination: {...}
}
```

### Create Asset
```
POST /api/v1/assets
{
  asset_tag: "QC.13.08.222.01",     // Or leave empty for auto-generation
  serial_number: "ABC123456",
  model_id: 1,
  division_id: 27,
  location_id: 5,
  supplier_id: 1,
  status_id: 2,
  warranty_months: 12,
  warranty_type_id: 1,
  purchase_date: "2024-08-13",
  notes: "Sample asset note"
}

Response:
{
  id: 261,
  asset_tag: "QC.13.08.222.01",
  qr_code: "AST-6923BBC920218",     // Auto-generated
  created_at: "2025-11-24T01:58:33Z"
}
```

### Assign Asset
```
POST /api/v1/assets/{id}/assign
{
  assigned_to: 29,
  notes: "Assigned to John Doe"
}

Updates:
- assigned_to = 29
- status_id = 2 (if not already Deployed)
- Create movement record
- Log audit trail
```

### Transfer Asset
```
POST /api/v1/assets/{id}/transfer
{
  location_id: 10,
  notes: "Moved to new office"
}

Updates:
- location_id = 10
- Create movement record
- Log audit trail
```

### QR Code Lookup
```
GET /api/v1/assets/qr/AST-691AB58373C7A

Response: Full asset object
```

### Expiring Warranties
```
GET /api/v1/assets/warranties/expiring?days=30

Returns assets with warranty expiring within 30 days

Response:
{
  data: [
    {
      id: 101,
      asset_tag: "QC.13.08.222.01",
      warranty_end_date: "2025-11-30",
      days_remaining: 10
    }
  ]
}
```

## Required Database Tables

### assets
```sql
id (PK), asset_tag (UNIQUE), name, qr_code (UNIQUE),
serial_number (UNIQUE), model_id (FK), division_id (FK),
location_id (FK), supplier_id (FK), movement_id (FK),
status_id (FK), assigned_to (FK), notes (TEXT),
ip_address, mac_address,
purchase_date, warranty_months, warranty_type_id (FK),
invoice_id (FK), purchase_order_id (FK),
created_at, updated_at, deleted_at

Indexes:
- asset_tag (UNIQUE)
- qr_code (UNIQUE)
- status_id, division_id (composite)
- assigned_to, status_id (composite)
- created_at, status_id (composite)
- asset_tag, serial_number, notes (FULLTEXT)
```

### asset_models
```sql
id (PK), name, manufacturer_id (FK), asset_type_id (FK),
description, specifications (JSON),
created_at, updated_at

Indexes:
- manufacturer_id, asset_type_id (composite)
```

### asset_types
```sql
id (PK), name (UNIQUE)
```

### manufacturers
```sql
id (PK), name (UNIQUE), website, contact_email
```

### asset_maintenance_logs
```sql
id (PK), asset_id (FK), ticket_id (FK), performed_by (FK),
maintenance_type (Preventive|Corrective|Emergency),
status (Scheduled|In-Progress|Completed|Failed),
description (TEXT), scheduled_at, completed_at,
created_at, updated_at

Indexes:
- asset_id, completed_at (composite)
- status, scheduled_at (composite)
```

### asset_lifecycle_events
```sql
id (PK), asset_id (FK), event_type (Purchase|Deploy|Repair|Transfer|Retire),
event_date, user_id (FK), details (JSON),
created_at

Indexes:
- asset_id, event_date (composite)
```

### movements
```sql
id (PK), asset_id (FK), location_id (FK), status_id (FK),
user_id (FK), moved_from_location_id (FK),
reason (TEXT), created_at

Indexes:
- asset_id, created_at (composite)
- location_id, created_at (composite)
```

## Required Validations & Business Logic

### Asset Creation
```
✓ Generate asset_tag if empty: Format = Division.DD.MM.YYYY.Sequence
✓ Generate qr_code: Format = AST-XXXXXXXXXXXXXXX (random hex)
✓ Validate: serial_number UNIQUE per supplier
✓ Validate: asset_tag UNIQUE globally
✓ Validate: qr_code UNIQUE globally
✓ Validate: model_id EXISTS
✓ Validate: division_id EXISTS
✓ Validate: supplier_id EXISTS
✓ Validate: warranty_months >= 0
✓ Auto-set: status = "Ready to Deploy" if new
✓ Calculate: warranty_end_date = purchase_date + warranty_months months
```

### Asset Assignment
```
✓ Validate: assigned_to is valid user
✓ Validate: asset status IS IN (Active, Deployed)
✓ Update: assigned_to, assigned_at = NOW
✓ Update: status = "Deployed" if "Ready to Deploy"
✓ Create: movement record
✓ Log: audit trail with assigned_to change
✓ Trigger: Notification to assigned user
```

### Asset Transfer
```
✓ Validate: location_id EXISTS
✓ Validate: asset exists and is not deleted
✓ Update: location_id = new location
✓ Store: previous location in moved_from_location_id
✓ Create: movement record with reason
✓ Log: audit trail
✓ Trigger: Notification to division manager
```

### Warranty Tracking
```
✓ Calculate: warranty_end_date = purchase_date + warranty_months
✓ Alert: 30 days before expiry (WARNING)
✓ Alert: 7 days before expiry (CRITICAL)
✓ Report: List all expiring warranties
✓ Validation: warranty_end_date cannot be in past on update
```

### Status Transitions
```
Valid Transitions:
Ready to Deploy → Deployed (on assignment)
Deployed → Active (after 24 hours in deployment)
Active ↔ Out for Repairs ↔ In Repairs ↔ Waiting for Repairs
Any State → Written Off - Broken (permanent)
Any State → Written Off - Age (permanent)

Restrictions:
❌ Cannot reverse Written Off status
❌ Cannot assign if Written Off
❌ Cannot transfer if Written Off
```

### QR Code Generation
```
✓ Generate on asset creation
✓ Format: AST-XXXXXXXXXXXXXXX (16 hex chars)
✓ Unique constraint enforced
✓ Queryable via API: GET /assets/qr/{qrCode}
✓ Scannable with mobile devices
```

## Required Dependencies

```
Dependencies:
- asset_models (model_id)
- manufacturers (via asset_models)
- asset_types (via asset_models)
- divisions (division_id)
- locations (location_id)
- suppliers (supplier_id)
- users (assigned_to, performed_by)
- statuses (status_id)
- warranty_types (warranty_type_id)
- tickets (for ticket linking)

Triggers:
- On assignment: Create movement record
- On transfer: Create movement record
- On warranty expiry: Send alert notification
- On maintenance complete: Update asset status
```

---

# FEATURE 3: MEETING ROOM BOOKING SYSTEM

## Required Pages/Views

### Backend API Endpoints
```
GET    /api/v1/meeting-rooms              - List rooms
GET    /api/v1/meeting-rooms/{id}         - Room detail
POST   /api/v1/meeting-rooms/available    - Check availability
POST   /api/v1/meeting-rooms/check-availability - Time slot check
POST   /api/v1/meeting-rooms              - Create room (admin)
PUT    /api/v1/meeting-rooms/{id}         - Update room
DELETE /api/v1/meeting-rooms/{id}         - Delete room
GET    /api/v1/meeting-rooms/{id}/statistics

GET    /api/v1/bookings                   - List bookings
POST   /api/v1/bookings                   - Create booking
GET    /api/v1/bookings/{id}              - Get booking detail
PUT    /api/v1/bookings/{id}              - Update booking
DELETE /api/v1/bookings/{id}              - Cancel booking
POST   /api/v1/bookings/{id}/approve      - Manager approve
POST   /api/v1/bookings/{id}/reject       - Manager reject
POST   /api/v1/bookings/{id}/cancel       - Cancel booking
GET    /api/v1/bookings/my/bookings       - User's bookings
GET    /api/v1/bookings/query/today       - Today's bookings
GET    /api/v1/bookings/query/upcoming    - Upcoming bookings
GET    /api/v1/bookings/query/statistics  - Statistics
```

### Frontend Pages
```
✅ Exists:
  - /meeting-rooms              (MeetingRoomsList.tsx)

❌ Missing:
  - Booking create/edit modal
  - Calendar view
  - Availability checker
  - Manager approval interface
  - Booking detail view
  - Room statistics view
  - Bulk operations
```

## Required API Endpoints

### List Meeting Rooms
```
GET /api/v1/meeting-rooms?page=1&limit=20

Response:
{
  data: [
    {
      id: 1,
      name: "Conference Room A",
      capacity: 20,
      location: "Building 1, Floor 2",
      amenities: ["Projector", "Whiteboard", "Video Conference"],
      manager_id: 14,
      manager: {id: 14, name: "Receptionist"},
      available_slots_today: 5
    }
  ]
}
```

### Check Availability
```
POST /api/v1/meeting-rooms/check-availability
{
  start_datetime: "2025-12-20T10:00:00Z",
  end_datetime: "2025-12-20T11:00:00Z"
}

Response:
{
  available_rooms: [
    {id: 1, name: "Conference Room A"},
    {id: 2, name: "Conference Room B"}
  ],
  unavailable_rooms: [
    {id: 3, name: "Conference Room C", booked_by: "John Doe"}
  ]
}
```

### Create Booking
```
POST /api/v1/bookings
{
  room_name: "Conference Room A",  // or room_id
  user_id: 5,
  start_datetime: "2025-12-20T10:00:00Z",
  end_datetime: "2025-12-20T11:00:00Z",
  purpose: "Team meeting",
  participants_count: 8,
  notes: "Please setup video conference"
}

Response:
{
  id: 174,
  booking_code: "BKG-20251220-001",
  status: "pending",      // Pending approval
  start_datetime: "2025-12-20T10:00:00Z",
  created_at: "2025-12-19T09:15:00Z"
}
```

### Manager Approve Booking
```
POST /api/v1/bookings/{id}/approve
{
  approved_by: 14,
  notes: "Approved"
}

Updates:
- status = "approved"
- approved_at = NOW
- approved_by = 14
- Sends notification to user
```

### Manager Reject Booking
```
POST /api/v1/bookings/{id}/reject
{
  approved_by: 14,
  reason: "Room already double-booked"
}

Updates:
- status = "rejected"
- approved_by = 14
- reason stored
- Sends notification to user
```

### Cancel Booking
```
DELETE /api/v1/bookings/{id}

or

POST /api/v1/bookings/{id}/cancel
{
  reason: "Meeting cancelled"
}

Updates:
- status = "cancelled"
- cancelled_at = NOW
- Sends notification to manager
```

### User's Bookings
```
GET /api/v1/bookings/my/bookings?status=pending&page=1

Response: User's bookings only
```

### Today's Bookings
```
GET /api/v1/bookings/query/today?room_name=Conference%20Room%20A

Response: All bookings for today
```

### Upcoming Bookings
```
GET /api/v1/bookings/query/upcoming?days=7

Response: Bookings in next 7 days
```

## Required Database Tables

### meeting_rooms
```sql
id (PK), name (UNIQUE), capacity (int), location (string),
amenities (JSON - array of features),
manager_id (FK), is_available (bool),
created_at, updated_at

Indexes:
- name (UNIQUE)
- manager_id
```

### meeting_room_bookings
```sql
id (PK), room_name (string), user_id (FK), approved_by (FK),
manager_id (FK), start_datetime, end_datetime,
status (Pending|Approved|Rejected|Cancelled),
purpose, participants_count (int), notes (TEXT),
created_at, updated_at

Indexes:
- room_name, start_datetime, end_datetime (composite - UNIQUE)
- user_id, status (composite)
- start_datetime, end_datetime (composite)
- status, start_datetime (composite)
- approved_by (for manager queries)
```

## Required Validations & Business Logic

### Booking Creation
```
✓ Validate: start_datetime < end_datetime
✓ Validate: start_datetime >= NOW + 1 hour (minimum booking lead time)
✓ Validate: end_datetime <= NOW + 30 days (maximum booking window)
✓ Validate: (end_datetime - start_datetime) >= 1 hour (minimum duration)
✓ Validate: (end_datetime - start_datetime) <= 8 hours (maximum duration)
✓ Validate: start_datetime >= 08:00:00 (business hours)
✓ Validate: end_datetime <= 18:00:00 (business hours)
✓ Validate: room_name EXISTS
✓ Validate: user_id EXISTS and is_active = true
✓ Check: No overlapping bookings for same room
  - NOT EXISTS (SELECT 1 FROM bookings
    WHERE room_name = ? AND status IN ('Approved', 'Pending')
    AND NOT (end_datetime <= ? OR start_datetime >= ?))
✓ Auto-set: status = "Pending"
✓ Auto-assign: manager_id from room configuration
```

### Availability Checking
```
✓ Query all bookings for room_name
✓ Filter: status IN ('Approved', 'Pending') and deleted_at IS NULL
✓ Check: No time overlap with requested slot
✓ Return: List of available/unavailable rooms
✓ Consider: Room capacity vs. participants_count
```

### Approval Workflow
```
Initial State: Pending
Manager Views: Pending bookings in their room(s)
Manager Action: Approve or Reject
Final States: Approved, Rejected, Cancelled

Pending → Approved (by manager)
Pending → Rejected (by manager)
Approved → Cancelled (by user or manager)
Rejected: Terminal (cannot reopen)
Cancelled: Terminal (cannot reactivate)
```

### Conflict Detection
```
✓ Before save: Check for overlapping bookings
✓ Excluded states: Rejected, Cancelled
✓ For time overlap check:
  - Overlap exists if: (start_datetime < existing_end) AND (end_datetime > existing_start)
✓ Return: Conflict details (room, conflicting booking, time)
```

### Status Transitions
```
Valid Paths:
Pending → Approved (manager action)
Pending → Rejected (manager action)
Approved → Cancelled (user or manager can cancel)
Pending → Cancelled (user or manager can cancel before approval)

Blocked Transitions:
❌ Rejected cannot be un-rejected
❌ Cancelled cannot be reopened
❌ Cannot modify dates for Approved bookings (must cancel & rebook)
```

### Notification Triggers
```
✓ On booking creation: Notify room manager (Pending approval)
✓ On approval: Notify user (Approved booking)
✓ On rejection: Notify user with reason (Rejected)
✓ On cancellation: Notify manager (Slot freed up)
✓ On day-of booking: Send reminder to user (if enabled)
```

### Reporting
```
✓ Room availability: % of time booked per room
✓ Popular rooms: Most booked rooms
✓ User booking patterns: Most frequent bookers
✓ Manager approval rate: # approved vs. rejected
✓ Cancellation rate: % of bookings cancelled
```

## Required Dependencies

```
Dependencies:
- users (user_id, manager_id, approved_by)
- meeting_rooms (room_name/room_id)
- notifications (for approval/rejection/cancellation)

Triggers:
- On Pending status: Notify room manager for approval
- On Approved status: Notify user confirmation
- On Rejected status: Notify user with reason
- On Cancelled status: Notify manager (slot freed)
- 24 hours before: Send reminder (if enabled)
```

---

# FEATURE DEPENDENCIES MATRIX

## Cross-Feature Dependencies

```
Ticket System:
  ↓ depends on ↓
  - Users (technician assignment)
  - Assets (optional: for asset-related tickets)
  - Locations (ticket location)
  - SLA Policies (for SLA calculation)
  - Notifications (approval/update notifications)

Asset System:
  ↓ depends on ↓
  - Users (assignment, performed_by)
  - Divisions (asset ownership)
  - Locations (asset location)
  - Manufacturers (asset model details)
  - Suppliers (asset sourcing)
  - Status codes (asset lifecycle)
  - Warranty types (warranty configuration)
  - Tickets (maintenance tracking)
  - Notifications (warranty alerts, assignment)

Meeting Rooms:
  ↓ depends on ↓
  - Users (requester, approver, manager)
  - Meeting rooms (room details)
  - Notifications (approval, rejection, cancellation)
```

## Shared Infrastructure Required

```
Authentication:
- User roles (Admin, Manager, Technician, User)
- Permission checks on all endpoints
- Token validation

Notifications:
- Email system
- Push notifications
- In-app notifications
- Notification preferences by user

Audit Trail:
- Activity logging
- Change tracking
- User action logging

Error Handling:
- Validation error responses
- Business logic error messages
- Exception handling

Pagination:
- Standard pagination support
- Sort/filter on list endpoints
```

---

**END OF FEATURE MATRIX**
