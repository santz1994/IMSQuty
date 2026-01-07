# Financial Service - Complete Implementation Guide

## Overview

The **Financial Service** is a comprehensive microservice for managing financial operations in the IMSQUTY ecosystem. It provides complete invoice management, budget tracking, expense management with approval workflows, and financial analytics.

### Key Features

- **Invoice Management**: Create, track, and manage customer invoices with payment tracking
- **Budget Management**: Allocate and monitor budgets with utilization tracking
- **Expense Management**: Track expenses against budgets with approval workflow
- **Budget Alerts**: Automated alerts for over-budget, near-limit, and under-utilized budgets
- **Financial Analytics**: Comprehensive analytics by category, vendor, and time period
- **Approval Workflows**: Structured approval process for expense validation
- **Auto-Calculations**: Automatic total calculations and budget tracking

---

## Architecture

### Database Schema

#### 1. Invoices Table
```sql
- id (PK)
- invoice_number (unique)
- customer_name
- customer_email
- customer_phone
- amount (decimal)
- tax (decimal)
- total (decimal)
- due_date
- paid_date (nullable)
- status (Draft, Pending, Paid, Overdue, Cancelled)
- notes (text)
- created_by, updated_by
- timestamps, soft_deletes
```

#### 2. Budgets Table
```sql
- id (PK)
- name
- category
- allocated_amount (decimal)
- spent_amount (decimal, default: 0)
- period_start
- period_end
- is_active (boolean, default: true)
- created_by, updated_by
- timestamps, soft_deletes
```

#### 3. Expenses Table
```sql
- id (PK)
- budget_id (FK → budgets.id)
- category
- description
- amount (decimal)
- expense_date
- receipt_number (nullable)
- vendor (nullable)
- status (Pending, Approved, Rejected, Paid)
- approved_by (nullable)
- approved_at (nullable)
- notes (nullable, for rejection reasons)
- created_by, updated_by
- timestamps, soft_deletes
```

### Relationships
- **Budget** `hasMany` **Expenses**
- **Expense** `belongsTo` **Budget**

---

## API Endpoints

### Base URL
```
http://localhost:8005/api/v1
```

### Authentication
All endpoints require authentication via Laravel Sanctum:
```
Authorization: Bearer {token}
```

---

## Invoice Management (6 Endpoints)

### 1. List Invoices
```http
GET /invoices
```

