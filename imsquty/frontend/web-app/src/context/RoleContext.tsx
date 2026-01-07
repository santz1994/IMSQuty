import React, { createContext, useContext, useMemo } from 'react'
import { useAppSelector } from '../store/hooks'

/**
 * Role Types
 * - super-admin: Full system access (Developer level)
 * - admin: Business operations & management
 * - user: Limited operational access
 */
export type UserRole = 'super-admin' | 'admin' | 'user' | 'guest'

/**
 * Role Context Interface
 */
interface RoleContextType {
  role: UserRole
  permissions: string[]
  hasPermission: (permission: string) => boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  hasAllRoles: (roles: UserRole[]) => boolean
  isSuperAdmin: boolean
  isAdmin: boolean
  isUser: boolean
  canAccessSystemTools: boolean
  canManageUsers: boolean
  canApproveRequests: boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

/**
 * Role Provider Component
 * Manages user role and permissions throughout the app
 */
export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const roleContext = useMemo<RoleContextType>(() => {
    // If not authenticated, return guest role
    if (!isAuthenticated || !user) {
      return {
        role: 'guest',
        permissions: [],
        hasPermission: () => false,
        hasRole: () => false,
        hasAnyRole: () => false,
        hasAllRoles: () => false,
        isSuperAdmin: false,
        isAdmin: false,
        isUser: false,
        canAccessSystemTools: false,
        canManageUsers: false,
        canApproveRequests: false,
      }
    }

    // Determine role from user data
    const role: UserRole = (user.role?.toLowerCase() as UserRole) || 'user'
    const permissions: string[] = user.permissions || []

    // Helper functions
    const hasPermission = (permission: string): boolean => {
      // Super-admin has all permissions
      if (role === 'super-admin') return true

      // Check if user has specific permission
      return permissions.includes(permission)
    }

    const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(role)
      }
      return role === requiredRole
    }

    const hasAnyRole = (roles: UserRole[]): boolean => {
      return roles.includes(role)
    }

    const hasAllRoles = (roles: UserRole[]): boolean => {
      // This doesn't make sense for single role per user
      // But keeping for API consistency
      return roles.includes(role) && roles.length === 1
    }

    // Role flags
    const isSuperAdmin = role === 'super-admin'
    const isAdmin = role === 'admin' || isSuperAdmin
    const isUser = role === 'user' || isAdmin

    // Feature flags based on role
    const canAccessSystemTools = isSuperAdmin
    const canManageUsers = isAdmin
    const canApproveRequests = isAdmin

    return {
      role,
      permissions,
      hasPermission,
      hasRole,
      hasAnyRole,
      hasAllRoles,
      isSuperAdmin,
      isAdmin,
      isUser,
      canAccessSystemTools,
      canManageUsers,
      canApproveRequests,
    }
  }, [user, isAuthenticated])

  return (
    <RoleContext.Provider value={roleContext}>{children}</RoleContext.Provider>
  )
}

/**
 * Hook to use role context
 * @throws Error if used outside RoleProvider
 */
export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}

/**
 * HOC to protect components based on role
 */
export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: UserRole | UserRole[],
) => {
  return (props: P) => {
    const { hasRole } = useRole()

    if (!hasRole(requiredRole)) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this resource.</p>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * HOC to protect components based on permission
 */
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string | string[],
) => {
  return (props: P) => {
    const { hasPermission } = useRole()

    const hasRequiredPermission = Array.isArray(requiredPermission)
      ? requiredPermission.every((perm) => hasPermission(perm))
      : hasPermission(requiredPermission)

    if (!hasRequiredPermission) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Insufficient Permissions</h2>
          <p>You don't have the required permissions to access this resource.</p>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * Component to conditionally render based on role
 */
export const RoleGuard: React.FC<{
  role: UserRole | UserRole[]
  fallback?: React.ReactNode
  children: React.ReactNode
}> = ({ role, fallback = null, children }) => {
  const { hasRole } = useRole()

  if (!hasRole(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Component to conditionally render based on permission
 */
export const PermissionGuard: React.FC<{
  permission: string | string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}> = ({ permission, fallback = null, children }) => {
  const { hasPermission } = useRole()

  const hasRequiredPermission = Array.isArray(permission)
    ? permission.every((perm) => hasPermission(perm))
    : hasPermission(permission)

  if (!hasRequiredPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Export all utilities
 */
export default RoleProvider
