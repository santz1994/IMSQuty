# Database Migration Implementation Plan

**Status**: Ready for Execution
**Updated**: 2024-12-18  
**Target**: Complete database migration from `quty2` (monolith) → `imsquty` (10 microservices)

---

## 1. OVERVIEW

### Current State
- **Source**: `quty2` (Laravel monolith) - fully operational
- **Data**: 
  - 130+ users
  - 72 divisions
  - 334 assets
  - 19 tickets (sample period)
  - 821 audit log entries
- **Issues**: Field naming inconsistencies, schema differences

### Target State
- **10 Microservices** with shared MySQL database
- Each service has isolated schema concerns
- Real-time audit logging via RabbitMQ/Events
- GDPR compliance with soft-deletes

---

## 2. PHASE BREAKDOWN

### PHASE 1: Preparation (Days 1-2)
**Goals**: Map all tables, identify orphan data, validate foreign keys

#### Tasks:
1. ✅ Extract full schema from `itquty.sql`
2. ✅ Document field mapping (DATABASE_SCHEMA_MAPPING.md)
3. ❌ **TODO**: Run data validation queries
4. ❌ **TODO**: Create backup of old database

#### Validation Queries to Run:

```sql
-- 1. Check for orphan asset records
SELECT a.id, a.asset_tag, a.division_id
FROM assets a
LEFT JOIN divisions d ON a.division_id = d.id
WHERE a.division_id IS NOT NULL AND d.id IS NULL;

-- 2. Check for orphan ticket records
SELECT t.id, t.ticket_code, t.assigned_to
FROM tickets t
LEFT JOIN users u ON t.assigned_to = u.id
WHERE t.assigned_to IS NOT NULL AND u.id IS NULL;

-- 3. Validate timestamps
SELECT id, created_at, updated_at
FROM users
WHERE created_at > updated_at;

-- 4. Check for duplicate emails
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING count > 1;

-- 5. Validate audit log data integrity
SELECT id, event_type
FROM audit_logs
WHERE event_type NOT IN ('auth', 'model', 'system');
```

#### Deliverables:
- [ ] Validation report
- [ ] Cleaned data export
- [ ] Backup archive

---

### PHASE 2: Seeder Development (Days 3-5)
**Goals**: Build seeders for each microservice

#### Services & Seeders:

| Service | Primary Tables | Seeder File | Status |
|---------|---|---|---|
| **USER-SERVICE** | users, divisions, locations | `MigrateLegacyUsersSeeder.php` | ✅ Done |
| **TICKET-SERVICE** | tickets, statuses, types, priorities | `MigrateLegacyTicketsSeeder.php` | ❌ TODO |
| **ASSET-SERVICE** | assets, models, types, manufacturers | `MigrateLegacyAssetsSeeder.php` | ❌ TODO |
| **MASTER-DATA-SERVICE** | divisions, locations, manufacturers | `MigrateLegacyMasterDataSeeder.php` | ❌ TODO |
| **AUDIT-SERVICE** | audit_logs | `MigrateLegacyAuditLogsSeeder.php` | ❌ TODO |

#### Template Structure:
```php
class MigrateLegacy{Service}Seeder extends Seeder {
    public function run(): void {
        // 1. Fetch legacy data
        $legacyRecords = $this->fetchLegacyData();
        
        // 2. Validate data integrity
        $this->validateData($legacyRecords);
        
        // 3. Transform/map fields
        $transformed = $this->transformData($legacyRecords);
        
        // 4. Insert into new tables
        $this->insertData($transformed);
        
        // 5. Create audit trails
        $this->createAuditTrails();
        
        // 6. Report results
        $this->reportSummary();
    }
}
```

#### Deliverables:
- [ ] 5 seeder classes (one per service)
- [ ] Unit tests for each seeder
- [ ] Data transformation documentation

---

### PHASE 3: Testing (Days 6-8)
**Goals**: Validate data integrity, test rollback

#### Test Environment Setup:
```bash
# 1. Create test database
mysql -u root -p < /path/to/imsquty_test.sql

# 2. Run seeders in test
cd imsquty
php artisan migrate:fresh --seed

# 3. Validate counts match
php artisan tinker
>>> User::count() // Should match old count
>>> Ticket::count()
>>> Asset::count()
```

