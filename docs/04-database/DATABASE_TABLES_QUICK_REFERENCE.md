# 📊 DATABASE TABLES - QUICK REFERENCE
## IMSQuty System - Complete Overview

**Last Updated**: January 7, 2026  
**Total Tables**: 151 (94 Implemented + 57 Planned)

---

## 🎯 QUICK STATS

```
✅ IMPLEMENTED:    94 tables (62%)
🆕 NEW (2026):     16 tables (Session 8-9)
⏳ PLANNED:        57 tables (38%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TOTAL SYSTEM:  151 tables
```

---

## 📋 TABLE SUMMARY BY MODULE

| # | Module | Existing | New | Planned | Total | Status |
|---|--------|----------|-----|---------|-------|--------|
| 1 | **Authentication & RBAC** | 11 | 5 | 0 | 16 | ✅ 100% |
| 2 | **Organization (Dept/Team)** | 2 | 2 | 0 | 4 | ✅ 100% |
| 3 | **Asset Management** | 13 | 0 | 0 | 13 | ✅ 100% |
| 4 | **Ticket/Damage System** | 11 | 0 | 0 | 11 | ✅ 100% |
| 5 | **Meeting Room Booking** | 1 | 10 | 0 | 11 | ✅ 100% |
| 6 | **Financial Management** | 3 | 1 | 0 | 4 | ✅ 100% |
| 7 | **Audit & Activity Logs** | 4 | 1 | 0 | 5 | ✅ 100% |
| 8 | **Notification System** | 3 | 0 | 0 | 3 | ✅ 100% |
| 9 | **UI Menu System** | 3 | 0 | 0 | 3 | ✅ 100% |
| 10 | **Import/Export** | 7 | 0 | 0 | 7 | ✅ 100% |
| 11 | **Knowledge Base** | 2 | 0 | 0 | 2 | ✅ 100% |
| 12 | **System Tables** | 5 | 0 | 0 | 5 | ✅ 100% |
| | **SUBTOTAL (IMPLEMENTED)** | **65** | **19** | **0** | **84** | **56%** |
| 13 | **HR Module** | 0 | 0 | 12 | 12 | ⏳ 0% |
| 14 | **Inventory Management** | 0 | 0 | 8 | 8 | ⏳ 0% |
| 15 | **Reporting & Analytics** | 0 | 0 | 6 | 6 | ⏳ 0% |
| 16 | **Project Management** | 0 | 0 | 10 | 10 | ⏳ 0% |
| 17 | **Procurement** | 0 | 0 | 8 | 8 | ⏳ 0% |
| 18 | **Customer/Vendor Portal** | 0 | 0 | 6 | 6 | ⏳ 0% |
| 19 | **Training Module** | 0 | 0 | 6 | 6 | ⏳ 0% |
| | **SUBTOTAL (PLANNED)** | **0** | **0** | **56** | **56** | **0%** |
| | **━━━━━━━━━━━━━━━━━━━** | **━━━** | **━━━** | **━━━** | **━━━** | **━━━** |
| | **GRAND TOTAL** | **65** | **19** | **56** | **140** | **60%** |

---

## 🔥 DETAILED BREAKDOWN

### ✅ **1. AUTHENTICATION & RBAC** (16 tables - 100% Complete)

**Legacy Tables (11):**
```
users, roles, permissions, role_has_permissions, 
model_has_roles, model_has_permissions, role_user,
permission_role, password_resets, personal_access_tokens, sessions
```

**New Tables (5):**
```
departments, teams, login_history, user_sessions, password_policies
```

**Features:**
- JWT authentication
- Role-Based Access Control (RBAC)
- 6 role levels (superadmin → user)
- 78+ granular permissions
- Department/team hierarchy
- Login tracking & session management

---

### 💼 **2. ASSET MANAGEMENT** (13 tables - 100% Complete)

**Core Tables:**
```sql
assets                          -- 200+ assets
├── asset_types                 -- 22 types (PC, Monitor, Printer, etc.)
├── asset_models                -- 31 models
├── manufacturers               -- 29 manufacturers
├── suppliers                   -- Vendor management
├── statuses                    -- 8 statuses
├── warranty_types              -- 2 types
└── Related:
    ├── asset_maintenance_logs  -- Service history
    ├── asset_lifecycle_events  -- Event tracking
    ├── asset_requests          -- Requisition workflow
    ├── movements               -- Location transfers
    ├── invoices                -- Purchase records
    └── purchase_orders         -- PO tracking
```

