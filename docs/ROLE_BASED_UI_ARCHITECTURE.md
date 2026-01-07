# 🎯 ROLE-BASED UI/UX ARCHITECTURE

**Date**: January 8, 2026  
**Feature**: Multi-Level User Interface System  
**Priority**: **HIGH** - Critical for Production  
**Status**: Design Phase

---

## 📊 OVERVIEW

IMSQuty memiliki **6 level akses hierarki** dengan UI/UX yang berbeda sesuai peran dan tanggung jawab:

1. **Superadmin** - Full system control & IT infrastructure
2. **Direktur (Director)** - Strategic decisions & company policy
3. **Manager** - Team operations & project oversight
4. **Admin** - Module management & user support
5. **HR (Human Resources)** - Employee & access management
6. **User** - End user operations & daily tasks

---

## 🏗️ ARCHITECTURE DESIGN

### Complete Role Hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│  🔧 SUPERADMIN (IT Infrastructure)                          │
│  • Full system access & control                             │
│  • System configuration & deployment                        │
│  • Database management & backup                             │
│  • UAC/RBAC configuration                                   │
│  • Advanced monitoring & performance                        │
│  • Security & infrastructure                                │
│  • Code deployment & CI/CD                                  │
│  Level: STRATEGIC + TECHNICAL                               │
└─────────────────────────────────────────────────────────────┘
            ↓ reports to & coordinates with
┌─────────────────────────────────────────────────────────────┐
│  👔 DIREKTUR (Director/C-Level)                             │
│  • Company strategic decisions                              │
│  • Business policy & governance                             │
│  • Budget approval & financial oversight                    │
│  • Department performance review                            │
│  • High-level reports & KPI monitoring                      │
│  • Risk management & compliance                             │
│  Level: STRATEGIC (BUSINESS)                                │
└─────────────────────────────────────────────────────────────┘
            ↓ delegates to
┌─────────────────────────────────────────────────────────────┐
│  👨‍💼 MANAGER (Department/Team Lead)                          │
│  • Team operations & coordination                           │
│  • Project monitoring & task allocation                     │
│  • Performance review & reporting                           │
│  • Resource request & approval (level 1)                    │
│  • Department KPI tracking                                  │
│  • Staff mentoring & supervision                            │
│  Level: OPERATIONAL (LEADERSHIP)                            │
└─────────────────────────────────────────────────────────────┘
            ↓ supported by
┌──────────────────────┬──────────────────────────────────────┐
│  💼 ADMIN            │  👥 HR (Human Resources)             │
│  • Module management │  • Employee data management          │
│  • User support      │  • Access control by position        │
│  • Daily operations  │  • Recruitment & onboarding          │
│  • Content moderate  │  • Training & development            │
│  • Approval workflow │  • Leave & attendance management     │
│  • System monitoring │  • Employee relations & compliance   │
│  Level: OPERATIONAL  │  Level: OPERATIONAL (HR)             │
└──────────────────────┴──────────────────────────────────────┘
            ↓ serves
┌─────────────────────────────────────────────────────────────┐
│  👤 USER (Staff/Employee)                                   │
│  • Daily operational tasks                                  │
│  • Create tickets & requests                                │
│  • View assigned assets                                     │
│  • Book meeting rooms                                       │
│  • Submit reports & timesheets                              │
│  • View personal data & history                             │
│  Level: OPERATIONAL (END USER)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 DETAILED UI/UX BY ROLE

### 1. **SUPERADMIN DASHBOARD** 🔧

**Role Definition**: Pengguna dengan akses tertinggi dalam sistem IT. Memiliki otoritas penuh terhadap seluruh konfigurasi sistem, perangkat keras, perangkat lunak, dan manajemen pengguna.

**Primary Color Scheme**: Dark theme with tech accents
- Background: `#0a0e27` (Dark blue)
- Accent: `#00ff88` (Matrix green)
- Text: `#e0e0e0` (Light gray)
- Status: `#ff3366` (Critical red), `#ffaa00` (Warning orange)

**Key Responsibilities**:
- ✅ Mengelola semua akun pengguna termasuk admin dan user
- ✅ Mengatur hak akses seluruh sistem (server, jaringan, aplikasi)
- ✅ Melakukan perubahan konfigurasi besar dan kebijakan keamanan
- ✅ Memiliki kontrol penuh atas inventaris aset dan perangkat IT
- ✅ Menambah/menghapus user dan admin
- ✅ Menetapkan struktur hirarki akses
- ✅ Audit dan monitoring sistem keseluruhan
- ✅ Pengambilan keputusan strategis terkait IT dan aset

**Layout Components**:

#### A. System Performance Panel (Top Priority)
```typescript
<SystemPerformancePanel>
  {/* Real-time metrics */}
  - CPU Usage: 45% ██████░░░░
  - Memory: 8.2GB / 16GB ████████░░
  - Disk I/O: 125 MB/s ███░░░░░░░
  - Network: 45 Mbps ██████░░░░
  
  {/* Service Health */}
  - ✅ Auth Service: 200ms avg response
  - ✅ Asset Service: 180ms avg response
  - ✅ Ticket Service: 150ms avg response
  - ⚠️ Inventory Service: 500ms avg (warning)
  - ❌ Notification Service: DOWN (critical)
  
  {/* Database Status */}
  - MySQL: 234 connections, 12ms latency
  - Redis: 1.2GB used, 45K ops/sec
  - Queries: 1.2K/sec, 0.02% slow queries
</SystemPerformancePanel>
```

#### B. Advanced Monitoring Dashboard
```typescript
<AdvancedMonitoring>
  {/* Prometheus Metrics */}
  - API Request Rate
  - Error Rate by Service
  - P95/P99 Latency
  - Database Query Performance
  - Cache Hit Ratio
  
  {/* Grafana Integration */}
  - Embedded Grafana Dashboards
  - Custom Query Builder
  - Alert Management
  - Log Aggregation (ELK Stack)
</AdvancedMonitoring>
```

#### C. System Configuration Panel
```typescript
<SystemConfiguration>
  {/* Environment Management */}
  - Environment Variables Editor
  - Feature Flags Toggle
  - Service Configuration
  - API Rate Limiting
  - CORS Settings
  
  {/* Database Management */}
  - Run Migrations
  - Seed Database
  - Backup Database
  - Restore Database
  - Query Console
  
  {/* UAC/RBAC Configuration */}
  - Role Management
  - Permission Editor
  - Access Control Lists
  - Security Policies
  - Audit Logs Viewer
</SystemConfiguration>
```

#### D. Developer Tools
```typescript
<DeveloperTools>
  {/* API Testing */}
  - API Playground (Swagger UI)
  - Request Builder
  - Response Inspector
  - Performance Profiler
  
  {/* Deployment Tools */}
  - Docker Container Management
  - Kubernetes Pod Viewer
  - CI/CD Pipeline Status
  - Version Control Integration
  
  {/* Debug Console */}
  - Real-time Logs Viewer
  - Error Stack Traces
  - Network Inspector
  - Database Query Logger
</DeveloperTools>
```

