# Database Schema Mapping: itquty.sql → imsquty Services

**Purpose**: Document field naming inconsistencies and schema transformations for data migration from monolith to microservices.

**Last Updated**: 2024-12-18
**Status**: In Progress (Session 33)

---

## Executive Summary

The old monolith (`quty2/itquty.sql`) uses different naming conventions than the new microservices (`imsquty`). This document maps tables, identifies breaking changes, and provides migration strategies.

**Key Issues Found**:
1. **Field Naming**: `type_name` → `name`, `abbreviation` → `code`
2. **Boolean Encoding**: Integer (0/1) vs. Boolean vs. String enums
3. **Foreign Keys**: Different constraint strategies (SET NULL vs CASCADE vs RESTRICT)
4. **New Fields**: Audit, soft-deletes, timestamps inconsistencies

---

## Core Tables Mapping

### 1. USERS Table

| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| `id` | `id` | INT | ✓ Direct mapping |
| `supabase_id` | `supabase_id` | VARCHAR | ✓ Direct mapping |
| `name` | `name` | VARCHAR | ✓ Direct mapping |
| `email` | `email` | VARCHAR | ✓ Direct mapping |
| `notify_email` | `notify_email` | TINYINT(1) | 0/1 → Boolean |
| `notify_ticket_created` | `notify_ticket_created` | TINYINT(1) | 0/1 → Boolean |
| `notify_ticket_assigned` | `notify_ticket_assigned` | TINYINT(1) | 0/1 → Boolean |
| `notify_ticket_updated` | `notify_ticket_updated` | TINYINT(1) | 0/1 → Boolean |
| `notify_meeting_approved` | `notify_meeting_approved` | TINYINT(1) | 0/1 → Boolean |
| `notify_meeting_rejected` | `notify_meeting_rejected` | TINYINT(1) | 0/1 → Boolean |
| `profile_picture` | `profile_picture` | VARCHAR | ✓ Direct mapping |
| `division_id` | `division_id` | INT | FK to divisions |
| `location_id` | `location_id` | BIGINT | FK to locations |
| `phone` | `phone` | VARCHAR(20) | ✓ Direct mapping |
| `is_active` | `is_active` | TINYINT(1) | 0/1 → Boolean |
| `last_login_at` | `last_login_at` | TIMESTAMP | ✓ Direct mapping |
| `password` | `password` | VARCHAR(60) | ⚠️ Keep encrypted |
| `api_token` | `api_token` | VARCHAR(60) | ⚠️ Hash before migration |
| `remember_token` | `remember_token` | VARCHAR(100) | Optional, can drop |
| `created_at` | `created_at` | TIMESTAMP | ✓ Direct mapping |
| `updated_at` | `updated_at` | TIMESTAMP | ✓ Direct mapping |
| — | `deleted_at` | TIMESTAMP | ❌ NEW: Soft-delete |

**Migration Strategy**:
```sql
INSERT INTO users (id, supabase_id, name, email, notify_email, division_id, location_id, 
                   phone, is_active, password, created_at, updated_at)
SELECT id, supabase_id, name, email, notify_email, division_id, location_id, 
       phone, is_active, password, created_at, updated_at
FROM old_users
WHERE deleted_at IS NULL;
```

---

### 2. DIVISIONS Table

| Old Field | New Field | Type | Issues |
|-----------|-----------|------|--------|
| `id` | `id` | INT | ✓ Direct |
| `name` | `name` | VARCHAR(100) | ✓ Direct |

**Data Count**: 72 divisions (from old DB)

---

### 3. LOCATIONS Table

| Old Field | New Field | Type | Issues |
|-----------|-----------|------|--------|
| `id` | `id` | INT | ✓ Direct |
| `location` | `name` | VARCHAR(100) | ⚠️ FIELD RENAMED |

---

### 4. ASSETS Table (Complex)

#### OLD Schema Fields:
```sql
id, asset_tag, name, serial_number, division_id, supplier_id, 
warranty_type_id, status_id, purchase_date, assigned_to, 
purchase_order_id, ip_address, mac_address, notes, warranty_months, 
invoice_id, qr_code, model_id, movement_id, created_at, updated_at
```

#### NEW Schema Fields (Expected):
```sql
id, asset_tag, name, serial_number, division_id, supplier_id,
warranty_type_id, status_id, purchase_date, assigned_to,
purchase_order_id, ip_address, mac_address, notes, warranty_months,
invoice_id, qr_code, model_id, location_id, is_spare, created_at,
updated_at, deleted_at
```

#### Field Mapping:

