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
const UsersList = lazy(() => import('./pages/Users/UsersList'))
const ReportsList = lazy(() => import('./pages/Reports/ReportsList'))
const InventoryList = lazy(() => import('./pages/Inventory/InventoryList'))
const FinancialList = lazy(() => import('./pages/Financial/FinancialList'))
const NotificationsList = lazy(() => import('./pages/Notifications/NotificationsList'))
const MeetingRoomsList = lazy(() => import('./pages/MeetingRooms/MeetingRoomsList'))
const BookingCalendar = lazy(() => import('./pages/MeetingRooms/BookingCalendar'))
const BookingApprovals = lazy(() => import('./pages/MeetingRooms/BookingApprovals'))
const ReceptionistPanel = lazy(() => import('./pages/MeetingRooms/ReceptionistPanel'))
const AuditLogsList = lazy(() => import('./pages/AuditLogs/AuditLogsList'))
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'))

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

        <Route
          path="/meeting-rooms"
          element={
            <ProtectedDashboardRoute>
              <MeetingRoomsList />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/meeting-rooms/calendar"
          element={
            <ProtectedDashboardRoute>
              <BookingCalendar />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/meeting-rooms/approvals"
          element={
            <ProtectedDashboardRoute>
              <BookingApprovals />
            </ProtectedDashboardRoute>
          }
        />

        <Route
          path="/meeting-rooms/receptionist"
          element={
            <ProtectedDashboardRoute>
              <ReceptionistPanel />
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
          path="/users"
          element={
            <ProtectedDashboardRoute>
              <UsersList />
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
      </Routes>
    </Suspense>
  )
}

export default App