**Query Parameters:**
- `status` - Filter by status (Draft, Pending, Paid, Overdue, Cancelled)
- `search` - Search invoice_number, customer_name, customer_email
- `overdue` - Filter overdue invoices (boolean)
- `per_page` - Results per page (default: 15)

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "invoice_number": "INV-2024-001",
        "customer_name": "PT ABC Company",
        "customer_email": "finance@abc.com",
        "customer_phone": "+62812345678",
        "amount": 10000000,
        "tax": 1000000,
        "total": 11000000,
        "remaining_amount": 11000000,
        "is_overdue": false,
        "due_date": "2024-02-15T00:00:00.000000Z",
        "paid_date": null,
        "status": "Pending",
        "notes": "First invoice of 2024",
        "created_by": 1,
        "updated_by": 1,
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z"
      }
    ],
    "per_page": 15,
    "total": 50
  }
}
```

### 2. Show Invoice
```http
GET /invoices/{invoice}
```

**Response:** Single invoice object (same structure as list)

### 3. Create Invoice
```http
POST /invoices
```

**Request Body:**
```json
{
  "invoice_number": "INV-2024-002",
  "customer_name": "PT XYZ Corp",
  "customer_email": "billing@xyz.com",
  "customer_phone": "+62812345679",
  "amount": 15000000,
  "tax": 1500000,
  "due_date": "2024-03-01",
  "status": "Draft",
  "notes": "Q1 2024 services"
}
```

**Validation Rules:**
- `invoice_number` - required, unique, max:50
- `customer_name` - required, max:255
- `customer_email` - required, email, max:255
- `amount` - required, numeric, min:0
- `tax` - nullable, numeric, min:0
- `due_date` - required, date, after:today
- `status` - nullable, in:Draft,Pending,Paid,Overdue,Cancelled

**Business Logic:**
- Total auto-calculated: `total = amount + tax`
- Default status: `Pending`

### 4. Update Invoice
```http
PUT /invoices/{invoice}
```

**Request Body:** Same as create (all fields optional)

**Business Logic:**
- Total recalculated if amount or tax changed
- Auto-marks as Overdue if past due date

### 5. Delete Invoice
```http
DELETE /invoices/{invoice}
```

**Response:**
```json
{
  "status": "success",
  "message": "Invoice deleted successfully"
}
```

### 6. Mark Invoice as Paid
```http
POST /invoices/{invoice}/pay
```

**Request Body:**
```json
{
  "paid_date": "2024-01-20"  // optional, defaults to today
}
```

**Response:** Updated invoice with status = "Paid"

---

## Budget Management (6 Endpoints)

### 1. List Budgets
```http
GET /budgets
```

**Query Parameters:**
- `category` - Filter by category
- `is_active` - Filter by active status (boolean)
- `search` - Search name, category
- `per_page` - Results per page (default: 15)

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Q1 2024 Marketing Budget",
        "category": "Marketing",
        "allocated_amount": 50000000,
        "spent_amount": 25000000,
        "remaining_amount": 25000000,
        "utilization_percentage": 50.00,
        "period_start": "2024-01-01T00:00:00.000000Z",
        "period_end": "2024-03-31T00:00:00.000000Z",
        "is_active": true,
        "expenses_count": 15,
        "created_by": 1,
        "updated_by": 1,
        "created_at": "2024-01-01T08:00:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z"
      }
    ],
    "per_page": 15,
    "total": 20
  }
}
```

### 2. Show Budget
```http
GET /budgets/{budget}
```

**Response:** Single budget with expenses relationship loaded

### 3. Create Budget
```http
POST /budgets
```

**Request Body:**
```json
{
  "name": "Q2 2024 IT Budget",
  "category": "IT",
  "allocated_amount": 100000000,
  "period_start": "2024-04-01",
  "period_end": "2024-06-30",
  "is_active": true
}
```

**Validation Rules:**
- `name` - required, max:255
- `category` - required, max:100
- `allocated_amount` - required, numeric, min:0
- `period_start` - required, date
- `period_end` - required, date, after:period_start
- `is_active` - nullable, boolean

**Business Logic:**
- `spent_amount` initialized to 0
- `is_active` defaults to true

### 4. Update Budget
```http
PUT /budgets/{budget}
```

**Request Body:** Same as create (all fields optional)

### 5. Delete Budget
```http
DELETE /budgets/{budget}
```

### 6. Budget Utilization Report
```http
GET /budgets/{budget}/utilization
```

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "budget_id": 1,
    "name": "Q1 2024 Marketing Budget",
    "allocated_amount": 50000000,
    "spent_amount": 25000000,
    "remaining_amount": 25000000,
    "utilization_percentage": 50.00,
    "is_over_budget": false,
    "is_near_limit": false,
    "total_expenses": 15,
    "approved_expenses": 12,
    "pending_expenses": 3,
    "period_start": "2024-01-01",
    "period_end": "2024-03-31"
  }
}
```

---

## Expense Management (7 Endpoints)

### 1. List Expenses
```http
GET /expenses
```

**Query Parameters:**
- `budget_id` - Filter by budget
- `status` - Filter by status (Pending, Approved, Rejected, Paid)
- `category` - Filter by category
- `search` - Search description, vendor, receipt_number
- `per_page` - Results per page (default: 15)

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "budget_id": 1,
        "category": "Advertising",
        "description": "Google Ads Campaign Jan 2024",
        "amount": 5000000,
        "expense_date": "2024-01-10T00:00:00.000000Z",
        "receipt_number": "RCP-001",
        "vendor": "Google Inc.",
        "status": "Approved",
        "approved_by": 2,
        "approved_at": "2024-01-12T09:15:00.000000Z",
        "budget": {
          "id": 1,
          "name": "Q1 2024 Marketing Budget",
          "category": "Marketing"
        },
        "created_by": 1,
        "updated_by": 2,
        "created_at": "2024-01-10T14:20:00.000000Z",
        "updated_at": "2024-01-12T09:15:00.000000Z"
      }
    ],
    "per_page": 15,
    "total": 120
  }
}
```