#### E. Navigation Menu (Super-Admin)
```typescript
const superAdminMenu = [
  {
    section: "System",
    items: [
      { icon: "🖥️", label: "System Dashboard", path: "/super-admin/system" },
      { icon: "📊", label: "Performance Metrics", path: "/super-admin/metrics" },
      { icon: "🔍", label: "Monitoring", path: "/super-admin/monitoring" },
      { icon: "⚙️", label: "Configuration", path: "/super-admin/config" },
      { icon: "🗄️", label: "Database", path: "/super-admin/database" },
    ]
  },
  {
    section: "Security",
    items: [
      { icon: "🔐", label: "UAC/RBAC", path: "/super-admin/rbac" },
      { icon: "🛡️", label: "Security Logs", path: "/super-admin/security" },
      { icon: "🔑", label: "API Keys", path: "/super-admin/api-keys" },
      { icon: "👤", label: "Session Management", path: "/super-admin/sessions" },
    ]
  },
  {
    section: "Infrastructure",
    items: [
      { icon: "🐳", label: "Docker Containers", path: "/super-admin/docker" },
      { icon: "☸️", label: "Kubernetes", path: "/super-admin/k8s" },
      { icon: "📦", label: "Microservices", path: "/super-admin/services" },
      { icon: "🔄", label: "CI/CD", path: "/super-admin/cicd" },
    ]
  },
  {
    section: "Development",
    items: [
      { icon: "🧪", label: "API Playground", path: "/super-admin/api" },
      { icon: "📝", label: "Code Console", path: "/super-admin/console" },
      { icon: "🐛", label: "Debug Tools", path: "/super-admin/debug" },
      { icon: "📚", label: "Documentation", path: "/super-admin/docs" },
    ]
  },
  {
    section: "Operations (Normal Access)",
    items: [
      { icon: "🏠", label: "Dashboard", path: "/dashboard" },
      { icon: "📦", label: "Assets", path: "/assets" },
      { icon: "🎫", label: "Tickets", path: "/tickets" },
      { icon: "👥", label: "Users", path: "/users" },
    ]
  },
]
```

---

### 2. **DIREKTUR (DIRECTOR) DASHBOARD** 👔

**Role Definition**: Pengguna tingkat eksekutif yang bertanggung jawab atas strategi bisnis, kebijakan perusahaan, dan keputusan finansial besar. Menduduki tingkatan strategis dalam perusahaan.

**Primary Color Scheme**: Executive professional theme
- Background: `#1a1d29` (Deep charcoal)
- Accent: `#d4af37` (Executive gold)
- Text: `#f5f5f5` (Premium white)
- Charts: Rich color palette for data visualization

**Key Responsibilities**:
- ✅ Menentukan arah bisnis, kebijakan, dan strategi TI/aset perusahaan
- ✅ Mengawasi manajer dan memastikan kinerja sesuai target strategis
- ✅ Mempunyai otoritas akhir dalam keputusan pengelolaan aset besar
- ✅ Approval anggaran dan investasi signifikan
- ✅ Review performa departemen dan KPI perusahaan
- ✅ Mengatur kebijakan risiko dan compliance
- ✅ Final approval untuk keputusan strategis

**Layout Components**:

#### A. Executive Dashboard Panel
```typescript
<ExecutiveDashboard>
  {/* High-Level KPIs */}
  - Company Performance Score: 87% ↑ 5%
  - Total Assets Value: $2.5M
  - Budget Utilization: 73% of $10M
  - Employee Satisfaction: 4.2/5.0
  
  {/* Strategic Metrics */}
  - Department Performance Matrix
  - Financial Health Score
  - Risk Assessment Dashboard
  - Strategic Goals Progress
  
  {/* Pending Executive Decisions */}
  - Budget Approvals: 3 pending
  - Strategic Initiatives: 5 in progress
  - Department Requests: 8 awaiting review
</ExecutiveDashboard>
```

#### B. Business Intelligence Center
```typescript
<BusinessIntelligence>
  {/* Trend Analysis */}
  - Revenue vs Budget Trends
  - Department Cost Analysis
  - Asset ROI Analysis
  - Employee Productivity Trends
  
  {/* Predictive Analytics */}
  - Forecasted Budget Needs
  - Asset Lifecycle Predictions
  - Risk Probability Matrices
  
  {/* Comparative Reports */}
  - YoY Performance
  - Department Benchmarking
  - Industry Comparisons
</BusinessIntelligence>
```

#### C. Strategic Planning Tools
```typescript
<StrategicPlanning>
  {/* Goal Setting */}
  - Company OKRs
  - Department Goals
  - Initiative Tracking
  
  {/* Resource Planning */}
  - Annual Budget Planning
  - Headcount Planning
  - Asset Acquisition Strategy
  
  {/* Policy Management */}
  - Company Policies
  - Compliance Requirements
  - Risk Mitigation Plans
</StrategicPlanning>
```

#### D. Navigation Menu (Direktur)
```typescript
const directorMenu = [
  {
    section: "Executive Overview",
    items: [
      { icon: "📊", label: "Executive Dashboard", path: "/director/dashboard" },
      { icon: "💼", label: "Business Intelligence", path: "/director/bi" },
      { icon: "📈", label: "Performance Review", path: "/director/performance" },
      { icon: "🎯", label: "Strategic Goals", path: "/director/goals" },
    ]
  },
  {
    section: "Financial Oversight",
    items: [
      { icon: "💰", label: "Budget Overview", path: "/director/budget" },
      { icon: "✅", label: "Approvals", path: "/director/approvals", badge: 8 },
      { icon: "📉", label: "Cost Analysis", path: "/director/costs" },
      { icon: "💳", label: "Investment Review", path: "/director/investments" },
    ]
  },
  {
    section: "Organization",
    items: [
      { icon: "🏛️", label: "Departments", path: "/director/departments" },
      { icon: "👥", label: "Leadership Team", path: "/director/leadership" },
      { icon: "📋", label: "Company Policies", path: "/director/policies" },
      { icon: "⚖️", label: "Compliance", path: "/director/compliance" },
    ]
  },
  {
    section: "Reports & Analytics",
    items: [
      { icon: "📊", label: "Executive Reports", path: "/director/reports" },
      { icon: "🔍", label: "Audit Review", path: "/director/audit" },
      { icon: "📈", label: "Trend Analysis", path: "/director/trends" },
    ]
  },
]
```

---

### 3. **MANAGER DASHBOARD** 👨‍💼

**Role Definition**: Pengguna atau pimpinan yang bertanggung jawab atas tim atau departemen tertentu. Memiliki peran koordinasi di level menengah dan mengawasi operasional harian.

**Primary Color Scheme**: Leadership professional theme
- Background: `#f8f9fa` (Light professional)
- Accent: `#2563eb` (Leadership blue)
- Text: `#374151` (Professional gray)
- Highlights: `#10b981` (Success green), `#f59e0b` (Action orange)

**Key Responsibilities**:
- ✅ Membimbing staf, mengalokasikan tugas, dan memonitor penyelesaian proyek
- ✅ Melaporkan kinerja tim ke manajemen tingkat atas
- ✅ Berkoordinasi dengan Admin dan departemen lain
- ✅ Memantau kinerja tim terkait penggunaan sistem dan aset
- ✅ Memprioritaskan permintaan IT atau pengadaan aset
- ✅ Approve level-1 untuk tim langsung
- ✅ Performance review tim

