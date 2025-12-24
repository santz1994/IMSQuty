# 🌱 PHASE 3: SEEDING STRATEGY & DATABASE IMPORT (Dec 26)

**Date**: December 26, 2025  
**Status**: 🔄 READY TO START  
**Focus**: Seeder Implementation & Data Import Logic  
**Effort**: 8 hours  
**Owner**: Senior Developer  

---

## 📋 PHASE 3 OVERVIEW

**Objective**: Import 63 tables from itquty.sql (monolith) → imsquty (microservices)  
**Current State**: All 29 tables already created by migrations ✅  
**Data Status**: Ready in itquty.sql (93 users, 156 assets, 120+ tickets)  
**Timeline**: 8 hours to create all seeders

---

## 🎯 PHASE 3 TODO LIST

### Task 1: Create Reference Data Seeders (2-3 hours)

These seeders handle master data that other services depend on.

#### 1.1 Create DivisionsSeeder
**File**: `database/seeders/DivisionsSeeder.php`

Import divisions from itquty → imsquty.divisions

**Logic**:
```php
$legacyDivisions = DB::connection('itquty')
    ->table('divisions')
    ->get();
    
foreach ($legacyDivisions as $div) {
    Division::create([
        'name' => $div->division_name,
        'code' => $div->abbreviation,
        'description' => $div->description,
        'is_active' => $div->is_active ?? true,
    ]);
}
```

**Naming Fixes**:
- `division_name` → `name` ✅
- `abbreviation` → `code` ✅

**Status**: ⏳ READY TO CREATE

---

#### 1.2 Create LocationsSeeder
**File**: `database/seeders/LocationsSeeder.php`

Import locations from itquty → imsquty.locations

**Logic**:
```php
$legacyLocations = DB::connection('itquty')
    ->table('locations')
    ->get();
    
foreach ($legacyLocations as $loc) {
    Location::create([
        'name' => $loc->location_name,
        'code' => $loc->location_code,
        'building' => $loc->building,
        'floor' => $loc->floor,
        'room_number' => $loc->room_number,
        'is_active' => $loc->is_active ?? true,
    ]);
}
```

**Status**: ⏳ READY TO CREATE

---

#### 1.3 Create ManufacturersSeeder
**File**: `database/seeders/ManufacturersSeeder.php`

Import manufacturers from itquty → imsquty.manufacturers

**Naming Fixes**:
- `manufacturer_name` → `name` ✅
- `abbreviation` → `code` ✅

**Status**: ⏳ READY TO CREATE

---

#### 1.4 Create SuppliersSeeder
**File**: `database/seeders/SuppliersSeeder.php`

Import suppliers from itquty → imsquty.suppliers

**Fields**: name, code, contact_person, phone, email, address, city, state, country, postal_code, website, description, is_active

**Status**: ⏳ READY TO CREATE

---

#### 1.5 Create WarrantyTypesSeeder
**File**: `database/seeders/WarrantyTypesSeeder.php`

Import warranty_types from itquty → imsquty.warranty_types

**Naming Fixes**:
- `warranty_name` → `name` ✅

**Status**: ⏳ READY TO CREATE

---

### Task 2: Create Asset Data Seeders (2-3 hours)

These seeders handle primary data entities.

#### 2.1 Create AssetTypesSeeder
**File**: `database/seeders/AssetTypesSeeder.php`

Import asset types (categories) from itquty

**Status**: ⏳ READY TO CREATE

---

#### 2.2 Create AssetModelsSeeder
**File**: `database/seeders/AssetModelsSeeder.php`

Import asset models/specifications from itquty

**Status**: ⏳ READY TO CREATE

---

#### 2.3 Create StatusesSeeder
**File**: `database/seeders/StatusesSeeder.php`

Import statuses (Active, Inactive, Maintenance, Decommissioned, etc.)

**Status**: ⏳ READY TO CREATE

---

#### 2.4 Create AssetsSeeder
**File**: `database/seeders/AssetsSeeder.php`

Import all 156 assets from itquty → imsquty.assets

