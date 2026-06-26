import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type {
  AdminUser,
  AdminUserDetail,
  CreateUserDto,
  UpdateUserDto,
  UserListParams,
} from '../model/adminUser'

// Users use the RPC-style admin resource (like Warehouse), not REST /admin/users:
//   GetAll · Get/{id} · Create · Update/{id} · Delete/{id}
const RESOURCE = '/admin/UserAdmin'

interface RawList {
  data?: AdminUser[]
  Data?: AdminUser[]
  items?: AdminUser[]
  Items?: AdminUser[]
  result?: AdminUser[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function toQuery(params: UserListParams): Record<string, unknown> {
  return {
    Page: params.page,
    Limit: params.pageSize,
    Search: params.search || undefined,
    RoleId: params.roleId || undefined,
    DepartmentId: params.departmentId || undefined,
  }
}

function pickItems(data: RawList | AdminUser[]): AdminUser[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

function pickTotal(res: AxiosResponse<RawList | AdminUser[]>, items: AdminUser[], params: UserListParams): number {
  const header = res.headers['x-total-count']
  const fromHeader = header != null ? Number(header) : NaN
  if (Number.isFinite(fromHeader) && fromHeader >= 0) return fromHeader

  if (!Array.isArray(res.data)) {
    const env = res.data.total ?? res.data.totalCount ?? res.data.TotalCount
    if (typeof env === 'number' && env >= 0) return env
  }

  const page = params.page ?? 1
  const pageSize = params.pageSize ?? items.length
  return items.length < pageSize ? (page - 1) * pageSize + items.length : page * pageSize + 1
}

export const userAdminApi = {
  list: async (params: UserListParams): Promise<Paginated<AdminUser>> => {
    const res = await httpClient.get<RawList | AdminUser[]>(`${RESOURCE}/GetAll`, {
      params: toQuery(params),
    })
    const items = pickItems(res.data)
    return {
      items,
      total: pickTotal(res, items, params),
      page: params.page ?? 1,
      pageSize: params.pageSize ?? items.length,
    }
  },

  getById: async (id: ID): Promise<AdminUserDetail> => {
    const { data } = await httpClient.get<AdminUserDetail>(`${RESOURCE}/Get/${id}`)
    return data
  },

  create: async (dto: CreateUserDto): Promise<AdminUser> => {
    const { data } = await httpClient.post<AdminUser>(`${RESOURCE}/Create`, dto)
    return data
  },

  update: async (id: ID, dto: UpdateUserDto): Promise<AdminUser> => {
    const { data } = await httpClient.patch<AdminUser>(`${RESOURCE}/Update/${id}`, dto)
    return data
  },

  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/Delete/${id}`)
  },
}