**Layout Components**:

#### A. Team Management Panel
```typescript
<TeamManagement>
  {/* Team Overview */}
  - Team Size: 12 members
  - Active Projects: 5
  - Tasks Completion: 78%
  - Team Performance: 4.1/5.0
  
  {/* Team Metrics */}
  - Individual Performance Dashboard
  - Task Distribution Chart
  - Workload Balance Monitor
  - Attendance & Leave Status
  
  {/* Quick Actions */}
  - Assign Task
  - Approve Request
  - Schedule Meeting
  - Review Performance
</TeamManagement>
```

#### B. Operational Dashboard
```typescript
<OperationalDashboard>
  {/* Department KPIs */}
  - Monthly Targets: 85% achieved
  - Budget Usage: 67% of allocated
  - Open Tickets: 12 (3 critical)
  - Asset Utilization: 89%
  
  {/* Project Tracking */}
  - Active Projects Status
  - Milestones Progress
  - Resource Allocation
  - Risk Indicators
</OperationalDashboard>
```

#### C. Approval Workflow Center
```typescript
<ApprovalCenter>
  {/* Pending Approvals */}
  - Leave Requests: 5 pending
  - Asset Requests: 3 pending
  - Budget Requests: 2 pending
  - Overtime Requests: 1 pending
  
  {/* Approval History */}
  - Recent Decisions
  - Approval Analytics
  - Response Time Metrics
</ApprovalCenter>
```

#### D. Navigation Menu (Manager)
```typescript
const managerMenu = [
  {
    section: "Team Overview",
    items: [
      { icon: "📊", label: "Team Dashboard", path: "/manager/dashboard" },
      { icon: "👥", label: "Team Members", path: "/manager/team" },
      { icon: "📋", label: "Team Tasks", path: "/manager/tasks" },
      { icon: "📈", label: "Team Performance", path: "/manager/performance" },
    ]
  },
  {
    section: "Operations",
    items: [
      { icon: "📦", label: "Department Assets", path: "/manager/assets" },
      { icon: "🎫", label: "Department Tickets", path: "/manager/tickets" },
      { icon: "💰", label: "Department Budget", path: "/manager/budget" },
      { icon: "📊", label: "Department Reports", path: "/manager/reports" },
    ]
  },
  {
    section: "Management",
    items: [
      { icon: "✅", label: "Approvals", path: "/manager/approvals", badge: 11 },
      { icon: "📅", label: "Team Schedule", path: "/manager/schedule" },
      { icon: "🎯", label: "Goals & OKRs", path: "/manager/goals" },
      { icon: "📝", label: "Reviews", path: "/manager/reviews" },
    ]
  },
  {
    section: "Resources",
    items: [
      { icon: "➕", label: "Request Asset", path: "/manager/request-asset" },
      { icon: "➕", label: "Request Budget", path: "/manager/request-budget" },
      { icon: "➕", label: "Request Headcount", path: "/manager/request-headcount" },
    ]
  },
]
```

---

### 4. **ADMIN DASHBOARD** 💼

**Role Definition**: Pengguna dengan akses terbatas dibanding superadmin, bertugas mengelola aspek operasional tertentu dari sistem IT atau aset perusahaan. Administrator memiliki hak terbatas yang ditentukan oleh Superadmin.

**Primary Color Scheme**: Professional business theme
- Background: `#f5f7fa` (Light gray)
- Accent: `#3b82f6` (Professional blue)
- Text: `#1f2937` (Dark gray)
- Actions: `#8b5cf6` (Admin purple)

**Key Responsibilities**:
- ✅ Memelihara perangkat keras dan lunak dalam lingkup tertentu
- ✅ Mengatur hak akses user di level departemen/modul
- ✅ Menangani permintaan support user
- ✅ Monitoring harian operasi sistem dan aset
- ✅ Bisa menambah user baru (jika diizinkan superadmin)
- ✅ Mengelola aset dan konfigurasi dalam lingkup yang ditetapkan
- ✅ Tidak dapat melakukan perubahan sistem global
- ✅ Approval workflow dalam scope modul

**Layout Components**:

#### A. Business Operations Panel
```typescript
<BusinessOperationsPanel>
  {/* KPI Cards */}
  - Total Assets: 1,234
  - Open Tickets: 45 (⚠️ 5 overdue)
  - Active Users: 89
  - Today's Bookings: 12
  
  {/* Charts */}
  - Monthly Revenue Trend
  - Ticket Resolution Rate
  - Asset Utilization Rate
  - Department Performance
</BusinessOperationsPanel>
```

#### B. Management Tools
```typescript
<ManagementTools>
  {/* User Management */}
  - Create/Edit Users
  - Assign Roles
  - Department Management
  - Team Assignment
  
  {/* Approval Workflows */}
  - Pending Approvals (23)
  - Asset Requests (8)
  - Budget Approvals (3)
  - Leave Requests (12)
  
  {/* Content Moderation */}
  - Review Comments
  - Moderate Uploads
  - Audit Activities
</ManagementTools>
```

#### C. Reports & Analytics
```typescript
<ReportsAnalytics>
  {/* Standard Reports */}
  - Asset Inventory Report
  - Ticket Performance Report
  - Financial Summary
  - User Activity Report
  
  {/* Analytics */}
  - Trend Analysis
  - Predictive Insights
  - Custom Dashboards
  - Export to Excel/PDF
</ReportsAnalytics>
```

#### D. Navigation Menu (Admin)
```typescript
const adminMenu = [
  {
    section: "Overview",
    items: [
      { icon: "🏠", label: "Dashboard", path: "/dashboard" },
      { icon: "📊", label: "Analytics", path: "/analytics" },
      { icon: "📈", label: "Reports", path: "/reports" },
    ]
  },
  {
    section: "Operations",
    items: [
      { icon: "📦", label: "Assets", path: "/assets" },
      { icon: "🎫", label: "Tickets", path: "/tickets" },
      { icon: "🏢", label: "Meeting Rooms", path: "/meeting-rooms" },
      { icon: "📦", label: "Inventory", path: "/inventory" },
      { icon: "💰", label: "Financial", path: "/financial" },
    ]
  },
  {
    section: "Management",
    items: [
      { icon: "👥", label: "Users", path: "/users" },
      { icon: "🏛️", label: "Departments", path: "/departments" },
      { icon: "✅", label: "Approvals", path: "/approvals", badge: 23 },
      { icon: "📋", label: "Audit Logs", path: "/audit-logs" },
    ]
  },
  {
    section: "Settings",
    items: [
      { icon: "⚙️", label: "Settings", path: "/settings" },
      { icon: "🔔", label: "Notifications", path: "/notifications" },
      { icon: "👤", label: "Profile", path: "/profile" },
    ]
  },
]
```

---

### 5. **HR (HUMAN RESOURCES) DASHBOARD** 👥