### 2. Show Expense
```http
GET /expenses/{expense}
```

### 3. Create Expense
```http
POST /expenses
```

**Request Body:**
```json
{
  "budget_id": 1,
  "category": "Software",
  "description": "Adobe Creative Cloud Annual License",
  "amount": 7500000,
  "expense_date": "2024-01-15",
  "receipt_number": "RCP-002",
  "vendor": "Adobe Systems",
  "status": "Pending"
}
```

**Validation Rules:**
- `budget_id` - required, integer, exists:budgets
- `category` - required, max:100
- `description` - required, max:500
- `amount` - required, numeric, min:0
- `expense_date` - required, date, before_or_equal:today
- `receipt_number` - nullable, max:50
- `vendor` - nullable, max:255
- `status` - nullable, in:Pending,Approved,Rejected,Paid

**Business Logic:**
- Validates budget exists and is active
- Checks if expense would exceed budget (allows 10% overflow)
- Default status: `Pending`
- Returns `null` if validation fails

### 4. Update Expense
```http
PUT /expenses/{expense}
```

**Business Logic:**
- If approved expense amount changes, adjusts budget `spent_amount`

### 5. Delete Expense
```http
DELETE /expenses/{expense}
```

**Business Logic:**
- If expense was approved, decreases budget `spent_amount`

### 6. Approve Expense
```http
POST /expenses/{expense}/approve
```

**Request Body:**
```json
{
  "approved_by": 2  // optional, defaults to authenticated user
}
```

**Response:** Updated expense with status = "Approved"

**Business Logic:**
- Only pending expenses can be approved
- Updates status, approved_by, approved_at
- Increments budget `spent_amount`

### 7. Reject Expense
```http
POST /expenses/{expense}/reject
```

**Request Body:**
```json
{
  "reason": "Invoice amount exceeds approved budget category"
}
```

**Response:** Updated expense with status = "Rejected"

**Business Logic:**
- Only pending expenses can be rejected
- Stores reason in notes field

---

## Financial Reports (3 Endpoints)

### 1. Financial Summary
```http
GET /financial-summary
```

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "total_invoices": 150,
    "pending_invoices": 35,
    "overdue_invoices": 8,
    "total_budgets": 25,
    "active_budgets": 20,
    "total_expenses": 380,
    "pending_expenses": 45,
    "total_invoice_amount": 2500000000,
    "total_budget_amount": 1500000000,
    "total_spent_amount": 850000000
  }
}
```

### 2. Budget Alerts
```http
GET /budget-alerts
```

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "over_budget": [
      {
        "id": 3,
        "name": "Emergency IT Repairs",
        "allocated_amount": 10000000,
        "spent_amount": 12500000,
        "over_by": 2500000,
        "utilization_percentage": 125.00
      }
    ],
    "near_limit": [
      {
        "id": 5,
        "name": "Q1 Training Budget",
        "allocated_amount": 20000000,
        "spent_amount": 18000000,
        "remaining": 2000000,
        "utilization_percentage": 90.00
      }
    ],
    "under_utilized": [
      {
        "id": 8,
        "name": "2023 Q4 Marketing",
        "allocated_amount": 50000000,
        "spent_amount": 15000000,
        "remaining": 35000000,
        "utilization_percentage": 30.00
      }
    ]
  }
}
```