**Asset Statuses:**
1. Ready to Deploy
2. Deployed (Assigned)
3. Out for Repairs
4. Waiting for Repairs
5. In Repairs
6. Written Off - Broken
7. Written Off - Age
8. Active

**Key Features:**
- QR code tracking (AST-XXXXXXXXXXXXX)
- Asset tag (QC.DD.MM.YYY.XX)
- IP/MAC address tracking
- Warranty management
- Lifecycle tracking
- Maintenance logs
- Location transfers

---

### 🎫 **3. TICKET/DAMAGE SYSTEM** (11 tables - 100% Complete)

**Core Tables:**
```sql
tickets                         -- Main ticket records (19+)
├── tickets_statuses            -- 3 statuses (Open, Pending, Resolved)
├── tickets_types               -- 3 types (Incident, Problem, Loan)
├── tickets_priorities          -- 3 priorities (Low, Medium, High)
├── ticket_comments             -- Comments/updates
├── ticket_history              -- Complete audit trail (38+ records)
├── ticket_assets               -- Asset linkage
├── tickets_canned_fields       -- Template responses
├── tickets_entries             -- Staff notes
├── sla_policies                -- SLA rules (4+ policies)
└── resolution_choices          -- Resolution templates
```

**Priorities:**
- **Low**: Response 24h
- **Medium**: Response 8h
- **High**: Response 2h
- **Critical**: Response 30min (planned)

**Workflow:**
```
Open → Assigned → In Progress → Resolved → Closed
```

---

### 🏢 **4. MEETING ROOM BOOKING** (11 tables - 100% Complete)

**Legacy:**
```
meeting_room_bookings           -- 173 bookings
```

**New Enhanced System (10 tables):**
```sql
room_bookings                   -- Enhanced booking system
├── room_amenities              -- Facilities (projector, whiteboard)
├── room_amenity_mapping        -- Room-amenity link
├── room_equipment              -- Equipment inventory
├── room_equipment_mapping      -- Room-equipment link
├── room_availability           -- Availability schedule
├── room_blackout_dates         -- Maintenance dates
├── room_recurring_bookings     -- Recurring patterns
├── room_booking_participants   -- Attendee list
└── room_booking_feedback       -- Reviews & ratings
```

**Booking Statuses:**
- Pending (Awaiting approval)
- Approved (Confirmed)
- Rejected (Declined)
- Cancelled (User cancelled)

**Features:**
- Multi-room support
- Recurring bookings (daily/weekly/monthly)
- Equipment tracking
- Amenity management
- Participant management
- Feedback system
- Blackout date management

---

### 💰 **5. FINANCIAL MANAGEMENT** (4 tables - 100% Complete)

```sql
budgets                         -- Department budgets
invoices                        -- Purchase invoices
expenses                        -- Expense tracking (NEW)
purchase_orders                 -- PO management
```

**Features:**
- Department budget allocation
- Monthly/yearly tracking
- Invoice management
- Expense approval workflow
- Purchase order tracking

---

### 📋 **6. AUDIT & ACTIVITY LOGS** (5 tables - 100% Complete)

```sql
activity_logs                   -- Activity audit trail
audit_logs                      -- Complete audit history
daily_activities                -- User daily tasks
admin_online_status             -- Admin availability
login_history                   -- Login tracking (NEW)
```

**Logged Activities:**
- User login/logout
- Asset CRUD operations
- Ticket status changes
- Approval workflows
- Data exports
- System config changes
- Permission changes

---

### 🔔 **7. NOTIFICATION SYSTEM** (3 tables - 100% Complete)

```sql
notifications                   -- User notifications
notification_settings           -- User preferences
push_subscriptions              -- Push tokens
```

**Notification Types:**
- Ticket assigned
- Asset approval pending
- Meeting room approved/rejected
- SLA breach warning
- Maintenance reminder
- System announcements

---

### 📦 **8. IMPORT/EXPORT** (7 tables - 100% Complete)

```sql
exports, export_logs
imports, import_logs, import_conflicts
bulk_operations, bulk_operation_logs
```

**Features:**
- Excel/CSV import
- Data validation
- Conflict resolution
- Bulk operations
- Export history

---

## ⏳ PLANNED MODULES (57 tables)

