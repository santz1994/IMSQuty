# 📋 NAMING STANDARDIZATION GUIDE

**Date**: December 24, 2025  
**Scope**: imsquty Microservices  
**Purpose**: Eliminate naming inconsistencies, unclear naming, mismatched terminology  
**Status**: 📋 REFERENCE GUIDE - For implementation phase  

---

## 🎯 NAMING INCONSISTENCIES FOUND (8 Critical Issues)

### Issue #1: Field Name Inconsistency - Asset Type

**Current Problem**:
- **Monolith** uses: `type_name`, `abbreviation`
- **Microservice expects**: `name`, `code`
- **Status**: ❌ Data loss during import

**Standardization**:
```
Database Field         | Standard Name | Used In | Mapping
---------------------------------------------------------
asset_types.type_name  | name         | New     | monolith.type_name → ms.name
asset_types.abbreviation| code        | New     | monolith.abbreviation → ms.code
```

**Implementation**:
- [ ] Update asset-type resource to use `name` consistently
- [ ] Create seeder to map `type_name` → `name`
- [ ] Document in API: return `name` not `type_name`

**Files to Update**:
- [ ] `services/master-data-service/app/Models/AssetType.php` - Add accessor
- [ ] `services/master-data-service/app/Http/Resources/AssetTypeResource.php`
- [ ] `services/master-data-service/app/Repositories/AssetTypeRepository.php`
- [ ] `database/seeders/MigrateLegacyAssetTypesSeeder.php` (create)

---

### Issue #2: Boolean Field Type Inconsistency - Spare Flag

**Current Problem**:
- **Monolith**: `assets.spare` TINYINT(1) [0 or 1]
- **Microservice**: `assets.is_spare` BOOLEAN [true/false]
- **Status**: ⚠️ Type mismatch, naming inconsistency

**Standardization**:
```
Field          | Type    | Standard Name | Mapping
---------------------------------------------------
assets.spare   | TINYINT | is_spare     | 0 → false, 1 → true
assets.ip      | VARCHAR | ip_address   | (consolidate duplicates)
assets.mac     | VARCHAR | mac_address  | (consolidate duplicates)
```

**Implementation**:
- [ ] In migration: use `$table->boolean('is_spare')` 
- [ ] In model: add mutator `setIsSpareAttribute()`
- [ ] In seeder: convert `0/1` → boolean

**Files to Update**:
- [ ] `services/asset-service/app/Models/Asset.php`
- [ ] `services/asset-service/app/Http/Resources/AssetResource.php`
- [ ] `database/seeders/MigrateLegacyAssetsSeeder.php` (create)

---

### Issue #3: Duplicate Network Fields

**Current Problem**:
- **Monolith has BOTH**: `ip_address` AND `ip`, `mac_address` AND `mac`
- **Confusing**: Which field is authoritative?
- **Status**: ❌ Data duplication, unclear semantics

**Standardization**:
```
Old Field        | New Field      | Usage     | Action
----------------------------------------------------------
ip_address       | ip_address     | Keep      | Primary field
ip               | (deprecated)   | Legacy    | Delete from schema
mac_address      | mac_address    | Keep      | Primary field
mac              | (deprecated)   | Legacy    | Delete from schema
```

**Implementation**:
- [ ] In migrations: remove `ip` and `mac` columns
- [ ] In model: accept both but use only `ip_address`/`mac_address`
- [ ] In resource: return only `ip_address`/`mac_address`
- [ ] In seeder: use `ip_address` value (ignore duplicate)

**Files to Update**:
- [ ] `services/asset-service/database/migrations/*_create_assets_table.php` - Remove ip/mac
- [ ] `services/asset-service/app/Models/Asset.php` - Add fields to fillable
- [ ] `services/asset-service/app/Http/Resources/AssetResource.php`
- [ ] `database/seeders/MigrateLegacyAssetsSeeder.php` - Select ip_address only

---

### Issue #4: Unclear Reference - movement_id

**Current Problem**:
- **Monolith**: `assets.movement_id` INT(11) - Unclear relationship
- **Questions**: 
  - Is it FK to `movements` table?
  - Is it "current location" or "last recorded location"?
  - Why duplicate info with separate movements table?
- **Status**: ❌ Unclear semantics, potential data inconsistency

**Standardization**:
```
Current Field     | Recommended     | Meaning
---------------------------------------------
movement_id       | last_movement_id | Last recorded asset movement/location
(No status_id FK) | (Add if needed)   | Current location/status reference
```

**Decision Required**:
- [ ] Is `movement_id` = "last known location"?
- [ ] Or is it "current location" (should be FK to users/locations)?
- [ ] Should we track movement history separately?

**Recommended Implementation**:
```php
// In Asset model - clarify relationship
public function lastMovement()
{
    return $this->belongsTo(Movement::class, 'movement_id');
}

// In Resource
'last_movement_id' => $this->movement_id,
'last_movement' => new MovementResource($this->lastMovement),
```

