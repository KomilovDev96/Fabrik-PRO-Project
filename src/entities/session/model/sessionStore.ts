import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/shared/config/constants'
import { ROLE_PERMISSIONS, type Permission } from '@/shared/lib/rbac'
import type { AuthUser } from '@/entities/user'

interface SetSessionPayload {
  user: AuthUser
  accessToken: string
  refreshToken?: string
}

interface SessionState {
  user: AuthUser | null
  /** Flattened, resolved permission list for the current user. */
  permissions: Permission[]
  isAuthenticated: boolean
  setSession: (payload: SetSessionPayload) => void
  clearSession: () => void
}

/** Resolve effective permissions: explicit list from backend, else union of role perms. */
function resolvePermissions(user: AuthUser): Permission[] {
  if (user.permissions?.length) return user.permissions
  const set = new Set<Permission>()
  for (const role of user.roles) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) set.add(p)
  }
  return [...set]
}

/**
 * Auth/session store.
 * Tokens live in dedicated localStorage keys so the axios interceptor can read
 * them without importing this store (keeps `shared` independent of `entities`).
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      permissions: [],
      isAuthenticated: false,

      setSession: ({ user, accessToken, refreshToken }) => {
        localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
        if (refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
        set({ user, permissions: resolvePermissions(user), isAuthenticated: true })
      },

      clearSession: () => {
        localStorage.removeItem(STORAGE_KEYS.accessToken)
        localStorage.removeItem(STORAGE_KEYS.refreshToken)
        set({ user: null, permissions: [], isAuthenticated: false })
      },
    }),
    {
      name: 'fp_session',
      // Persist only non-sensitive identity; tokens stay in their own keys.
      partialize: (s) => ({ user: s.user, permissions: s.permissions, isAuthenticated: s.isAuthenticated }),
    },
  ),
)
