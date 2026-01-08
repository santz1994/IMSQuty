# 📊 DATABASE TABLES INVENTORY
## IMSQuty Complete Database Schema

**Last Updated**: January 7, 2026  
**Status**: Production Ready  
**Total Tables**: 85+

---

## 📑 TABLE OF CONTENTS

1. [✅ EXISTING TABLES (Legacy - itquty.sql)](#existing-tables)
2. [🆕 NEW TABLES (Microservices - Recently Created)](#new-tables)
3. [⏳ PLANNED TABLES (To Be Created)](#planned-tables)
4. [📈 STATISTICS](#statistics)

---

## ✅ EXISTING TABLES (63 Tables)

### 🔐 **1. AUTHENTICATION & AUTHORIZATION (11 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 1 | `users` | User accounts | 131 | ✅ Active |
| 2 | `roles` | Role definitions | 6 | ✅ Active |
| 3 | `permissions` | Permission definitions | 99 | ✅ Active |
| 4 | `role_has_permissions` | Role-permission mapping | Multiple | ✅ Active |
| 5 | `model_has_roles` | Model-role association | Multiple | ✅ Active |
| 6 | `model_has_permissions` | Model-permission mapping | Multiple | ✅ Active |
| 7 | `role_user` | User-role mapping | Multiple | ✅ Active |
| 8 | `permission_role` | Permission-role mapping | Multiple | ✅ Active |
| 9 | `password_resets` | Password reset tokens | - | ✅ Active |
| 10 | `personal_access_tokens` | API tokens | - | ✅ Active |
| 11 | `sessions` | Active user sessions | - | ✅ Active |

**Key Features:**
- RBAC (Role-Based Access Control)
- Spatie Laravel Permission package
- JWT authentication support
- Session management

---

### 🏢 **2. ORGANIZATIONAL STRUCTURE (4 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 12 | `divisions` | Organizational divisions | 73 | ✅ Active |
| 13 | `locations` | Physical locations | 15 | ✅ Active |
| 14 | `departments` | Department structure | 10 | 🆕 New (2026) |
| 15 | `teams` | Team management | 12 | 🆕 New (2026) |

**Divisions Examples:**
- IT Development (27)
- Human Resources (39)
- Finance & Accounting (3)
- Operations (37)
- Marketing (26)
- 73+ more departments

**Locations:**
- Building A Floor 1-5
- Building B Floor 1-3
- Data Center
- Meeting Rooms
- Storage Facilities

---

### 💼 **3. ASSET MANAGEMENT (13 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 16 | `assets` | Asset inventory | 200+ | ✅ Active |
| 17 | `asset_types` | Asset classification | 22 | ✅ Active |
| 18 | `asset_models` | Equipment models | 31 | ✅ Active |
| 19 | `asset_maintenance_logs` | Service/repair history | Multiple | ✅ Active |
| 20 | `asset_lifecycle_events` | Event tracking | Multiple | ✅ Active |
| 21 | `asset_requests` | Asset requisition | Multiple | ✅ Active |
| 22 | `movements` | Location transfers | Multiple | ✅ Active |
| 23 | `manufacturers` | Equipment manufacturers | 29 | ✅ Active |
| 24 | `suppliers` | Vendor suppliers | Multiple | ✅ Active |
| 25 | `statuses` | Asset status codes | 8 | ✅ Active |
| 26 | `warranty_types` | Warranty options | 2 | ✅ Active |
| 27 | `invoices` | Purchase invoices | Multiple | ✅ Active |
| 28 | `purchase_orders` | PO tracking | Multiple | ✅ Active |

**Asset Types (22):**
- PC/Computer
- Laptop
- Monitor
- Printer
- Network Equipment
- Server
- Mobile Device
- Peripheral
- UPS
- Network Switch
- Router
- Access Point
- CCTV Camera
- Projector
- Scanner
- External HDD
- Keyboard
- Mouse
- Headset
- Webcam
- Docking Station
- And more...

**Asset Statuses (8):**
1. Ready to Deploy
2. Deployed (Assigned)
3. Out for Repairs
4. Waiting for Repairs
5. In Repairs
6. Written Off - Broken
7. Written Off - Age
8. Active

**Asset Fields:**
- asset_tag (QC.DD.MM.YYY.XX)
- qr_code (AST-XXXXXXXXXXXXX)
- serial_number
- ip_address, mac_address
- purchase_date, warranty_months
- assigned_to (user_id)
- location_id, division_id

---

### 🎫 **4. TICKET/DAMAGE REPORTING (11 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 29 | `tickets` | Main ticket records | 19+ | ✅ Active |
| 30 | `tickets_statuses` | Status options | 3 | ✅ Active |
| 31 | `tickets_types` | Ticket types | 3 | ✅ Active |
| 32 | `tickets_priorities` | Priority levels | 3 | ✅ Active |
| 33 | `ticket_comments` | Comments/updates | Multiple | ✅ Active |
| 34 | `ticket_history` | Audit trail | 38+ | ✅ Active |
| 35 | `ticket_assets` | Asset linkage | Multiple | ✅ Active |
| 36 | `tickets_canned_fields` | Template responses | - | ✅ Active |
| 37 | `tickets_entries` | Staff notes | Multiple | ✅ Active |
| 38 | `sla_policies` | Service Level Agreements | 4+ | ✅ Active |
| 39 | `resolution_choices` | Resolution templates | Multiple | ✅ Active |

**Ticket Priorities (3):**
1. Low (Response: 24h)
2. Medium (Response: 8h)
3. High (Response: 2h)
4. Critical (Response: 30min) - New

**Ticket Statuses (3):**
1. Open
2. Pending
3. Resolved
4. Closed (New)
5. Cancelled (New)

**Ticket Types (3):**
1. Incident (Equipment failure)
2. Problem (Recurring issue)
3. Loan (Equipment borrow request)
4. Service Request (New)
5. Change Request (New)

**Ticket Fields:**
- ticket_number (unique)
- title, description
- status_id, type_id, priority_id
- reported_by (user_id)
- assigned_to (user_id)
- asset_id (optional)
- location_id
- created_at, updated_at, resolved_at
- sla_due_date

---

### 🏢 **5. MEETING ROOM BOOKING (8 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 40 | `meeting_room_bookings` | Booking records | 173 | ✅ Active |
| 41 | `room_bookings` | Enhanced bookings | Multiple | 🆕 New |
| 42 | `room_amenities` | Room facilities | Multiple | 🆕 New |
| 43 | `room_amenity_mapping` | Room-amenity link | Multiple | 🆕 New |
| 44 | `room_equipment` | Equipment inventory | Multiple | 🆕 New |
| 45 | `room_equipment_mapping` | Room-equipment link | Multiple | 🆕 New |
| 46 | `room_availability` | Availability schedule | Multiple | 🆕 New |
| 47 | `room_blackout_dates` | Maintenance dates | Multiple | 🆕 New |
| 48 | `room_recurring_bookings` | Recurring meetings | Multiple | 🆕 New |
| 49 | `room_booking_participants` | Meeting attendees | Multiple | 🆕 New |
| 50 | `room_booking_feedback` | Booking reviews | Multiple | 🆕 New |

**Booking Statuses (4):**
1. Pending (Awaiting approval)
2. Approved (Confirmed)
3. Rejected (Declined)
4. Cancelled (User cancelled)

**Room Features:**
- room_name, capacity
- start_datetime, end_datetime
- user_id (requester)
- approved_by (manager)
- status, notes
- recurring_pattern (daily/weekly/monthly)
- amenities (projector, whiteboard, video conf)
- equipment tracking

---

### 📋 **6. AUDIT & LOGGING (5 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 51 | `activity_logs` | Activity audit trail | Multiple | ✅ Active |
| 52 | `audit_logs` | Complete audit history | Multiple | ✅ Active |
| 53 | `daily_activities` | User daily tasks | Multiple | ✅ Active |
| 54 | `admin_online_status` | Admin availability | Multiple | ✅ Active |
| 55 | `login_history` | Login tracking | Multiple | 🆕 New |

**Logged Activities:**
- User login/logout
- Asset CRUD operations
- Ticket status changes
- Approval workflows
- Data exports
- System configuration changes
- Permission changes

---

### 💰 **7. FINANCIAL MANAGEMENT (4 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 56 | `budgets` | Budget allocation | Multiple | ✅ Active |
| 57 | `invoices` | Invoice records | Multiple | ✅ Active |
| 58 | `expenses` | Expense tracking | Multiple | 🆕 New |
| 59 | `purchase_orders` | PO management | Multiple | ✅ Active |

**Features:**
- Department budgets
- Monthly/yearly tracking
- Invoice management
- Expense approval workflow
- Purchase order tracking

---

### 🔔 **8. NOTIFICATION SYSTEM (3 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 60 | `notifications` | User notifications | Multiple | ✅ Active |
| 61 | `notification_settings` | User preferences | Multiple | ✅ Active |
| 62 | `push_subscriptions` | Push notification tokens | Multiple | ✅ Active |

**Notification Types:**
- Ticket assigned
- Asset approval pending
- Meeting room approved/rejected
- SLA breach warning
- Maintenance reminder
- System announcements

---

### 🎨 **9. UI & MENU SYSTEM (3 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 63 | `menus` | Menu structure | Multiple | ✅ Active |
| 64 | `menu_role` | Role-based menus | Multiple | ✅ Active |
| 65 | `menu_user` | User menu customization | Multiple | ✅ Active |

**Features:**
- Hierarchical menu structure
- Role-based menu visibility
- User menu preferences
- Dynamic navigation

---

### 🛠️ **10. SYSTEM TABLES (5 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 66 | `migrations` | Database migrations | Multiple | ✅ Active |
| 67 | `jobs` | Queue jobs | Multiple | ✅ Active |
| 68 | `cache` | Cache storage | Multiple | ✅ Active |
| 69 | `cache_locks` | Cache locks | Multiple | ✅ Active |
| 70 | `media` | File attachments | Multiple | ✅ Active |

---

### 📦 **11. IMPORT/EXPORT SYSTEM (7 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 71 | `exports` | Export jobs | Multiple | ✅ Active |
| 72 | `export_logs` | Export history | Multiple | ✅ Active |
| 73 | `imports` | Import jobs | Multiple | ✅ Active |
| 74 | `import_logs` | Import history | Multiple | ✅ Active |
| 75 | `import_conflicts` | Conflict resolution | Multiple | ✅ Active |
| 76 | `bulk_operations` | Bulk updates | Multiple | ✅ Active |
| 77 | `bulk_operation_logs` | Bulk operation logs | Multiple | ✅ Active |

**Features:**
- Excel/CSV import
- Data validation
- Conflict resolution
- Bulk operations
- Export history

---

### 📚 **12. KNOWLEDGE BASE (2 Tables)**

| No | Table Name | Purpose | Records | Status |
|----|-----------|---------|---------|--------|
| 78 | `knowledge_base_articles` | Help articles | Multiple | ✅ Active |
| 79 | `pcspecs` | PC specifications | Multiple | ✅ Active |

---

## 🆕 NEW TABLES (Microservices - 2026)

### **Created in January 2026 - Session 8/9**

| No | Table Name | Service | Purpose | Status |
|----|-----------|---------|---------|--------|
| 80 | `departments` | Auth Service | Hierarchical dept structure | ✅ Complete |
| 81 | `teams` | Auth Service | Team management | ✅ Complete |
| 82 | `login_history` | Auth Service | Login tracking | ✅ Complete |
| 83 | `user_sessions` | Auth Service | Active sessions | ✅ Complete |
| 84 | `password_policies` | Auth Service | Password rules | ✅ Complete |
| 85 | `room_bookings` | Room Service | Enhanced bookings | ✅ Complete |
| 86 | `room_amenities` | Room Service | Room facilities | ✅ Complete |
| 87 | `room_amenity_mapping` | Room Service | Amenity links | ✅ Complete |
| 88 | `room_equipment` | Room Service | Equipment tracking | ✅ Complete |
| 89 | `room_equipment_mapping` | Room Service | Equipment links | ✅ Complete |
| 90 | `room_availability` | Room Service | Availability rules | ✅ Complete |
| 91 | `room_blackout_dates` | Room Service | Maintenance dates | ✅ Complete |
| 92 | `room_recurring_bookings` | Room Service | Recurring patterns | ✅ Complete |
| 93 | `room_booking_participants` | Room Service | Attendee list | ✅ Complete |
| 94 | `room_booking_feedback` | Room Service | Reviews/ratings | ✅ Complete |
| 95 | `expenses` | Financial Service | Expense tracking | ✅ Complete |

---

## ⏳ PLANNED TABLES (To Be Created)

### **HIGH PRIORITY - Q1 2026**

#### **HR Module (12 Tables)**

| No | Table Name | Purpose | Priority |
|----|-----------|---------|----------|
| 96 | `employees` | Employee master data | 🔥 High |
| 97 | `employee_contracts` | Contract management | 🔥 High |
| 98 | `leave_requests` | Leave management | 🔥 High |
| 99 | `leave_types` | Leave categories | 🔥 High |
| 100 | `leave_balances` | Leave balance tracking | 🔥 High |
| 101 | `attendance` | Daily attendance | 🔥 High |
| 102 | `time_logs` | Clock in/out tracking | 🔥 High |
| 103 | `payroll` | Salary processing | 📊 Medium |
| 104 | `payroll_items` | Payroll components | 📊 Medium |
| 105 | `recruitment_jobs` | Job postings | 📊 Medium |
| 106 | `recruitment_candidates` | Candidate pipeline | 📊 Medium |
| 107 | `performance_reviews` | Performance tracking | 📊 Medium |

**Features:**
- Complete HRIS system
- Leave management workflow
- Attendance tracking
- Payroll integration
- Recruitment pipeline
- Performance management

---

#### **Inventory Module (8 Tables)**

| No | Table Name | Purpose | Priority |
|----|-----------|---------|----------|
| 108 | `inventory_items` | Stock items | 🔥 High |
| 109 | `inventory_categories` | Item categories | 🔥 High |
| 110 | `inventory_warehouses` | Warehouse locations | 🔥 High |
| 111 | `inventory_transactions` | Stock movements | 🔥 High |
| 112 | `stock_adjustments` | Stock corrections | 📊 Medium |
| 113 | `reorder_rules` | Auto-reorder rules | 📊 Medium |
| 114 | `vendors` | Vendor management | 📊 Medium |
| 115 | `vendor_contracts` | Vendor agreements | 📄 Low |

**Features:**
- Stock tracking
- Multi-warehouse support
- Automatic reordering
- Vendor management
- Stock adjustment workflows

---

#### **Reporting Module (6 Tables)**

| No | Table Name | Purpose | Priority |
|----|-----------|---------|----------|
| 116 | `reports` | Report definitions | 📊 Medium |
| 117 | `report_schedules` | Scheduled reports | 📊 Medium |
| 118 | `report_subscriptions` | User subscriptions | 📊 Medium |
| 119 | `report_exports` | Export history | 📄 Low |
| 120 | `dashboards` | Custom dashboards | 📄 Low |
| 121 | `dashboard_widgets` | Widget configurations | 📄 Low |

**Features:**
- Custom report builder
- Scheduled reports
- Email distribution
- Dashboard builder
- KPI tracking

---

#### **Project Management (10 Tables)**

| No | Table Name | Purpose | Priority |
|----|-----------|---------|----------|
| 122 | `projects` | Project tracking | 📊 Medium |
| 123 | `project_tasks` | Task management | 📊 Medium |
| 124 | `project_milestones` | Milestone tracking | 📊 Medium |
| 125 | `project_members` | Team assignments | 📊 Medium |
| 126 | `project_documents` | Document storage | 📄 Low |
| 127 | `project_time_logs` | Time tracking | 📄 Low |
| 128 | `project_budgets` | Budget tracking | 📄 Low |
| 129 | `project_expenses` | Expense tracking | 📄 Low |
| 130 | `project_risks` | Risk management | 📄 Low |
| 131 | `project_change_requests` | Change tracking | 📄 Low |

**Features:**
- Gantt charts
- Task dependencies
- Time tracking
- Budget management
- Document management
- Risk tracking

---

#### **Procurement Module (8 Tables)**

| No | Table Name | Purpose | Priority |
|----|-----------|---------|----------|
| 132 | `procurement_requests` | Purchase requests | 📊 Medium |
| 133 | `procurement_approvals` | Approval workflow | 📊 Medium |
| 134 | `procurement_quotations` | Vendor quotes | 📊 Medium |
| 135 | `procurement_contracts` | Contract management | 📄 Low |
| 136 | `procurement_deliveries` | Delivery tracking | 📄 Low |
| 137 | `procurement_evaluations` | Vendor evaluation | 📄 Low |
| 138 | `procurement_categories` | Item categories | 📄 Low |
| 139 | `procurement_templates` | Request templates | 📄 Low |

**Features:**
- Purchase request workflow
- Multi-level approvals
- Vendor quotation comparison
- Contract management
- Delivery tracking

---

#### **Customer/Vendor Portal (6 Tables)**

| No | Table Name | Purpose | Priority |
|----|-----------|---------|----------|
| 140 | `customers` | Customer database | 📄 Low |
| 141 | `customer_contacts` | Contact persons | 📄 Low |
| 142 | `customer_contracts` | Service contracts | 📄 Low |
| 143 | `customer_tickets` | Support tickets | 📄 Low |
| 144 | `vendor_portal_users` | Vendor accounts | 📄 Low |
| 145 | `vendor_submissions` | Vendor documents | 📄 Low |

---

#### **Training Module (6 Tables)**

| No | Table Name | Purpose | Priority |
|----|-----------|---------|----------|
| 146 | `training_courses` | Course catalog | 📄 Low |
| 147 | `training_sessions` | Training schedule | 📄 Low |
| 148 | `training_enrollments` | Student registrations | 📄 Low |
| 149 | `training_certificates` | Certification tracking | 📄 Low |
| 150 | `training_materials` | Course materials | 📄 Low |
| 151 | `training_evaluations` | Feedback forms | 📄 Low |

---

## 📈 STATISTICS

### Current Status (January 2026)

| Category | Tables | Status |
|----------|--------|--------|
| ✅ **Existing (Legacy)** | **78 tables** | Production |
| 🆕 **Recently Created** | **16 tables** | Complete |
| ⏳ **Planned (Q1 2026)** | **57 tables** | Pending |
| **TOTAL SYSTEM** | **151 tables** | 62% Complete |

---

### By Module

| Module | Existing | New | Planned | Total | % Complete |
|--------|----------|-----|---------|-------|------------|
| **Authentication** | 11 | 5 | 0 | 16 | 100% ✅ |
| **Organization** | 2 | 2 | 0 | 4 | 100% ✅ |
| **Asset Management** | 13 | 0 | 0 | 13 | 100% ✅ |
| **Ticketing** | 11 | 0 | 0 | 11 | 100% ✅ |
| **Meeting Rooms** | 1 | 10 | 0 | 11 | 100% ✅ |
| **Financial** | 3 | 1 | 0 | 4 | 100% ✅ |
| **Audit & Logs** | 4 | 1 | 0 | 5 | 100% ✅ |
| **Notifications** | 3 | 0 | 0 | 3 | 100% ✅ |
| **HR** | 0 | 0 | 12 | 12 | 0% ⏳ |
| **Inventory** | 0 | 0 | 8 | 8 | 0% ⏳ |
| **Reporting** | 0 | 0 | 6 | 6 | 0% ⏳ |
| **Projects** | 0 | 0 | 10 | 10 | 0% ⏳ |
| **Procurement** | 0 | 0 | 8 | 8 | 0% ⏳ |
| **Customer Portal** | 0 | 0 | 6 | 6 | 0% ⏳ |
| **Training** | 0 | 0 | 6 | 6 | 0% ⏳ |
| **System** | 30 | 0 | 1 | 31 | 97% ✅ |

---

### Priority Breakdown

| Priority | Tables | Target Date |
|----------|--------|-------------|
| 🔥 **High** | 25 tables | Q1 2026 (Jan-Mar) |
| 📊 **Medium** | 20 tables | Q2 2026 (Apr-Jun) |
| 📄 **Low** | 12 tables | Q3 2026 (Jul-Sep) |

---

## 🎯 IMPLEMENTATION ROADMAP

### **Phase 1: Core Enhancement** (Current - Jan 2026) ✅
- ✅ Authentication enhancement (departments, teams)
- ✅ Meeting room enhancement (10 new tables)
- ✅ Login tracking
- ✅ Password policies

### **Phase 2: HR Module** (Feb-Mar 2026) ⏳
- Employee management (12 tables)
- Leave management workflow
- Attendance tracking
- Basic payroll

### **Phase 3: Inventory Module** (Mar-Apr 2026) ⏳
- Stock tracking (8 tables)
- Warehouse management
- Vendor management
- Auto-reorder rules

### **Phase 4: Reporting & Analytics** (Apr-May 2026) ⏳
- Report builder (6 tables)
- Custom dashboards
- Scheduled reports
- KPI tracking

### **Phase 5: Advanced Features** (Jun-Sep 2026) ⏳
- Project management (10 tables)
- Procurement (8 tables)
- Customer portal (6 tables)
- Training module (6 tables)

---

## 📝 NOTES

### Migration Strategy
1. **Preserve Legacy**: Keep `itquty.sql` tables intact
2. **Microservices**: Each service has its own database
3. **Shared Tables**: Use `shared/migrations` for common tables
4. **Data Migration**: Gradual migration from monolith to microservices

### Naming Conventions
- **Snake case**: `asset_maintenance_logs`
- **Plural**: `users`, `tickets`, `assets`
- **Pivot tables**: `model1_model2` (e.g., `role_user`)
- **Mapping tables**: `*_mapping` (e.g., `room_amenity_mapping`)

### Foreign Keys
- All use `*_id` suffix
- Cascade on delete where appropriate
- Soft deletes for audit trail

### Timestamps
- All tables have `created_at`, `updated_at`
- Critical tables have `deleted_at` (soft delete)
- Activity tables have `recorded_at`

---

**Document Prepared By**: Senior Database Architect  
**For**: IMSQuty Development Team  
**Status**: Living Document - Updated Weekly