### **🔥 HIGH PRIORITY - Q1 2026**

#### **HR Module** (12 tables)
```
employees, employee_contracts, leave_requests, leave_types,
leave_balances, attendance, time_logs, payroll, payroll_items,
recruitment_jobs, recruitment_candidates, performance_reviews
```

**Features:**
- Complete HRIS system
- Leave management workflow
- Attendance tracking
- Payroll integration
- Recruitment pipeline
- Performance management

---

#### **Inventory Module** (8 tables)
```
inventory_items, inventory_categories, inventory_warehouses,
inventory_transactions, stock_adjustments, reorder_rules,
vendors, vendor_contracts
```

**Features:**
- Stock tracking
- Multi-warehouse support
- Automatic reordering
- Vendor management
- Stock adjustment workflows

---

### **📊 MEDIUM PRIORITY - Q2 2026**

#### **Reporting Module** (6 tables)
```
reports, report_schedules, report_subscriptions,
report_exports, dashboards, dashboard_widgets
```

**Features:**
- Custom report builder
- Scheduled reports
- Email distribution
- Dashboard builder
- KPI tracking

---

#### **Project Management** (10 tables)
```
projects, project_tasks, project_milestones, project_members,
project_documents, project_time_logs, project_budgets,
project_expenses, project_risks, project_change_requests
```

**Features:**
- Gantt charts
- Task dependencies
- Time tracking
- Budget management
- Risk tracking

---

### **📄 LOW PRIORITY - Q3 2026**

#### **Procurement** (8 tables)
```
procurement_requests, procurement_approvals, procurement_quotations,
procurement_contracts, procurement_deliveries, procurement_evaluations,
procurement_categories, procurement_templates
```

#### **Customer/Vendor Portal** (6 tables)
```
customers, customer_contacts, customer_contracts,
customer_tickets, vendor_portal_users, vendor_submissions
```

#### **Training Module** (6 tables)
```
training_courses, training_sessions, training_enrollments,
training_certificates, training_materials, training_evaluations
```

---

## 🎯 IMPLEMENTATION TIMELINE

```
CURRENT (Jan 2026):
✅ Phase 1: Core Enhancement Complete
   - Authentication (16 tables)
   - Asset Management (13 tables)
   - Ticketing (11 tables)
   - Meeting Rooms (11 tables)

Q1 2026 (Feb-Mar):
⏳ Phase 2: HR Module (12 tables)
   - Employee management
   - Leave/attendance
   - Basic payroll

Q2 2026 (Apr-Jun):
⏳ Phase 3: Inventory & Reporting (14 tables)
   - Stock management
   - Report builder
   - Dashboards

Q3 2026 (Jul-Sep):
⏳ Phase 4: Advanced Features (31 tables)
   - Project management
   - Procurement
   - Training module
```

---

## 📊 VISUAL PROGRESS

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTED: ████████████████████████░░░░░░░░░░░░░░ 62%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Core Modules:         ████████████████████ 100%
HR Module:            ░░░░░░░░░░░░░░░░░░░░   0%
Inventory:            ░░░░░░░░░░░░░░░░░░░░   0%
Reporting:            ░░░░░░░░░░░░░░░░░░░░   0%
Advanced Features:    ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 🎉 KEY ACHIEVEMENTS (2026)

**Session 8-9 (January 2026):**
- ✅ Created 16 new tables
- ✅ Enhanced RBAC with departments/teams
- ✅ Complete meeting room booking system
- ✅ Login history tracking
- ✅ Password policies
- ✅ Financial expense tracking

**Production Ready:**
- 94 tables fully implemented
- 200+ assets tracked
- 173+ room bookings
- 19+ tickets processed
- 131 users active

---

## 📝 NAMING CONVENTIONS

**Tables:**
- Snake case: `asset_maintenance_logs`
- Plural: `users`, `tickets`, `assets`
- Pivot: `model1_model2` (e.g., `role_user`)
- Mapping: `*_mapping` (e.g., `room_amenity_mapping`)

**Fields:**
- Foreign keys: `*_id` suffix
- Timestamps: `created_at`, `updated_at`, `deleted_at`
- Status: `is_active`, `is_available`
- Flags: `is_*` prefix for booleans

---

**Document Status**: ✅ Production Ready  
**Maintained By**: Database Architecture Team  
**Updated**: Weekly
