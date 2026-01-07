/**
 * Role-Based Dashboard Routes
 * 
 * Maps user roles to their respective dashboard components
 * Ensures each role has a unique, tailored dashboard experience
 */

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'

// Dashboard imports
import DirectorDashboard from '../pages/Director/DirectorDashboard'
import HRDashboard from '../pages/HR/HRDashboard'
import ManagerDashboard from '../pages/Manager/ManagerDashboard'
import SuperAdminDashboard from '../pages/SuperAdmin/SuperAdminDashboard'
import UserDashboard from '../pages/User/UserDashboard'

/**
 * Smart Dashboard Router
 * Automatically routes to appropriate dashboard based on user role
 */
export const SmartDashboard: React.FC = () => {
  const { role } = useRole()

  switch (role) {
    case 'superadmin':
      return <SuperAdminDashboard />
    case 'director':
      return <DirectorDashboard />
    case 'manager':
      return <ManagerDashboard />
    case 'hr':
      return <HRDashboard />
    case 'admin':
      // Admin can use generic dashboard or manager dashboard
      return <ManagerDashboard />
    case 'user':
      return <UserDashboard />
    default:
      return <Navigate to="/login" replace />
  }
}

/**
 * Role-Based Route Configuration
 */
export const roleDashboardRoutes = {
  superadmin: '/dashboard/superadmin',
  director: '/dashboard/director',
  manager: '/dashboard/manager',
  admin: '/dashboard/admin',
  hr: '/dashboard/hr',
  user: '/dashboard/user',
}

/**
 * Get dashboard path for specific role
 */
export const getDashboardPath = (role: string): string => {
  return roleDashboardRoutes[role as keyof typeof roleDashboardRoutes] || '/dashboard'
}

/**
 * Check if user can access specific dashboard
 */
export const canAccessDashboard = (userRole: string, dashboardRole: string): boolean => {
  // Superadmin can access all dashboards
  if (userRole === 'superadmin') return true

  // Director can access director, manager, admin, hr, and user dashboards
  if (userRole === 'director' && ['director', 'manager', 'admin', 'hr', 'user'].includes(dashboardRole)) {
    return true
  }

  // Manager can access manager, admin, hr, and user dashboards
  if (userRole === 'manager' && ['manager', 'admin', 'hr', 'user'].includes(dashboardRole)) {
    return true
  }

  // Others can only access their own dashboard
  return userRole === dashboardRole
}

export default SmartDashboard