**Role Definition**: Tim yang mengelola sumber daya manusia, termasuk manajemen data karyawan dan akses ke sistem. HR memfokuskan diri pada aspek sumber daya manusia, administrasi, pengembangan karyawan, dan kepatuhan regulasi.

**Primary Color Scheme**: People-focused friendly theme
- Background: `#fefefe` (Clean white)
- Accent: `#ec4899` (HR pink/magenta)
- Text: `#374151` (Comfortable gray)
- People: `#8b5cf6` (Purple for people), `#14b8a6` (Teal for growth)

**Key Responsibilities**:
- ✅ Mengelola data karyawan dan izin akses ke aplikasi internal
- ✅ Bekerja sama dengan admin/superadmin untuk user management
- ✅ Menyediakan dukungan administratif terkait aset karyawan
- ✅ Mengelola hak akses HR atau user untuk sistem internal
- ✅ Recruitment, onboarding, dan offboarding
- ✅ Leave management dan attendance tracking
- ✅ Performance review dan training programs
- ✅ Payroll administration (view/manage)
- ✅ Employee relations dan compliance

**Layout Components**:

#### A. Employee Management Panel
```typescript
<EmployeeManagement>
  {/* Overview */}
  - Total Employees: 234
  - Active: 228
  - On Leave: 6
  - New Hires (This Month): 3
  - Pending Exits: 1
  
  {/* Quick Stats */}
  - Departments: 12
  - Teams: 45
  - Average Tenure: 3.2 years
  - Turnover Rate: 8.5%
  
  {/* Pending HR Actions */}
  - Leave Approvals: 12
  - Document Verification: 5
  - Access Requests: 8
  - Performance Reviews: 15
</EmployeeManagement>
```

#### B. Recruitment & Onboarding
```typescript
<RecruitmentCenter>
  {/* Active Recruitment */}
  - Open Positions: 8
  - Candidates in Pipeline: 23
  - Interviews Scheduled: 5
  - Offers Extended: 2
  
  {/* Onboarding */}
  - Onboarding in Progress: 3
  - Access Provisioning: 2 pending
  - Training Scheduled: 5
  - Equipment Assignment: 1 pending
</RecruitmentCenter>
```

#### C. Leave & Attendance
```typescript
<LeaveAttendance>
  {/* Leave Management */}
  - Pending Leave Requests: 12
  - Approved This Month: 45
  - Leave Balance Report
  - Holiday Calendar
  
  {/* Attendance */}
  - Today's Attendance: 95%
  - Late Arrivals: 3
  - Absent: 6
  - Work From Home: 12
</LeaveAttendance>
```

#### D. Performance & Development
```typescript
<PerformanceDevelopment>
  {/* Performance Review */}
  - Pending Reviews: 15
  - Review Cycles
  - Goal Setting Status
  - Performance Analytics
  
  {/* Training & Development */}
  - Active Training Programs: 8
  - Enrolled Employees: 67
  - Completion Rate: 78%
  - Upcoming Sessions: 5
</PerformanceDevelopment>
```

#### E. Navigation Menu (HR)
```typescript
const hrMenu = [
  {
    section: "Employee Management",
    items: [
      { icon: "👥", label: "Employees", path: "/hr/employees" },
      { icon: "➕", label: "Add Employee", path: "/hr/employees/create" },
      { icon: "🏛️", label: "Departments", path: "/hr/departments" },
      { icon: "👨‍💼", label: "Teams", path: "/hr/teams" },
    ]
  },
  {
    section: "Recruitment",
    items: [
      { icon: "📢", label: "Job Openings", path: "/hr/jobs" },
      { icon: "📋", label: "Candidates", path: "/hr/candidates" },
      { icon: "🎯", label: "Onboarding", path: "/hr/onboarding" },
      { icon: "✅", label: "Background Checks", path: "/hr/background-checks" },
    ]
  },
  {
    section: "Attendance & Leave",
    items: [
      { icon: "📅", label: "Attendance", path: "/hr/attendance" },
      { icon: "🏖️", label: "Leave Management", path: "/hr/leave", badge: 12 },
      { icon: "📆", label: "Holiday Calendar", path: "/hr/holidays" },
      { icon: "⏰", label: "Shift Management", path: "/hr/shifts" },
    ]
  },
  {
    section: "Performance",
    items: [
      { icon: "⭐", label: "Performance Reviews", path: "/hr/reviews", badge: 15 },
      { icon: "🎓", label: "Training Programs", path: "/hr/training" },
      { icon: "📈", label: "Development Plans", path: "/hr/development" },
      { icon: "🏆", label: "Achievements", path: "/hr/achievements" },
    ]
  },
  {
    section: "Payroll & Benefits",
    items: [
      { icon: "💰", label: "Payroll", path: "/hr/payroll" },
      { icon: "🏥", label: "Benefits", path: "/hr/benefits" },
      { icon: "💳", label: "Compensation", path: "/hr/compensation" },
    ]
  },
  {
    section: "Reports & Compliance",
    items: [
      { icon: "📊", label: "HR Reports", path: "/hr/reports" },
      { icon: "⚖️", label: "Compliance", path: "/hr/compliance" },
      { icon: "📋", label: "Policies", path: "/hr/policies" },
    ]
  },
]
```

---

### 6. **USER DASHBOARD** 👤

**Role Definition**: Pengguna biasa atau staf yang menggunakan sistem IT untuk aktivitas sehari-hari. User adalah pengguna akhir yang mengakses sistem untuk menjalankan tugas operasional dengan akses terbatas sesuai kebutuhan pekerjaan.

**Primary Color Scheme**: Friendly & accessible theme
- Background: `#ffffff` (Pure white)
- Accent: `#10b981` (Friendly green)
- Text: `#374151` (Comfortable gray)
- Actions: `#3b82f6` (Actionable blue)

**Key Responsibilities**:
- ✅ Menggunakan perangkat IT dan aplikasi sesuai fungsinya
- ✅ Melaporkan masalah atau kendala ke admin atau IT support
- ✅ Mengikuti prosedur dan kebijakan keamanan yang ditetapkan
- ✅ Tidak bisa mengubah konfigurasi sistem atau aset secara global
- ✅ Dapat mengakses data dan aplikasi yang relevan dengan tugasnya
- ✅ Submit requests untuk approval
- ✅ View personal records dan activity

**Layout Components**:

#### A. Personal Dashboard
```typescript
<PersonalDashboard>
  {/* Quick Actions */}
  - 🎫 Create Ticket
  - 🏢 Book Meeting Room
  - 📦 Request Asset
  - 📝 Submit Report
  
  {/* My Activity */}
  - My Open Tickets (3)
  - My Bookings (2)
  - My Assets (5)
  - Pending Requests (1)
  
  {/* Notifications */}
  - Ticket #1234 resolved ✅
  - Meeting room confirmed 🏢
  - Asset approved 📦
</PersonalDashboard>
```

#### B. Limited Operations
```typescript
<LimitedOperations>
  {/* View Only */}
  - My Assets (read-only)
  - My Tickets (edit own only)
  - My Bookings (manage own)
  - My Reports (view own)
  
  {/* Create Only */}
  - New Ticket
  - New Booking Request
  - New Asset Request
  - New Report Submission
</LimitedOperations>
```