| Old | New | Type | Change |
|-----|-----|------|--------|
| `id` | `id` | INT | ✓ |
| `asset_tag` | `asset_tag` | VARCHAR | ✓ |
| `name` | `name` | VARCHAR | ✓ |
| `serial_number` | `serial_number` | VARCHAR | ✓ UNIQUE |
| `division_id` | `division_id` | INT | ✓ |
| `supplier_id` | `supplier_id` | INT | ✓ |
| `warranty_type_id` | `warranty_type_id` | INT | ✓ |
| `status_id` | `status_id` | INT | ✓ |
| `purchase_date` | `purchase_date` | DATETIME | ✓ |
| `assigned_to` | `assigned_to` | INT | ✓ FK to users |
| `purchase_order_id` | `purchase_order_id` | INT | ✓ |
| `ip_address` | `ip_address` | VARCHAR | ✓ |
| `mac_address` | `mac_address` | VARCHAR | ✓ |
| `notes` | `notes` | TEXT | ✓ |
| `warranty_months` | `warranty_months` | INT | ✓ |
| `invoice_id` | `invoice_id` | INT | ✓ |
| `qr_code` | `qr_code` | VARCHAR | ✓ UNIQUE |
| `model_id` | `model_id` | INT | ✓ FK to asset_models |
| `movement_id` | — | INT | ❌ DEPRECATED |
| — | `location_id` | BIGINT | ❌ NEW: FK to locations |
| — | `is_spare` | BOOLEAN | ❌ NEW: Asset classification |
| — | `deleted_at` | TIMESTAMP | ❌ NEW: Soft-delete |
| `created_at` | `created_at` | TIMESTAMP | ✓ |
| `updated_at` | `updated_at` | TIMESTAMP | ✓ |

**Sample Data Migration**:
- 334 assets from old system
- Example: `QHP.24.01.666.01` (asset_tag format)

---

### 5. ASSET_MODELS Table

| Old Field | New Field | Type | Change |
|-----------|-----------|------|--------|
| `id` | `id` | INT | ✓ |
| `name` | `name` | VARCHAR | ✓ |
| `manufacturer_id` | `manufacturer_id` | INT | ✓ FK |
| `asset_type_id` | `asset_type_id` | INT | ✓ FK |

---

### 6. ASSET_TYPES Table

| Old Field | New Field | Type | Issues |
|-----------|-----------|------|--------|
| `id` | `id` | INT | ✓ |
| `type_name` | `name` | VARCHAR | ⚠️ FIELD RENAMED |
| `abbreviation` | `code` | VARCHAR | ⚠️ FIELD RENAMED |
| `spare` | `is_spare` | BOOLEAN | ⚠️ TYPE + NAME CHANGE |

**Migration SQL**:
```sql
SELECT id, type_name AS name, abbreviation AS code, spare AS is_spare
FROM old_asset_types;
```

---

### 7. TICKETS Table

| Old Field | New Field | Type | Issues |
|-----------|-----------|------|--------|
| `id` | `id` | INT | ✓ |
| `ticket_code` | `ticket_code` | VARCHAR | ✓ |
| `subject` | `subject` | VARCHAR | ✓ |
| `description` | `description` | TEXT | ✓ |
| `ticket_priority_id` | `priority_id` | INT | ✓ FK |
| `ticket_type_id` | `type_id` | INT | ✓ FK |
| `ticket_status_id` | `status_id` | INT | ✓ FK |
| `location_id` | `location_id` | INT | ✓ FK |
| `user_id` | `reporter_id` | INT | ⚠️ RENAMED (creator) |
| `assigned_to` | `assigned_to` | INT | ✓ FK to users |
| `assigned_at` | `assigned_at` | DATETIME | ✓ |
| `assignment_type` | `assignment_type` | VARCHAR | ✓ ENUM(manual,auto) |
| `sla_due` | `sla_due` | DATETIME | ✓ |
| — | `resolved_at` | DATETIME | ❌ NEW: Completion ts |
| — | `deleted_at` | TIMESTAMP | ❌ NEW: Soft-delete |
| `created_at` | `created_at` | TIMESTAMP | ✓ |
| `updated_at` | `updated_at` | TIMESTAMP | ✓ |

