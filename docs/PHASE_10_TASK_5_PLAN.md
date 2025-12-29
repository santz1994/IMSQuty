# Phase 10 Task 5: Asset Management Screens - IMPLEMENTATION PLAN ✅

**Task**: Implement Asset Management Screens with Full Backend Integration  
**Status**: READY TO IMPLEMENT  
**Duration**: 3-4 days  
**Lines of Code Expected**: 1,200+ LOC  
**Complexity**: MEDIUM  

---

## 🎯 Task Summary

Implement complete asset management screens for Flutter mobile app with:
- Asset list with pagination, search, and filters
- Asset detail screen with full information display
- Asset create screen with form validation
- Backend API integration (imsquty asset-service)
- Riverpod state management integration
- Material Design 3 UI consistency

---

## 📋 Deliverables

| Screen | File | Lines | Status |
|--------|------|-------|--------|
| Asset List | `asset_list_screen.dart` | 300+ | IMPLEMENT |
| Asset Detail | `asset_detail_screen.dart` | 350+ | IMPLEMENT |
| Asset Create | `asset_create_screen.dart` | 250+ | IMPLEMENT |
| Asset Form Widget | `asset_form_widget.dart` | 300+ | NEW |

**Total Task 5 LOC**: 1,200+ lines of production-ready code

---

## 🔌 Backend API Integration

### Asset Service Endpoints
All endpoints available at: `http://localhost:8000/api/v1/assets`

#### List Assets (GET /assets)
```
Endpoint: GET /api/v1/assets
Query Parameters:
  - page: int (default 1)
  - per_page: int (default 20)
  - search: string (optional - search name, model, serial)
  - status: string (optional - new, in_use, maintenance, retired)
  - location_id: int (optional - filter by location)
  - assigned_to: int (optional - filter by assignee)

Response:
{
  "data": [
    {
      "id": 1,
      "name": "MacBook Pro 14",
      "model": "MNEC3LL/A",
      "serial_number": "ABC123XYZ",
      "asset_type": "Laptop",
      "status": "in_use",
      "location": "HQ",
      "assigned_to": "John Doe",
      "qr_code": "ASSET-001",
      "image_url": "https://...",
      "purchase_date": "2023-01-15",
      "created_at": "2023-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "per_page": 20,
    "current_page": 1,
    "last_page": 8,
    "from": 1,
    "to": 20
  }
}
```

#### Get Asset Detail (GET /assets/{id})
```
Endpoint: GET /api/v1/assets/{id}

Response:
{
  "data": {
    "id": 1,
    "name": "MacBook Pro 14",
    "model": "MNEC3LL/A",
    "serial_number": "ABC123XYZ",
    "asset_type": "Laptop",
    "asset_type_id": 5,
    "asset_category_id": 2,
    "status": "in_use",
    "status_id": 2,
    "location": "HQ",
    "location_id": 1,
    "assigned_to": "John Doe",
    "assigned_to_id": 42,
    "manufacturer": "Apple",
    "manufacturer_id": 8,
    "qr_code": "ASSET-001",
    "image_url": "https://...",
    "warranty_type": "Manufacturer",
    "warranty_expiry": "2026-01-15",
    "purchase_date": "2023-01-15",
    "purchase_price": 1500.00,
    "condition": "Excellent",
    "notes": "Recently updated with new SSD",
    "created_at": "2023-01-15T10:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z",
    "related_tickets": [
      { "id": 5, "title": "SSD Replacement", "status": "closed" }
    ],
    "maintenance_logs": [
      { "id": 12, "type": "Service", "date": "2024-01-10", "notes": "SSD upgrade" }
    ]
  }
}
```

