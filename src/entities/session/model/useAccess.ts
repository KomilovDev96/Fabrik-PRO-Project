import { useCallback } from 'react'
import { hasPermission, type Permission } from '@/shared/lib/rbac'
import { useSessionStore } from './sessionStore'

/**
 * RBAC hook. Use everywhere you need to gate UI or logic on permissions.
 *
 *   const { can } = useAccess()
 *   if (can('warehouses.create')) { ... }
 */
export function useAccess() {
  const permissions = useSessionStore((s) => s.permissions)

  const can = useCallback(
    (required: Permission | Permission[], mode: 'all' | 'any' = 'all') =>
      hasPermission(permissions, required, mode),
    [permissions],
  )

  return { can, permissions }
}
