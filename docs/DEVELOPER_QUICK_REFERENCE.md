# Developer Quick Reference

**Last Updated**: Current Session
**For**: Web App + Admin Panel Frontend Development

---

## 🚀 Start Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend services running (localhost:8000/api/v1)

### Web App
```bash
cd d:\Project\ITQuty\imsquty\frontend\web-app
npm install
npm run dev
# → http://localhost:5173
```

### Admin Panel
```bash
cd d:\Project\ITQuty\imsquty\frontend\admin-panel
npm install
npm run dev
# → http://localhost:5174
```

---

## 📋 Common Tasks

### Create New Page
```tsx
// pages/YourPage.tsx
import React from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { Box, Paper, Typography } from '@mui/material'

const YourPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.yourSlice)

  return (
    <Box>
      <Typography variant="h5">Your Page Title</Typography>
      <Paper sx={{ p: 3 }}>
        {/* Content here */}
      </Paper>
    </Box>
  )
}

export default YourPage
```

### Create New API Service
```typescript
// api/yourService.ts
import client from './client'

export interface YourItem {
  id: number
  name: string
  // ... fields
}

export interface YourListResponse {
  success: boolean
  data: YourItem[]
  message: string
}

class YourService {
  async getItems(): Promise<YourListResponse> {
    const response = await client.get<YourListResponse>('/your-items')
    return response.data
  }

  async createItem(data: YourItem): Promise<YourListResponse> {
    const response = await client.post<YourListResponse>('/your-items', data)
    return response.data
  }

  // ... add other CRUD methods
}

export default new YourService()
```

### Create Redux Slice
```typescript
// store/slices/yourSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import yourService, { YourItem } from '../../api/yourService'

interface YourState {
  items: YourItem[]
  loading: boolean
  error: string | null
}

const initialState: YourState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchItems = createAsyncThunk(
  'your/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await yourService.getItems()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error')
    }
  },
)

const yourSlice = createSlice({
  name: 'your',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default yourSlice.reducer
```

### Use Redux in Component
```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchItems } from '../store/slices/yourSlice'

const YourComponent: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector((state) => state.your)

  useEffect(() => {
    dispatch(fetchItems())
  }, [dispatch])

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </>
  )
}
```

---

## 🎨 Material-UI Common Patterns

### Responsive Grid
```tsx
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    {/* xs=12: full width on mobile, sm=6: half width on tablet, md=4: third on desktop */}
  </Grid>
</Grid>
```

### Table with Actions
```tsx
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
        <TableCell>Column 1</TableCell>
        <TableCell>Column 2</TableCell>
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id} hover>
          <TableCell>{item.field1}</TableCell>
          <TableCell>{item.field2}</TableCell>
          <TableCell align="right">
            <IconButton onClick={() => handleEdit(item.id)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton onClick={() => handleDelete(item.id)} color="error">
              <Delete fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

### Form Fields
```tsx
<Stack spacing={2}>
  <TextField
    fullWidth
    label="Name"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    error={!!errors.name}
    helperText={errors.name}
  />
  <TextField
    fullWidth
    select
    label="Status"
    value={formData.status}
    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
    SelectProps={{ native: true }}
  >
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </TextField>
</Stack>
```

### Dialog/Modal
```tsx
<Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Dialog Title</DialogTitle>
  <DialogContent sx={{ pt: 2 }}>
    {/* Content here */}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
    <Button onClick={handleSave} variant="contained">Save</Button>
  </DialogActions>
</Dialog>
```

---

## 🔗 API Response Format

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Item Name"
  },
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "success": false,
  "data": null,
  "message": "Error message"
}
```

**List Response**:
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "message": "Success",
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 25,
      "last_page": 3
    }
  }
}
```

---

## 🧭 File Structure

### Web App
```
web-app/
├── src/
│   ├── api/              # API services
│   ├── store/            # Redux state
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   ├── App.tsx          # Main routing
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json
└── vite.config.ts
```

### Admin Panel
```
admin-panel/
├── src/
│   ├── api/             # API services
│   ├── store/           # Redux state
│   ├── pages/           # Admin pages
│   ├── components/      # Layout/components
│   ├── App.tsx         # Admin routing
│   ├── main.tsx        # React entry point
│   └── index.css       # Global styles
├── public/
├── package.json
└── vite.config.ts
```

---

## 🔐 Authentication

### Login Flow
1. User submits email/password on Login page
2. `login` action dispatches to authService.login()
3. API returns token + user data
4. Token stored in localStorage
5. Redux state updated (isAuthenticated = true)
6. App redirects to dashboard

### Protected Routes
```tsx
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}
```

### Request Interceptor
```typescript
// Auto-adds JWT token to every API request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Error Handling
```typescript
// Auto-redirects to login on 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
```

---

## 📊 Component Checklist

When creating new components:

- [ ] Use TypeScript types for all props
- [ ] Handle loading state (show CircularProgress)
- [ ] Handle error state (show Alert)
- [ ] Handle empty state (show "No data" message)
- [ ] Use custom hooks (useAppDispatch, useAppSelector)
- [ ] Add proper Material-UI styling
- [ ] Make responsive (Grid with xs/sm/md/lg)
- [ ] Add error validation on forms
- [ ] Show confirmation before delete
- [ ] Clear errors after successful action
- [ ] Disable buttons during loading
- [ ] Show success/error toast (if using toaster)
- [ ] Test with demo data

---

## 🐛 Debugging

### Redux DevTools
```bash
# Install Redux DevTools browser extension
# Then use in Chrome DevTools to inspect state/actions
```

### Console Logging
```typescript
// Log async thunk
export const myThunk = createAsyncThunk('...', async (arg, { rejectWithValue }) => {
  console.log('Starting:', arg)
  try {
    const response = await service.fetch()
    console.log('Success:', response)
    return response
  } catch (error) {
    console.error('Error:', error)
    return rejectWithValue(error)
  }
})
```

### API Testing
```bash
# Use Postman or curl to test API endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/assets
```

---

## 📝 Demo Credentials

```
Web App & Admin Panel:
Email: admin@example.com
Password: password
```

---

## 🚨 Common Errors

### "Cannot find module" Error
```bash
# Solution: Install dependencies
npm install
```

### "localStorage is not defined" Error
```typescript
// Solution: Check if running in browser
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value')
}
```

### "401 Unauthorized" Error
```typescript
// Solution: Token expired, need to login again
// This is handled automatically by interceptor → redirects to /login
```

### API call not working
```typescript
// Check:
1. Backend service running on correct port
2. Token in localStorage (use DevTools Application tab)
3. API endpoint path matches backend route
4. CORS configured correctly
5. Request body matches expected format
```

---

## 🎯 Next Steps (After Frontend Completion)

1. **Master Data Integration** - Add dropdown data from backend
2. **Form Validation** - Install react-hook-form + yup
3. **Pagination UI** - Add prev/next/go-to-page controls
4. **Search/Filter** - Add search input to list pages
5. **Mobile App** - Start Flutter app (Phase 10)
6. **E2E Tests** - Add Cypress tests
7. **Performance** - Optimize bundle size, lazy load pages
8. **Analytics** - Add dashboard charts + reporting

---

## 📚 Useful Links

- **React Docs**: https://react.dev
- **Redux Toolkit**: https://redux-toolkit.js.org
- **Material-UI**: https://mui.com
- **React Router**: https://reactrouter.com
- **TypeScript**: https://www.typescriptlang.org
- **Axios**: https://axios-http.com

---

**Happy Coding! 🚀**