#### Create Asset (POST /assets)
```
Endpoint: POST /api/v1/assets

Request Body:
{
  "name": "Dell XPS 13",
  "model": "9310",
  "serial_number": "DEL456ABC",
  "asset_type_id": 1,
  "asset_category_id": 2,
  "manufacturer_id": 3,
  "status_id": 2,
  "location_id": 1,
  "assigned_to_id": 42,
  "purchase_date": "2024-01-20",
  "purchase_price": 1200.00,
  "warranty_type": "Manufacturer",
  "warranty_expiry": "2027-01-20",
  "condition": "New",
  "notes": "Enterprise deployment"
}

Response:
{
  "data": {
    "id": 151,
    "name": "Dell XPS 13",
    "model": "9310",
    "serial_number": "DEL456ABC",
    "qr_code": "ASSET-151",
    ...all fields...
  },
  "message": "Asset created successfully"
}
```

#### Update Asset (PUT /assets/{id})
```
Endpoint: PUT /api/v1/assets/{id}

Request Body: (same as create, all fields optional)

Response:
{
  "data": {...updated asset...},
  "message": "Asset updated successfully"
}
```

#### Delete Asset (DELETE /assets/{id})
```
Endpoint: DELETE /api/v1/assets/{id}

Response:
{
  "message": "Asset deleted successfully"
}
```

---

## 📊 State Management (Riverpod Integration)

### Existing Provider Usage
From Task 3, these providers are already created and working:

```dart
// Asset List Provider
final assetListProvider = StateNotifierProvider<AssetListNotifier, AsyncValue<AssetListState>>(
  (ref) => AssetListNotifier(ref.watch(assetApiServiceProvider)),
);

// Asset Detail Provider (parametrized by ID)
final assetDetailProvider = StateNotifierProvider.family<
  AssetDetailNotifier,
  AsyncValue<Asset>,
  int
>(
  (ref, assetId) => AssetDetailNotifier(
    assetId,
    ref.watch(assetApiServiceProvider),
  ),
);

// Computed providers
final assetCountProvider = Provider<int>((ref) {
  return ref.watch(assetListProvider).whenData((state) => state.total).value ?? 0;
});

final assetsPerPageProvider = Provider<int>((ref) => 20);
```

### Usage in Screens
```dart
// Watch asset list (with pagination)
final assetListAsync = ref.watch(assetListProvider);

// Load assets
ref.read(assetListProvider.notifier).fetchAssets();

// Search
ref.read(assetListProvider.notifier).search('MacBook');

// Filter by status
ref.read(assetListProvider.notifier).filterByStatus('in_use');

// Pagination
ref.read(assetListProvider.notifier).nextPage();

// Watch asset detail
final assetDetail = ref.watch(assetDetailProvider(assetId));

// Create asset
await ref.read(assetListProvider.notifier).createAsset(assetData);

// Delete asset
await ref.read(assetListProvider.notifier).deleteAsset(assetId);
```

---

## 📱 Screen Implementation Details

### 1. Asset List Screen (300+ LOC)

**Purpose**: Display paginated list of assets with search and filters

**Features**:
- ✅ List all assets with pagination (20 per page)
- ✅ Search by name, serial number, model
- ✅ Filter by status (New, In Use, Maintenance, Retired)
- ✅ Filter by location
- ✅ Sort options (name, date, status)
- ✅ Pull-to-refresh
- ✅ Loading state while fetching
- ✅ Empty state when no assets
- ✅ Error message display with retry
- ✅ Tap asset to view details
- ✅ FAB to create new asset
- ✅ Delete asset with confirmation

**Layout**:
```
┌─────────────────────────────────────────┐
│ Assets                           [icon] │  ← AppBar with search icon
├─────────────────────────────────────────┤
│ Search: [________] [⏰] [⚙️]            │  ← Search + filter chips
├─────────────────────────────────────────┤
│ [MacBook Pro 14]     [Status: In Use]   │  ← Asset card 1
│  Serial: ABC123XYZ   Location: HQ       │
│  Assigned: John Doe                     │
├─────────────────────────────────────────┤
│ [Dell XPS 13]        [Status: New]      │  ← Asset card 2
│  Serial: DEL456ABC   Location: HQ       │
│  Unassigned                             │
├─────────────────────────────────────────┤
│ Page 1 of 8 [← Prev │ Next →]           │  ← Pagination
└─────────────────────────────────────────┘
                              [+]             ← FAB (Create)
```

