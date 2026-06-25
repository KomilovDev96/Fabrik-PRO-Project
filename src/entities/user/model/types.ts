import type { ID } from '@/shared/types'
import type { Permission, Role } from '@/shared/lib/rbac'

/** The authenticated user as returned by the backend. */
export interface AuthUser {
  id: ID
  fullName: string
  username: string
  email?: string
  avatarUrl?: string
  roles: Role[]
  /** Human-readable role title from the backend (for display). */
  roleTitle?: string
  /** Explicit permissions from the backend. If empty, we derive them from roles. */
  permissions?: Permission[]
}
