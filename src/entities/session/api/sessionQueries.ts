import { useMutation } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import { authApi, type LoginCredentials } from './authApi'
import { useSessionStore } from '../model/sessionStore'

/**
 * Full login flow as one mutation:
 *   POST /User/Login/login  →  token
 *   GET  /User/GetMe/me     →  current user
 *   setSession(...)         →  store token + user, mark authenticated
 *
 * RBAC: the backend permission model differs from the app's; until it is mapped,
 * authenticated users get full access ('*'). Replace `permissions: ['*']` with a
 * real mapping from GET /api/v1/permissions when wiring fine-grained RBAC.
 */
export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession)

  return useMutation<void, ApiError, LoginCredentials>({
    mutationFn: async (credentials) => {
      const token = await authApi.login(credentials)
      if (!token) throw { status: 401, message: 'Неверный логин или пароль' } satisfies ApiError
      const user = await authApi.getMe(token)
      setSession({ user: { ...user, permissions: ['*'] }, accessToken: token })
    },
  })
}
