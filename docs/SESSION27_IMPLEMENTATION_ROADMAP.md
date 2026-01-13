# 🎯 SESSION 27 - IMPLEMENTATION ROADMAP

**Date:** January 13, 2026  
**Developer:** Daniel Rizaldy - Senior IT Developer Programmer  
**Status:** ✅ Permissions Fixed | 🚀 Ready for Next Phase

---

## ✅ COMPLETED (Session 27)

### Critical Fix: Admin Panel Permissions
- ✅ Fixed "0 Permissions" issue
- ✅ Added `display_name` for roles and permissions
- ✅ Fixed frontend/backend data model mismatch
- ✅ Migration ready: `2026_01_13_add_display_name_to_roles.php`

**Files Modified:** 7 code files + 1 migration  
**Documentation:** Consolidated to 2 files only

---

## 🎯 YOUR REQUIREMENTS - IMPLEMENTATION PLAN

### **A. WEB-APP FEATURES**

#### 1. ✅ Meeting Room Booking (Partially Complete)
**Status:** Basic booking works, needs enhancements

**Remaining:**
- [ ] Monthly calendar view
- [ ] Status overview per month
- [ ] Better UI/UX

**Files:** `frontend/web-app/src/pages/MeetingRooms/CalendarView.tsx`  
**Effort:** 2 hours

---

#### 2. ✅ All Users Can Create Requests (COMPLETE)
**Status:** ✅ Working  
**No action needed**

---

#### 3. ⏳ Superadmin & Director Approval
**Status:** Backend complete, frontend needs implementation

**Implementation:**
```typescript
// frontend/web-app/src/pages/MeetingRooms/ApprovalPanel.tsx
const handleApprove = async (bookingId: number) => {
  await client.post(`/meeting-rooms/bookings/${bookingId}/approve`, {
    notes: approvalNotes
  });
  showNotification('Booking approved successfully');
  refreshList();
};
```

**Files to Modify:**
- `frontend/web-app/src/pages/MeetingRooms/ApprovalPanel.tsx`
- Add approval buttons and modal
- Add rejection with reason

**Effort:** 3 hours

---

#### 4. ⏳ Receptionist Drag & Drop + Override/Block
**Status:** Not implemented

**Implementation:**
```bash
# Install library
cd frontend/web-app
npm install react-beautiful-dnd @types/react-beautiful-dnd
```

```typescript
// ReceptionistPanel.tsx
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const handleDragEnd = (result) => {
  if (!result.destination) return;
  
  const booking = bookings[result.source.index];
  const newTime = calculateNewTime(result.destination.index);
  
  // Show confirmation for override
  if (hasConflict(booking, newTime)) {
    showConfirmDialog('Override existing booking?');
  }
  
  await client.put(`/meeting-rooms/bookings/${booking.id}/reschedule`, {
    start_time: newTime.start,
    end_time: newTime.end,
    override: true
  });
};
```

**Features:**
- Drag approved bookings to new time slots
- Override confirmation dialog
- Block room functionality (maintenance mode)
- Visual feedback during drag

**Files:**
- `frontend/web-app/src/pages/MeetingRooms/ReceptionistPanel.tsx`
- `services/meeting-room-service/src/controllers/BookingController.php`

**Effort:** 4-5 hours

---

#### 5. ⏳ SLA in Ticketing + Auto-Assign to Admin
**Status:** Not implemented

**Database Migration:**
```sql
-- File: services/ticket-service/database/migrations/2026_01_14_add_sla_to_tickets.php
ALTER TABLE tickets 
ADD COLUMN sla_response_due DATETIME NULL AFTER priority,
ADD COLUMN sla_resolution_due DATETIME NULL AFTER sla_response_due,
ADD COLUMN sla_status ENUM('on_track', 'at_risk', 'breached') DEFAULT 'on_track',
ADD COLUMN auto_assigned BOOLEAN DEFAULT FALSE;

CREATE TABLE ticket_sla_rules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL,
    response_time_hours INT NOT NULL COMMENT 'Hours to first response',
    resolution_time_hours INT NOT NULL COMMENT 'Hours to resolution',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY priority_unique (priority)
);

-- Seed SLA rules
INSERT INTO ticket_sla_rules (priority, response_time_hours, resolution_time_hours) VALUES
('urgent', 1, 4),
('high', 4, 24),
('medium', 8, 72),
('low', 24, 168);
```

