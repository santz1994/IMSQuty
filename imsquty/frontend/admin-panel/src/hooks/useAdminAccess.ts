import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

/**
 * Admin Panel Access Control Hook
 * 
 * Restricts admin panel access to:
 * - Developer (Level 0) - daniel@quty.co.id
 * - Superadmin (Level 1)
 * 
 * All other roles are redirected to unauthorized page
 */
export const useAdminAccess = () => {
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Check if user has admin panel access
    const allowedRoles = ['developer', 'superadmin']
    const hasAccess = user.roles?.some((role) => allowedRoles.includes(role.name))

    if (!hasAccess) {
      navigate('/unauthorized')
    }
  }, [user, navigate])

  return user
}

/**
 * Get user access level from role
 */
export const getUserLevel = (user: any): number => {
  if (!user?.roles || user.roles.length === 0) return 999

  // Get highest level (lowest number) from user's roles
  const levels = user.roles.map((role: any) => role.level ?? 999)
  return Math.min(...levels)
}

/**
 * Check if user can access admin panel
 */
export const canAccessAdminPanel = (user: any): boolean => {
  if (!user?.roles) return false

  const allowedRoles = ['developer', 'superadmin']
  return user.roles.some((role: any) => allowedRoles.includes(role.name))
}

/**
 * Get user role hierarchy info
 */
export const getRoleHierarchyInfo = (user: any) => {
  const level = getUserLevel(user)
  const roleNames = user?.roles?.map((r: any) => r.display_name || r.name).join(', ') || 'No Role'

  const hierarchyLabels: Record<number, string> = {
    0: 'System Developer (Highest)',
    1: 'IT Infrastructure Control',
    2: 'Strategic Business Decisions',
    3: 'Team Operations',
    4: 'Human Resources',
    5: 'Module Management / Reception',
    6: 'End User',
  }

  return {
    level,
    roleNames,
    hierarchyLabel: hierarchyLabels[level] || 'Unknown',
    canAccessAdminPanel: canAccessAdminPanel(user),
  }
}
