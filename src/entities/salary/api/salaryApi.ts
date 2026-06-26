import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { CreateSalaryDto, Salary, SalaryListParams, UpdateSalaryDto } from '../model/types'

const RESOURCE = '/admin/salaries'

interface RawList {
  data?: Salary[]
  Data?: Salary[]
  items?: Salary[]
  Items?: Salary[]
  result?: Salary[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function toQuery(p: SalaryListParams): Record<string, unknown> {
  return { Page: p.page, Limit: p.pageSize, Search: p.search || undefined, UserId: p.userId || undefined }
}
function pickItems(data: RawList | Salary[]): Salary[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}
function pickTotal(res: AxiosResponse<RawList | Salary[]>, items: Salary[], p: SalaryListParams): number {
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

export const salaryApi = {
  list: async (params: SalaryListParams): Promise<Paginated<Salary>> => {
    const res = await httpClient.get<RawList | Salary[]>(RESOURCE, { params: toQuery(params) })
    const items = pickItems(res.data)
    return { items, total: pickTotal(res, items, params), page: params.page ?? 1, pageSize: params.pageSize ?? items.length }
  },
  getById: async (id: ID): Promise<Salary> => {
    const { data } = await httpClient.get<Salary>(`${RESOURCE}/${id}`)
    return data
  },
  create: async (dto: CreateSalaryDto): Promise<Salary> => {
    const { data } = await httpClient.post<Salary>(RESOURCE, dto)
    return data
  },
  update: async (id: ID, dto: UpdateSalaryDto): Promise<Salary> => {
    const { data } = await httpClient.patch<Salary>(`${RESOURCE}/${id}`, dto)
    return data
  },
  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
  removeMany: async (ids: ID[]): Promise<void> => {
    await httpClient.delete(RESOURCE, { params: { ids }, paramsSerializer: { indexes: null } })
  },
}
