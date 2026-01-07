# 🗄️ PHASE 1: DATABASE SETUP & FOUNDATION

**Duration**: Week 1-2  
**Status**: 🔴 NOT STARTED  
**Priority**: 🔴 CRITICAL  
**Effort**: 40-60 hours

---

## 📋 OVERVIEW

This phase creates all database tables, migrations, relationships, indexes, and seeders needed for:
1. Asset Management System
2. Damage Reporting System
3. Meeting Room Booking System
4. Supporting infrastructure (audit, users, notifications)

**Output**: Production-ready database with realistic test data

---

## 📊 DATABASE SCHEMA

### GROUP 1: CORE INFRASTRUCTURE (Already Exists)

```sql
-- These tables already exist (no changes needed)
users
├── id, uuid, email, password
├── name, phone, department_id
├── role_id, status, created_at
└── avatar_url, last_login

roles
├── id, name (admin, user, manager, technician)
└── description

permissions
├── id, name, description
└── resource, action (e.g., asset:create, report:approve)

role_permission (pivot table)
├── role_id, permission_id
└── primary key: (role_id, permission_id)
```

### GROUP 2: ASSET MANAGEMENT TABLES (⚠️ NEEDS CREATION)

```sql
asset_categories
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique)
├── name (varchar 100 unique not null)
├── description (text nullable)
├── depreciation_rate (decimal 5,2 default 10.00)
├── parent_category_id (bigint unsigned nullable - for subcategories)
├── created_at, updated_at
└── soft_delete: deleted_at

asset_types
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique)
├── name (varchar 100 not null) -- e.g., "Laptop", "Projector", "Desk"
├── category_id (foreign key to asset_categories)
├── description (text)
└── created_at, updated_at

assets (MAIN TABLE)
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique not null)
├── asset_type_id (foreign key to asset_types)
├── category_id (foreign key to asset_categories)
├── name (varchar 255 not null)
├── description (text)
├── barcode (varchar 100 unique nullable)
├── qr_code (text nullable - base64 encoded QR image)
├── serial_number (varchar 100 unique nullable)
├── model (varchar 100 nullable)
├── manufacturer (varchar 100 nullable)
├── purchase_date (date not null)
├── purchase_price (decimal 12,2 not null)
├── depreciation_rate (decimal 5,2) -- can override category default
├── current_value (decimal 12,2 not null)
├── location (varchar 255 not null)
├── location_building (varchar 50 nullable)
├── location_floor (int nullable)
├── location_room (varchar 50 nullable)
├── responsible_user_id (foreign key to users nullable)
├── status (enum: active, maintenance, retired, lost, disposed)
├── warranty_expiry (date nullable)
├── last_maintenance_date (datetime nullable)
├── maintenance_schedule_months (int nullable) -- e.g., 6 for 6-monthly maintenance
├── notes (text)
├── created_by_user_id (foreign key to users)
├── created_at, updated_at, deleted_at
└── INDEXES: barcode, qr_code, location, status, responsible_user_id, asset_type_id

asset_movements
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique)
├── asset_id (foreign key to assets not null)
├── from_location (varchar 255 not null)
├── to_location (varchar 255 not null)
├── movement_reason (varchar 255)
├── moved_by_user_id (foreign key to users not null)
├── moved_at (datetime not null)
├── notes (text)
├── created_at
└── INDEX: asset_id, moved_at

asset_maintenance
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique)
├── asset_id (foreign key to assets not null)
├── maintenance_type (enum: preventive, corrective, inspection, calibration)
├── scheduled_date (date not null)
├── completed_date (date nullable)
├── completed_by_user_id (foreign key to users nullable)
├── maintenance_cost (decimal 10,2)
├── notes (text)
├── status (enum: scheduled, in_progress, completed, cancelled)
├── vendor_name (varchar 100 nullable)
├── attachment_path (varchar 255 nullable) -- for maintenance report
├── created_at, updated_at
└── INDEXES: asset_id, scheduled_date, status, completed_date

asset_warranty
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique)
├── asset_id (foreign key to assets not null)
├── warranty_type (enum: manufacturer, extended, service, support)
├── provider_name (varchar 100)
├── start_date (date not null)
├── end_date (date not null)
├── coverage_description (text)
├── coverage_percentage (decimal 5,2) -- e.g., 80% coverage
├── max_claim_amount (decimal 10,2 nullable)
├── claims_made (int default 0)
├── created_at, updated_at
└── INDEX: asset_id, end_date

asset_depreciation_log
├── id (bigint unsigned primary key auto_increment)
├── asset_id (foreign key to assets not null)
├── previous_value (decimal 12,2)
├── current_value (decimal 12,2)
├── depreciation_amount (decimal 12,2)
├── depreciation_method (enum: straight_line, declining_balance, sum_of_years)
├── calculated_at (datetime)
├── created_at
└── INDEX: asset_id, calculated_at
```