#### C. Navigation Menu (User)
```typescript
const userMenu = [
  {
    section: "My Workspace",
    items: [
      { icon: "🏠", label: "Home", path: "/home" },
      { icon: "📋", label: "My Tasks", path: "/my-tasks" },
      { icon: "🔔", label: "Notifications", path: "/notifications", badge: 5 },
    ]
  },
  {
    section: "Actions",
    items: [
      { icon: "🎫", label: "My Tickets", path: "/my-tickets" },
      { icon: "🏢", label: "My Bookings", path: "/my-bookings" },
      { icon: "📦", label: "My Assets", path: "/my-assets" },
      { icon: "📝", label: "My Reports", path: "/my-reports" },
    ]
  },
  {
    section: "Create",
    items: [
      { icon: "➕", label: "Create Ticket", path: "/tickets/create" },
      { icon: "🏢", label: "Book Room", path: "/bookings/create" },
      { icon: "📦", label: "Request Asset", path: "/requests/create" },
    ]
  },
  {
    section: "Account",
    items: [
      { icon: "👤", label: "Profile", path: "/profile" },
      { icon: "⚙️", label: "Settings", path: "/settings" },
      { icon: "🚪", label: "Logout", path: "/logout" },
    ]
  },
]
```

---

## 🔐 COMPREHENSIVE PERMISSION MATRIX

### Complete Feature Access by Role:

| Feature / Module | Superadmin | Direktur | Manager | Admin | HR | User |
|-----------------|-----------|----------|---------|-------|----|----- |
| **SYSTEM INFRASTRUCTURE** |
| System Dashboard | ✅ Full | 👁️ View | ❌ | ❌ | ❌ | ❌ |
| Performance Metrics | ✅ Full | 👁️ View | 👁️ Dept | 👁️ View | ❌ | ❌ |
| Server Configuration | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| Database Management | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| Backup/Restore | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| Migration Tools | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| Service Deployment | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **SECURITY & ACCESS** |
| UAC/RBAC Config | ✅ Full | 👁️ View | ❌ | 👁️ View | 👁️ View | ❌ |
| Security Logs | ✅ Full | 👁️ All | 👁️ Dept | 👁️ Module | 👁️ HR | ❌ |
| API Keys Management | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| Session Management | ✅ Full | 👁️ All | ✅ Team | ✅ Module | ✅ Emp | 👁️ Own |
| Firewall Rules | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **INFRASTRUCTURE** |
| Docker/K8s Management | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| Service Health Monitor | ✅ Full | 👁️ View | 👁️ View | 👁️ View | ❌ | ❌ |
| Load Balancing | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| CI/CD Pipeline | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| Log Aggregation | ✅ Full | 👁️ View | 👁️ Dept | 👁️ View | ❌ | ❌ |
| **BUSINESS OPERATIONS** |
| Assets Management | ✅ Full | 👁️ All | ✅ Dept | ✅ Full | 👁️ All | 👁️ Own |
| Asset Assignment | ✅ Full | ✅ Approve | ✅ Approve | ✅ Assign | ✅ Assign | ➕ Request |
| Asset Maintenance | ✅ Full | 👁️ All | ✅ Dept | ✅ Schedule | 👁️ View | ➕ Report |
| Tickets Management | ✅ Full | 👁️ All | ✅ Dept | ✅ Full | 👁️ View | ✅ Own |
| Ticket Assignment | ✅ Full | ✅ Reassign | ✅ Assign | ✅ Assign | ❌ | ➕ Create |
| SLA Configuration | ✅ Full | ✅ Set | 👁️ View | 👁️ View | ❌ | ❌ |
| Meeting Room Mgmt | ✅ Full | ✅ Priority | ✅ Manage | ✅ Manage | ✅ Manage | ✅ Book |
| Room Approval | ✅ Full | ✅ VIP | ✅ Dept | ✅ Approve | ❌ | ❌ |
| Inventory Management | ✅ Full | 👁️ All | ✅ Dept | ✅ Full | 👁️ View | 👁️ View |
| Stock Adjustment | ✅ Full | ✅ Approve | ✅ Request | ✅ Execute | ❌ | ❌ |
| Warehouse Transfer | ✅ Full | ✅ Approve | ✅ Request | ✅ Execute | ❌ | ❌ |
| **FINANCIAL** |
| Financial Dashboard | ✅ Full | ✅ Full | 👁️ Dept | ✅ Manage | 👁️ Limited | ❌ |
| Invoice Management | ✅ Full | 👁️ All | 👁️ Dept | ✅ Process | ❌ | ❌ |
| Budget Planning | ✅ Full | ✅ Full | ✅ Dept | 👁️ View | ❌ | ❌ |
| Budget Approval | ✅ Full | ✅ Final | ✅ Level-1 | ❌ | ❌ | ❌ |
| Expense Tracking | ✅ Full | 👁️ All | ✅ Dept | ✅ Monitor | ❌ | ➕ Submit |
| Purchase Orders | ✅ Full | ✅ Approve | ✅ Create | ✅ Process | ❌ | ➕ Request |
| Payment Processing | ✅ Full | ✅ Approve | ❌ | ✅ Process | ❌ | ❌ |
| **USER & EMPLOYEE MANAGEMENT** |
| User CRUD | ✅ Full | ✅ All | ✅ Team | ✅ Limited | ✅ Full | 👁️ Own |
| Role Assignment | ✅ Full | ✅ Approve | ❌ | 👁️ View | ✅ Assign | ❌ |
| Department Management | ✅ Full | ✅ Full | ✅ Own | ✅ View | ✅ Full | 👁️ Own |
| Team Assignment | ✅ Full | ✅ Approve | ✅ Full | ✅ View | ✅ Full | 👁️ Own |
| Employee Onboarding | ✅ Full | 👁️ View | ✅ Team | ✅ Support | ✅ Full | ❌ |
| Employee Offboarding | ✅ Full | ✅ Approve | ✅ Initiate | ✅ Support | ✅ Full | ❌ |
| Access Provisioning | ✅ Full | ✅ Approve | ✅ Request | ✅ Execute | ✅ Full | ❌ |
| **HR OPERATIONS** |
| Recruitment | ✅ Full | ✅ Approve | ✅ Request | 👁️ View | ✅ Full | ❌ |
| Leave Management | ✅ Full | ✅ Final | ✅ Approve | 👁️ View | ✅ Full | ➕ Apply |
| Attendance Tracking | ✅ Full | 👁️ All | 👁️ Team | 👁️ View | ✅ Full | 👁️ Own |
| Performance Review | ✅ Full | ✅ Final | ✅ Direct | 👁️ View | ✅ Manage | 👁️ Own |
| Training Programs | ✅ Full | ✅ Approve | ✅ Nominate | 👁️ View | ✅ Full | ✅ Enroll |
| Payroll (View) | ✅ Full | ✅ Full | 👁️ Team | ❌ | ✅ Full | 👁️ Own |
| **APPROVALS & WORKFLOWS** |
| Asset Requests | ✅ Full | ✅ Final | ✅ Level-1 | ✅ Process | ✅ HR-Related | ➕ Submit |
| Budget Requests | ✅ Full | ✅ Final | ✅ Level-1 | ❌ | ❌ | ➕ Submit |
| Leave Requests | ✅ Full | ✅ Final | ✅ Level-1 | ❌ | ✅ Process | ➕ Submit |
| Purchase Requests | ✅ Full | ✅ Final | ✅ Level-1 | ✅ Process | ❌ | ➕ Submit |
| Access Requests | ✅ Full | ✅ Approve | ✅ Level-1 | ✅ Process | ✅ Process | ➕ Submit |
| Workflow Configuration | ✅ Full | ✅ Set | 👁️ View | 👁️ View | 👁️ View | ❌ |
| **REPORTING & ANALYTICS** |
| System Reports | ✅ Full | 👁️ View | ❌ | 👁️ View | ❌ | ❌ |
| Business Intelligence | ✅ Full | ✅ Full | ✅ Dept | 👁️ Limited | 👁️ HR | ❌ |
| KPI Dashboard | ✅ Full | ✅ Full | ✅ Team | 👁️ View | ✅ HR | 👁️ Own |
| Custom Reports | ✅ Full | ✅ Create | ✅ Create | ✅ Create | ✅ Create | ➕ Request |
| Data Export | ✅ Full | ✅ All | ✅ Dept | ✅ Module | ✅ HR | ❌ |
| Scheduled Reports | ✅ Full | ✅ Subscribe | ✅ Subscribe | ✅ Subscribe | ✅ Subscribe | ❌ |
| **AUDIT & COMPLIANCE** |
| Audit Logs (All) | ✅ Full | ✅ View | 👁️ Dept | 👁️ Module | 👁️ HR | ❌ |
| Compliance Reports | ✅ Full | ✅ Full | 👁️ Dept | 👁️ View | ✅ HR | ❌ |
| Security Audit | ✅ Full | ✅ Review | ❌ | 👁️ View | ❌ | ❌ |
| Activity Monitoring | ✅ Full | 👁️ All | 👁️ Team | 👁️ Module | 👁️ Emp | 👁️ Own |
| **NOTIFICATIONS** |
| System Notifications | ✅ Full | ✅ All | ✅ Team | ✅ Module | ✅ Emp | ✅ Own |
| Email Templates | ✅ Full | 👁️ View | 👁️ View | ✅ Edit | ✅ Edit | ❌ |
| Push Notifications | ✅ Full | ✅ Config | 👁️ View | ✅ Config | ✅ Config | ✅ Receive |
| Notification Settings | ✅ Full | ✅ Own | ✅ Own | ✅ Own | ✅ Own | ✅ Own |
| **SYSTEM SETTINGS** |
| Global Settings | ✅ Full | ✅ Approve | ❌ | 👁️ View | ❌ | ❌ |
| Company Profile | ✅ Full | ✅ Edit | 👁️ View | 👁️ View | 👁️ View | 👁️ View |
| Localization | ✅ Full | ✅ Set | 👁️ View | 👁️ View | 👁️ View | ✅ Own |
| Integration Config | ✅ Full | ❌ | ❌ | 👁️ View | ❌ | ❌ |
| Feature Flags | ✅ Full | ✅ Approve | ❌ | 👁️ View | ❌ | ❌ |

