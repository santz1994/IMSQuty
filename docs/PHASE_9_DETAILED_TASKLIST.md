# PHASE 9 - FORM VALIDATION + PAGINATION + ADMIN

**Phase**: 9 - Advanced UI Features  
**Status**: 🔴 NOT STARTED (Ready to begin)  
**Estimated Duration**: 12-17 hours (2-3 sessions)  
**Timeline**: After Phase 8 completion  

---

## 🎯 PHASE 9 OBJECTIVES

1. **Form Validation Framework** - react-hook-form + yup validation
2. **Pagination UI Controls** - prev/next buttons, page indicator, items-per-page
3. **Admin Panel Pages** - Settings, Audit Logs, Roles & Permissions
4. **Testing Infrastructure** - E2E (Cypress) + Unit tests (Jest)

---

## 📋 DETAILED TASKS & TIMELINE

### TASK 1: Form Validation Framework (2-3 hours) ⭐ PRIORITY 1

#### 1.1 - Install Dependencies (30 min)
```bash
cd d:\Project\ITQuty\imsquty\frontend\web-app
npm install react-hook-form yup
npm install --save-dev @types/yup
```

**Verify Installation**:
- [x] Check package.json has both packages
- [x] Check node_modules has both packages

#### 1.2 - Create FormField Component (30 min)
**File**: `frontend/web-app/src/components/FormField.tsx`
**Purpose**: Reusable form field wrapper with error display

**Features**:
- [ ] Text input with label
- [ ] Error message display (red text)
- [ ] Disabled state (during submit)
- [ ] Optional asterisk for required fields
- [ ] Consistent Material-UI styling
- [ ] Support for different input types (text, email, password, etc.)

**Example Code Structure**:
```typescript
interface FormFieldProps {
  label: string
  error?: string
  disabled?: boolean
  required?: boolean
  ...inputProps
}

export const FormField: React.FC<FormFieldProps> = ({
  label, error, disabled, required, ...props
}) => (
  <FormControl fullWidth error={!!error} disabled={disabled}>
    <TextField
      label={`${label}${required ? ' *' : ''}`}
      {...props}
    />
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
)
```

#### 1.3 - Create Asset Form Hook (45 min)
**File**: `frontend/web-app/src/hooks/useAssetForm.ts`
**Purpose**: Encapsulate asset form validation logic

**Validation Schema**:
```typescript
const assetValidationSchema = yup.object({
  asset_tag: yup.string().required('Asset tag is required'),
  name: yup.string().required('Asset name is required'),
  serial_number: yup.string().required('Serial number is required'),
  division_id: yup.number().required('Division is required'),
  location_id: yup.number().required('Location is required'),
  purchase_date: yup.date().optional(),
  warranty_months: yup.number().min(0).optional(),
  notes: yup.string().optional(),
})
```

**Hook Exports**:
- [ ] `useAssetForm()` - returns form methods and helpers
- [ ] `register` - from react-hook-form
- [ ] `handleSubmit` - form submission handler
- [ ] `formState.errors` - validation errors
- [ ] `isSubmitting` - during API call

#### 1.4 - Integrate into Asset Pages (45 min)
**Files to Update**:
- [ ] `frontend/web-app/src/pages/Assets/AssetCreate.tsx`
  - Replace current form with react-hook-form
  - Add validation messages display
  - Disable submit button during loading
  - Show field-level errors
  
- [ ] `frontend/web-app/src/pages/Assets/AssetDetail.tsx`
  - Add validation only in edit mode
  - Keep view mode read-only
  - Same error handling as Create

**Changes**:
```typescript
const { register, handleSubmit, formState: { errors, isSubmitting } } = useAssetForm()

<FormField
  label="Asset Tag"
  error={errors.asset_tag?.message}
  disabled={isSubmitting}
  {...register('asset_tag')}
/>
```

#### 1.5 - Create Ticket Form Hook (45 min)
**File**: `frontend/web-app/src/hooks/useTicketForm.ts`

**Validation Schema**:
```typescript
const ticketValidationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().required('Priority is required'),
  status: yup.string().required('Status is required'),
  assigned_to: yup.number().optional(),
})
```

#### 1.6 - Integrate into Ticket Pages (45 min)
**Files to Update**:
- [ ] `frontend/web-app/src/pages/Tickets/TicketCreate.tsx`
- [ ] `frontend/web-app/src/pages/Tickets/TicketDetail.tsx` (edit mode)

**Expected Result**: Same as Asset pages - field validation + error display

---

### TASK 2: Pagination UI Controls (1.5-2 hours) ⭐ PRIORITY 2

#### 2.1 - Create PaginationControls Component (45 min)
**File**: `frontend/web-app/src/components/PaginationControls.tsx`

**Props**:
```typescript
interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage: number
  onItemsPerPageChange: (perPage: number) => void
  totalItems: number
}
```

**UI Elements**:
- [ ] Previous button (disabled on page 1)
- [ ] Page number display ("Page X of Y")
- [ ] Next button (disabled on last page)
- [ ] Items-per-page select (10, 20, 50, 100)
- [ ] Total items display ("Showing X-Y of Z")
- [ ] Responsive layout (stacks on mobile)

