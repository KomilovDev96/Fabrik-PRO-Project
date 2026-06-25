import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { ListParams, Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { CashBox, CreateCashBoxDto, UpdateCashBoxDto } from '../model/types'

// REST resource under /admin (same shape as clients):
//   GET /admin/cash-boxes · GET /{id} · POST · PATCH /{id} · DELETE /{id} · DELETE ?ids=
const RESOURCE = '/admin/cash-boxes'

/** Envelope variants the backend may wrap a list in (it usually returns a bare array). */
interface RawList {
  data?: CashBox[]
  Data?: CashBox[]
  items?: CashBox[]
  Items?: CashBox[]
  result?: CashBox[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function toQuery(params: ListParams): Record<string, unknown> {
  return {
    Page: params.page,
    Limit: params.pageSize,
    Search: params.search || undefined,
  }
}

function pickItems(data: RawList | CashBox[]): CashBox[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

function pickTotal(res: AxiosResponse<RawList | CashBox[]>, items: CashBox[], params: ListParams): number {
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

export const cashboxApi = {
  list: async (params: ListParams): Promise<Paginated<CashBox>> => {
    const res = await httpClient.get<RawList | CashBox[]>(RESOURCE, { params: toQuery(params) })
    const items = pickItems(res.data)
    return {
      items,
      total: pickTotal(res, items, params),
      page: params.page ?? 1,
      pageSize: params.pageSize ?? items.length,
    }
  },

  getById: async (id: ID): Promise<CashBox> => {
    const { data } = await httpClient.get<CashBox>(`${RESOURCE}/${id}`)
    return data
  },

  create: async (dto: CreateCashBoxDto): Promise<CashBox> => {
    const { data } = await httpClient.post<CashBox>(RESOURCE, dto)
    return data
  },

  update: async (id: ID, dto: UpdateCashBoxDto): Promise<CashBox> => {
    const { data } = await httpClient.patch<CashBox>(`${RESOURCE}/${id}`, dto)
    return data
  },

  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
}
