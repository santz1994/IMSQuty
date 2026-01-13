import React from 'react'
import { Navigate } from 'react-router-dom'
import { canAccessAdminPanel } from '../hooks/useAdminAccess'
import { useAppSelector } from '../store/hooks'

interface ProtectedRouteProps {
  children: React.ReactElement
}

/**
 * Protected Route Component
 * Ensures only Developer and Superadmin can access admin routes
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useAppSelector((state) => state.auth.user)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!canAccessAdminPanel(user)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