**Example Layout**:
```
[Previous] Page 1 of 5 [Next] | Items per page: [20 ▼] | Showing 1-20 of 87 items
```

#### 2.2 - Update Redux Slices (30 min)
**Files to Update**:
- [ ] `frontend/web-app/src/store/slices/assetSlice.ts`
- [ ] `frontend/web-app/src/store/slices/ticketSlice.ts`

**Add to State**:
```typescript
pagination: {
  page: 1
  perPage: 20
  total: 0
}
```

**Update Thunks**:
```typescript
export const fetchAssets = createAsyncThunk(
  'asset/fetchAssets',
  async ({ page, perPage }: { page: number; perPage: number }) => {
    const response = await assetService.getAssets(page, perPage)
    return response.data
  }
)
```

#### 2.3 - Integrate into List Pages (45 min)
**Files to Update**:
- [ ] `frontend/web-app/src/pages/Assets/AssetList.tsx`
- [ ] `frontend/web-app/src/pages/Tickets/TicketList.tsx`

**Changes**:
- [ ] Add useState for pagination state
- [ ] Dispatch thunk with page + perPage params
- [ ] Render PaginationControls component
- [ ] Update displayed data based on pagination
- [ ] Remember user's items-per-page selection (optional: localStorage)

**Example Code**:
```typescript
const [page, setPage] = useState(1)
const [perPage, setPerPage] = useState(20)

useEffect(() => {
  dispatch(fetchAssets({ page, perPage }))
}, [page, perPage, dispatch])

const handlePageChange = (newPage: number) => setPage(newPage)
const handlePerPageChange = (newPerPage: number) => {
  setPerPage(newPerPage)
  setPage(1) // Reset to page 1
}

return (
  <>
    <PaginationControls
      currentPage={page}
      totalPages={Math.ceil(assets.pagination.total / perPage)}
      onPageChange={handlePageChange}
      itemsPerPage={perPage}
      onItemsPerPageChange={handlePerPageChange}
      totalItems={assets.pagination.total}
    />
  </>
)
```

---

### TASK 3: Admin Panel Pages (3-4 hours) 🟡 PRIORITY 3

#### 3.1 - System Settings Page (1.5 hours)
**File**: `frontend/admin-panel/src/pages/SystemSettings.tsx` (Replace stub)

**Features**:
- [ ] Database backup configuration
  - [ ] Backup schedule selector (daily, weekly, monthly)
  - [ ] Retention period (in days)
  - [ ] Manual backup button
  - [ ] Last backup display + status
  
- [ ] Email configuration
  - [ ] SMTP server address
  - [ ] SMTP port
  - [ ] Email address (from)
  - [ ] Send test email button
  
- [ ] Security settings
  - [ ] Password expiration policy (days)
  - [ ] Login attempt limit
  - [ ] Session timeout (minutes)
  - [ ] 2FA enabled toggle
  
- [ ] Save button with success/error toast

**API Endpoints** (assume these exist):
- GET /admin/settings
- POST /admin/settings
- POST /admin/settings/test-email

#### 3.2 - Audit Logs Page (1.5 hours)
**File**: `frontend/admin-panel/src/pages/AuditLogs.tsx` (Replace stub)

**Features**:
- [ ] Audit log table with columns:
  - User who performed action
  - Action type (CREATE, READ, UPDATE, DELETE)
  - Entity type (Asset, Ticket, User, etc.)
  - Entity ID
  - Timestamp
  - IP Address (optional)
  - Changes summary
  
- [ ] Filters:
  - [ ] Date range picker (from/to)
  - [ ] User filter (multi-select)
  - [ ] Action type filter (multi-select)
  - [ ] Entity type filter (multi-select)
  
- [ ] Search:
  - [ ] By entity ID
  - [ ] By user email
  
- [ ] Export button (CSV)
- [ ] Pagination (20 items/page)

**API Endpoints**:
- GET /admin/audit-logs (with filters + search)
- GET /admin/audit-logs/export

#### 3.3 - Roles & Permissions Page (1 hour)
**File**: `frontend/admin-panel/src/pages/RolesPermissions.tsx` (Replace stub)

**Features**:
- [ ] Role list table:
  - Role name
  - Description
  - Number of users
  - Actions (Edit, Delete)
  
- [ ] Create Role button → Dialog:
  - [ ] Role name input
  - [ ] Description input
  - [ ] Permissions checklist (Auth, Read Assets, Create Assets, etc.)
  - [ ] Cancel + Save buttons
  
- [ ] Edit Role:
  - [ ] Same form as Create
  - [ ] Pre-populate current values
  - [ ] Show warning if role has users
  
- [ ] Delete Role:
  - [ ] Confirmation dialog
  - [ ] Show users with this role (warning if >0)
  - [ ] Allow only if no users assigned

**API Endpoints**:
- GET /admin/roles
- POST /admin/roles
- GET /admin/roles/:id
- PUT /admin/roles/:id
- DELETE /admin/roles/:id

