# SESSION 32 - Database Migration Strategy & Schema Alignment

**Date:** December 24, 2025  
**Focus:** Analyze itquty.sql (old monolith) and align with imsquty microservices  
**Objective:** Import legacy data while maintaining microservices schema integrity

---

## 🎯 Understanding the Challenge

### Current Situation:
- **Source Database:** `itquty.sql` - Old monolithic Laravel application backup
- **Target Database:** `imsquty` - New microservices architecture
- **Strategy:** Strangler Pattern - Migrate data while refactoring to microservices

### Key Issues Found:

#### 1. Schema Naming Differences

**Example: asset_types Table**

| Field | Monolith (itquty) | Microservice Expected |
|-------|-------------------|----------------------|
| Type Name | `type_name` | `name` |
| Code | `abbreviation` | `code` |
| Spare | `spare` | `is_spare` |

**Monolith Definition:**
```sql
CREATE TABLE `asset_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `type_name` varchar(100) NOT NULL,      ← Monolith uses type_name
  `abbreviation` varchar(3) NOT NULL,     ← Monolith uses abbreviation
  `spare` tinyint(1) NOT NULL DEFAULT 0   ← Monolith uses spare
)
```

**Microservice Definition (from migration):**
```sql
CREATE TABLE `asset_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,           ← Expects name
  `code` varchar(10) NOT NULL,            ← Expects code
  `is_spare` tinyint(1) NOT NULL DEFAULT 0 ← Expects is_spare
)
```

#### 2. Relationship Column Naming

**Monolith:** Uses simple IDs + relationship names
- `asset_type_id` → references asset_types table
- `manufacturer_id` → references manufacturers table

**Microservice:** Expected same but with different relationship definitions

#### 3. Duplicate/Redundant Fields

**Assets Table - Monolith has duplicates:**
```sql
`ip_address` varchar(45) DEFAULT NULL,    -- Used
`ip` varchar(45) DEFAULT NULL,            -- Duplicate/Old field

`mac_address` varchar(17) DEFAULT NULL,   -- Used
`mac` varchar(17) DEFAULT NULL,           -- Duplicate/Old field
```

---

## 📊 Table-by-Table Analysis

### Master Data Service Tables

#### 1. `divisions` → MISMATCH ❌
**Monolith:** Uses `divisions` table
**Microservice:** Creates `divisions` with same fields
**Status:** ✅ Compatible - Use as-is

#### 2. `locations` → MISMATCH ❌
**Monolith:** Unknown structure (need to extract)
**Microservice:** Expects (id, name, code, address, division_id)
**Action:** Extract and verify field names

#### 3. `asset_types` → MISMATCH ❌
**Monolith:** `type_name`, `abbreviation`, `spare`
**Microservice:** `name`, `code`, `is_spare`
**Action:** Map during import

#### 4. `manufacturers` → NEEDS CHECK ❌
**Monolith:** Unknown structure
**Microservice:** Expects (id, name, code, country)
**Action:** Extract and verify

#### 5. `asset_models` → COMPATIBLE ✅
**Monolith:** `asset_model` field exists
**Microservice:** Expects `name` or `asset_model`
**Action:** Map or rename during import

---

### Asset Service Tables

#### 1. `assets` Table → COMPLEX MISMATCH ⚠️
**Monolith Fields:**
```sql
id, asset_tag, name, qr_code, serial_number,
model_id, division_id, location_id, supplier_id,
movement_id (strange - should be one-to-many),
status_id, assigned_to, notes, ip_address, mac_address,
purchase_date, warranty_months, warranty_type_id,
invoice_id, purchase_order_id,
ip (duplicate), mac (duplicate),
deleted_at, created_at, updated_at
```

**Microservice Should Have:**
- Same structure but cleaned (no duplicates)
- Better relationship handling

**Action:** Clean duplicates, verify FKs

#### 2. `asset_movements` → NOT FOUND ❌
**Monolith:** Has `movement_id` in assets but no movements table visible
**Microservice:** Needs `asset_movements` table
**Action:** Create mapping or extract from monolith

#### 3. `asset_maintenance_logs` → FOUND ✅
**Status:** Table exists in monolith SQL
**Action:** Import directly

---

### Ticket Service Tables

#### 1. `tickets` Table → NEEDS EXTRACTION ❌
**Status:** Not shown in SQL excerpt - need to find
**Action:** Extract full table definition

#### 2. `ticket_comments` → NEEDS EXTRACTION ❌
**Status:** Not shown
**Action:** Extract definition

#### 3. `tickets_statuses`, `tickets_priorities`, `tickets_types` → FOUND ✅
**Status:** Need to verify field names
**Action:** Check monolith definitions

---

## 🔧 Migration Strategy

### Phase 1: Schema Alignment (30 mins)
1. Extract ALL table definitions from itquty.sql
2. Create mapping document for field name differences
3. Identify missing tables and handle
4. Document any data transformations needed

### Phase 2: Laravel Model Updates (1-2 hours)
1. Update models to include field name accessors/mutators
2. Handle schema mismatch with appends/fillable
3. Test model operations

### Phase 3: Data Import (30 mins)
1. Run migrations for microservices
2. Import data from itquty.sql with mappings
3. Verify data integrity

### Phase 4: Testing (1-2 hours)
1. Run full test suite
2. Fix any relationship or validation issues
3. Verify audit logging

---

## 📋 Action Items for This Session

- [ ] Extract complete schema from itquty.sql
- [ ] Document field mappings for each table
- [ ] Create data import script/migrations
- [ ] Update models with accessor/mutators for field mapping
- [ ] Test data import
- [ ] Fix failing tests
- [ ] Update documentation

---

## 🗂️ File Structure for Migration

```
imsquty/
└── database/
    ├── migrations/        ← Existing microservice migrations
    ├── seeds/            ← New: Data from itquty.sql
    │   ├── ImportDivisionsSeeder.php
    │   ├── ImportAssetTypesSeeder.php
    │   └── ...
    └── mappings/         ← Field mapping references
        └── schema-mapping.json
```

---

## 💾 Next Steps

1. **Extract Schema:** Get full table definitions
2. **Create Mapping:** Document all field name changes
3. **Build Import:** Create seeders with field mapping
4. **Validate:** Test with actual data
5. **Fix Tests:** Adjust tests for actual data