### GROUP 3: DAMAGE REPORTING TABLES (⚠️ NEEDS CREATION)

```sql
damage_reports (MAIN TABLE)
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique not null)
├── asset_id (foreign key to assets not null)
├── reported_by_user_id (foreign key to users not null)
├── report_title (varchar 255 not null)
├── description (text not null)
├── damage_type (enum: broken, malfunction, wear, damage, missing_part)
├── severity_level (enum: critical, high, medium, low)
├── priority (int 1-5, calculated from severity and urgency)
├── location (varchar 255)
├── status (enum: open, assigned, in_progress, pending_parts, resolved, closed)
├── assigned_to_user_id (foreign key to users nullable)
├── assigned_at (datetime nullable)
├── resolution_user_id (foreign key to users nullable)
├── resolution_notes (text nullable)
├── resolved_at (datetime nullable)
├── expected_resolution_time (datetime nullable)
├── actual_resolution_time (datetime nullable)
├── sla_status (enum: met, breached, warning nullable)
├── estimated_cost (decimal 10,2 nullable)
├── actual_cost (decimal 10,2 nullable)
├── created_at, updated_at, deleted_at
└── INDEXES: asset_id, status, priority, assigned_to_user_id, reported_by_user_id, created_at

damage_attachments
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique)
├── damage_report_id (foreign key to damage_reports not null)
├── file_path (varchar 255 not null) -- stored in MinIO
├── file_name (varchar 255)
├── file_type (enum: photo, document, video, audio)
├── file_size (bigint)
├── mime_type (varchar 100) -- e.g., image/jpeg
├── uploaded_by_user_id (foreign key to users)
├── uploaded_at (datetime)
├── created_at
└── INDEX: damage_report_id

damage_comments
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique)
├── damage_report_id (foreign key to damage_reports not null)
├── user_id (foreign key to users not null)
├── comment_text (text not null)
├── is_internal (boolean default false) -- internal note vs. comment
├── created_at, updated_at, deleted_at
└── INDEX: damage_report_id, created_at

damage_status_history
├── id (bigint unsigned primary key auto_increment)
├── damage_report_id (foreign key to damage_reports)
├── old_status (varchar 50)
├── new_status (varchar 50)
├── changed_by_user_id (foreign key to users)
├── change_reason (text)
├── changed_at (datetime)
└── INDEX: damage_report_id, changed_at
```

### GROUP 4: MEETING ROOM TABLES (⚠️ NEEDS CREATION)