**Key Code Sections**:
```dart
// ConsumerStatefulWidget for lifecycle
class AssetListScreen extends ConsumerStatefulWidget

// Watch list with error/loading states
final assetListAsync = ref.watch(assetListProvider);

// Search implementation
ref.read(assetListProvider.notifier).search(query);

// Filter chips
_buildFilterChips() → status, location filters

// Asset card with swipe to delete
Dismissible(
  onDismissed: () → delete asset
  child: GestureDetector(
    onTap: () → navigate to detail
    child: Card(...)
  )
)

// Pagination buttons
ref.read(assetListProvider.notifier).nextPage()
ref.read(assetListProvider.notifier).previousPage()

// Pull-to-refresh
RefreshIndicator(
  onRefresh: () → fetch assets
)
```

**Integration Points**:
- AssetProvider (watch/read operations)
- AssetApiService (via provider)
- MasterDataProvider (for dropdowns: locations, statuses, types)
- GoRouter (navigate to detail: context.push('/home/assets/:id'))
- Validators (search input validation)

---

### 2. Asset Detail Screen (350+ LOC)

**Purpose**: Display full asset information with edit and delete capabilities

**Features**:
- ✅ Display all asset fields
- ✅ Show QR code (text representation if no image)
- ✅ Related tickets section (links to ticket detail)
- ✅ Maintenance logs section
- ✅ Edit button (inline form or new screen)
- ✅ Delete button with confirmation
- ✅ Back button to list
- ✅ Loading state while fetching
- ✅ Error message with retry
- ✅ Share asset QR code
- ✅ Print asset label

**Layout**:
```
┌─────────────────────────────────────────┐
│ ← MacBook Pro 14                  [⋮]   │  ← Header with menu
├─────────────────────────────────────────┤
│ [QR CODE IMAGE]                         │  ← QR code
│ Tap to view larger                      │
├─────────────────────────────────────────┤
│ DEVICE INFORMATION                      │
│ Name: MacBook Pro 14                    │
│ Model: MNEC3LL/A                        │
│ Serial: ABC123XYZ                       │
│ Type: Laptop                            │
│ Category: Computing                     │
│ Manufacturer: Apple                     │
├─────────────────────────────────────────┤
│ STATUS & LOCATION                       │
│ Status: In Use                          │
│ Location: HQ                            │
│ Assigned To: John Doe                   │
│ Condition: Excellent                    │
├─────────────────────────────────────────┤
│ WARRANTY & PURCHASE                     │
│ Purchase Date: 2023-01-15               │
│ Purchase Price: $1,500.00               │
│ Warranty Type: Manufacturer             │
│ Warranty Expiry: 2026-01-15             │
├─────────────────────────────────────────┤
│ RELATED TICKETS (3)                     │
│ [SSD Replacement - Closed]              │
│ [Screen Repair - Open]                  │
│ [Keyboard Issue - Resolved]             │
├─────────────────────────────────────────┤
│ MAINTENANCE LOGS (5)                    │
│ [2024-01-10] Service - SSD upgrade      │
│ [2023-12-01] Cleaning - Regular upkeep │
├─────────────────────────────────────────┤
│ NOTES                                   │
│ Recently updated with new SSD for       │
│ performance improvement.                │
└─────────────────────────────────────────┘
         [Edit] [Delete] [Share]
```

**Key Code Sections**:
```dart
// ConsumerWidget with assetId parameter
class AssetDetailScreen extends ConsumerWidget {
  final int assetId;

// Watch specific asset
final assetAsync = ref.watch(assetDetailProvider(assetId));

// Build UI based on AsyncValue
assetAsync.when(
  data: (asset) => _buildContent(asset),
  loading: () => LoadingWidget(),
  error: (err, st) => ErrorWidget(),
)

// Delete with confirmation
_showDeleteConfirmation() → showDialog()

// Edit asset
_navigateToEdit() → context.push('/home/assets/:id/edit')

// Display related tickets as tappable links
related_tickets.map((t) => ListTile(
  onTap: () → navigate to ticket detail
  title: t.title,
  subtitle: t.status,
))

// Display maintenance logs
maintenance_logs.map((m) => Card(...))
```