#### Validation Tests:
```php
// tests/Feature/MigrationTest.php
public function test_users_migrated_correctly() {
    $this->artisan('migrate:fresh');
    $this->artisan('db:seed', ['--class' => 'MigrateLegacyUsersSeeder']);
    
    $this->assertEquals(130, User::count());
    $this->assertTrue(User::where('email', 'daniel@quty.co.id')->exists());
}

public function test_foreign_keys_valid() {
    $tickets = Ticket::all();
    foreach ($tickets as $ticket) {
        $this->assertNotNull($ticket->status);
        $this->assertNotNull($ticket->type);
    }
}

public function test_audit_logs_migrated() {
    $this->assertEquals(821, AuditLog::count());
}
```

#### Deliverables:
- [ ] 20+ integration tests
- [ ] Test report
- [ ] Performance benchmarks

---

### PHASE 4: Production Migration (Day 9)
**Goals**: Run migration on live database

#### Pre-Migration Checklist:
- [ ] Full database backup
- [ ] All services in maintenance mode
- [ ] Team on standby for rollback
- [ ] All tests passing
- [ ] Documentation updated

#### Migration Steps:

**Step 1: Maintenance Window (2 hours)**
```bash
# 1. Stop all services
docker-compose down

# 2. Backup current database
mysqldump -u root -p imsquty > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Take backup of old database too
mysqldump -u root -p quty2 > quty2_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Step 2: Run Migrations**
```bash
# 1. Start only database
docker-compose up -d mysql

# 2. Create new imsquty database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS imsquty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Import schema
mysql -u root -p imsquty < /path/to/schema.sql

# 4. Start services
docker-compose up -d
```

**Step 3: Run Seeders in Order**
```bash
cd imsquty

# Critical: Run in this order (dependency chain)
php artisan db:seed --class=MigrateLegacyDivisionsSeeder
php artisan db:seed --class=MigrateLegacyLocationsSeeder
php artisan db:seed --class=MigrateLegacyUsersSeeder
php artisan db:seed --class=MigrateLegacyMasterDataSeeder
php artisan db:seed --class=MigrateLegacyAssetsSeeder
php artisan db:seed --class=MigrateLegacyTicketsSeeder
php artisan db:seed --class=MigrateLegacyAuditLogsSeeder
```

**Step 4: Verify**
```bash
# Run validation queries
php artisan tinker
>>> User::count() // 130+
>>> Asset::count() // 334+
>>> Ticket::count() // 19+
>>> AuditLog::count() // 821+

# Check logs for errors
tail -f storage/logs/laravel.log
```

**Step 5: Rollback (if needed)**
```bash
# Option 1: Restore backup
mysql -u root -p imsquty < backup_[timestamp].sql

# Option 2: Run fresh migrations
php artisan migrate:fresh
```

#### Deliverables:
- [ ] Migration run book
- [ ] Migration log transcript
- [ ] Verification report

---

## 3. DATA TRANSFORMATION RULES

### Users
```
KEEP: id, email, name, password, division_id, is_active, created_at
TRANSFORM: notify_* (0/1 → boolean)
VALIDATE: All emails unique, division_id exists
```

### Assets
```
KEEP: id, asset_tag, serial_number, model_id, status_id
DROP: movement_id (deprecated)
ADD: location_id (from division mapping)
TRANSFORM: spare → is_spare
VALIDATE: asset_tag unique, serial_number unique
```

### Tickets
```
KEEP: id, ticket_code, subject, assigned_to, status_id
RENAME: user_id → reporter_id
VALIDATE: ticket_code unique, assigned_to exists
```

### Audit Logs
```
KEEP: All fields
NOTE: These are historical - read-only in new system
```

---

## 4. ERROR HANDLING

### Common Issues & Fixes

**Issue**: Foreign key constraint violation
```sql
-- Find orphans
SELECT * FROM old_assets WHERE division_id NOT IN (SELECT id FROM old_divisions);

-- Fix: Assign to default division
UPDATE old_assets SET division_id = 1 WHERE division_id IS NULL;
```

**Issue**: Duplicate email addresses
```sql
-- Find duplicates
SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1;