```sql
meeting_rooms (MAIN TABLE)
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique not null)
├── name (varchar 100 not null)
├── description (text)
├── building_name (varchar 100)
├── floor_number (int)
├── room_number (varchar 50)
├── room_capacity (int not null) -- max persons
├── room_image_url (varchar 255 nullable) -- photo of room
├── floor_map_url (varchar 255 nullable) -- URL to building map
├── directions (text) -- how to find the room
├── status (enum: available, maintenance, retired, reserved)
├── has_projector (boolean)
├── has_whiteboard (boolean)
├── has_video_conference (boolean)
├── has_monitor_display (boolean)
├── has_microphone (boolean)
├── other_equipment (text) -- comma-separated or JSON
├── access_card_required (boolean)
├── access_card_number (varchar 50 nullable)
├── phone_extension (varchar 20 nullable)
├── calendar_id (varchar 255 nullable) -- for external calendar sync
├── created_at, updated_at, deleted_at
└── INDEXES: name, building_name, floor_number, status

room_equipment
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique)
├── name (varchar 100 not null) -- projector, whiteboard, camera, etc.
├── description (text)
├── quantity (int default 1)
└── created_at, updated_at

room_equipment_mapping (pivot table)
├── id (bigint unsigned primary key auto_increment)
├── room_id (foreign key to meeting_rooms)
├── equipment_id (foreign key to room_equipment)
└── notes (text)

room_availability
├── id (bigint unsigned primary key auto_increment)
├── room_id (foreign key to meeting_rooms)
├── day_of_week (int 0-6, Sunday-Saturday)
├── start_time (time, e.g., 08:00:00)
├── end_time (time, e.g., 18:00:00)
├── is_available (boolean default true)
├── created_at, updated_at
└── Unique index: (room_id, day_of_week)

room_blackout_dates
├── id (bigint unsigned primary key auto_increment)
├── room_id (foreign key to meeting_rooms)
├── blackout_reason (varchar 255)
├── start_date (date)
├── end_date (date)
├── notes (text)
├── created_at
└── INDEX: room_id, start_date, end_date

room_bookings (MAIN TABLE)
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique not null)
├── room_id (foreign key to meeting_rooms not null)
├── booked_by_user_id (foreign key to users not null)
├── booking_title (varchar 255 not null)
├── booking_description (text)
├── start_time (datetime not null)
├── end_time (datetime not null)
├── duration_minutes (int)
├── expected_attendees (int)
├── status (enum: pending, confirmed, checked_in, completed, cancelled)
├── cancellation_reason (text nullable)
├── cancelled_by_user_id (foreign key to users nullable)
├── cancelled_at (datetime nullable)
├── reminder_sent (boolean default false)
├── reminder_sent_at (datetime nullable)
├── check_in_time (datetime nullable)
├── check_in_user_id (foreign key to users nullable)
├── check_out_time (datetime nullable)
├── actual_attendees (int nullable)
├── booking_notes (text)
├── recurring_booking_id (foreign key to room_recurring_bookings nullable)
├── parent_booking_id (foreign key to room_bookings nullable) -- for recurring instances
├── created_at, updated_at, deleted_at
└── INDEXES: room_id, start_time, booked_by_user_id, status, start_time

room_recurring_bookings
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique)
├── room_id (foreign key to meeting_rooms)
├── booked_by_user_id (foreign key to users)
├── booking_title (varchar 255)
├── start_time (time, e.g., 10:00:00)
├── end_time (time, e.g., 11:00:00)
├── duration_minutes (int)
├── pattern_type (enum: daily, weekly, biweekly, monthly, custom)
├── frequency_interval (int, e.g., 1 for every 1 week, 2 for every 2 weeks)
├── days_of_week (json or varchar, e.g., [1,3,5] for Mon, Wed, Fri)
├── start_date (date)
├── end_date (date nullable) -- null means no end date
├── exclude_dates (json, array of dates to skip)
├── max_recurrences (int nullable) -- max number of bookings to generate
├── status (enum: active, paused, ended)
├── created_at, updated_at
└── INDEX: room_id, pattern_type

room_booking_feedback
├── id (bigint unsigned primary key auto_increment)
├── booking_id (foreign key to room_bookings not null)
├── user_id (foreign key to users not null)
├── rating (int 1-5)
├── cleanliness_rating (int 1-5 nullable)
├── equipment_rating (int 1-5 nullable)
├── comfort_rating (int 1-5 nullable)
├── comments (text)
├── issue_reported (text nullable)
├── submitted_at (datetime)
├── created_at
└── INDEX: booking_id
```

### GROUP 5: NOTIFICATION TABLES (⚠️ NEEDS CREATION)