**Integration Points**:
- AssetProvider (watch detail)
- TicketProvider (navigate to ticket from related)
- GoRouter (back, edit, navigate)
- Share functionality (share QR code)

---

### 3. Asset Create Screen (250+ LOC)

**Purpose**: Form for creating new assets

**Features**:
- ✅ Form fields for all required asset properties
- ✅ Field validation (name, serial, model required)
- ✅ Dropdown selectors (type, category, location, assigned_to, status)
- ✅ Date picker for purchase_date and warranty_expiry
- ✅ Numeric input for purchase_price
- ✅ Textarea for notes
- ✅ Loading state on submit
- ✅ Error message display
- ✅ Success feedback with navigation
- ✅ Cancel button (back)
- ✅ Form validation before submit

**Layout**:
```
┌─────────────────────────────────────────┐
│ ← Create Asset                    [✓]   │  ← Header with save button
├─────────────────────────────────────────┤
│ DEVICE INFORMATION                      │
│ Asset Name *                            │
│ [________________________] [error text] │
│                                         │
│ Model *                                 │
│ [________________________]               │
│                                         │
│ Serial Number *                         │
│ [________________________]               │
│                                         │
│ Asset Type *                            │
│ [▼ Select Type         ]                │
│                                         │
│ Asset Category *                        │
│ [▼ Select Category     ]                │
│                                         │
│ Manufacturer                            │
│ [▼ Select Manufacturer ]                │
├─────────────────────────────────────────┤
│ STATUS & ASSIGNMENT                     │
│ Status *                                │
│ [▼ Select Status       ]                │
│                                         │
│ Location *                              │
│ [▼ Select Location     ]                │
│                                         │
│ Assigned To                             │
│ [▼ Select User         ]                │
│                                         │
│ Condition                               │
│ [▼ Select Condition    ]                │
├─────────────────────────────────────────┤
│ PURCHASE & WARRANTY                     │
│ Purchase Date                           │
│ [2024-01-20        ▼] [calendar icon]   │
│                                         │
│ Purchase Price                          │
│ [$             0.00] (Rp format)        │
│                                         │
│ Warranty Type                           │
│ [▼ Select Type         ]                │
│                                         │
│ Warranty Expiry                         │
│ [2027-01-20        ▼]                   │
├─────────────────────────────────────────┤
│ ADDITIONAL INFORMATION                  │
│ Notes                                   │
│ [___________________________]            │
│ [___________________________]            │
│ [___________________________]            │
└─────────────────────────────────────────┘
       [Save]        [Cancel]
```

**Key Code Sections**:
```dart
// Form widget (reusable from asset_form_widget.dart)
class AssetFormWidget extends ConsumerStatefulWidget

// Form validation
validateAssetName() → required, 3-255 chars
validateModel() → required
validateSerialNumber() → required, unique check

// Field controllers
_nameController = TextEditingController()
_modelController = TextEditingController()
// ... etc

// Dropdown loading from MasterData
final locations = ref.watch(
  masterDataProvider.select((m) => m.locations)
);

// Date picker
_showDatePicker(context, (date) {
  setState(() => _purchaseDate = date);
});

// Submit form
_handleSubmit() async {
  if (!_formKey.currentState!.validate()) return;
  
  final asset = Asset(
    name: _nameController.text,
    ...
  );
  
  await ref.read(assetListProvider.notifier).createAsset(asset);
  context.pop(); // Back to list
}
```

**Integration Points**:
- AssetFormWidget (reusable form)
- AssetProvider (createAsset operation)
- MasterDataProvider (dropdowns)
- Validators (field validation)
- GoRouter (back)

---

