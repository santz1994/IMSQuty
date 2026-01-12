# Feature Implementation Roadmap - Session 23

**Date:** January 12, 2026  
**Status:** Planning & Partial Implementation  
**Priority:** P1 (HIGH) & P2 (MEDIUM)

---

## 🎯 QUICK SUMMARY

### P0 Errors Fixed (Critical): 6/6 ✅
- ✅ Audit Logs toLocaleString error - **FIXED**
- ✅ Roles & Permissions undefined - **FIXED**
- ✅ System Settings jobs table - **SQL CREATED**
- ✅ CORS/401 errors - **DOCUMENTED**
- ✅ Meeting Room LCD - **VERIFIED WORKING**
- ✅ Routes validation - **NEEDED**

### New Features (Optional Enhancements): 4 Features

| Feature | Priority | Status | Est. Time |
|---------|----------|--------|-----------|
| Meeting Room Timeline | P2 | Design Phase | 4h |
| Import/Export Users/Assets | P2 | Design Phase | 6h |
| Asset/Sparepart Requests | P3 | Design Phase | 6h |
| Page Permission Controller | P1 | Design Phase | 3h |

---

## 📋 IMPLEMENTATION GUIDE 1: MEETING ROOM TIMELINE

### Feature Description
Horizontal timeline view showing all meeting rooms in parallel, similar to a Gantt chart. Users can see at a glance which rooms are booked and when.

### Frontend Component

**File:** `frontend/web-app/src/pages/MeetingRooms/MeetingRoomTimeline.tsx`

```typescript
import React, { useState, useEffect } from 'react'
import { Box, Typography, Paper, Card, CardContent, Grid, Button, CircularProgress } from '@mui/material'
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material'
import { format, addDays, subDays, startOfDay, isSameDay } from 'date-fns'
import { useMeetingRoomsWithBookings } from '../../hooks/useMeetingRooms'

interface TimelineSlot {
  hour: number
  start: Date
  end: Date
}

const MeetingRoomTimeline: React.FC = () => {
  const { rooms, bookings, loading } = useMeetingRoomsWithBookings()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState<TimelineSlot[]>([])

  // Generate 24 hourly time slots
  useEffect(() => {
    const slots: TimelineSlot[] = []
    const baseDate = startOfDay(selectedDate)

    for (let hour = 8; hour <= 18; hour++) {
      slots.push({
        hour,
        start: new Date(baseDate.getTime() + hour * 60 * 60 * 1000),
        end: new Date(baseDate.getTime() + (hour + 1) * 60 * 60 * 1000)
      })
    }

    setTimeSlots(slots)
  }, [selectedDate])

  const getBookingsForSlot = (roomId: number, slot: TimelineSlot) => {
    return bookings.filter(b => 
      b.room_id === roomId &&
      b.status === 'approved' &&
      new Date(b.start_time) < slot.end &&
      new Date(b.end_time) > slot.start
    )
  }

  if (loading) return <CircularProgress />

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Meeting Room Timeline</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ChevronLeft />}
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Today />}
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ChevronRight />}
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          >
            Next
          </Button>
        </Box>
      </Box>

      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
      </Typography>

      <Box sx={{ overflowX: 'auto', border: '1px solid #ddd' }}>
        <Grid container spacing={0} sx={{ minWidth: '1200px' }}>
          {/* Time Labels Column */}
          <Grid item xs={12} sm={1.2} sx={{ minWidth: '120px', borderRight: '1px solid #ddd' }}>
            <Box sx={{ p: 1, backgroundColor: '#f5f5f5', fontWeight: 'bold', mb: 1 }}>
              Time
            </Box>
            {timeSlots.map(slot => (
              <Box
                key={slot.hour}
                sx={{
                  p: 1,
                  height: '80px',
                  borderBottom: '1px solid #eee',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                {slot.hour}:00 - {slot.hour + 1}:00
              </Box>
            ))}
          </Grid>

          {/* Room Columns */}
          {rooms.map(room => (
            <Grid item xs={12} sm={10.8 / rooms.length} sx={{ minWidth: '200px' }} key={room.id}>
              <Box sx={{ borderRight: '1px solid #ddd' }}>
                <Box sx={{ p: 1, backgroundColor: '#f5f5f5', fontWeight: 'bold', mb: 1 }}>
                  {room.name}
                </Box>
                {timeSlots.map(slot => {
                  const slotBookings = getBookingsForSlot(room.id, slot)

                  return (
                    <Box
                      key={`${room.id}-${slot.hour}`}
                      sx={{
                        p: 0.5,
                        height: '80px',
                        borderBottom: '1px solid #eee',
                        backgroundColor: slotBookings.length > 0 ? '#fff3cd' : '#f9f9f9',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {slotBookings.map((booking, idx) => (
                        <Card
                          key={booking.id}
                          sx={{
                            mb: 0.5,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#388e3c' },
                            p: 0.5
                          }}
                        >
                          <CardContent sx={{ p: '4px !important' }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              {booking.title}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )
                })}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, backgroundColor: '#4caf50' }} />
          <Typography variant="caption">Booked</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, backgroundColor: '#f9f9f9', border: '1px solid #ddd' }} />
          <Typography variant="caption">Available</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default MeetingRoomTimeline
```