```sql
notifications (MAIN TABLE)
├── id (bigint unsigned primary key auto_increment)
├── uuid (varchar 36 unique)
├── user_id (foreign key to users)
├── type (enum: damage_assigned, damage_resolved, asset_maintenance, booking_reminder, system_alert)
├── title (varchar 255)
├── message (text)
├── data (json, additional context)
├── read_at (datetime nullable)
├── action_url (varchar 255 nullable)
├── created_at
└── INDEX: user_id, created_at

notification_preferences
├── id (bigint unsigned primary key auto_increment)
├── user_id (foreign key to users unique)
├── email_notifications (boolean default true)
├── push_notifications (boolean default true)
├── in_app_notifications (boolean default true)
├── damage_report_alerts (boolean default true)
├── asset_maintenance_alerts (boolean default true)
├── booking_reminders (boolean default true)
├── quiet_hours_start (time nullable)
├── quiet_hours_end (time nullable)
├── created_at, updated_at
```

### GROUP 6: AUDIT & LOGGING TABLES (⚠️ NEEDS CREATION)

```sql
audit_logs
├── id (bigint unsigned primary key auto_increment)
├── user_id (foreign key to users nullable)
├── action (varchar 100) -- CREATE, UPDATE, DELETE, APPROVE, ASSIGN
├── entity_type (varchar 100) -- Asset, DamageReport, RoomBooking
├── entity_id (varchar 36)
├── entity_uuid (varchar 36)
├── old_values (json nullable)
├── new_values (json nullable)
├── ip_address (varchar 45)
├── user_agent (text)
├── created_at
└── INDEXES: user_id, action, entity_type, entity_id, created_at

activity_logs
├── id (bigint unsigned primary key auto_increment)
├── user_id (foreign key to users)
├── activity_type (varchar 100)
├── description (text)
├── metadata (json)
├── created_at
└── INDEX: user_id, created_at
```

---

## 🔧 MIGRATION FILES TO CREATE

Create these Laravel migration files:

```php
// database/migrations/2026_01_xx_000001_create_asset_tables.php
// database/migrations/2026_01_xx_000002_create_damage_report_tables.php
// database/migrations/2026_01_xx_000003_create_meeting_room_tables.php
// database/migrations/2026_01_xx_000004_create_notification_tables.php
// database/migrations/2026_01_xx_000005_create_audit_tables.php
```

**Each migration file should**:
1. Create all related tables
2. Add proper indexes
3. Add foreign key constraints
4. Add check constraints for enums
5. Add default values
6. Include down() method for rollback

---

## 📝 SEEDER FILES TO CREATE

Create realistic test data in seeders:

```php
// database/seeders/AssetCategorySeeder.php
// database/seeders/AssetTypeSeeder.php
// database/seeders/AssetSeeder.php (500+ assets)
// database/seeders/AssetMaintenanceSeeder.php
// database/seeders/DamageReportSeeder.php (100+ damage reports)
// database/seeders/MeetingRoomSeeder.php (20+ rooms)
// database/seeders/RoomBookingSeeder.php (500+ bookings)
// database/seeders/UserSeeder.php (updated with roles)
```

**Each seeder should create**:
- Realistic test data reflecting production scenarios
- Relationships between tables (foreign keys)
- Various statuses and edge cases
- Historical data (old dates, completed records)

---

## ✅ IMPLEMENTATION CHECKLIST

### Week 1: Schema Design & Migration Files

- [ ] Design all table schemas (detailed above)
- [ ] Create 5 migration files
- [ ] Define relationships (foreign keys)
- [ ] Add proper indexes
- [ ] Add constraints (unique, check, not null)
- [ ] Code review of migrations
- [ ] Test migrations: `php artisan migrate`
- [ ] Test rollback: `php artisan migrate:rollback`

**Deliverable**: Working migrations that create production-grade schema

### Week 1-2: Seeder Development

- [ ] Create AssetCategory seeder (10 categories)
- [ ] Create AssetType seeder (30 types)
- [ ] Create Asset seeder (500 realistic assets)
- [ ] Create AssetMaintenance seeder (scheduling)
- [ ] Create DamageReport seeder (100 reports, various statuses)
- [ ] Create MeetingRoom seeder (20 rooms)
- [ ] Create RoomBooking seeder (500 bookings)
- [ ] Create User seeder (50+ test users with different roles)
- [ ] Test seeders: `php artisan db:seed`
- [ ] Verify relationships: Query cross-table data
- [ ] Code review

