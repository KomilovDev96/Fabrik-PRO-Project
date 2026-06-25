import type { ReactNode } from 'react'
import type { Permission } from '@/shared/lib/rbac'
import { useAccess } from '../model/useAccess'

interface CanProps {
  /** Permission(s) required to render children. */
  perform: Permission | Permission[]
  /** 'all' (default) requires every permission; 'any' requires at least one. */
  mode?: 'all' | 'any'
  /** Rendered when the user lacks access (defaults to nothing). */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Declarative permission gate for JSX.
 *
 *   <Can perform="warehouses.create">
 *     <Button>Создать</Button>
 *   </Can>
 */
export function Can({ perform, mode = 'all', fallback = null, children }: CanProps) {
  const { can } = useAccess()
  return <>{can(perform, mode) ? children : fallback}</>
}
