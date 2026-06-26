import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type {
  CreateSickLeaveDto,
  SickLeave,
  SickLeaveListParams,
  UpdateSickLeaveDto,
} from '../model/types'

const RESOURCE = '/admin/sick-leaves'

interface RawList {
  data?: SickLeave[]
  Data?: SickLeave[]
  items?: SickLeave[]
  Items?: SickLeave[]
  result?: SickLeave[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function toQuery(p: SickLeaveListParams): Record<string, unknown> {
  return {
    Page: p.page,
    Limit: p.pageSize,
    Search: p.search || undefined,
    UserId: p.userId || undefined,
    StartDateStart: p.startDateStart || undefined,
    StartDateEnd: p.startDateEnd || undefined,
  }
}

function pickItems(data: RawList | SickLeave[]): SickLeave[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

function pickTotal(res: AxiosResponse<RawList | SickLeave[]>, items: SickLeave[], p: SickLeaveListParams): number {
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

export const sickLeaveApi = {
  list: async (params: SickLeaveListParams): Promise<Paginated<SickLeave>> => {
    const res = await httpClient.get<RawList | SickLeave[]>(RESOURCE, { params: toQuery(params) })
    const items = pickItems(res.data)
    return { items, total: pickTotal(res, items, params), page: params.page ?? 1, pageSize: params.pageSize ?? items.length }
  },
  getById: async (id: ID): Promise<SickLeave> => {
    const { data } = await httpClient.get<SickLeave>(`${RESOURCE}/${id}`)
    return data
  },
  create: async (dto: CreateSickLeaveDto): Promise<SickLeave> => {
    const { data } = await httpClient.post<SickLeave>(RESOURCE, dto)
    return data
  },
  update: async (id: ID, dto: UpdateSickLeaveDto): Promise<SickLeave> => {
    const { data } = await httpClient.patch<SickLeave>(`${RESOURCE}/${id}`, dto)
    return data
  },
  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
  removeMany: async (ids: ID[]): Promise<void> => {
    await httpClient.delete(RESOURCE, { params: { ids }, paramsSerializer: { indexes: null } })
  },
}