**Sample Data**:
- 19 tickets from sample period
- Example: `TKT-20251210-001` (format: TKT-YYYYMMDD-###)

---

### 8. TICKET_STATUSES Table

| Old Field | New Field | Type | Issues |
|-----------|-----------|------|--------|
| `id` | `id` | INT | ✓ |
| `status` | `name` | VARCHAR | ✓ |

**Values**:
- 1: Open
- 2: Pending
- 3: Resolved

---

### 9. TICKET_TYPES Table

| Old Field | New Field | Type | Issues |
|-----------|-----------|------|--------|
| `id` | `id` | INT | ✓ |
| `type` | `name` | VARCHAR | ✓ |

**Values**:
- 1: Incident
- 2: Problem
- 3: Loan

---

### 10. TICKET_PRIORITIES Table

| Old Field | New Field | Type | Issues |
|-----------|-----------|------|--------|
| `id` | `id` | INT | ✓ |
| `priority` | `name` | VARCHAR | ✓ |

**Values**:
- 1: Low
- 2: Medium
- 3: High

---

### 11. AUDIT_LOGS Table (Complex)

| Old Field | New Field | Type | Issues |
|-----------|-----------|------|--------|
| `id` | `id` | INT | ✓ |
| `user_id` | `user_id` | INT | ✓ FK nullable |
| `action` | `action` | VARCHAR | ✓ ENUM(create,update,delete,login,...) |
| `model` | `model` | VARCHAR | ✓ Model name (e.g., 'User', 'Asset') |
| `model_type` | `model_type` | VARCHAR | ✓ Full class (e.g., 'App\\User') |
| `model_id` | `model_id` | INT | ✓ Resource ID |
| `old_values` | `old_values` | JSON | ✓ Before snapshot |
| `new_values` | `new_values` | JSON | ✓ After snapshot |
| `ip_address` | `ip_address` | VARCHAR | ✓ |
| `user_agent` | `user_agent` | VARCHAR | ✓ Browser info |
| `description` | `description` | TEXT | ✓ Summary |
| `event_type` | `event_type` | VARCHAR | ✓ ENUM(auth,model,system) |
| `created_at` | `created_at` | TIMESTAMP | ✓ |
| `updated_at` | `updated_at` | TIMESTAMP | ✓ |

**Sample Data**:
- 821 audit log entries (200+ logins, 600+ CRUD operations, system events)
- Events: login, logout, failed_login, create, update, delete

---

## Enum/Lookup Tables Reference

### ASSET STATUSES
- 1: Active
- 2: In Repair
- 3: Retired
- 4: Lost
- etc.

### TICKET ASSIGNMENT TYPES
- `auto`: Automatically assigned by system
- `manual`: Manually assigned by admin

### AUDIT EVENT TYPES
- `auth`: Login/logout/failed attempts
- `model`: CRUD on models
- `system`: System actions (routes, bulk ops)

---

## Migration Challenges & Solutions

### Challenge 1: Field Renaming
**Problem**: `type_name`, `abbreviation`, `spare` fields have different names

**Solution**:
```sql
-- Map during INSERT
INSERT INTO new_asset_types (name, code, is_spare)
SELECT type_name, abbreviation, spare
FROM old_asset_types;
```

### Challenge 2: Boolean vs Integer
**Problem**: Old system uses `TINYINT(1)` (0/1), new may expect BOOLEAN

**Solution** (application-level):
- Database stores 0/1 (compatible)
- Cast to BOOLEAN in Laravel models with cast attributes
```php
protected $casts = [
    'is_spare' => 'boolean',
    'is_active' => 'boolean',
];
```

### Challenge 3: Soft Deletes
**Problem**: Old system has physical deletes, new uses `deleted_at`

**Solution**:
- Add `deleted_at` column in new system
- Migrate active records with `deleted_at = NULL`
- Track deletions via audit_logs

### Challenge 4: Foreign Key Constraints
**Problem**: Different cascade/nullify strategies

**Solution**:
```sql
-- Example: assets.assigned_to → users.id
-- Use SET NULL if user deleted (allow unassigned assets)
ALTER TABLE assets 
ADD CONSTRAINT fk_assets_assigned_to 
FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
```

### Challenge 5: Data Integrity
**Problem**: Orphaned records (e.g., assets with non-existent division_id)

**Solution**:
```sql
-- Find orphans before migration
SELECT a.id, a.division_id
FROM old_assets a
LEFT JOIN old_divisions d ON a.division_id = d.id
WHERE a.division_id IS NOT NULL AND d.id IS NULL;

-- Assign to default division or quarantine
UPDATE old_assets 
SET division_id = 1 
WHERE division_id NOT IN (SELECT id FROM old_divisions);
```

---

## Service-Specific Schema Notes

### TICKET-SERVICE
- Primary table: `tickets` (with statuses, types, priorities)
- Related: `ticket_comments`, `ticket_history`, `ticket_assets`
- Audit: All CRUD tracked in `audit_logs`

### USER-SERVICE
- Primary table: `users`
- Related: `roles`, `permissions`, `model_has_roles`
- Audit: User creation/updates logged

### ASSET-SERVICE
- Primary tables: `assets`, `asset_models`, `asset_types`
- Related: `asset_maintenance_logs`, `asset_requests`, `movements`
- Audit: Asset CRUD + maintenance tracked

### MEETING-ROOM-SERVICE
- Primary tables: `meeting_room_bookings`
- Audit: Booking creation, updates, cancellations

---

## Data Validation Checklist

- [ ] All user IDs are unique and > 0
- [ ] All division_id references exist
- [ ] All location_id references exist (if used)
- [ ] No circular foreign keys
- [ ] Ticket codes are unique
- [ ] Asset tags are unique
- [ ] Serial numbers are unique (where applicable)
- [ ] Timestamps are logical (created_at ≤ updated_at)
- [ ] No future dates in audit_logs
- [ ] Sensitive data (passwords, tokens) encrypted

---

## Next Steps

1. **Phase 1**: Extract complete schema from remaining tables
2. **Phase 2**: Build data seeders for each service
3. **Phase 3**: Run migration in test environment
4. **Phase 4**: Validate data integrity with SQL queries
5. **Phase 5**: Sync RBAC roles/permissions

---

## Related Files

- [SCHEMA_EXTRACT.sql](./SCHEMA_EXTRACT.sql) - Full DDL statements
- [MIGRATION_SEEDERS.md](./MIGRATION_SEEDERS.md) - Seeder templates (TBD)
- [AUDIT_LOGS_ANALYSIS.md](./AUDIT_LOGS_ANALYSIS.md) - Audit trail documentation (TBD)