**Implementation:**
```php
// services/ticket-service/src/Services/SLAService.php
class SLAService
{
    public function calculateSLA(Ticket $ticket): array
    {
        $rule = SLARuleModel::where('priority', $ticket->priority)->first();
        
        $responseDue = Carbon::parse($ticket->created_at)
            ->addHours($rule->response_time_hours);
        $resolutionDue = Carbon::parse($ticket->created_at)
            ->addHours($rule->resolution_time_hours);
        
        return [
            'response_due' => $responseDue,
            'resolution_due' => $resolutionDue,
            'status' => $this->calculateStatus($ticket, $responseDue, $resolutionDue)
        ];
    }
    
    public function autoAssignToAdmin(Ticket $ticket): User
    {
        // Get all active admins
        $admins = User::role('admin')
            ->where('is_active', true)
            ->get();
        
        // Calculate workload (open + in_progress tickets)
        $adminWorkload = $admins->map(function($admin) {
            return [
                'user' => $admin,
                'count' => Ticket::where('assigned_to', $admin->id)
                    ->whereIn('status', ['open', 'in_progress'])
                    ->count()
            ];
        })->sortBy('count');
        
        // Assign to admin with least workload
        $assignedAdmin = $adminWorkload->first()['user'];
        
        $ticket->update([
            'assigned_to' => $assignedAdmin->id,
            'auto_assigned' => true
        ]);
        
        return $assignedAdmin;
    }
}

// TicketController.php - store method
public function store(Request $request)
{
    $ticket = Ticket::create([
        'created_by' => auth()->id(), // Auto-populate
        // ... other fields
    ]);
    
    // Calculate SLA
    $sla = app(SLAService::class)->calculateSLA($ticket);
    $ticket->update([
        'sla_response_due' => $sla['response_due'],
        'sla_resolution_due' => $sla['resolution_due'],
        'sla_status' => $sla['status']
    ]);
    
    // Auto-assign to admin
    $assignedAdmin = app(SLAService::class)->autoAssignToAdmin($ticket);
    
    // Send notification
    Notification::send($assignedAdmin, new TicketAssignedNotification($ticket));
    
    return response()->json(['success' => true, 'data' => $ticket]);
}
```

**Frontend Indicators:**
```typescript
// TicketCard.tsx
const getSLAColor = (status: string) => {
  switch(status) {
    case 'on_track': return 'success';
    case 'at_risk': return 'warning';
    case 'breached': return 'error';
  }
};

<Chip 
  label={`Response due: ${formatDistance(slaResponseDue, new Date())}`}
  color={getSLAColor(slaStatus)}
  size="small"
/>
```

**Effort:** 5-6 hours

---

#### 6. ✅ Created By Auto-Generated (EASY)
**Status:** Will be included in #5 above

**Implementation:** Add to TicketController:
```php
'created_by' => auth()->id()
```

**Effort:** Already included in #5

---

#### 7. ⏳ Import/Export Assets & Spareparts
**Status:** Not implemented

**Installation:**
```bash
cd services/asset-service
composer require maatwebsite/excel
```

