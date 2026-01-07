/**
 * RBAC Dashboard Router
 * Routes users to their role-specific dashboard
 * Uses new three-tier architecture with hooks
 */

import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress, Alert } from '@mui/material'
import useAuth from '../hooks/useAuth'
import SuperAdminDashboard from './SuperAdmin/SuperAdminDashboard'
import DirectorDashboard from './Director/DirectorDashboard'
import ManagerDashboard from './Manager/ManagerDashboard'
import HRDashboard from './HR/HRDashboard'
import UserDashboard from './User/UserDashboard'

/**
 * Role hierarchy levels:
 * 1. Superadmin - Full system control & IT infrastructure
 * 2. Director - Strategic decisions & company policy
 * 3. Manager - Team operations & project oversight
 * 4. Admin - Module management & user support
 * 5. HR - Employee & access management
 * 6. User - End user operations & daily tasks
 */

const ROLE_DASHBOARDS: Record<string, React.ComponentType> = {
  superadmin: SuperAdminDashboard,
  director: DirectorDashboard,
  manager: ManagerDashboard,
  admin: ManagerDashboard, // Admin uses Manager dashboard with restricted access
  hr: HRDashboard,
  user: UserDashboard,
}

const RBACDashboard: React.FC = () => {
  const { user, loading, error, checkPermission } = useAuth()

  useEffect(() => {
    // Log dashboard access for audit
    if (user) {
      console.log(`[RBAC] User ${user.username} accessing dashboard as ${user.role?.name}`)
    }
  }, [user])

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Authentication Error: {error}
        </Alert>
      </Box>
    )
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Get user role slug (lowercase)
  const roleSlug = user.role?.slug?.toLowerCase() || 'user'

  // Get appropriate dashboard component
  const DashboardComponent = ROLE_DASHBOARDS[roleSlug] || UserDashboard

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <DashboardComponent />
    </Box>
  )
}

export default RBACDashboard