**Legend**:
- ✅ Full: Complete CRUD access with all permissions
- ✅ Create: Can create new records
- ✅ Approve: Can approve/reject requests (with level specification)
- 👁️ View: Read-only access (with scope: All/Dept/Team/Module/Own)
- ➕ Submit/Request: Can submit requests for approval
- ❌ No Access: Cannot access this feature

**Access Scope Definitions**:
- **All**: Access to all records across entire organization
- **Dept**: Access limited to own department
- **Team**: Access limited to direct reports/team members
- **Module**: Access limited to specific module/area of responsibility
- **Own**: Access limited to personal records only
- **HR**: Access to HR-related data only
- **Emp**: Access to employee data based on HR scope

---

## 🔧 BACKEND UAC/RBAC INTEGRATION

### Database Schema for Roles & Permissions:

```sql
-- Roles Table (already exists in auth-service)
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,  -- superadmin, director, manager, admin, hr, user
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    level INT NOT NULL,  -- 1=superadmin, 2=director, 3=manager, 4=admin/hr, 5=user
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,  -- e.g. 'asset.create', 'user.delete'
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,  -- asset, ticket, user, system, etc.
    action VARCHAR(20) NOT NULL,  -- create, read, update, delete, approve, etc.
    scope VARCHAR(20) DEFAULT 'all',  -- all, department, team, own
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_module (module),
    INDEX idx_action (action)
);

-- Role Permissions (Many-to-Many)
CREATE TABLE role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- User Roles (already exists but enhance)
CREATE TABLE user_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    department_id BIGINT UNSIGNED,  -- For department-scoped roles
    team_id BIGINT UNSIGNED,  -- For team-scoped roles
    granted_by BIGINT UNSIGNED,  -- Who assigned this role
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,  -- For temporary roles
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id),
    INDEX idx_user_role (user_id, role_id),
    INDEX idx_active (is_active)
);

-- Department Hierarchy (for scoped permissions)
CREATE TABLE departments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    parent_id BIGINT UNSIGNED,  -- For hierarchical structure
    manager_id BIGINT UNSIGNED,  -- Department head
    director_id BIGINT UNSIGNED,  -- Department director
    level INT,  -- Department level in hierarchy
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES departments(id),
    FOREIGN KEY (manager_id) REFERENCES users(id),
    FOREIGN KEY (director_id) REFERENCES users(id)
);

-- Teams (for team-scoped permissions)
CREATE TABLE teams (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    manager_id BIGINT UNSIGNED,  -- Team lead
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
);
```

### Pre-seeded Roles:

```php
// database/seeders/RolesSeeder.php
class RolesSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            [
                'name' => 'superadmin',
                'display_name' => 'Super Administrator',
                'description' => 'Full system access with complete control over infrastructure and configuration',
                'level' => 1,
                'is_system_role' => true,
            ],
            [
                'name' => 'director',
                'display_name' => 'Director',
                'description' => 'Executive level access for strategic decisions and policy setting',
                'level' => 2,
                'is_system_role' => true,
            ],
            [
                'name' => 'manager',
                'display_name' => 'Manager',
                'description' => 'Department/team leadership with operational oversight',
                'level' => 3,
                'is_system_role' => true,
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Module-level administrative access for operations',
                'level' => 4,
                'is_system_role' => true,
            ],
            [
                'name' => 'hr',
                'display_name' => 'Human Resources',
                'description' => 'Employee and HR operations management',
                'level' => 4,
                'is_system_role' => true,
            ],
            [
                'name' => 'user',
                'display_name' => 'User',
                'description' => 'Standard user with operational access',
                'level' => 5,
                'is_system_role' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
```

### Permission Naming Convention:

```
Format: {module}.{action}.{scope}

Examples:
- asset.create.all          // Create assets anywhere
- asset.create.department   // Create assets in own department
- asset.view.own           // View only own assets
- user.update.team         // Update users in own team
- ticket.approve.all       // Approve any ticket
- budget.approve.department // Approve department budget
```