### 4. Asset Form Widget (300+ LOC) - REUSABLE

**Purpose**: Reusable form component for asset create/edit screens

**Features**:
- ✅ All form fields (name, model, serial, type, etc.)
- ✅ Validation callbacks
- ✅ Dropdown population from MasterData
- ✅ Date pickers
- ✅ Loading state
- ✅ Error display per field
- ✅ Tab support for field organization
- ✅ Form state management

**Usage**:
```dart
// In create screen
AssetFormWidget(
  onSubmit: (assetData) {
    ref.read(assetListProvider.notifier).createAsset(assetData);
  },
)

// In edit screen
AssetFormWidget(
  asset: existingAsset,
  onSubmit: (assetData) {
    ref.read(assetDetailProvider(assetId).notifier).updateAsset(assetData);
  },
)
```

---

## 🎨 UI/UX Consistency

### Material Design 3 Elements
- ✅ FilledButton for primary actions (Create, Save, Delete)
- ✅ OutlinedButton for secondary (Cancel, Back)
- ✅ Card for list items and detail sections
- ✅ ListTile for simple list items (related tickets, maintenance)
- ✅ Dismissible for swipe-to-delete
- ✅ RefreshIndicator for pull-to-refresh
- ✅ AlertDialog for confirmations
- ✅ SnackBar for feedback (success, error)
- ✅ CircularProgressIndicator for loading
- ✅ TextField with validation error display
- ✅ DropdownMenuEntry for selects

### Color Scheme (From app_theme.dart)
```dart
// Status colors
statusNew = Colors.blue       // New assets
statusInUse = Colors.green    // In use
statusMaintenance = Colors.orange  // Under maintenance
statusRetired = Colors.grey   // Retired

// Action colors
deleteRed = Colors.red        // Delete
editBlue = Colors.blue        // Edit
successGreen = Colors.green   // Success
```

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Asset list loads with pagination
- [ ] Search filters assets correctly
- [ ] Status filter works (new, in_use, maintenance, retired)
- [ ] Location filter works
- [ ] Pagination buttons work (next, previous)
- [ ] Pull-to-refresh reloads list
- [ ] Tap asset opens detail screen
- [ ] Detail screen shows all fields
- [ ] Related tickets link works
- [ ] Maintenance logs display correctly
- [ ] Delete asset shows confirmation and removes from list
- [ ] Create asset form validates inputs
- [ ] Create asset submits and returns to list
- [ ] Error messages display properly
- [ ] Loading states show during async operations
- [ ] Empty state shows when no assets

### Integration Testing (Task 9)
- [ ] Asset list API pagination working
- [ ] Search API working
- [ ] Filter API working
- [ ] Create asset API working
- [ ] Delete asset API working
- [ ] Real backend data loads correctly
- [ ] Error handling works (API errors)
- [ ] Network timeout handled
- [ ] 401 unauthorized redirects to login
- [ ] 422 validation errors display

---

## 🔗 Dependencies & Integration

### Already Available (From Tasks 1-4)
```dart
// Services (Task 2)
AssetApiService        // Asset API endpoints
ApiService             // Base HTTP client with JWT
StorageService         // Token management
NotificationService    // FCM

// Providers (Task 3)
authProvider          // Auth state
masterDataProvider    // Reference data (statuses, locations, etc)
assetListProvider     // Asset list state
assetDetailProvider   // Asset detail state

// Validators (Task 1)
validateEmail(), validatePassword(), etc.

// Theme (Task 1)
app_theme.dart        // Material Design 3 colors & styles

// Routes (Task 4)
GoRouter setup with /home/assets routes
```

### Screen Dependencies
```dart
// UI Packages
flutter_riverpod       // State management
go_router             // Navigation
flutter_slidable      // Swipe actions (optional)
intl                  // Date/currency formatting

// Form validation
form_builder_flutter  // Complex forms
form_builder_validators

// Image/QR handling
flutter_svg           // QR code display
cached_network_image  // Load asset images
```

---