**Files to Update**:
- [ ] `services/asset-service/app/Models/Asset.php` - Add clear relationship
- [ ] `services/asset-service/database/migrations/*_create_assets_table.php` - Add FK constraint
- [ ] `services/asset-service/app/Http/Resources/AssetResource.php` - Add clarity to field names
- [ ] Documentation: Clarify movement_id semantics

---

### Issue #5: Ticket Status Naming Ambiguity

**Current Problem**:
- **Monolith**: Uses `ticket_status` foreign key
- **Unclear**: Where are status values? In separate table?
- **Status**: ⚠️ Unclear relationship, may cause import issues

**Standardization**:
```
Field           | Standard Name | Type | Values
----------------------------------------------------
status_id       | status_id     | INT  | FK to ticket_statuses
ticket_statuses.name | status    | VARCHAR | 'open', 'in_progress', 'closed', 'resolved'
```

**Implementation**:
- [ ] In migration: `$table->unsignedInteger('status_id')->references('id')->on('ticket_statuses')`
- [ ] In model: `protected $fillable = [..., 'status_id']`
- [ ] In resource: Include status_id (not status name directly)
- [ ] In seeder: Map monolith status values

**Files to Update**:
- [ ] `services/ticket-service/database/migrations/*_create_tickets_table.php`
- [ ] `services/ticket-service/app/Models/Ticket.php`
- [ ] `services/ticket-service/app/Http/Resources/TicketResource.php`

---

### Issue #6: Generic "finished" Field

**Current Problem**:
- **Monolith**: Some tables use `finished` BOOLEAN
- **Unclear**: Does "finished" mean completed, archived, or resolved?
- **Status**: ❌ Semantic ambiguity

**Standardization**:
```
Old Field    | Meaning         | New Field       | Type
----------------------------------------------------------
finished     | Task complete   | completed_at    | TIMESTAMP
(none)       | Workflow done   | resolved_at     | TIMESTAMP
(none)       | Marked archive  | archived_at     | TIMESTAMP
(none)       | Soft delete     | deleted_at      | TIMESTAMP
```

**Implementation** (Choose one per table):
```php
// For workflows: use resolved_at
$table->timestamp('resolved_at')->nullable(); // When marked done

// For archive: use archived_at
$table->timestamp('archived_at')->nullable(); // When archived

// For deletions: use deleted_at (SoftDeletes)
$table->softDeletes(); // Includes deleted_at
```

**Decision Required**:
- [ ] Which tables have "finished" field?
- [ ] What does each one mean semantically?
- [ ] Map each to appropriate timestamp

---

### Issue #7: Supplier Scope Ambiguity

**Current Problem**:
- **Monolith**: Has `suppliers` table, `supplier_id` in assets
- **Microservices**: No dedicated supplier service
- **Status**: ❌ Missing service scope, data loss risk

**Standardization**:
```
Current State        | Decision Needed | Recommendation
------------------------------------------------------
assets.supplier_id   | Create service? | Add to master-data-service
suppliers table      | Keep? Archive?  | Move to master-data service
Supplier tracking    | Service scope   | Add supplier-related queries to master-data
```

**Implementation Decision**:
- [ ] **Option A**: Add suppliers to master-data-service
- [ ] **Option B**: Create dedicated supplier-service
- [ ] **Option C**: Archive suppliers (accept data loss)

**Recommended**: Option A (add to master-data-service)

**Files to Create**:
- [ ] `services/master-data-service/database/migrations/*_create_suppliers_table.php`
- [ ] `services/master-data-service/app/Models/Supplier.php`
- [ ] `services/master-data-service/app/Http/Controllers/SupplierController.php`
- [ ] `database/seeders/MigrateLegacySuppliersSeeder.php`

---

### Issue #8: Invoice/PO Reference Strategy

**Current Problem**:
- **Monolith**: `assets.invoice_id`, `assets.purchase_order_id` foreign keys
- **Microservices**: Financial-service handles invoices separately
- **Status**: ❌ Relationship unclear, potential data loss

**Standardization**:
```
Field              | Service Owner    | Type | Strategy
-------------------------------------------------------
invoice_id         | financial-service | INT  | FK or denormalized
purchase_order_id  | financial-service | INT  | FK or denormalized
```

**Architecture Decision**:
- [ ] **Option A**: Keep FK, rely on financial-service for PO/invoice data
- [ ] **Option B**: Denormalize (store invoice_number, po_number as strings)
- [ ] **Option C**: Create separate invoice/po service

**Recommended**: Option B (denormalize to strings for resilience)

```php
// In Asset model
protected $fillable = [
    ...,
    'purchase_invoice_number',  // Invoice reference (string)
    'purchase_order_number',    // PO reference (string)
    'supplier_id',              // FK to suppliers table
    'purchase_date',
];

// Remove: 'invoice_id', 'purchase_order_id' (numeric FK)
```

**Files to Update**:
- [ ] `services/asset-service/database/migrations/*_create_assets_table.php`
- [ ] `services/asset-service/app/Models/Asset.php`
- [ ] `database/seeders/MigrateLegacyAssetsSeeder.php`

