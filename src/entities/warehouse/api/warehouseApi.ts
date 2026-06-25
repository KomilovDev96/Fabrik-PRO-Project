import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { ListParams, Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { CreateWarehouseDto, UpdateWarehouseDto, Warehouse } from '../model/types'

// Backend uses RPC-style routes for this resource (not REST):
//   GetAll · Get/{id} · Create · Update/{id} · Delete/{id}
const RESOURCE = '/Warehouse'

/** Envelope variants the backend may wrap a list in (it usually returns a bare array). */
interface RawList {
  data?: Warehouse[]
  Data?: Warehouse[]
  items?: Warehouse[]
  Items?: Warehouse[]
  result?: Warehouse[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

/** Map generic list params → backend query names (PascalCase). */
function toQuery(params: ListParams): Record<string, unknown> {
  return {
    Page: params.page,
    Limit: params.pageSize,
    Search: params.search || undefined,
  }
}

function pickItems(data: RawList | Warehouse[]): Warehouse[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

/**
 * Resolve the total record count:
 *  1. `X-Total-Count` response header (readable same-origin / via dev proxy),
 *  2. a `total`/`totalCount` field in an envelope,
 *  3. heuristic fallback: a full page implies there may be more.
 */
function pickTotal(
  res: AxiosResponse<RawList | Warehouse[]>,
  items: Warehouse[],
  params: ListParams,
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
  // Full page → assume at least one more page exists so the pager stays usable.
  return items.length < pageSize ? (page - 1) * pageSize + items.length : page * pageSize + 1
}

export const warehouseApi = {
  list: async (params: ListParams): Promise<Paginated<Warehouse>> => {
    const res = await httpClient.get<RawList | Warehouse[]>(`${RESOURCE}/GetAll`, {
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

  getById: async (id: ID): Promise<Warehouse> => {
    const { data } = await httpClient.get<Warehouse | { data: Warehouse }>(`${RESOURCE}/Get/${id}`)
    return 'data' in data ? data.data : data
  },

  create: async (dto: CreateWarehouseDto): Promise<Warehouse> => {
    const { data } = await httpClient.post<Warehouse>(`${RESOURCE}/Create`, dto)
    return data
  },

  update: async (id: ID, dto: UpdateWarehouseDto): Promise<Warehouse> => {
    const { data } = await httpClient.patch<Warehouse>(`${RESOURCE}/Update/${id}`, dto)
    return data
  },

  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/Delete/${id}`)
  },

  /** Warehouses as <Select> options (id + title). Used by forms that pick a warehouse (orders, …). */
  options: async (search?: string): Promise<{ value: number; label: string }[]> => {
    const { data } = await httpClient.get<RawList | Warehouse[]>(`${RESOURCE}/GetAll`, {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pickItems(data).map((w) => ({ value: w.id, label: w.title || `#${w.id}` }))
  },
}