**Complex Field Mapping**:
```php
'asset_tag' => $legacyAsset->asset_tag,
'name' => $legacyAsset->asset_name,
'serial_number' => $legacyAsset->serial_number,
'qr_code' => $legacyAsset->qr_code,
'model_id' => $assetModelMap[$legacyAsset->model_id],
'status_id' => $statusMap[$legacyAsset->status_id],
'location_id' => $locationMap[$legacyAsset->location_id],
'division_id' => $divisionMap[$legacyAsset->division_id],
'supplier_id' => $supplierMap[$legacyAsset->supplier_id],
'warranty_type_id' => $warrantyMap[$legacyAsset->warranty_type_id],
'assigned_to' => $userMap[$legacyAsset->assigned_to],
'invoice_id' => $legacyAsset->invoice_id,
'purchase_order_id' => $legacyAsset->purchase_order_id,
'ip_address' => $legacyAsset->ip ?? $legacyAsset->ip_address,  // CONSOLIDATION
'mac_address' => $legacyAsset->mac ?? $legacyAsset->mac_address,  // CONSOLIDATION
'purchase_date' => $legacyAsset->purchase_date,
'warranty_months' => $legacyAsset->warranty_months,
'notes' => $legacyAsset->notes,
```

**Data Consolidation** (Handles Phase 1 Decision #3):
- Network fields: `ip` + `ip_address` → consolidate to `ip_address`
- Network fields: `mac` + `mac_address` → consolidate to `mac_address`
- Logic: Use legacy field if present, otherwise use microservice field

**Status**: ⏳ READY TO CREATE

---

### Task 3: Create Transactional Data Seeders (2-3 hours)

#### 3.1 Create PcspecsSeeder
**File**: `database/seeders/PcspecsSeeder.php`

Import PC specifications

**Status**: ⏳ READY TO CREATE

---

#### 3.2 Create MovementsSeeder
**File**: `database/seeders/MovementsSeeder.php`

Import asset movements (transfers between locations)

**Status**: ⏳ READY TO CREATE

---

#### 3.3 Create MaintenanceLogsSeeder
**File**: `database/seeders/MaintenanceLogsSeeder.php`

Import maintenance history

**Status**: ⏳ READY TO CREATE

---

#### 3.4 Create AssetRequestsSeeder
**File**: `database/seeders/AssetRequestsSeeder.php`

Import asset requests/requisitions

**Status**: ⏳ READY TO CREATE

---

#### 3.5 Create TicketsSeeder (ticket-service)
**File**: `services/ticket-service/database/seeders/TicketsSeeder.php`

Import 120+ tickets from itquty

**Status**: ⏳ READY TO CREATE

---

#### 3.6 Create InvoicesSeeder (financial-service)
**File**: `services/financial-service/database/seeders/InvoicesSeeder.php`

Import invoices

**Status**: ⏳ READY TO CREATE

---

#### 3.7 Create PurchaseOrdersSeeder (financial-service)
**File**: `services/financial-service/database/seeders/PurchaseOrdersSeeder.php`

Import purchase orders

**Status**: ⏳ READY TO CREATE

---

### Task 4: Register All Seeders (30 min)

#### 4.1 Update DatabaseSeeder.php
**File**: `database/seeders/DatabaseSeeder.php`

Register all seeders in correct order (dependencies first):

```php
$this->call([
    // Reference data (no dependencies)
    DivisionsSeeder::class,
    LocationsSeeder::class,
    ManufacturersSeeder::class,
    SuppliersSeeder::class,
    WarrantyTypesSeeder::class,
    
    // Asset structures (depends on reference data)
    AssetTypesSeeder::class,
    AssetModelsSeeder::class,
    StatusesSeeder::class,
    
    // Primary data (depends on asset structures)
    AssetsSeeder::class,
    PcspecsSeeder::class,
    
    // Transactions (depends on primary data)
    MovementsSeeder::class,
    MaintenanceLogsSeeder::class,
    AssetRequestsSeeder::class,
    
    // Cross-service data
    TicketsSeeder::class,
    InvoicesSeeder::class,
    PurchaseOrdersSeeder::class,
]);
```

**Status**: ⏳ READY TO UPDATE

---

## 🔄 SEEDING EXECUTION STEPS

### Step 1: Create imsquty_seed database (Optional - for backup)
```bash
mysql -u root -e "CREATE DATABASE imsquty_seed;"
mysqldump -u root imsquty > imsquty_backup_before_seed.sql
```

---

### Step 2: Run all seeders
```bash
cd imsquty
php artisan db:seed --class=DatabaseSeeder
```

**Expected Output**:
```
Seeding: Database\Seeders\DivisionsSeeder
✓ Imported XX divisions

Seeding: Database\Seeders\LocationsSeeder
✓ Imported XX locations

... (all seeders)

Seeding: Database\Seeders\AssetsSeeder
✓ Imported 156 assets with field consolidation

✅ Database seeded successfully!
```

---

### Step 3: Verify import
```bash
mysql -u root imsquty -e "
  SELECT COUNT(*) as 'Total Divisions' FROM divisions;
  SELECT COUNT(*) as 'Total Locations' FROM locations;
  SELECT COUNT(*) as 'Total Users' FROM users;
  SELECT COUNT(*) as 'Total Assets' FROM assets;
  SELECT COUNT(*) as 'Total Tickets' FROM tickets;
"
```

---

## 📊 EXPECTED RESULTS

After Phase 3 completion:

| Table | Source | Records | Status |
|-------|--------|---------|--------|
| users | itquty | 93 | ✅ |
| divisions | itquty | ~10 | ✅ |
| locations | itquty | ~15 | ✅ |
| manufacturers | itquty | ~20 | ✅ |
| suppliers | itquty | ~10 | ✅ |
| warranty_types | itquty | ~5 | ✅ |
| asset_types | itquty | ~20 | ✅ |
| asset_models | itquty | ~50 | ✅ |
| assets | itquty | 156 | ✅ |
| statuses | itquty | ~5 | ✅ |
| movements | itquty | ~200 | ✅ |
| maintenance_logs | itquty | ~100 | ✅ |
| tickets | itquty | 120+ | ✅ |
| invoices | itquty | ~30 | ✅ |
| purchase_orders | itquty | ~20 | ✅ |

**Total Records**: ~750+ imported successfully

---

## 🔐 DATA INTEGRITY CHECKS

### Phase 4 (Dec 27) - Validation Checks

```sql
-- Check for orphaned assets (no location)
SELECT COUNT(*) FROM assets WHERE location_id IS NULL;

-- Check asset-to-location consistency
SELECT a.id, a.asset_tag, a.location_id 
FROM assets a 
WHERE a.location_id NOT IN (SELECT id FROM locations)
AND a.location_id IS NOT NULL;

-- Check duplicate QR codes
SELECT qr_code, COUNT(*) 
FROM assets 
WHERE qr_code IS NOT NULL 
GROUP BY qr_code 
HAVING COUNT(*) > 1;

-- Check duplicate serial numbers
SELECT serial_number, COUNT(*) 
FROM assets 
WHERE serial_number IS NOT NULL 
GROUP BY serial_number 
HAVING COUNT(*) > 1;

-- Verify network field consolidation
SELECT COUNT(*) FROM assets 
WHERE ip_address IS NOT NULL 
AND mac_address IS NOT NULL;

-- Check for missing purchase dates
SELECT COUNT(*) FROM assets 
WHERE purchase_date IS NULL AND warranty_months > 0;
```

---

## ✅ SUCCESS CRITERIA (Phase 3)

- ✅ All 14+ seeders created with proper error handling
- ✅ All data mappings correct (field name standardization)
- ✅ Network field consolidation working (ip/mac duplication handled)
- ✅ All 750+ records imported successfully
- ✅ No orphaned foreign keys
- ✅ All seeds idempotent (safe to run multiple times)
- ✅ DatabaseSeeder.php updated with all seeders
- ✅ Documentation updated with seeding strategy
- ✅ Ready for Phase 4 validation (Dec 27)

---

## 🎯 NEXT PHASE

**Phase 4 (Dec 27)**: Data Validation & Cleanup
- Run 299 tests (should all pass with real data)
- Validate data integrity
- Test microservices with real data
- Check GDPR compliance (audit trails, soft deletes)

See: [COMPREHENSIVE_ACTION_PLAN.md](./COMPREHENSIVE_ACTION_PLAN.md)
