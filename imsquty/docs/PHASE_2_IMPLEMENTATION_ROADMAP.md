# Phase 2 Implementation Roadmap
**Current Status:** 243/299 tests (81.3%) | Session 19+  
**Target:** 299/299 tests (100%)  
**Remaining Work:** 56 tests across 5 services | Est. 15-20 hours

---

## Overview

| Service | Status | Tests | Effort | Priority |
|---------|--------|-------|--------|----------|
| **asset-service** | 🔄 28% | 11/39 | 4-5h | **P1 URGENT** |
| **master-data-service** | 🔄 82% | 69/84 | 3-4h | P2 |
| **ticket-service** | 🔄 53% | 10/19 | 3-4h | P3 |
| **reporting-service** | 🔄 56% | 5/9 | 2-3h | P4 |
| **meeting-room-service** | 🔄 98% | 45/46 | 30min | P5 |
| **6 Complete Services** | ✅ 100% | 147/148 | — | Reference |

---

## Phase 2 Deliverables (DO NOT CREATE NEW .md FILES - UPDATE EXISTING ONLY)

**Active Documentation (Do NOT delete):**
- ✅ CURRENT_STATUS_SESSION19.md - Update with progress
- ✅ IMPLEMENTATION_FINAL_CHECKLIST.md - Check off completed tests
- ✅ START_HERE.md - Quick reference, no changes needed
- ✅ PROJECT_STATUS.md - Archive reference, no changes needed

**Cleanup Completed:**
- 🗑️ Deleted: SESSION_18_COMPLETE_HANDOFF.md
- 🗑️ Deleted: SESSION_18_FINAL_REPORT.md  
- 🗑️ Deleted: SESSION_18_PROGRESS.md
- 🗑️ Deleted: SESSION_18_STATUS.md
- 🗑️ Deleted: IMPLEMENTATION_CHECKLIST_SESSION_18.md
- 🗑️ Deleted: IMPLEMENTATION_PROGRESS.md (redundant)
- 🗑️ Deleted: IMPLEMENTATION_CHECKLIST.md (consolidated)
- 🗑️ Deleted: MASTER_COMPLETION_CHECKLIST.md (consolidated)

---

## Task 1: asset-service (11/39 → 39/39) - **URGENT - START HERE**

### Failing Tests (5 Critical)

#### 1.1 `expiringWarranties()` - 500 Error
**File:** `services/asset-service/tests/Feature/AssetControllerTest.php` line ~380  
**Issue:** Paginator wrapped incorrectly in API response  
**Root Cause:** Service returns `LengthAwarePaginator`, controller wraps in `AssetResource::collection()`  
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {"id": 1, "asset_tag": "TAG", "warranty_expiry_date": "2025-12-31"}
  ]
}
```

**Fix Steps:**
1. Open `services/asset-service/app/Http/Controllers/AssetController.php` line 386
2. Replace:
```php
public function expiringWarranties(Request $request)
{
    $days = $request->query('days', 30);
    $assets = $this->assetService->getExpiringWarranties($days);
    return $this->success(AssetResource::collection($assets));
}
```
3. With:
```php
public function expiringWarranties(Request $request)
{
    $days = $request->query('days', 30);
    $assets = $this->assetService->getExpiringWarranties($days);
    return $this->success(AssetResource::collection($assets->items()));
}
```

#### 1.2 `statistics()` - 500 Error
**File:** Same location, line ~418  
**Issue:** Incomplete response structure  
**Expected Structure:**
```json
{
  "success": true,
  "data": {
    "total_assets": 5,
    "by_status": {"active": 3, "inactive": 2},
    "total_value": 25000.50
  }
}
```

**Fix Steps:**
1. Open `services/asset-service/app/Services/AssetService.php` line ~200
2. Find `getAssetStatistics()` method
3. Enhance to return all required fields:
```php
public function getAssetStatistics()
{
    $totalAssets = Asset::count();
    $byStatus = Asset::groupBy('status_id')
        ->pluck(\DB::raw('COUNT(*) as count'), 'status_id')
        ->toArray();
    $totalValue = Asset::sum('purchase_price');
    
    return [
        'total_assets' => $totalAssets,
        'by_status' => $byStatus,
        'total_value' => $totalValue
    ];
}
```

#### 1.3 `transfer()` - 500 Error (Movement Schema Issue)
**File:** Line ~353  
**Issue:** Movement record creation fails  
**Root Cause:** Movement model fillable or table columns mismatch

**Fix Steps:**
1. Verify `services/asset-service/database/migrations/2024_01_01_000005_create_movements_table.php`
2. Check Movement model fillable in `services/asset-service/app/Models/Movement.php`
3. Ensure columns: `asset_id`, `from_user_id`, `to_user_id`, `movement_type`, `notes`
4. Update model fillable if needed:
```php
protected $fillable = ['asset_id', 'from_user_id', 'to_user_id', 'movement_type', 'notes'];
```

#### 1.4 `assign()` - 500 Error (Movement Creation)
**File:** Line ~334  
**Same Fix as 1.3** - Movement schema issue

#### 1.5 `index()` Pagination
**File:** Test expects specific pagination fields  
**Expected in response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "current_page": 1,
    "per_page": 15,
    "total": 50,
    "last_page": 4
  }
}
```