### Add Route

**File:** `frontend/web-app/src/App.tsx`

```typescript
// Add import
const MeetingRoomTimeline = lazy(() => import('./pages/MeetingRooms/MeetingRoomTimeline'))

// Add route
<Route
  path="/meeting-rooms/timeline"
  element={
    <ProtectedDashboardRoute>
      <MeetingRoomTimeline />
    </ProtectedDashboardRoute>
  }
/>
```

### Add to Navigation

**File:** `frontend/web-app/src/components/layouts/DashboardLayout.tsx`

```typescript
// In menu items array, add:
{
  label: 'Timeline View',
  icon: <Timeline />,
  path: '/meeting-rooms/timeline',
  roles: ['admin', 'superadmin', 'manager'],
  parent: 'Meeting Rooms'
}
```

---

## 📋 IMPLEMENTATION GUIDE 2: IMPORT/EXPORT USERS & ASSETS

### Backend Implementation

#### A. Laravel Excel Setup

```bash
# Install package
composer require maatwebsite/excel

# Publish config
php artisan vendor:publish --provider="Maatwebsite\Excel\ExcelServiceProvider"
```

**File:** `services/user-service/app/Exports/UsersExport.php`

```php
<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class UsersExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function collection()
    {
        return User::with('role')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Email',
            'Phone',
            'Role',
            'Department',
            'Status',
            'Created At'
        ];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->name,
            $user->email,
            $user->phone ?? '-',
            $user->role?->display_name ?? 'N/A',
            $user->department ?? '-',
            $user->status ?? 'active',
            $user->created_at->format('Y-m-d H:i:s')
        ];
    }
}
```

**File:** `services/user-service/app/Imports/UsersImport.php`

```php
<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Role;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithValidation;

class UsersImport implements ToModel, WithHeadings, WithValidation
{
    private $rolesCache = [];

    public function headings(): array
    {
        return [
            'id',
            'name',
            'email',
            'phone',
            'role',
            'department',
            'status',
            'created_at'
        ];
    }

    public function model(array $row)
    {
        // Skip header row
        if ($row[0] === 'ID') return null;

        $roleId = 3; // Default: staff role
        if (!empty($row[4])) {
            if (!isset($this->rolesCache[$row[4]])) {
                $role = Role::where('display_name', $row[4])->first();
                $this->rolesCache[$row[4]] = $role?->id ?? 3;
            }
            $roleId = $this->rolesCache[$row[4]];
        }

        return new User([
            'name' => $row[1],
            'email' => $row[2],
            'phone' => $row[3] ?? null,
            'role_id' => $roleId,
            'department' => $row[5] ?? null,
            'status' => $row[6] ?? 'active'
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => 'unique:users,email'
        ];
    }
}
```

**File:** `services/user-service/app/Http/Controllers/UserController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Exports\UsersExport;
use App\Imports\UsersImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function export()
    {
        // Check permission
        if (!auth()->user()->can('users.export')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        return Excel::download(new UsersExport, 'users_' . date('Y-m-d_H-i-s') . '.xlsx');
    }

    public function import(Request $request)
    {
        // Check permission
        if (!auth()->user()->can('users.import')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120'
        ]);

        try {
            Excel::import(new UsersImport, $request->file('file'));

            return response()->json([
                'success' => true,
                'message' => 'Users imported successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 400);
        }
    }
}
```