**Alert Thresholds:**
- **Over Budget**: Utilization > 100%
- **Near Limit**: Utilization >= 80%
- **Under Utilized**: Utilization < 50% AND past period_end

### 3. Expense Analytics
```http
GET /expense-analytics
```

**Query Parameters:**
- `period` - Time period (month, quarter, year)

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "total_expenses": 380,
    "total_amount": 850000000,
    "average_expense": 2236842.11,
    "by_category": [
      {
        "category": "Software",
        "total": 250000000,
        "count": 85,
        "average": 2941176.47
      },
      {
        "category": "Hardware",
        "total": 180000000,
        "count": 45,
        "average": 4000000.00
      }
    ],
    "top_vendors": [
      {
        "vendor": "Microsoft Corporation",
        "total": 125000000,
        "count": 28
      },
      {
        "vendor": "Dell Technologies",
        "total": 95000000,
        "count": 18
      }
    ]
  }
}
```

---

## Business Logic Details

### Auto-Calculations

#### Invoice Total Calculation
```php
$total = $amount + $tax;
```

#### Budget Utilization
```php
$utilization_percentage = ($spent_amount / $allocated_amount) * 100;
$remaining_amount = $allocated_amount - $spent_amount;
```

### Budget Validation

When creating an expense:
1. **Check Budget Exists**: Validates `budget_id` exists
2. **Check Budget Active**: Only active budgets can receive new expenses
3. **Check Budget Capacity**: Allows up to 110% utilization (10% overflow)
   ```php
   if ($budget->spent_amount + $expense->amount > $budget->allocated_amount * 1.1) {
       return null; // Exceeds budget + 10% overflow
   }
   ```

### Approval Workflow

#### Expense Approval
1. Expense must be in `Pending` status
2. Updates status to `Approved`
3. Records `approved_by` and `approved_at`
4. Increments budget `spent_amount`

#### Expense Rejection
1. Expense must be in `Pending` status
2. Updates status to `Rejected`
3. Stores rejection reason in `notes`
4. Does NOT update budget `spent_amount`

### Amount Adjustments

#### Update Approved Expense Amount
```php
$oldAmount = $expense->amount;
$newAmount = $data['amount'];
$difference = $newAmount - $oldAmount;

$budget->spent_amount += $difference;
```

#### Delete Approved Expense
```php
if ($expense->status === 'Approved') {
    $budget->spent_amount -= $expense->amount;
}
```

---

## Error Handling

### Common Error Responses

#### 404 Not Found
```json
{
  "status": "error",
  "message": "Invoice not found"
}
```

#### 422 Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "invoice_number": ["The invoice number has already been taken."],
    "due_date": ["The due date must be a date after today."]
  }
}
```

#### 400 Bad Request
```json
{
  "status": "error",
  "message": "Expense exceeds budget capacity (including 10% overflow allowance)"
}
```

---

## Integration with Other Services

### Auth Service
- Uses Sanctum tokens for authentication
- Validates user permissions for approval operations
- Tracks `created_by` and `updated_by` from auth context

### Notification Service
- Can trigger notifications on:
  - Invoice overdue
  - Budget near limit (>=80%)
  - Budget over budget (>100%)
  - Expense approval/rejection
  - Large expense creation (>threshold)

### Reporting Service
- Provides financial data for comprehensive reports
- Exports budget utilization trends
- Generates expense analytics by period

### User Service
- Links `approved_by` to user profiles
- Validates approver has Manager role or higher

---

## Testing Guide

### Unit Tests
```bash
cd services/financial-service
php artisan test --testsuite=Unit
```

**Coverage:**
- Model relationships
- Model scopes (pending, overdue, active)
- Computed properties (remaining_amount, utilization_percentage, is_overdue)
- Repository methods
- Service business logic

