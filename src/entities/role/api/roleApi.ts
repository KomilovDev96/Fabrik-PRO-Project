import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { ListParams, Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { CreateRoleDto, Permission, Role, UpdateMethod, UpdateRoleDto } from '../model/types'

const RESOURCE = '/admin/roles'

interface RawRole {
  id: number
  title?: string | null
}
interface RawList<T> {
  data?: T[]
  Data?: T[]
  items?: T[]
  Items?: T[]
  result?: T[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

export interface RoleOption {
  value: number
  label: string
}

function pick<T>(data: RawList<T> | T[]): T[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}
function total<T>(res: AxiosResponse<RawList<T> | T[]>, items: T[], p: ListParams): number {
  const header = res.headers['x-total-count']
  const fromHeader = header != null ? Number(header) : NaN
  if (Number.isFinite(fromHeader) && fromHeader >= 0) return fromHeader
  if (!Array.isArray(res.data)) {
    const env = res.data.total ?? res.data.totalCount ?? res.data.TotalCount
    if (typeof env === 'number' && env >= 0) return env
  }
  const page = p.page ?? 1
  const pageSize = p.pageSize ?? items.length
  return items.length < pageSize ? (page - 1) * pageSize + items.length : page * pageSize + 1
}

export const roleApi = {
  options: async (search?: string): Promise<RoleOption[]> => {
    const { data } = await httpClient.get<RawList<RawRole> | RawRole[]>(RESOURCE, {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pick(data).map((r) => ({ value: r.id, label: r.title || `#${r.id}` }))
  },

  list: async (params: ListParams): Promise<Paginated<Role>> => {
    const res = await httpClient.get<RawList<Role> | Role[]>(RESOURCE, {
      params: { Page: params.page, Limit: params.pageSize, Search: params.search || undefined },
    })
    const items = pick(res.data)
    return { items, total: total(res, items, params), page: params.page ?? 1, pageSize: params.pageSize ?? items.length }
  },

  create: async (dto: CreateRoleDto): Promise<Role> => {
    const { data } = await httpClient.post<Role>(RESOURCE, dto)
    return data
  },
  update: async (id: ID, dto: UpdateRoleDto): Promise<Role> => {
    const { data } = await httpClient.patch<Role>(`${RESOURCE}/${id}`, dto)
    return data
  },
  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },

  /** Assign permissions to a role: PATCH role with { permissions, method }. */
  setPermissions: async (id: ID, permissions: number[], method: UpdateMethod = 'Replace'): Promise<void> => {
    await httpClient.patch(`${RESOURCE}/${id}`, { permissions, method })
  },

  /** All permission definitions (global). */
  permissions: async (): Promise<Permission[]> => {
    const { data } = await httpClient.get<RawList<Permission> | Permission[]>('/admin/permissions', {
      params: { Page: 1, Limit: 500 },
    })
    return pick(data)
  },
}