**Fix:** Verify `AssetCollection.php` returns pagination correctly

### Failing Tests (Other)

#### 1.6-1.16 AssetModelController Tests (13 tests)
**File:** `services/asset-service/tests/Feature/AssetModelControllerTest.php`  
**Status:** 0/13 failing  
**Approach:** Same pattern as AssetController - verify migrations, fillables, relationships

---

## Task 2: master-data-service (69/84 → 84/84)

**Failing Tests:** 15  
**Pattern:** Exception types, pagination structures, unit tests  
**Reference:** Copy patterns from asset-service and user-service (100%)

**Key Files:**
- `services/master-data-service/app/Http/Controllers/`
- `services/master-data-service/app/Services/`
- `services/master-data-service/app/Repositories/`

---

## Task 3: ticket-service (10/19 → 19/19)

**Failing Tests:** 9  
**Pattern:** Schema relationships, business logic, workflow states  
**Key Focus:**
- Ticket workflow (open → assigned → resolved → closed)
- User-ticket relationships
- Priority levels and SLA calculations

---

## Task 4: reporting-service (5/9 → 9/9)

**Failing Tests:** 4  
**Pattern:** Data aggregation, statistics, date range filtering  
**Key Focus:**
- Aggregation logic
- Date range calculations
- Summary statistics

---

## Task 5: meeting-room-service (45/46 → 46/46)

**Failing Tests:** 1  
**Pattern:** Quick fix (likely date/time logic)  
**Key Focus:**
- Room availability calculations
- Booking conflict detection

---

## Implementation Workflow (DO NOT DEVIATE)

### For Each Service:

1. **Run Tests** (baseline)
   ```bash
   cd services/{SERVICE-NAME}
   php artisan test --no-coverage 2>&1
   ```

2. **Identify Failures** (categorize by type)
   - Type A: 404/501 = infrastructure issue (migrations, routes)
   - Type B: 500 = business logic issue (service/controller implementation)
   - Type C: Assertion = test data/expectations mismatch

3. **Fix Implementation** (following patterns from 6 complete services)
   - Update models (fillable, relationships, methods)
   - Update services (business logic, return types)
   - Update controllers (request handling, response formatting)
   - Update migrations (schema verification)

4. **Run Tests Again** (verify fixes)
   ```bash
   php artisan test --no-coverage 2>&1
   ```

5. **Move to Next Service** (only after 100% pass rate)

### Pattern Reference (Copy These Patterns):
- **user-service:** 43/43 ✅ - Basic CRUD + relationships
- **auth-service:** 28/28 ✅ - Authentication + token handling
- **inventory-service:** 10/10 ✅ - Resource management
- **notification-service:** 11/11 ✅ - Event handling
- **financial-service:** 10/10 ✅ - Calculations + aggregations
- **meeting-room-service:** 45/46 ✅ - Availability + bookings

