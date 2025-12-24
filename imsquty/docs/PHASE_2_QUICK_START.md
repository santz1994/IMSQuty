# 🚀 DECEMBER 25 - PHASE 2 QUICK START

**Date**: December 25, 2025 (Tomorrow)  
**Focus**: Code Updates for Missing Fields  
**Effort**: 8 hours  
**Owner**: Senior Developer  

---

## 📋 PHASE 2 TODO LIST (Copy & Use)

### Task 1: Asset Service Updates (3-4 hours)

#### 1.1 Update Migration
**File**: `services/asset-service/database/migrations/*_create_assets_table.php`

Add these fields to migration:
```php
$table->string('qr_code')->nullable();
$table->string('serial_number')->nullable();
$table->unsignedBigInteger('supplier_id')->nullable();
$table->unsignedBigInteger('warranty_type_id')->nullable();
$table->string('invoice_id')->nullable();
$table->string('purchase_order_id')->nullable();
```

**Checklist**:
- [ ] Open file and locate $table definition
- [ ] Add 6 fields above (in order shown)
- [ ] Save file

#### 1.2 Update Asset Model
**File**: `services/asset-service/app/Models/Asset.php`

Add to `$fillable` array:
```php
'qr_code',
'serial_number',
'supplier_id',
'warranty_type_id',
'invoice_id',
'purchase_order_id',
```

Also add relationships:
```php
public function supplier()
{
    return $this->belongsTo(Supplier::class);
}

public function warrantyType()
{
    return $this->belongsTo(WarrantyType::class);
}
```

**Checklist**:
- [ ] Open Asset model
- [ ] Add 6 fields to $fillable
- [ ] Add 2 relationships
- [ ] Save file

#### 1.3 Update AssetResource
**File**: `services/asset-service/app/Http/Resources/AssetResource.php`

Add to return array:
```php
'qr_code' => $this->qr_code,
'serial_number' => $this->serial_number,
'supplier_id' => $this->supplier_id,
'warranty_type_id' => $this->warranty_type_id,
'invoice_id' => $this->invoice_id,
'purchase_order_id' => $this->purchase_order_id,
```

**Checklist**:
- [ ] Open AssetResource
- [ ] Add 6 fields to response
- [ ] Save file

#### 1.4 Test
**Command**: 
```bash
cd services/asset-service
php artisan test --filter AssetTest
```

**Expected**: 40/40 tests still passing ✅

---

### Task 2: Master-Data Service - Add Supplier Model (2-3 hours)

#### 2.1 Create Migration
**File**: `services/master-data-service/database/migrations/YYYY_MM_DD_HHMMSS_create_suppliers_table.php`

```php
public function up()
{
    Schema::create('suppliers', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('code')->nullable();
        $table->string('email')->nullable();
        $table->string('phone')->nullable();
        $table->text('address')->nullable();
        $table->string('city')->nullable();
        $table->string('country')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });
}
```

**Checklist**:
- [ ] Create new migration file
- [ ] Copy schema above
- [ ] Run: `php artisan make:migration create_suppliers_table`
- [ ] Update file with schema

#### 2.2 Create Model
**File**: `services/master-data-service/app/Models/Supplier.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'code', 'email', 'phone', 'address', 'city', 'country'
    ];
}
```

**Checklist**:
- [ ] Create Supplier model
- [ ] Add SoftDeletes trait
- [ ] Add $fillable array
- [ ] Save file

#### 2.3 Create Resource
**File**: `services/master-data-service/app/Http/Resources/SupplierResource.php`

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

**Checklist**:
- [ ] Create SupplierResource
- [ ] Add fields to response
- [ ] Save file

#### 2.4 Create Controller
**File**: `services/master-data-service/app/Http/Controllers/SupplierController.php`

Use ManufacturerController as template (copy & rename)

**Checklist**:
- [ ] Copy ManufacturerController.php
- [ ] Rename to SupplierController.php
- [ ] Replace 'Manufacturer' with 'Supplier' (all occurrences)
- [ ] Update route parameter names
- [ ] Save file

#### 2.5 Add Routes
**File**: `services/master-data-service/routes/api.php`

Add:
```php
Route::apiResource('suppliers', SupplierController::class);
```

**Checklist**:
- [ ] Open routes/api.php
- [ ] Add supplier route
- [ ] Save file

#### 2.6 Create Tests
**File**: `services/master-data-service/tests/Feature/SupplierControllerTest.php`

Use ManufacturerControllerTest as template (copy & adapt)

**Checklist**:
- [ ] Copy ManufacturerControllerTest.php
- [ ] Rename to SupplierControllerTest.php
- [ ] Update model/factory references
- [ ] Save file

#### 2.7 Test
**Command**:
```bash
cd services/master-data-service
php artisan test --filter SupplierControllerTest
```

**Expected**: 8-10 tests passing ✅

---

### Task 3: Standardize Across All Services (1-2 hours)

#### 3.1 Fix ID Type (int → bigint)

**For each service**: Check if all IDs use `bigint`:

```bash
grep -r "unsignedInteger\|->id()" services/*/database/migrations/
```

**If found**: 
- Change `unsignedInteger` → `unsignedBigInteger`
- Change `->id()` → already bigint ✅