**Implementation:**
```php
// services/asset-service/app/Exports/AssetsExport.php
class AssetsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $filters;
    
    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }
    
    public function collection()
    {
        $query = Asset::with(['type', 'model', 'location', 'assignedTo']);
        
        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }
        if (!empty($this->filters['type_id'])) {
            $query->where('type_id', $this->filters['type_id']);
        }
        if (!empty($this->filters['location_id'])) {
            $query->where('location_id', $this->filters['location_id']);
        }
        
        return $query->get();
    }
    
    public function headings(): array
    {
        return [
            'Asset Tag', 'Name', 'Type', 'Model', 'Serial Number',
            'Purchase Date', 'Purchase Price', 'Status', 'Location',
            'Assigned To', 'Notes'
        ];
    }
    
    public function map($asset): array
    {
        return [
            $asset->asset_tag,
            $asset->name,
            $asset->type->name ?? '',
            $asset->model->name ?? '',
            $asset->serial_number,
            $asset->purchase_date,
            $asset->purchase_price,
            $asset->status,
            $asset->location->name ?? '',
            $asset->assignedTo->name ?? '',
            $asset->notes,
        ];
    }
}

// app/Imports/AssetsImport.php
class AssetsImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new Asset([
            'asset_tag' => $row['asset_tag'],
            'name' => $row['name'],
            'type_id' => AssetType::where('name', $row['type'])->first()?->id,
            'serial_number' => $row['serial_number'],
            'purchase_date' => $row['purchase_date'],
            'purchase_price' => $row['purchase_price'],
            'status' => $row['status'],
            'notes' => $row['notes'],
        ]);
    }
    
    public function rules(): array
    {
        return [
            'asset_tag' => 'required|unique:assets,asset_tag',
            'name' => 'required',
            'type' => 'required',
        ];
    }
}

// AssetController.php
public function export(Request $request)
{
    $filters = $request->only(['status', 'type_id', 'location_id']);
    return Excel::download(new AssetsExport($filters), 'assets_'.date('Y-m-d').'.xlsx');
}

public function import(Request $request)
{
    $request->validate([
        'file' => 'required|mimes:xlsx,xls,csv|max:5120'
    ]);
    
    try {
        Excel::import(new AssetsImport, $request->file('file'));
        return response()->json(['success' => true, 'message' => 'Assets imported successfully']);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
    }
}
```

**Frontend:**
```typescript
// AssetsPage.tsx
const handleExport = async () => {
  const filters = { status, type_id, location_id };
  const response = await client.get('/assets/export', { params: filters, responseType: 'blob' });
  downloadFile(response.data, `assets_${new Date().toISOString()}.xlsx`);
};

const handleImport = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  await client.post('/assets/import', formData);
  showNotification('Assets imported successfully');
  refreshList();
};
```

**Effort:** 5-6 hours

---

#### 8. ⏳ Daily Activities for IT Support
**Status:** Not implemented

**Database:**
```sql
-- services/ticket-service/database/migrations/2026_01_14_create_daily_activities.php
CREATE TABLE daily_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'IT Support staff',
    date DATE NOT NULL,
    activity_type ENUM('maintenance', 'support', 'installation', 'training', 'meeting', 'other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    ticket_id BIGINT UNSIGNED NULL COMMENT 'Related ticket if any',
    asset_id BIGINT UNSIGNED NULL COMMENT 'Related asset if any',
    location VARCHAR(255) NULL,
    status ENUM('pending', 'completed', 'approved', 'rejected') DEFAULT 'completed',
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, date),
    INDEX idx_date (date),
    INDEX idx_status (status)
);
```

**Implementation:**
```php
// DailyActivityController.php
public function store(Request $request)
{
    $request->validate([
        'date' => 'required|date',
        'activity_type' => 'required|in:maintenance,support,installation,training,meeting,other',
        'title' => 'required|string|max:255',
        'description' => 'required|string',
        'duration_minutes' => 'required|integer|min:1',
        'ticket_id' => 'nullable|exists:tickets,id',
        'asset_id' => 'nullable|exists:assets,id',
    ]);
    
    $activity = DailyActivity::create([
        'user_id' => auth()->id(),
        ...$request->all()
    ]);
    
    return response()->json(['success' => true, 'data' => $activity]);
}

public function myActivities(Request $request)
{
    $query = DailyActivity::where('user_id', auth()->id());
    
    if ($request->start_date) {
        $query->where('date', '>=', $request->start_date);
    }
    if ($request->end_date) {
        $query->where('date', '<=', $request->end_date);
    }
    
    return response()->json(['success' => true, 'data' => $query->get()]);
}

public function dashboard(Request $request)
{
    $userId = $request->user_id ?? auth()->id();
    $month = $request->month ?? now()->format('Y-m');
    
    $activities = DailyActivity::where('user_id', $userId)
        ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$month])
        ->get();
    
    $stats = [
        'total_activities' => $activities->count(),
        'total_hours' => round($activities->sum('duration_minutes') / 60, 2),
        'by_type' => $activities->groupBy('activity_type')->map->count(),
        'by_status' => $activities->groupBy('status')->map->count(),
    ];
    
    return response()->json(['success' => true, 'data' => $stats]);
}
```

