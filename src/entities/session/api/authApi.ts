import { httpClient } from '@/shared/api'
import type { AuthUser } from '@/entities/user'

export interface LoginCredentials {
  login: string
  password: string
}

/** Raw user shape returned by GET /User/GetMe/me (only the fields we use). */
interface RawUserDetail {
  id: number
  fullName?: string
  phoneNumber?: string
  role?: { id?: number; title?: string } | string
  department?: { title?: string }
  avatarUrl?: string
  email?: string
}

/** Pull the JWT out of the login response — backend returns it either in the
 *  body (token/accessToken/…) or in the `Authorization` header. Ported 1:1 from
 *  the working reference frontend. */
function extractToken(data: unknown, headers: Record<string, unknown>): string {
  if (data && typeof data === 'object') {
    const r = data as Record<string, unknown>
    const direct = r.token ?? r.accessToken ?? r.access_token ?? r.jwtToken
    if (typeof direct === 'string') return direct
    const nested = r.data
    if (nested && typeof nested === 'object') {
      const n = nested as Record<string, unknown>
      const nt = n.token ?? n.accessToken ?? n.access_token ?? n.jwtToken
      if (typeof nt === 'string') return nt
    }
  }
  if (typeof data === 'string' && data.trim()) return data
  const header = headers.authorization ?? headers.Authorization
  return typeof header === 'string' ? header : ''
}

/** Strip quotes and an optional `Bearer ` prefix. */
function normalizeToken(raw: string): string {
  const cleaned = raw.replace(/^"|"$/g, '').trim()
  if (!cleaned || cleaned === 'null' || cleaned === 'undefined') return ''
  return cleaned.startsWith('Bearer ') ? cleaned.slice(7).trim() : cleaned
}

/** Map the backend user onto our app's AuthUser. */
function mapUser(raw: RawUserDetail): AuthUser {
  const roleTitle = typeof raw.role === 'string' ? raw.role : raw.role?.title
  return {
    id: raw.id,
    fullName: raw.fullName || raw.phoneNumber || 'User',
    username: raw.phoneNumber || String(raw.id),
    email: raw.email,
    avatarUrl: raw.avatarUrl,
    // The backend RBAC model is its own thing; we expose the role title for
    // display and grant access via explicit permissions on login (see sessionQueries).
    roles: [],
    roleTitle,
  }
}

export const authApi = {
  /** POST /User/Login/login → normalized JWT string. */
  login: async (credentials: LoginCredentials): Promise<string> => {
    const response = await httpClient.post('/User/Login/login', credentials)
    const token = extractToken(response.data, response.headers as Record<string, unknown>)
    return normalizeToken(token)
  },

  /** GET /User/GetMe/me → mapped AuthUser. Pass the fresh token right after login. */
  getMe: async (token?: string): Promise<AuthUser> => {
    const { data } = await httpClient.get<RawUserDetail>(
      '/User/GetMe/me',
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    )
    return mapUser(data)
  },
}
