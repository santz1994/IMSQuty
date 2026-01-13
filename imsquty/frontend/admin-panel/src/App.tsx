import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import AuditLogs from './pages/AuditLogs'
import Login from './pages/Login'
import PagePermissions from './pages/PagePermissions'
import RolesPermissions from './pages/RolesPermissions'
import SystemSettings from './pages/SystemSettings'
import Unauthorized from './pages/Unauthorized'
import UserManagement from './pages/UserManagement'
import { useAppSelector } from './store/hooks'

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />}
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <SystemSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AuditLogs />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <RolesPermissions />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/page-permissions"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <PagePermissions />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default App