---

## 📊 NAMING CONVENTION STANDARDS (Going Forward)

### 1. Field Naming Convention

```
Category         | Convention        | Examples
--------------------------------------------------
Primary Keys     | id                | id
Foreign Keys     | {table}_id        | user_id, asset_id, supplier_id
Status           | status_id         | status_id (FK to statuses table)
Boolean flags    | is_{property}     | is_active, is_spare, is_available
Timestamps       | {action}_at       | created_at, updated_at, resolved_at
Counts           | {item}_count      | view_count, download_count
Amounts/totals   | {item}_total      | price_total, quantity_total
Names/titles     | name              | (NOT type_name, title, label)
Codes/refs       | code              | (NOT abbreviation, short_code, ref)
Descriptions     | description       | (NOT desc, notes for long text)
Flags            | is_{status}       | (NOT flag_{status}, {status}_flag)
```

---

### 2. Table Naming Convention

```
Type           | Convention           | Examples
-----------------------------------------------------
Collections    | Plural noun          | assets, users, divisions, suppliers
Pivot/Junction | {table1}_{table2}    | user_roles, asset_movements
Status list    | {entity}_statuses    | ticket_statuses, asset_statuses
Log/history    | {entity}_logs        | audit_logs, activity_logs
```

---

### 3. Avoid These Patterns

```
❌ Generic names:
   - "data", "info", "item", "value", "temp"
   - Use specific: "asset_data" → "assets"

❌ Abbreviations:
   - "abbr", "mfr", "desc" → use full names: "code", "manufacturer", "description"

❌ Duplicates:
   - "ip" AND "ip_address" → pick one: use "ip_address"
   - "finished" AND "completed" → pick one: use "completed_at"

❌ Type suffixes in names:
   - "type_name" → use "name"
   - "status_id_number" → use "status_id"

❌ Ambiguous statuses:
   - "finished" → clarify: "completed", "resolved", "archived"
   - "active" → clarify: "is_active", "is_enabled"
```

---

## 🔄 REFACTORING CHECKLIST

### Phase 1: Standards Documentation (DONE)
- [x] Create this guide
- [x] Document 8 naming inconsistencies
- [x] Define naming conventions

### Phase 2: Code Updates (IN PROGRESS)
- [ ] **Asset Service**:
  - [ ] Update AssetType model (type_name → name)
  - [ ] Remove duplicate ip/mac fields
  - [ ] Clarify movement_id semantics
  - [ ] Update Asset model fillables

- [ ] **Master Data Service**:
  - [ ] Add suppliers table/model
  - [ ] Standardize asset_type names
  - [ ] Verify location table structure

- [ ] **Ticket Service**:
  - [ ] Clarify ticket_status relationships
  - [ ] Remove ambiguous "finished" fields
  - [ ] Ensure status_id FK constraints

- [ ] **All Services**:
  - [ ] Review for generic names (data, info, etc.)
  - [ ] Replace abbreviations with full words
  - [ ] Standardize timestamp naming

### Phase 3: Database Migrations (TODO)
- [ ] Update all migrations to follow conventions
- [ ] Add FK constraints clearly
- [ ] Document field purposes with comments

### Phase 4: Tests & Validation (TODO)
- [ ] Update field names in test factories
- [ ] Update API response assertions
- [ ] Verify seeder data mapping

### Phase 5: Documentation (TODO)
- [ ] API docs - use standard field names
- [ ] ERD diagrams - reflect naming standards
- [ ] Database schema docs - explain each field

---

## 📝 IMPLEMENTATION PRIORITY

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0-CRITICAL | Issue #1 (type_name→name) | 2h | Blocks data import |
| P0-CRITICAL | Issue #3 (ip/mac duplicates) | 1h | Blocks data import |
| P0-CRITICAL | Issue #4 (movement_id clarity) | 2h | Blocks data import |
| P1-HIGH | Issue #2 (spare boolean) | 1h | Data loss risk |
| P1-HIGH | Issue #5 (ticket status) | 2h | Query/filter issues |
| P1-HIGH | Issue #7 (suppliers scope) | 3h | Missing service |
| P2-MEDIUM | Issue #6 (finished field) | 2h | Semantic clarity |
| P2-MEDIUM | Issue #8 (invoice/PO) | 2h | Financial tracking |

**Total Estimated Effort**: 15 hours (2 days @ 7.5h/day)

---

## ✅ VERIFICATION CHECKLIST

After refactoring:
- [ ] All field names follow conventions
- [ ] No duplicate fields (ip/mac, finished/resolved)
- [ ] All FK relationships documented
- [ ] API responses use standard names
- [ ] Tests pass with new field names
- [ ] Database seeder maps old → new names
- [ ] Documentation reflects new structure
- [ ] Team trained on naming standards

---

**Document Status**: 📋 REFERENCE GUIDE  
**Last Updated**: December 24, 2025  
**Owner**: Development Team  
**Next Action**: Begin Phase 2 (Code Updates) after architecture decisions