---

### TASK 4: Testing Infrastructure (6-8 hours) 🔵 PRIORITY 4

#### 4.1 - E2E Tests with Cypress (4 hours)

**Setup**:
```bash
npm install --save-dev cypress cypress-testing-library
npx cypress open
```

**Test Scenarios** (Create in `cypress/e2e/`):

1. **Authentication Flow** (30 min)
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials (error shown)
   - [ ] Logout clears session
   - [ ] Protected route redirects to login

2. **Asset Management** (1 hour)
   - [ ] View asset list
   - [ ] Create new asset (form validation works)
   - [ ] View asset detail
   - [ ] Edit asset (save changes)
   - [ ] Delete asset (confirmation works)
   - [ ] Search asset by name/tag
   - [ ] Filter asset by status

3. **Ticket Management** (1 hour)
   - [ ] View ticket list
   - [ ] Create new ticket
   - [ ] View ticket detail
   - [ ] Edit ticket
   - [ ] Delete ticket
   - [ ] Search ticket by number/title
   - [ ] Filter ticket by priority

4. **Error Scenarios** (30 min)
   - [ ] Network error handled gracefully
   - [ ] 404 error shows message
   - [ ] 500 error shows message
   - [ ] Timeout handled

#### 4.2 - Unit Tests with Jest (2-4 hours)

**Setup**:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Test Files** (Create in `src/__tests__/`):

1. **Redux Slices** (1 hour)
   - [ ] assetSlice reducers (add, update, remove)
   - [ ] assetSlice thunks (fetchAssets success/error)
   - [ ] divisionSlice similar tests

2. **Components** (1 hour)
   - [ ] SearchFilter renders correctly
   - [ ] SearchFilter filters data correctly
   - [ ] FormField shows error message
   - [ ] PaginationControls buttons work

3. **Services** (1-2 hours)
   - [ ] assetService.getAssets() returns correct data
   - [ ] Error handling in services
   - [ ] JWT interceptor works

---

## 📊 PHASE 9 TIMELINE

```
Day 1 (4 hours):
├─ Task 1.1-1.2: Install dependencies + FormField component (1 hour)
├─ Task 1.3-1.4: Asset form hooks + integration (1.5 hours)
├─ Task 1.5-1.6: Ticket form hooks + integration (1.5 hours)

Day 2 (4 hours):
├─ Task 2.1-2.2: Pagination UI + Redux update (1.5 hours)
├─ Task 2.3: List page integration (1.5 hours)
├─ Task 3.1-3.3: Admin pages (System, Audit, Roles) (1 hour)

Day 3 (4-9 hours - optional):
├─ Task 4.1: E2E tests (Cypress) (4 hours)
└─ Task 4.2: Unit tests (Jest) (2-4 hours)
```

**Recommended Priority**:
1. ✅ Form Validation (critical for UX)
2. ✅ Pagination (important for data management)
3. 🟡 Admin Pages (nice to have)
4. 🔵 Testing (can be deferred to Phase 10)

---

## ✅ PHASE 9 SIGN-OFF CRITERIA

### Must Have (All required for Phase 9 completion)
- [x] All form fields have validation
- [x] Error messages display correctly
- [x] Submit buttons disabled during loading
- [x] Pagination controls working
- [x] Page changes fetch correct data
- [x] Items-per-page selector works

### Should Have
- [x] Admin Settings page functional
- [x] Admin Audit Logs page functional
- [x] Admin Roles page functional
- [x] E2E tests covering main flows
- [x] Unit tests for critical functions

### Nice to Have
- [ ] Component snapshots tests
- [ ] Visual regression tests
- [ ] Performance benchmarks
- [ ] Accessibility audit (a11y)

---

## 📞 SUPPORT

**Questions about Phase 9?**  
→ Reference: [PHASE_8_COMPLETE_SIGN_OFF.md](PHASE_8_COMPLETE_SIGN_OFF.md)

**How to run current code?**  
→ Reference: [PHASE_8_QUICK_START.md](PHASE_8_QUICK_START.md)

**Need code examples?**  
→ Reference: [PHASE_8_IMPLEMENTATION_COMPLETE.md](PHASE_8_IMPLEMENTATION_COMPLETE.md)

---

## 🎯 EXPECTED DELIVERABLES

After Phase 9 completion:

✅ **Form Validation**:
- All forms with field-level validation
- Clear error messages for each field
- Submit disabled during loading
- Success messages after save

✅ **Pagination**:
- Previous/Next button navigation
- Page indicator (Page X of Y)
- Items-per-page selector
- Total items count

✅ **Admin Pages**:
- System Settings (database, email, security)
- Audit Logs (searchable, filterable, exportable)
- Roles & Permissions (CRUD operations)

✅ **Testing**:
- E2E test coverage (main user flows)
- Unit test coverage (>70% critical code)
- Automated test suite in CI/CD

---

**Created**: December 29, 2025  
**Phase**: 9 - Form Validation + Pagination + Admin  
**Status**: 🔴 READY TO BEGIN  
**Prerequisites**: Phase 8 complete (✅ already done)

