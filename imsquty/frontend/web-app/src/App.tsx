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
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AssetList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assets/create"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AssetCreate />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assets/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AssetDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TicketList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets/create"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TicketCreate />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TicketDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