**Frontend:**
```typescript
// DailyActivitiesPage.tsx - Form
const ActivityForm = () => {
  const [formData, setFormData] = useState({
    date: new Date(),
    activity_type: 'support',
    title: '',
    description: '',
    duration_minutes: 30,
    ticket_id: null,
    asset_id: null,
  });
  
  const handleSubmit = async () => {
    await client.post('/daily-activities', formData);
    showNotification('Activity logged successfully');
    refreshList();
  };
};

// Dashboard Widget
const ActivityStats = () => {
  const { data } = useSWR('/daily-activities/dashboard?month=2026-01', fetcher);
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Card>
          <CardContent>
            <Typography variant="h4">{data?.total_activities}</Typography>
            <Typography>Total Activities</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card>
          <CardContent>
            <Typography variant="h4">{data?.total_hours}h</Typography>
            <Typography>Total Hours</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
```

**Effort:** 6-7 hours

---

#### 9. ⏳ System Settings (Notifications, Language, Themes, Password)
**Status:** Partially implemented

**Remaining:**
- [ ] Notification preferences UI
- [ ] Language selector (i18n)
- [ ] Theme customization panel
- [ ] Change password form

**Implementation:**
```typescript
// SettingsPage.tsx
const SystemSettings = () => {
  return (
    <Tabs>
      <Tab label="Notifications">
        <NotificationSettings />
      </Tab>
      <Tab label="Language">
        <LanguageSelector />
      </Tab>
      <Tab label="Appearance">
        <ThemeCustomizer />
      </Tab>
      <Tab label="Security">
        <SecuritySettings />
      </Tab>
    </Tabs>
  );
};

// Language setup
npm install i18next react-i18next
```

**Effort:** 4 hours

---

#### 10. ⏳ Fix Dark Mode Theme Errors in Chrome
**Status:** Need to investigate

**Action Plan:**
1. Test all pages in dark mode
2. Identify specific errors from console
3. Fix CSS/MUI theme issues
4. Test in Chrome specifically

**Effort:** 2-3 hours (once issues identified)

---

### **B. ADMIN PANEL FEATURES**

#### 1. ⏳ Superadmin Manage Meeting Rooms
**Status:** Not implemented

**Implementation:**
```php
// admin-panel API routes
Route::middleware(['auth:api', 'role:superadmin'])->group(function () {
    Route::resource('meeting-rooms', MeetingRoomController::class);
});
```

```typescript
// admin-panel/src/pages/MeetingRooms.tsx
const MeetingRoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  
  const handleCreate = async (data) => {
    await client.post('/meeting-rooms', data);
  };
  
  const handleEdit = async (id, data) => {
    await client.put(`/meeting-rooms/${id}`, data);
  };
  
  const handleDelete = async (id) => {
    if (confirm('Delete this room?')) {
      await client.delete(`/meeting-rooms/${id}`);
    }
  };
};
```

**Effort:** 2 hours

---

#### 2. ✅ Arrange Roles, Pages, Permissions (FIXED!)
**Status:** ✅ Complete (Session 27)

---

#### 3. ⏳ Admin Panel Access Control
**Requirement:** Only daniel@quty.co.id (Developer) and superadmin can login

**Hierarchy:** 
```
daniel@quty.co.id (Developer)
  ↓
superadmin
  ↓
director
  ↓
manager
  ↓
hrd
  ↓
receptionist/admin
  ↓
user
```

**Implementation:**
```sql
-- Add Developer role
INSERT INTO roles (name, display_name, description, guard_name, is_system, level) 
VALUES ('developer', 'Developer', 'System Developer - Highest Access', 'api', true, 0);

-- Create Daniel's account
INSERT INTO users (username, email, password, name, is_active) 
VALUES ('daniel', 'daniel@quty.co.id', '$2y$10$...', 'Daniel Rizaldy', true);

-- Assign Developer role
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT id, 'App\\Models\\User', (SELECT id FROM users WHERE email = 'daniel@quty.co.id')
FROM roles WHERE name = 'developer';

-- Update roles table with hierarchy levels
UPDATE roles SET level = 0 WHERE name = 'developer';
UPDATE roles SET level = 1 WHERE name = 'superadmin';
UPDATE roles SET level = 2 WHERE name = 'director';
UPDATE roles SET level = 3 WHERE name = 'manager';
UPDATE roles SET level = 4 WHERE name = 'hrd';
UPDATE roles SET level = 5 WHERE name IN ('admin', 'receptionist');
UPDATE roles SET level = 6 WHERE name = 'user';
```