### Feature Tests
```bash
php artisan test --testsuite=Feature
```

**Coverage:**
- All 22 API endpoints
- Validation rules
- Authorization checks
- Business logic workflows
- Error responses

### Test Data
```bash
php artisan db:seed --class=FinancialSeeder
```

Creates sample data:
- 50 invoices (various statuses)
- 10 budgets (various categories)
- 100 expenses (various statuses and budgets)

---

## Security Considerations

### Authentication
- All endpoints require valid Sanctum token
- Token must be included in `Authorization: Bearer {token}` header

### Authorization
- Create/Update/Delete operations: Requires authenticated user
- Approve Expense: Should require Manager role or higher (implement in middleware)
- View operations: All authenticated users

### Data Validation
- All inputs validated via Request classes
- SQL injection prevented via Eloquent ORM
- XSS prevented via resource transformations

### Audit Trail
- All create/update operations record `created_by` / `updated_by`
- Soft deletes preserve data history
- Timestamps track all changes

---

## Performance Optimization

### Database Indexes
```sql
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_budgets_is_active ON budgets(is_active);
CREATE INDEX idx_budgets_category ON budgets(category);
CREATE INDEX idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
```

### Query Optimization
- Eager loading relationships: `with('budget')`, `with('expenses')`
- Pagination on all list endpoints
- Search queries use indexed columns
- Analytics use aggregate functions

### Caching Strategy
```php
// Cache financial summary (5 minutes)
Cache::remember('financial_summary', 300, function() {
    return $this->getFinancialSummary();
});

// Cache budget alerts (10 minutes)
Cache::remember('budget_alerts', 600, function() {
    return $this->getBudgetAlerts();
});
```

---

## Troubleshooting

### Common Issues

#### 1. Invoice Total Mismatch
**Problem:** Total doesn't match amount + tax
**Solution:** Total auto-calculated, don't manually set total in request

#### 2. Expense Creation Fails
**Problem:** "Budget validation failed"
**Causes:**
- Budget doesn't exist
- Budget is inactive (`is_active = false`)
- Expense would exceed budget + 10% overflow
**Solution:** Check budget status and capacity

#### 3. Approval Fails
**Problem:** "Cannot approve expense"
**Causes:**
- Expense not in Pending status
- Already approved or rejected
**Solution:** Only pending expenses can be approved

#### 4. Budget Spent Amount Incorrect
**Problem:** spent_amount doesn't match sum of approved expenses
**Solution:** Run budget recalculation:
```php
$budget->spent_amount = $budget->expenses()
    ->where('status', 'Approved')
    ->sum('amount');
$budget->save();
```

---

## Maintenance

### Regular Tasks

#### Daily
- Check overdue invoices
- Monitor budget alerts
- Review pending expense approvals

#### Weekly
- Budget utilization reports
- Expense analytics review
- Under-utilized budget identification

#### Monthly
- Archive paid invoices (>90 days)
- Close expired budgets
- Generate financial summary reports

#### Quarterly
- Database optimization (indexes, vacuum)
- Review and archive old expenses
- Performance audit

---

## Changelog

### Version 1.0.0 (2024-01-15)
- ✅ Initial release
- ✅ Invoice management (6 endpoints)
- ✅ Budget management (6 endpoints)
- ✅ Expense management (7 endpoints)
- ✅ Financial reports (3 endpoints)
- ✅ Budget alert system
- ✅ Expense approval workflow
- ✅ Auto-calculations
- ✅ Comprehensive validation
- ✅ Resource transformers
- ✅ Search and filtering
- ✅ 22 API endpoints total
- ✅ 0 errors

---

## Support

For issues or questions:
- **Documentation**: /docs/FINANCIAL_SERVICE_COMPLETE.md
- **API Gateway**: http://localhost:3000
- **Service Health**: http://localhost:8005/api/v1/health

---

## License

Internal IMSQUTY project - All rights reserved