**Deliverable**: Database populated with 1000+ realistic records

### Week 2: Validation & Documentation

- [ ] Run database integrity checks
- [ ] Verify all foreign key relationships
- [ ] Check index performance (explain queries)
- [ ] Create database schema diagram
- [ ] Document table purposes and relationships
- [ ] Create sample queries for each report type
- [ ] Write API specification for each table
- [ ] Performance baseline testing

**Deliverable**: Documented, validated, production-ready database

---

## 🚀 QUICK START COMMANDS

```bash
# Create migration files
php artisan make:migration create_asset_tables
php artisan make:migration create_damage_report_tables
php artisan make:migration create_meeting_room_tables
php artisan make:migration create_notification_tables
php artisan make:migration create_audit_tables

# Create seeders
php artisan make:seeder AssetCategorySeeder
php artisan make:seeder AssetTypeSeeder
php artisan make:seeder AssetSeeder
php artisan make:seeder DamageReportSeeder
php artisan make:seeder MeetingRoomSeeder
php artisan make:seeder RoomBookingSeeder

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Verify database
mysql -u imsquty_user -pimsqutypassword imsquty -e "SHOW TABLES;"
mysql -u imsquty_user -pimsqutypassword imsquty -e "SELECT COUNT(*) FROM assets;"
```

---

## 📊 DATABASE STATISTICS (Post-Seeding)

```
Expected data after seeding:
├── asset_categories: 10 records
├── asset_types: 30 records
├── assets: 500+ records
├── asset_movements: 200+ records
├── asset_maintenance: 150+ records
├── damage_reports: 100+ records
├── damage_comments: 300+ records
├── meeting_rooms: 20 records
├── room_bookings: 500+ records
├── users: 50+ test users
├── roles: 5 roles (admin, user, technician, manager, supervisor)
└── Total records: 2000+

Database size: ~50-100 MB (depending on attachment storage)
Backup size: ~10 MB (compressed)
```

---

## 🔍 VERIFICATION QUERIES

After seeding, run these queries to verify integrity:

```sql
-- Check total records
SELECT 'assets' as table_name, COUNT(*) as count FROM assets
UNION SELECT 'damage_reports', COUNT(*) FROM damage_reports
UNION SELECT 'room_bookings', COUNT(*) FROM room_bookings;

-- Check relationships
SELECT COUNT(*) FROM assets WHERE responsible_user_id IS NULL;
SELECT COUNT(*) FROM room_bookings WHERE room_id IS NULL;

-- Check date ranges
SELECT MIN(created_at), MAX(created_at) FROM damage_reports;
SELECT MIN(start_time), MAX(start_time) FROM room_bookings;

-- Check status distribution
SELECT status, COUNT(*) FROM damage_reports GROUP BY status;
SELECT status, COUNT(*) FROM assets GROUP BY status;
```

---

## ⏱️ TIME ESTIMATE

```
Task                              Hours   Person-Days
─────────────────────────────────────────────────────
Schema design & review               8        1.0
Migration files creation            12        1.5
Seeder development                  16        2.0
Testing & verification               8        1.0
Documentation                        4        0.5
─────────────────────────────────────────────────────
TOTAL                              48        6.0
```

**Timeline**: 1-2 weeks (depending on team size and complexity)

---

## 📚 DELIVERABLES

1. ✅ 5 well-structured Laravel migration files
2. ✅ 8 comprehensive seeder files
3. ✅ Database schema documentation (ER diagram)
4. ✅ Sample queries for each business scenario
5. ✅ Verification report (integrity, relationships, performance)
6. ✅ Backup of seeded database
7. ✅ API specification (for Phase 2-4)

---

**Status**: Ready to implement  
**Start Date**: Now  
**Phase**: 1 of 7  
**Next Phase**: Asset Service Implementation (Week 3-4)
