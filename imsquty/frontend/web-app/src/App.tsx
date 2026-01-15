import { Box, CircularProgress } from '@mui/material'
import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import DashboardLayout from './components/layouts/DashboardLayout'
import Login from './pages/Login'
import RoomLCDDisplay, { AllRoomsLCDDisplay } from './pages/MeetingRooms/RoomLCDDisplay'
import { useAppSelector } from './store/hooks'

// Lazy load all page components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AssetList = lazy(() => import('./pages/Assets/AssetList'))
const AssetCreate = lazy(() => import('./pages/Assets/AssetCreate'))
const AssetDetail = lazy(() => import('./pages/Assets/AssetDetail'))
const TicketList = lazy(() => import('./pages/Tickets/TicketList'))
const TicketCreate = lazy(() => import('./pages/Tickets/TicketCreate'))
const TicketDetail = lazy(() => import('./pages/Tickets/TicketDetail'))
const SLADashboard = lazy(() => import('./pages/Tickets/SLADashboard'))
const ReportsList = lazy(() => import('./pages/Reports/ReportsList'))
const InventoryList = lazy(() => import('./pages/Inventory/InventoryList'))
const FinancialList = lazy(() => import('./pages/Financial/FinancialList'))
const NotificationsList = lazy(() => import('./pages/Notifications/NotificationsList'))
const BookingForm = lazy(() => import('./pages/MeetingRooms/BookingForm'))
const BookingsList = lazy(() => import('./pages/MeetingRooms/BookingsList'))
const ApprovalDashboard = lazy(() => import('./pages/MeetingRooms/ApprovalDashboard'))
const ReceptionistView = lazy(() => import('./pages/MeetingRooms/ReceptionistView'))
const AuditLogsList = lazy(() => import('./pages/AuditLogs/AuditLogsList'))
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'))
const DailyActivities = lazy(() => import('./pages/Admin/DailyActivities'))

// Role-based dashboards
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/SuperAdminDashboard'))
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'))
const DirectorDashboard = lazy(() => import('./pages/Director/DirectorDashboard'))
const ManagerDashboard = lazy(() => import('./pages/Manager/ManagerDashboard'))
const HRDashboard = lazy(() => import('./pages/HR/HRDashboard'))
const UserDashboard = lazy(() => import('./pages/User/UserDashboard'))
const KPIDashboard = lazy(() => import('./pages/KPI/KPIDashboard'))

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    }}
  >
    <CircularProgress />
  </Box>
)

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/**
 * ProtectedDashboardRoute - Reusable wrapper for protected routes with dashboard layout
 * Eliminates 60% of JSX duplication
 */
const ProtectedDashboardRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
)

// Wrapper component for LCD display with roomId from URL params
const RoomLCDDisplayWrapper: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  return <RoomLCDDisplay roomId={Number(roomId)} />
}

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        <Route
          path="/"
          element={
            <ProtectedDashboardRoute>
              <Dashboard />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/assets"
          element={
            <ProtectedDashboardRoute>
              <AssetList />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/assets/create"
          element={
            <ProtectedDashboardRoute>
              <AssetCreate />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/assets/:id"
          element={
            <ProtectedDashboardRoute>
              <AssetDetail />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedDashboardRoute>
              <TicketList />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/tickets/create"
          element={
            <ProtectedDashboardRoute>
              <TicketCreate />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <ProtectedDashboardRoute>
              <TicketDetail />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/tickets/sla/dashboard"
          element={
            <ProtectedDashboardRoute>
              <SLADashboard />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedDashboardRoute>
              <InventoryList />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/financial"
          element={
            <ProtectedDashboardRoute>
              <FinancialList />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedDashboardRoute>
              <ReportsList />
            </ProtectedDashboardRoute>
          }
        />

        {/* User Booking Module Routes - A.1 Implementation */}
        <Route
          path="/meeting-room-bookings"
          element={
            <ProtectedDashboardRoute>
              <BookingsList />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/meeting-room-bookings/create"
          element={
            <ProtectedDashboardRoute>
              <BookingForm />
            </ProtectedDashboardRoute>
          }
        />

        {/* Director Approval Dashboard Routes - A.2 Implementation */}
        <Route
          path="/meeting-room-bookings/approvals"
          element={
            <ProtectedDashboardRoute>
              <ApprovalDashboard />
            </ProtectedDashboardRoute>
          }
        />

        {/* Receptionist View Routes - A.3 Implementation */}
        <Route
          path="/meeting-room-bookings/receptionist"
          element={
            <ProtectedDashboardRoute>
              <ReceptionistView />
            </ProtectedDashboardRoute>
          }
        />

        {/* LCD Display routes - fullscreen without navigation */}
        <Route
          path="/meeting-rooms/display/:roomId"
          element={
            <ProtectedRoute>
              <RoomLCDDisplayWrapper />
            </ProtectedRoute>
          }
        />

        <Route
          path="/meeting-rooms/display-all"
          element={
            <ProtectedRoute>
              <AllRoomsLCDDisplay />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedDashboardRoute>
              <NotificationsList />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedDashboardRoute>
              <AuditLogsList />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedDashboardRoute>
              <SettingsPage />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/daily-activities"
          element={
            <ProtectedDashboardRoute>
              <DailyActivities />
            </ProtectedDashboardRoute>
          }
        />

        {/* Role-based dashboard routes */}
        <Route
          path="/dashboard/superadmin"
          element={
            <ProtectedDashboardRoute>
              <SuperAdminDashboard />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedDashboardRoute>
              <AdminDashboard />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/dashboard/director"
          element={
            <ProtectedDashboardRoute>
              <DirectorDashboard />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/dashboard/manager"
          element={
            <ProtectedDashboardRoute>
              <ManagerDashboard />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/dashboard/hr"
          element={
            <ProtectedDashboardRoute>
              <HRDashboard />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/dashboard/user"
          element={
            <ProtectedDashboardRoute>
              <UserDashboard />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/kpi"
          element={
            <ProtectedDashboardRoute>
              <KPIDashboard />
            </ProtectedDashboardRoute>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default App
