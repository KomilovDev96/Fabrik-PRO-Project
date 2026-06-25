import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Permission } from '@/shared/lib/rbac'
import { useAccess, useSessionStore } from '@/entities/session'

interface ProtectedRouteProps {
  children: ReactNode
  /** Permission(s) required to enter this route. Omit for auth-only routes. */
  permission?: Permission | Permission[]
}

/**
 * Route guard:
 *  - not authenticated → redirect to /login (remembering where we came from),
 *  - authenticated but lacking permission → redirect to /403.
 */
export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const { can } = useAccess()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (permission && !can(permission)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