**Affected Services**: Check all 10

**Checklist**:
- [ ] auth-service
- [ ] user-service
- [ ] asset-service
- [ ] master-data-service
- [ ] ticket-service
- [ ] meeting-room-service
- [ ] financial-service
- [ ] inventory-service
- [ ] reporting-service
- [ ] notification-service

#### 3.2 Add SoftDeletes Trait

**For each service**: Verify all models have `SoftDeletes` trait

**Check**:
```bash
grep -r "use SoftDeletes" services/*/app/Models/
```

**If missing**: 
- Add `use SoftDeletes;` to model
- Add `$dates = ['deleted_at'];` to model

**Affected Models**: Check all service models

**Checklist**:
- [ ] auth-service models
- [ ] user-service models
- [ ] asset-service models (ALL)
- [ ] master-data-service models (ALL)
- [ ] ticket-service models
- [ ] meeting-room-service models
- [ ] financial-service models
- [ ] inventory-service models
- [ ] reporting-service models
- [ ] notification-service models

---

### Task 4: Verify All Tests Still Pass (30 min)

**Command**:
```bash
# In each service directory
php artisan test

# Or run all tests from root
for dir in services/*/; do
  echo "Testing $dir..."
  cd "$dir"
  php artisan test
  cd ../../..
done
```

**Expected**: 299/299 tests passing ✅

**Checklist**:
- [ ] auth-service: 28/28 ✅
- [ ] user-service: 43/43 ✅
- [ ] asset-service: 40/40 ✅
- [ ] master-data-service: 84/84 ✅
- [ ] ticket-service: 19/19 ✅
- [ ] meeting-room-service: 46/46 ✅
- [ ] financial-service: 10/10 ✅
- [ ] inventory-service: 10/10 ✅
- [ ] reporting-service: 9/9 ✅
- [ ] notification-service: 11/11 ✅

---

## 📚 REFERENCE DOCUMENTS

**Read These First**:
1. [PHASE_1_ARCHITECTURAL_DECISIONS.md](./PHASE_1_ARCHITECTURAL_DECISIONS.md) - What to change
2. [NAMING_STANDARDIZATION_GUIDE.md](./NAMING_STANDARDIZATION_GUIDE.md) - Naming patterns
3. [DATABASE_IMPORT_CRITICAL_ANALYSIS.md](./DATABASE_IMPORT_CRITICAL_ANALYSIS.md) - Why these fields

**Use These for Examples**:
- ManufacturerController (for SupplierController)
- ManufacturerControllerTest (for SupplierControllerTest)
- Asset model (already has all patterns)
- AssetResource (reference for response structure)

---

## ⏰ TIME BREAKDOWN

| Task | Time | Status |
|------|------|--------|
| Asset service updates | 3-4h | Ready |
| Master-data (Supplier) | 2-3h | Ready |
| Standardization | 1-2h | Ready |
| Testing | 30 min | Ready |
| **TOTAL** | **8h** | **READY** |

---

## ✅ SUCCESS CRITERIA

- [x] All 6 new fields added to Asset model
- [x] Supplier model created with controller/routes
- [x] ID types standardized (all bigint)
- [x] SoftDeletes trait on all models
- [x] 299/299 tests still passing
- [x] No data loss on planned import
- [x] Ready for Phase 3 (Dec 26)

---

## 🚨 COMMON ISSUES & FIXES

### Issue #1: Migration Won't Run
**Cause**: Doctrine DBAL missing  
**Fix**: `composer require doctrine/dbal`

### Issue #2: Tests Fail After Changes
**Cause**: Migrations not refreshed  
**Fix**: `php artisan migrate:fresh`

### Issue #3: Foreign Key Constraint Error
**Cause**: supplier_id FK but suppliers table missing  
**Fix**: Run migrations, populate suppliers table

### Issue #4: 299 Tests → 290 Tests
**Cause**: New tests not registered  
**Fix**: Check test class extends TestCase, uses traits

---

## 📞 HELP & REFERENCE

**Questions?**:
- See [CURRENT_STATUS_SESSION19.md](./CURRENT_STATUS_SESSION19.md)
- See [PHASE_1_ARCHITECTURAL_DECISIONS.md](./PHASE_1_ARCHITECTURAL_DECISIONS.md)
- See [NAMING_STANDARDIZATION_GUIDE.md](./NAMING_STANDARDIZATION_GUIDE.md)

**Documentation**:
- All docs in `d:\Project\ITQuty\imsquty\docs\`
- Reference docs in `docs/task/`

---

## 🎯 END OF DAY CHECKLIST (Dec 25)

- [ ] Task 1 complete: Asset service ✅
- [ ] Task 2 complete: Master-data supplier ✅
- [ ] Task 3 complete: Standardization ✅
- [ ] Task 4 complete: All 299 tests passing ✅
- [ ] Code committed to git
- [ ] Ready for Phase 3 (Dec 26)

---

**GO! You've got this! 💪**

**Time**: December 25, 2025, 8:00 AM - 5:00 PM (8 hours)  
**Objective**: Add missing fields, create Supplier model, standardize, verify tests  
**Next**: Phase 3 (Dec 26) - Database import seeders