**Routes:** `services/user-service/routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/export', [UserController::class, 'export']);
    Route::post('/users/import', [UserController::class, 'import']);
});
```

#### B. Add Permissions

**File:** `services/rbac-service/database/seeders/PermissionsSeeder.php`

```php
public function run()
{
    // ... existing permissions ...

    // Users management
    Permission::firstOrCreate(
        ['name' => 'users.export'],
        ['display_name' => 'Export Users', 'module' => 'users']
    );

    Permission::firstOrCreate(
        ['name' => 'users.import'],
        ['display_name' => 'Import Users', 'module' => 'users']
    );

    // Assets management
    Permission::firstOrCreate(
        ['name' => 'assets.export'],
        ['display_name' => 'Export Assets', 'module' => 'assets']
    );

    Permission::firstOrCreate(
        ['name' => 'assets.import'],
        ['display_name' => 'Import Assets', 'module' => 'assets']
    );
}
```

### Frontend Implementation

**File:** `frontend/admin-panel/src/components/ImportExportDialog.tsx`

```typescript
import React, { useRef, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  CircularProgress,
  Alert,
  LinearProgress,
  Typography
} from '@mui/material'
import { Download, Upload } from '@mui/icons-material'
import apiClient from '../api/apiClient'

interface ImportExportDialogProps {
  open: boolean
  onClose: () => void
  type: 'users' | 'assets'
  onImportSuccess?: () => void
}

const ImportExportDialog: React.FC<ImportExportDialogProps> = ({
  open,
  onClose,
  type,
  onImportSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleExport = async () => {
    setExporting(true)
    setError(null)

    try {
      const response = await apiClient.get(`/${type}/export`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(`/${type}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          setProgress(percentCompleted)
        }
      })

      if (response.data.success) {
        onImportSuccess?.()
        onClose()
      } else {
        setError(response.data.message || 'Import failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import/Export {type.toUpperCase()}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Export Button */}
          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
            onClick={handleExport}
            disabled={exporting || importing}
            fullWidth
          >
            {exporting ? 'Exporting...' : `Export ${type}`}
          </Button>

          <Typography variant="caption" color="text.secondary" align="center">
            or
          </Typography>

          {/* Import Section */}
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImport}
              style={{ display: 'none' }}
              disabled={importing}
            />
            <Button
              variant="outlined"
              startIcon={importing ? <CircularProgress size={20} /> : <Upload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={importing || exporting}
              fullWidth
            >
              {importing ? 'Importing...' : `Import ${type}`}
            </Button
          </Box>

          {importing && progress > 0 && (
            <Box>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption">{progress}%</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportExportDialog
```

### Add to Users Page

**File:** `frontend/admin-panel/src/pages/Users.tsx`

```typescript
const Users: React.FC = () => {
  const [importExportOpen, setImportExportOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    // Refetch users list
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<CloudDownload />}
          onClick={() => setImportExportOpen(true)}
        >
          Import/Export
        </Button>
      </Box>

      <ImportExportDialog
        open={importExportOpen}
        onClose={() => setImportExportOpen(false)}
        type="users"
        onImportSuccess={handleImportSuccess}
      />

      {/* Rest of users table */}
    </Box>
  )
}
```

---

## 📋 IMPLEMENTATION GUIDE 3: ASSET/SPAREPART REQUEST SYSTEM

### Backend Implementation

**Database Migration:**

```php
// File: services/asset-service/database/migrations/2026_01_12_create_asset_requests_table.php

Schema::create('asset_requests', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id');
    $table->enum('request_type', ['asset', 'sparepart']);
    $table->string('asset_type'); // e.g., "Laptop", "Monitor", "Battery"
    $table->integer('quantity')->default(1);
    $table->text('justification');
    $table->decimal('estimated_cost', 15, 2)->nullable();
    $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
    $table->enum('status', ['pending', 'manager_approved', 'procurement_approved', 'ordered', 'received', 'rejected'])->default('pending');
    
    $table->unsignedBigInteger('approved_by_manager')->nullable();
    $table->unsignedBigInteger('approved_by_procurement')->nullable();
    $table->text('manager_notes')->nullable();
    $table->text('procurement_notes')->nullable();
    $table->text('rejection_reason')->nullable();
    
    $table->timestamps();

    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('approved_by_manager')->references('id')->on('users')->onDelete('set null');
    $table->foreign('approved_by_procurement')->references('id')->on('users')->onDelete('set null');

    $table->index('user_id');
    $table->index('status');
    $table->index('priority');
});
```

**Model & Controller:** `services/asset-service/app/Models/AssetRequest.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetRequest extends Model
{
    protected $fillable = [
        'user_id', 'request_type', 'asset_type', 'quantity',
        'justification', 'estimated_cost', 'priority', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function managerApprover()
    {
        return $this->belongsTo(User::class, 'approved_by_manager');
    }

    public function procurementApprover()
    {
        return $this->belongsTo(User::class, 'approved_by_procurement');
    }
}
```

**Controller:** `services/asset-service/app/Http/Controllers/AssetRequestController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\AssetRequest;
use Illuminate\Http\Request;

class AssetRequestController extends Controller
{
    public function index()
    {
        $requests = AssetRequest::query()
            ->with(['user', 'managerApprover', 'procurementApprover'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_type' => 'required|in:asset,sparepart',
            'asset_type' => 'required|string|max:100',
            'quantity' => 'required|integer|min:1|max:1000',
            'justification' => 'required|string|min:10',
            'estimated_cost' => 'nullable|numeric|min:0',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $assetRequest = AssetRequest::create([
            'user_id' => auth()->id(),
            ...$validated
        ]);

        // Send notification to managers
        // Notification::send($managers, new AssetRequestCreated($assetRequest));

        return response()->json([
            'success' => true,
            'message' => 'Asset request submitted',
            'data' => $assetRequest
        ], 201);
    }

    public function approveByManager($id, Request $request)
    {
        $assetRequest = AssetRequest::findOrFail($id);

        if ($assetRequest->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Invalid status'], 400);
        }

        $assetRequest->update([
            'status' => 'manager_approved',
            'approved_by_manager' => auth()->id(),
            'manager_notes' => $request->notes ?? null
        ]);

        return response()->json(['success' => true, 'data' => $assetRequest]);
    }

    public function approveByProcurement($id, Request $request)
    {
        $assetRequest = AssetRequest::findOrFail($id);

        if ($assetRequest->status !== 'manager_approved') {
            return response()->json(['success' => false, 'message' => 'Must be manager-approved first'], 400);
        }

        $assetRequest->update([
            'status' => 'procurement_approved',
            'approved_by_procurement' => auth()->id(),
            'procurement_notes' => $request->notes ?? null
        ]);

        return response()->json(['success' => true, 'data' => $assetRequest]);
    }

    public function reject($id, Request $request)
    {
        $assetRequest = AssetRequest::findOrFail($id);

        $assetRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);

        return response()->json(['success' => true, 'data' => $assetRequest]);
    }

    public function markAsOrdered($id)
    {
        $assetRequest = AssetRequest::findOrFail($id);

        $assetRequest->update(['status' => 'ordered']);

        return response()->json(['success' => true, 'data' => $assetRequest]);
    }

    public function markAsReceived($id, Request $request)
    {
        $assetRequest = AssetRequest::findOrFail($id);

        $assetRequest->update([
            'status' => 'received',
            'procurement_notes' => ($assetRequest->procurement_notes ?? '') . "\nReceived: " . $request->received_notes ?? ''
        ]);

        return response()->json(['success' => true, 'data' => $assetRequest]);
    }
}
```

**Routes:**

```php
// In routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('asset-requests', AssetRequestController::class);
    Route::post('asset-requests/{id}/approve-manager', [AssetRequestController::class, 'approveByManager']);
    Route::post('asset-requests/{id}/approve-procurement', [AssetRequestController::class, 'approveByProcurement']);
    Route::post('asset-requests/{id}/reject', [AssetRequestController::class, 'reject']);
    Route::post('asset-requests/{id}/ordered', [AssetRequestController::class, 'markAsOrdered']);
    Route::post('asset-requests/{id}/received', [AssetRequestController::class, 'markAsReceived']);
});
```

### Frontend Implementation

**File:** `frontend/web-app/src/pages/Assets/AssetRequestForm.tsx`

```typescript
import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress
} from '@mui/material'
import assetService from '../../services/AssetService'

interface AssetRequestFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const AssetRequestForm: React.FC<AssetRequestFormProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    request_type: 'asset',
    asset_type: '',
    quantity: 1,
    justification: '',
    estimated_cost: '',
    priority: 'medium'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      await assetService.createAssetRequest(formData)
      onSuccess()
      onClose()
      setFormData({
        request_type: 'asset',
        asset_type: '',
        quantity: 1,
        justification: '',
        estimated_cost: '',
        priority: 'medium'
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Request Asset / Spare Part</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Request Type</InputLabel>
            <Select
              value={formData.request_type}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
            >
              <MenuItem value="asset">Asset</MenuItem>
              <MenuItem value="sparepart">Spare Part</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Asset/Part Type"
            value={formData.asset_type}
            onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
            placeholder="e.g., Laptop, Monitor, Battery"
            required
          />

          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            inputProps={{ min: 1, max: 1000 }}
            required
          />

          <TextField
            fullWidth
            label="Justification"
            multiline
            rows={4}
            value={formData.justification}
            onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
            placeholder="Why do you need this? What will it be used for?"
            required
          />

          <TextField
            fullWidth
            label="Estimated Cost (Optional)"
            type="number"
            value={formData.estimated_cost}
            onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
            inputProps={{ min: 0, step: 0.01 }}
          />

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          {error && (
            <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>
              {error}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !formData.asset_type || !formData.justification}
        >
          {submitting ? <CircularProgress size={20} /> : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AssetRequestForm
```

---

## 📋 IMPLEMENTATION GUIDE 4: PAGE PERMISSION CONTROLLER

### Backend: Database Schema & API

See [SESSION23_COMPREHENSIVE_ERROR_FIX_AND_IMPROVEMENTS.md](./SESSION23_COMPREHENSIVE_ERROR_FIX_AND_IMPROVEMENTS.md#error-1-missing-page-permission-controller) for complete implementation details.

---

## ✅ IMPLEMENTATION CHECKLIST

### P0 - Critical Fixes (COMPLETED):
- [x] Audit Logs toLocaleString fix
- [x] Roles & Permissions undefined fix
- [x] System Settings jobs table SQL
- [x] CORS/401 documentation
- [x] Meeting Room LCD verification

### P1 - High Priority (IN PROGRESS):
- [ ] Page Permission Controller (Backend API + Frontend UI)
- [ ] User detail page debugging
- [ ] Route audit and missing routes

### P2 - Medium Priority (TODO):
- [ ] Meeting Room Timeline component
- [ ] Import/Export functionality (Backend + Frontend)
- [ ] Asset/Sparepart Request system

### P3 - Low Priority (NICE TO HAVE):
- [ ] Advanced analytics dashboard
- [ ] Mobile app optimization
- [ ] QR code check-in system
- [ ] Recurring bookings

---

## 📚 DOCUMENTATION

All documentation is maintained in `/docs/` folder:

- ✅ [SESSION23_COMPREHENSIVE_ERROR_FIX_AND_IMPROVEMENTS.md](./SESSION23_COMPREHENSIVE_ERROR_FIX_AND_IMPROVEMENTS.md)
- ✅ [CORS_AND_AUTHENTICATION_FIXES.md](./CORS_AND_AUTHENTICATION_FIXES.md)
- ✅ [MEETING_ROOM_SYSTEM_COMPLETE_GUIDE.md](./MEETING_ROOM_SYSTEM_COMPLETE_GUIDE.md)
- ✅ [FEATURE_IMPLEMENTATION_ROADMAP.md](./FEATURE_IMPLEMENTATION_ROADMAP.md) ← YOU ARE HERE

---

**Document Status:** ✅ COMPLETE  
**Last Updated:** January 12, 2026  
**Next Review:** After implementation of P2 features