## 📝 Implementation Checklist

### Phase 1: Asset List Screen (1 day)
- [ ] Create ConsumerStatefulWidget
- [ ] Implement list view with pagination
- [ ] Add search functionality
- [ ] Add filter chips (status, location)
- [ ] Add pull-to-refresh
- [ ] Add error and loading states
- [ ] Add empty state UI
- [ ] Add tap-to-detail navigation
- [ ] Add FAB for create
- [ ] Add delete with confirmation
- [ ] Test with real API data

### Phase 2: Asset Detail Screen (1 day)
- [ ] Create ConsumerWidget with ID parameter
- [ ] Display all asset fields in sections
- [ ] Show QR code
- [ ] Display related tickets (clickable)
- [ ] Display maintenance logs
- [ ] Add edit button
- [ ] Add delete button with confirmation
- [ ] Add share/print functionality
- [ ] Add loading and error states
- [ ] Test with real API data

### Phase 3: Asset Create Form (1 day)
- [ ] Create reusable AssetFormWidget
- [ ] Implement all form fields
- [ ] Add field validation
- [ ] Add dropdown population from MasterData
- [ ] Add date pickers
- [ ] Add currency formatting
- [ ] Implement submit handler
- [ ] Add loading state on submit
- [ ] Test form validation
- [ ] Test API submission

### Phase 4: Polish & Testing (1 day)
- [ ] Review UI/UX consistency
- [ ] Test all error scenarios
- [ ] Test network error handling
- [ ] Test 401 unauthorized handling
- [ ] Verify Material Design 3 compliance
- [ ] Check theme consistency
- [ ] Optimize performance (lazy loading)
- [ ] Add loader animations
- [ ] Full manual testing
- [ ] Document any issues/limitations

---

## 🚀 Success Criteria

Task 5 is COMPLETE when:
- ✅ Asset list screen displays paginated assets from API
- ✅ Search and filter functionality works correctly
- ✅ Asset detail screen shows all information
- ✅ Create asset form submits to backend successfully
- ✅ Delete asset removes from list and backend
- ✅ All screens handle loading, error, and empty states
- ✅ Navigation between screens works (back, detail, create)
- ✅ Material Design 3 UI consistency throughout
- ✅ All form validation works end-to-end
- ✅ Integration with Riverpod providers verified
- ✅ No console errors or warnings
- ✅ Manual testing passed on all features

---

## 📞 Backend API Status

**Asset Service**: ✅ READY (All endpoints implemented and tested)

Confirmed working endpoints:
- ✅ GET /api/v1/assets (list with pagination)
- ✅ GET /api/v1/assets/{id} (detail)
- ✅ POST /api/v1/assets (create)
- ✅ PUT /api/v1/assets/{id} (update)
- ✅ DELETE /api/v1/assets/{id} (delete)

Database: **imsquty** (shared MySQL 8)
Base URL: **http://localhost:8000/api/v1**

---

## 📖 Reference Documents

- [Task 1 - Flutter Setup](00_PROJECT_MASTER_STATUS.md#-phase-10-mobile-app-in-progress--40-complete)
- [Task 2 - API Integration](00_PROJECT_MASTER_STATUS.md#-phase-10-mobile-app-in-progress--40-complete)
- [Task 3 - Riverpod Providers](00_PROJECT_MASTER_STATUS.md#-phase-10-mobile-app-in-progress--40-complete)
- [Task 4 - Auth Screens](PHASE_10_TASK_4_COMPLETE.md)
- Backend Roadmap: [quty2/docs/task/09_CUSTOM_ROADMAP_BASED_ON_QUESTIONNAIRE.md](../../../quty2/docs/task/09_CUSTOM_ROADMAP_BASED_ON_QUESTIONNAIRE.md)

---

**Status**: ✅ READY FOR IMPLEMENTATION  
**Priority**: HIGH (Asset management is core functionality)  
**Complexity**: MEDIUM (Uses existing patterns from Tasks 1-4)  
**Timeline**: 3-4 days