### Auth Middleware Enhancement:

```php
// app/Http/Middleware/CheckPermission.php
class CheckPermission
{
    public function handle($request, Closure $next, $permission, $scope = 'all')
    {
        $user = auth()->user();
        
        // Superadmin bypass
        if ($user->hasRole('superadmin')) {
            return $next($request);
        }
        
        // Check if user has permission
        if (!$user->hasPermission($permission)) {
            abort(403, 'Unauthorized action.');
        }
        
        // Check scope if not 'all'
        if ($scope !== 'all') {
            $this->checkScope($user, $request, $scope);
        }
        
        return $next($request);
    }
    
    private function checkScope($user, $request, $scope)
    {
        $resourceOwnerId = $request->route('id');
        
        switch ($scope) {
            case 'own':
                if ($resourceOwnerId != $user->id) {
                    abort(403, 'You can only access your own resources.');
                }
                break;
                
            case 'team':
                $resource = $this->getResource($request);
                if (!$user->isInSameTeam($resource->user_id)) {
                    abort(403, 'You can only access resources in your team.');
                }
                break;
                
            case 'department':
                $resource = $this->getResource($request);
                if (!$user->isInSameDepartment($resource->user_id)) {
                    abort(403, 'You can only access resources in your department.');
                }
                break;
        }
    }
}
```

### User Model Enhancement:

```php
// app/Models/User.php
class User extends Authenticatable
{
    // ... existing code
    
    /**
     * Check if user has specific role
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }
    
    /**
     * Check if user has any of the specified roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }
    
    /**
     * Check if user has all specified roles
     */
    public function hasAllRoles(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->count() === count($roles);
    }
    
    /**
     * Check if user has specific permission
     */
    public function hasPermission(string $permission): bool
    {
        // Superadmin has all permissions
        if ($this->hasRole('superadmin')) {
            return true;
        }
        
        return $this->roles()
            ->whereHas('permissions', function($query) use ($permission) {
                $query->where('name', $permission);
            })
            ->exists();
    }
    
    /**
     * Get user's role level (lower = higher authority)
     */
    public function getRoleLevel(): int
    {
        return $this->roles()->min('level') ?? 999;
    }
    
    /**
     * Check if user is in same team
     */
    public function isInSameTeam(int $userId): bool
    {
        $otherUser = User::find($userId);
        return $this->team_id === $otherUser->team_id;
    }
    
    /**
     * Check if user is in same department
     */
    public function isInSameDepartment(int $userId): bool
    {
        $otherUser = User::find($userId);
        return $this->department_id === $otherUser->department_id;
    }
    
    /**
     * Check if user can approve (is higher in hierarchy)
     */
    public function canApprove(User $targetUser): bool
    {
        return $this->getRoleLevel() < $targetUser->getRoleLevel();
    }
    
    /**
     * Get direct reports (for managers)
     */
    public function directReports()
    {
        if ($this->hasRole('manager')) {
            return User::where('manager_id', $this->id)->get();
        }
        return collect();
    }
    
    /**
     * Get department members (for managers/directors)
     */
    public function departmentMembers()
    {
        if ($this->hasAnyRole(['manager', 'director'])) {
            return User::where('department_id', $this->department_id)->get();
        }
        return collect();
    }
}
```

### API Route Protection:

```php
// routes/api.php

// Superadmin only routes
Route::group(['middleware' => ['auth:sanctum', 'role:superadmin'], 'prefix' => 'superadmin'], function() {
    Route::get('/system/performance', [SuperAdminController::class, 'performance']);
    Route::post('/database/backup', [SuperAdminController::class, 'backup']);
    Route::post('/migrations/run', [SuperAdminController::class, 'runMigrations']);
});

// Director routes
Route::group(['middleware' => ['auth:sanctum', 'role:director'], 'prefix' => 'director'], function() {
    Route::get('/dashboard', [DirectorController::class, 'dashboard']);
    Route::get('/performance-review', [DirectorController::class, 'performanceReview']);
    Route::post('/budget/approve/{id}', [DirectorController::class, 'approveBudget']);
});

// Manager routes
Route::group(['middleware' => ['auth:sanctum', 'role:manager'], 'prefix' => 'manager'], function() {
    Route::get('/team', [ManagerController::class, 'team']);
    Route::post('/approvals/{id}', [ManagerController::class, 'approve']);
});

// HR routes
Route::group(['middleware' => ['auth:sanctum', 'role:hr'], 'prefix' => 'hr'], function() {
    Route::resource('employees', EmployeeController::class);
    Route::post('/leave/approve/{id}', [LeaveController::class, 'approve']);
});

// Admin routes
Route::group(['middleware' => ['auth:sanctum', 'role:admin,manager'], 'prefix' => 'admin'], function() {
    Route::resource('users', UserController::class);
    Route::resource('assets', AssetController::class);
});

// Authenticated user routes (all roles)
Route::group(['middleware' => 'auth:sanctum'], function() {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/my-assets', [AssetController::class, 'myAssets']);
});
```

### Phase 1: Role Detection & Routing (1 hour)

**Files to Create/Modify**:

1. **Role Context Provider**
```typescript
// src/context/RoleContext.tsx
interface RoleContextType {
  role: 'super-admin' | 'admin' | 'user'
  permissions: string[]
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}
```

2. **Role-Based Router**
```typescript
// src/routes/RoleBasedRouter.tsx
const RoleBasedRouter = () => {
  const { role } = useRole()
  
  switch (role) {
    case 'super-admin':
      return <SuperAdminRoutes />
    case 'admin':
      return <AdminRoutes />
    case 'user':
      return <UserRoutes />
  }
}
```

---

### Phase 2: Super-Admin Dashboard (3-4 hours)

**Components to Create**:

1. `SuperAdminDashboard.tsx` - Main layout
2. `SystemPerformancePanel.tsx` - Real-time metrics
3. `MonitoringIntegration.tsx` - Prometheus/Grafana
4. `DatabaseConsole.tsx` - Database management
5. `ConfigurationEditor.tsx` - System config
6. `RBACManager.tsx` - UAC/RBAC editor
7. `DeveloperTools.tsx` - API playground, logs

---

### Phase 3: Admin Dashboard (2-3 hours)

**Components to Create**:

1. `AdminDashboard.tsx` - Business operations
2. `UserManagement.tsx` - User CRUD
3. `ApprovalQueue.tsx` - Approval workflows
4. `ReportsCenter.tsx` - Business reports
5. `AuditLogsViewer.tsx` - Activity logs

---

### Phase 4: User Dashboard (1-2 hours)

**Components to Create**:

1. `UserDashboard.tsx` - Personal workspace
2. `MyTasks.tsx` - Personal tasks
3. `QuickActions.tsx` - Create ticket, booking
4. `MyActivity.tsx` - Personal activity feed

---

### Phase 5: Permission Guards (1 hour)

**Implement Guards**:

1. `PermissionGuard` - Check permission
2. `RoleGuard` - Check role
3. `FeatureFlag` - Toggle features
4. `RouteGuard` - Protect routes