---

## Code Quality Standards (MANDATORY)

✅ **Every Implementation Must Include:**
- Validation (Form Requests)
- Error Handling (try-catch, error responses)
- Audit Logging (log all CUD operations)
- Tests (80%+ coverage)
- API Resources (transformation layer)
- Soft Deletes (on all models)
- Timestamps (created_at, updated_at)

✅ **Response Format (Mandatory):**
```json
{
  "success": true|false,
  "data": {...}|[...],
  "message": "Human-readable message",
  "errors": {...}  // if applicable
}
```

✅ **PSR-12 Compliance:**
- 4-space indentation
- Line length max 120 characters
- PHPDoc on all methods
- Type hints on parameters and returns

---

## Database State (VERIFIED)

**Shared Database:** `imsquty` (21 tables)

### Core Tables (16):
- assets, asset_models, asset_statuses
- movements
- users, roles, permissions
- master_data
- tickets, ticket_priorities, ticket_statuses
- rooms, room_bookings
- notifications
- reports
- audit_logs

### RBAC Tables (5):
- permissions (80 rows)
- roles (4 rows: admin, manager, user, guest)
- model_has_roles
- model_has_permissions
- role_has_permissions

**Verification:** All tables present and seeded. ✅

---

## Testing Configuration (VERIFIED)

**Framework:** PHPUnit with Laravel RefreshDatabase  
**Pattern:** `TestCase::seedRoles()` on each test  
**Database:** Separate test database (auto-recreated per test)  
**Factories:** Available for all models  

**Run Tests Command:**
```bash
php artisan test --no-coverage 2>&1  # All tests
php artisan test tests/Feature/SomeControllerTest.php  # Single file
php artisan test --filter="testMethodName"  # Single test
```

---

## Git Workflow (KEEP CLEAN)

✅ **Commit After Each Service Complete:**
```bash
git add -A
git commit -m "feat: complete {service-name} - all tests passing 100%"
git push origin main
```

❌ **Do NOT:**
- Commit half-done work
- Create branches for each test
- Add debug files (.log, .tmp)

---

## Success Criteria

**Task Complete When:**
- ✅ All 299 tests passing (100%)
- ✅ No migrations pending
- ✅ All routes accessible
- ✅ No deprecated warnings
- ✅ Code coverage 80%+
- ✅ Audit logs present in all CUD operations

**Sign-Off:**
```
[COMPLETED] Phase 2 Implementation
- Status: 299/299 (100%)
- Services: 10/10 complete
- Effort: ~18 hours
- Quality: PSR-12, 80%+ coverage, audit logs mandatory
```

---

## Time Estimate Breakdown

| Task | Tests | Hours | Start After |
|------|-------|-------|-------------|
| asset-service | 28 | 4-5h | NOW |
| master-data-service | 15 | 3-4h | +5h |
| ticket-service | 9 | 3-4h | +9h |
| reporting-service | 4 | 2-3h | +12h |
| meeting-room-service | 1 | 0.5h | +15h |
| Docs + Cleanup | — | 1h | +15.5h |
| **TOTAL** | **56** | **13-19h** | — |

---

## Update Log

**Session 19+ (Current):**
- ✅ Created Phase 2 Implementation Roadmap
- ✅ Deleted 8 deprecated .md files
- ✅ Consolidated to active documentation (8 files)
- 🔄 Ready for asset-service implementation

---

## NEXT IMMEDIATE ACTION

**User Direction:** Start implementation of asset-service right now
1. Run tests to confirm 11/39 baseline
2. Fix expiringWarranties() method
3. Fix statistics() method
4. Fix transfer() and assign() methods
5. Run tests until 39/39 passes
6. Move to master-data-service

**Do NOT create new .md files during implementation.**  
**Update CURRENT_STATUS_SESSION19.md after each service completes.**  
**Sign-off in IMPLEMENTATION_FINAL_CHECKLIST.md when done.**

---
