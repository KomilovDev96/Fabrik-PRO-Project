import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import {
  PAYROLL_RESOURCE,
  type CreatePayrollDto,
  type PayrollEntry,
  type PayrollKind,
  type PayrollListParams,
  type UpdatePayrollDto,
} from '../model/types'

interface RawList {
  data?: PayrollEntry[]
  Data?: PayrollEntry[]
  items?: PayrollEntry[]
  Items?: PayrollEntry[]
  result?: PayrollEntry[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function toQuery(params: PayrollListParams): Record<string, unknown> {
  return {
    Page: params.page,
    Limit: params.pageSize,
    Search: params.search || undefined,
    UserId: params.userId || undefined,
    ForDateStart: params.forDateStart || undefined,
    ForDateEnd: params.forDateEnd || undefined,
    DateStart: params.dateStart || undefined,
    DateEnd: params.dateEnd || undefined,
    AmountStart: params.amountStart || undefined,
    AmountEnd: params.amountEnd || undefined,
  }
}

function pickItems(data: RawList | PayrollEntry[]): PayrollEntry[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

function pickTotal(
  res: AxiosResponse<RawList | PayrollEntry[]>,
  items: PayrollEntry[],
  params: PayrollListParams,
): number {
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

/**
 * One API surface for all four ledgers — the kind only selects the REST resource
 * (PAYROLL_RESOURCE). Same list/CRUD/bulk-delete shape everywhere.
 */
export const payrollApi = {
  list: async (kind: PayrollKind, params: PayrollListParams): Promise<Paginated<PayrollEntry>> => {
    const res = await httpClient.get<RawList | PayrollEntry[]>(PAYROLL_RESOURCE[kind], {
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

  getById: async (kind: PayrollKind, id: ID): Promise<PayrollEntry> => {
    const { data } = await httpClient.get<PayrollEntry>(`${PAYROLL_RESOURCE[kind]}/${id}`)
    return data
  },

  create: async (kind: PayrollKind, dto: CreatePayrollDto): Promise<PayrollEntry> => {
    const { data } = await httpClient.post<PayrollEntry>(PAYROLL_RESOURCE[kind], dto)
    return data
  },

  update: async (kind: PayrollKind, id: ID, dto: UpdatePayrollDto): Promise<PayrollEntry> => {
    const { data } = await httpClient.patch<PayrollEntry>(`${PAYROLL_RESOURCE[kind]}/${id}`, dto)
    return data
  },

  remove: async (kind: PayrollKind, id: ID): Promise<void> => {
    await httpClient.delete(`${PAYROLL_RESOURCE[kind]}/${id}`)
  },

  removeMany: async (kind: PayrollKind, ids: ID[]): Promise<void> => {
    await httpClient.delete(PAYROLL_RESOURCE[kind], { params: { ids }, paramsSerializer: { indexes: null } })
  },
}