-- Fix: Delete duplicates, keep original
DELETE u2 FROM users u1 
JOIN users u2 ON u1.email = u2.email 
WHERE u1.id < u2.id;
```

**Issue**: Timestamp inconsistency
```sql
-- Find bad timestamps
SELECT * FROM users WHERE created_at > updated_at;

-- Fix: Set updated_at = created_at
UPDATE users SET updated_at = created_at WHERE created_at > updated_at;
```

---

## 5. ROLLBACK STRATEGY

### Immediate Rollback (< 15 min)
```bash
# 1. Stop all services
docker-compose down

# 2. Restore backup
mysql -u root -p imsquty < backup_YYYYMMDD_HHMMSS.sql

# 3. Start services
docker-compose up -d

# 4. Verify old monolith (quty2) is still running
mysql -u root -p quty2 -e "SELECT COUNT(*) as user_count FROM users;"
```

### Graceful Rollback (15 min - 1 hour)
- Keep both systems running in parallel
- Route traffic to old system
- Gradually migrate users/data
- Run validation before final cutover

---

## 6. SUCCESS CRITERIA

✅ **All checks must pass**:

| Check | Target | Status |
|-------|--------|--------|
| User count | 130+ | ❌ Pending |
| Asset count | 334+ | ❌ Pending |
| Ticket count | 19+ | ❌ Pending |
| Division count | 72 | ❌ Pending |
| Location count | All present | ❌ Pending |
| Foreign key integrity | 100% | ❌ Pending |
| No duplicate emails | 0 duplicates | ❌ Pending |
| Audit logs present | 821+ entries | ❌ Pending |
| All tests passing | 100% | ❌ Pending |
| Data consistency check | All OK | ❌ Pending |

---

## 7. TIMELINE

```
Week 1:
  Mon: Phase 1 (Prep & Validation)
  Tue: Phase 1 (Cleanup & Backup)
  Wed: Phase 2 (Seeder Development)
  Thu: Phase 2 (Seeder Development)
  Fri: Phase 3 (Testing)

Week 2:
  Mon: Phase 3 (Testing & Bug Fixes)
  Tue: Phase 3 (Performance Testing)
  Wed: Phase 4 (Production Migration) ⚠️ CRITICAL
  Thu: Post-migration Monitoring
  Fri: Decommission Old System
```

---

## 8. TEAM RESPONSIBILITIES

| Role | Tasks |
|------|-------|
| **Database Admin** | Backups, migrations, rollback |
| **Backend Dev** | Seeder development, testing |
| **DevOps** | Docker orchestration, monitoring |
| **QA** | Data validation, test cases |
| **Product** | Communication, cutover coordination |

---

## 9. COMMUNICATION PLAN

### Pre-Migration (Day 8)
- [ ] Notify all stakeholders
- [ ] Schedule maintenance window (2 hours)
- [ ] Prepare status page message

### During Migration (Day 9)
- [ ] Status updates every 15 minutes
- [ ] Slack/Teams notifications
- [ ] Live monitoring dashboard

### Post-Migration
- [ ] Success announcement
- [ ] Link to migration documentation
- [ ] Feedback collection

---

## 10. NEXT IMMEDIATE ACTIONS

### For Next Session:
1. ✅ Consolidate schema mapping (Done)
2. ✅ Create user seeder template (Done)
3. **TODO**: Build remaining 4 seeders
4. **TODO**: Write data validation queries
5. **TODO**: Create test suite
6. **TODO**: Schedule production migration date

### Files to Complete:
- [ ] `MigrateLegacyTicketsSeeder.php`
- [ ] `MigrateLegacyAssetsSeeder.php`
- [ ] `MigrateLegacyMasterDataSeeder.php`
- [ ] `MigrateLegacyAuditLogsSeeder.php`
- [ ] `tests/Feature/DatabaseMigrationTest.php`
- [ ] `MIGRATION_VALIDATION_QUERIES.sql`

---

## Documentation Links

- 📋 [DATABASE_SCHEMA_MAPPING.md](./DATABASE_SCHEMA_MAPPING.md)
- 🔧 [MigrateLegacyUsersSeeder.php](../database/seeders/MigrateLegacyUsersSeeder.php)
- 📊 [SESSION_33_PROGRESS.md](./SESSION_33_PROGRESS.md)

---

**Questions?** Check the [imsquty documentation index](./INDEX.md) or review SESSION notes.