---

## 📊 UI MOCKUPS

### Super-Admin Dashboard Layout:

```
┌─────────────────────────────────────────────────────────┐
│  🔧 IMSQuty Super-Admin Console        [User] [Logout]  │
├───────────┬─────────────────────────────────────────────┤
│           │  System Performance                         │
│ 🖥️ System  │  ┌────────┬────────┬────────┬────────┐     │
│ 📊 Metrics │  │CPU 45% │RAM 52% │Disk IO │Network │     │
│ 🔍 Monitor │  ├────────┴────────┴────────┴────────┤     │
│ ⚙️ Config  │  │ Service Health                    │     │
│ 🗄️ DB      │  │ ✅ Auth  ✅ Asset  ⚠️ Inventory   │     │
│           │  └──────────────────────────────────────┘     │
│ 🔐 RBAC    │  Real-time Monitoring                       │
│ 🛡️ Security│  [Embedded Grafana Dashboard]               │
│ 🔑 API Keys│                                             │
│           │  Quick Actions                              │
│ 🐳 Docker  │  [Run Migration] [Backup DB] [Clear Cache] │
│ ☸️ K8s     │  [View Logs] [Test API] [Deploy Service]   │
│ 📦 Services│                                             │
│           │  Recent System Events                       │
│ 🧪 API Play│  • Service deployed: asset-service v1.2.3  │
│ 🐛 Debug   │  • Migration executed: 2026_01_08_001      │
│ 📚 Docs    │  • Alert triggered: High memory usage      │
└───────────┴─────────────────────────────────────────────┘
```

### Admin Dashboard Layout:

```
┌─────────────────────────────────────────────────────────┐
│  💼 IMSQuty Admin Panel            [User] [Logout]      │
├───────────┬─────────────────────────────────────────────┤
│           │  Business Overview                          │
│ 🏠 Home    │  ┌──────┬──────┬──────┬──────┐             │
│ 📊 Reports │  │Assets│Ticket│Users │Rooms │             │
│           │  │1,234 │  45  │  89  │  12  │             │
│ 📦 Assets  │  └──────┴──────┴──────┴──────┘             │
│ 🎫 Tickets │                                             │
│ 🏢 Rooms   │  [📈 Monthly Performance Chart]            │
│ 📦 Inventor│                                             │
│ 💰 Finance │  Pending Approvals (23)                    │
│           │  • Asset Request - John Doe (2 days ago)    │
│ 👥 Users   │  • Budget Approval - Finance Dept          │
│ 🏛️ Depts   │  • Leave Request - 5 pending               │
│ ✅ Approval│                                             │
│ 📋 Audit   │  Recent Activities                          │
│           │  • New ticket created by Jane               │
│ ⚙️ Settings│  • Asset assigned to IT Team               │
└───────────┴─────────────────────────────────────────────┘
```

### User Dashboard Layout:

```
┌─────────────────────────────────────────────────────────┐
│  👤 IMSQuty - Welcome, John!       [Notif] [Logout]     │
├───────────┬─────────────────────────────────────────────┤
│           │  Quick Actions                              │
│ 🏠 Home    │  [🎫 Create Ticket] [🏢 Book Room]          │
│ 📋 My Tasks│  [📦 Request Asset] [📝 Submit Report]      │
│ 🔔 Notif ⑤│                                             │
│           │  My Activity                                │
│ 🎫 Tickets │  ┌────────────────────────────────┐         │
│ 🏢 Booking │  │ My Open Tickets (3)            │         │
│ 📦 Assets  │  │ • Laptop repair - In Progress  │         │
│ 📝 Reports │  │ • Printer issue - Pending      │         │
│           │  └────────────────────────────────┘         │
│ ➕ Create  │  ┌────────────────────────────────┐         │
│           │  │ My Bookings (2)                │         │
│ 👤 Profile │  │ • Meeting Room A - Tomorrow    │         │
│ ⚙️ Settings│  │ • Conference Hall - Next Week  │         │
│ 🚪 Logout  │  └────────────────────────────────┘         │
└───────────┴─────────────────────────────────────────────┘
```

---

## 🎯 IMPLEMENTATION PLAN

### **Phase 1: Backend UAC/RBAC Setup** (2-3 hours)

**Database Migrations**:
```bash
php artisan make:migration enhance_roles_and_permissions_tables
php artisan make:migration create_departments_and_teams_tables
php artisan migrate
```

**Seed Data**:
```bash
php artisan make:seeder RolesSeeder         # 6 roles
php artisan make:seeder PermissionsSeeder   # 60+ permissions
php artisan make:seeder RolePermissionsSeeder
php artisan db:seed
```

**User Model Enhancement**: Add methods to [User.php](../imsquty/services/user-service/Models/User.php)

**Middleware Creation**:
```bash
php artisan make:middleware CheckRole
php artisan make:middleware CheckPermission
# Register in Kernel.php
```

---

### **Phase 2: Frontend Role Detection** (1 hour)

**RoleContext Provider**: Create `src/context/RoleContext.tsx`

**Permission Guards**: Create `src/components/guards/`
- PermissionGuard.tsx
- RoleGuard.tsx
- ConditionalRender.tsx

**App.tsx Integration**: Wrap with `<RoleProvider>`

---

### **Phase 3: Dashboard Implementation** (6-8 hours)

1. **Superadmin Dashboard** (2 hours) - System performance & monitoring
2. **Direktur Dashboard** (1.5 hours) - Executive KPIs & strategic tools
3. **Manager Dashboard** (1.5 hours) - Team management & approvals
4. **Admin Dashboard** (1 hour) - Operations & user management
5. **HR Dashboard** (1 hour) - Employee management & recruitment
6. **User Dashboard** (1 hour) - Personal workspace & quick actions

---

### **Phase 4: Testing & Polish** (2 hours)

- Permission testing per role
- UI/UX polish & responsive design
- Error handling & loading states
- Security audit

---

## 🚀 NEXT STEPS

**Immediate (Next 10 minutes)**:
- ✅ Architecture design complete
- ⏳ Begin backend UAC/RBAC implementation

**Priority 1 (2-3 hours)**:
- ⏳ Database migrations
- ⏳ Seed roles & permissions
- ⏳ Enhance User model
- ⏳ Create middleware

**Priority 2 (1 hour)**:
- ⏳ RoleContext provider
- ⏳ Permission guards
- ⏳ Role-based routing

**Priority 3 (6-8 hours)**:
- ⏳ Implement 6 dashboards
- ⏳ Role-specific components
- ⏳ Navigation menus

**Priority 4 (2 hours)**:
- ⏳ Testing
- ⏳ Polish
- ⏳ Documentation

---

**Total Estimated Time**: 13-15 hours
**Priority**: **CRITICAL** - Foundation for production security
**Dependencies**: 
- ✅ Backend auth service (100% complete)
- ✅ Frontend authService (100% complete)
- ✅ Dashboard service (100% complete)

---

**Generated by**: Senior Full-Stack Team  
**Date**: January 8, 2026  
**Document Version**: 2.0 - Complete 6-Role Hierarchy
**Status**: Design Complete - Ready for Implementation
