import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layouts/DashboardLayout'
import AssetCreate from './pages/Assets/AssetCreate'
import AssetDetail from './pages/Assets/AssetDetail'
import AssetList from './pages/Assets/AssetList'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import TicketCreate from './pages/Tickets/TicketCreate'
import TicketDetail from './pages/Tickets/TicketDetail'
import TicketList from './pages/Tickets/TicketList'
import { useAppSelector } from './store/hooks'

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

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return (
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
    </Routes>
  )
}

export default App
