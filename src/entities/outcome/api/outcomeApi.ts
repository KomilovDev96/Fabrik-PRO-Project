import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { CreateOutcomeDto, Outcome, OutcomeListParams, UpdateOutcomeDto } from '../model/types'

const RESOURCE = '/admin/outcomes'

interface RawList {
  data?: Outcome[]
  Data?: Outcome[]
  items?: Outcome[]
  Items?: Outcome[]
  result?: Outcome[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function toQuery(p: OutcomeListParams): Record<string, unknown> {
  return {
    Page: p.page,
    Limit: p.pageSize,
    Search: p.search || undefined,
    OutcomeCategoryId: p.outcomeCategoryId || undefined,
    SupplierId: p.supplierId || undefined,
    CashBoxId: p.cashBoxId || undefined,
    CurrencyId: p.currencyId || undefined,
    StartDate: p.startDate || undefined,
    EndDate: p.endDate || undefined,
  }
}
function pickItems(data: RawList | Outcome[]): Outcome[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}
function pickTotal(res: AxiosResponse<RawList | Outcome[]>, items: Outcome[], p: OutcomeListParams): number {
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

export const outcomeApi = {
  list: async (params: OutcomeListParams): Promise<Paginated<Outcome>> => {
    const res = await httpClient.get<RawList | Outcome[]>(RESOURCE, { params: toQuery(params) })
    const items = pickItems(res.data)
    return { items, total: pickTotal(res, items, params), page: params.page ?? 1, pageSize: params.pageSize ?? items.length }
  },
  getById: async (id: ID): Promise<Outcome> => {
    const { data } = await httpClient.get<Outcome>(`${RESOURCE}/${id}`)
    return data
  },
  create: async (dto: CreateOutcomeDto): Promise<Outcome> => {
    const { data } = await httpClient.post<Outcome>(RESOURCE, dto)
    return data
  },
  update: async (id: ID, dto: UpdateOutcomeDto): Promise<Outcome> => {
    const { data } = await httpClient.patch<Outcome>(`${RESOURCE}/${id}`, dto)
    return data
  },
  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
  removeMany: async (ids: ID[]): Promise<void> => {
    await httpClient.delete(RESOURCE, { params: { ids }, paramsSerializer: { indexes: null } })
  },
}