**Admin Panel Login Check:**
```typescript
// admin-panel/src/middleware/AuthMiddleware.tsx
export const requireAdminAccess = () => {
  const user = useAppSelector(state => state.auth.user);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Only Developer and Superadmin can access admin panel
    const allowedRoles = ['developer', 'superadmin'];
    const hasAccess = user.roles.some(role => allowedRoles.includes(role.name));
    
    if (!hasAccess) {
      toast.error('Access denied: Admin panel is restricted to Developers and Superadmins only');
      navigate('/unauthorized');
    }
  }, [user]);
  
  return user;
};

// Login page
const handleLogin = async (credentials) => {
  const response = await client.post('/auth/login', credentials);
  const user = response.data.user;
  
  // Check if user has admin panel access
  const allowedRoles = ['developer', 'superadmin'];
  const hasAccess = user.roles.some(role => allowedRoles.includes(role.name));
  
  if (!hasAccess) {
    throw new Error('You do not have permission to access the Admin Panel');
  }
  
  dispatch(setUser(user));
  navigate('/admin/dashboard');
};
```

**Effort:** 2 hours

---

#### 4. ✅ Permissions Show 0 (FIXED!)
**Status:** ✅ Fixed in Session 27

---

#### 5. ⏳ More Improvement Functions
**Suggestions:**

1. **User Activity Dashboard**
   - Real-time user login tracking
   - Activity heatmap
   - Session management

2. **Bulk Operations**
   - Bulk user import/export
   - Bulk role assignments
   - Bulk permission updates

3. **Advanced Audit Logs**
   - Filter by user, action, date range
   - Export audit reports
   - Visual timeline

4. **System Health Monitoring**
   - Service status dashboard
   - Database connection status
   - API response times
   - Error rate tracking

5. **Notification Center**
   - Admin notifications for system events
   - User action alerts
   - Critical error notifications

**Effort per feature:** 2-4 hours each

---

## 📋 PRIORITY EXECUTION PLAN

### Phase 1 (Week 1) - Critical
1. Deploy Session 27 migration (30 min)
2. Create Developer role + daniel@quty.co.id account (1 hour)
3. Implement admin panel access control (2 hours)
4. Meeting room approval workflow (3 hours)

**Total:** ~7 hours

### Phase 2 (Week 2) - High Priority
1. Receptionist drag & drop (5 hours)
2. SLA + auto-assign tickets (6 hours)
3. Daily activities for IT Support (7 hours)

**Total:** ~18 hours

### Phase 3 (Week 3) - Medium Priority
1. Import/Export assets (6 hours)
2. System settings UI (4 hours)
3. Superadmin meeting room management (2 hours)
4. Dark mode fixes (3 hours)

**Total:** ~15 hours

### Phase 4 (Week 4) - Enhancements
1. More improvement functions (8-12 hours)
2. Testing and bug fixes (4 hours)
3. Documentation updates (2 hours)

**Total:** ~14-18 hours

---

## 🚀 NEXT SESSION ACTION ITEMS

### Immediate (Session 28):
1. ✅ Deploy Session 27 migration
2. ✅ Verify permissions work
3. 🚀 Create Developer role
4. 🚀 Setup daniel@quty.co.id account
5. 🚀 Implement admin panel access control

**Estimated Time:** 4-5 hours

---

## 📊 PROGRESS TRACKING

**Total Requirements:** 15 items  
**Completed:** 3 items (20%)  
**In Progress:** 0 items  
**Not Started:** 12 items (80%)  

**Estimated Total Effort:** 54-64 hours  
**Target Completion:** End of January 2026

---

**Daniel Rizaldy - Senior IT Developer Programmer**  
*Deep Research · Deep Think · Deep Implementation*  
Updated: January 13, 2026
