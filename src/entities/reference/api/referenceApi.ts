import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { ListParams, Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'

/** A generic reference-data row (Sozlamalar: colors, currencies, payment methods, …). */
export interface ReferenceItem {
  id: ID
  [key: string]: unknown
}

interface RawList {
  data?: ReferenceItem[]
  Data?: ReferenceItem[]
  items?: ReferenceItem[]
  Items?: ReferenceItem[]
  result?: ReferenceItem[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function pickItems(data: RawList | ReferenceItem[]): ReferenceItem[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

function pickTotal(res: AxiosResponse<RawList | ReferenceItem[]>, items: ReferenceItem[], p: ListParams): number {
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

/**
 * Build a CRUD surface for a simple reference resource. Handles both REST
 * (`/admin/colors`) and RPC (`ProductCategoryAdmin/GetAll|Create|...`) styles.
 */
export function makeReferenceApi(resource: string, opts?: { rpc?: boolean }) {
  const rpc = !!opts?.rpc
  const listUrl = rpc ? `${resource}/GetAll` : resource
  const createUrl = rpc ? `${resource}/Create` : resource
  const itemUrl = (id: ID) => (rpc ? `${resource}/Update/${id}` : `${resource}/${id}`)
  const deleteUrl = (id: ID) => (rpc ? `${resource}/Delete/${id}` : `${resource}/${id}`)

  return {
    list: async (params: ListParams): Promise<Paginated<ReferenceItem>> => {
      const res = await httpClient.get<RawList | ReferenceItem[]>(listUrl, {
        params: { Page: params.page, Limit: params.pageSize, Search: params.search || undefined },
      })
      const items = pickItems(res.data)
      return { items, total: pickTotal(res, items, params), page: params.page ?? 1, pageSize: params.pageSize ?? items.length }
    },
    create: async (dto: Record<string, unknown>): Promise<ReferenceItem> => {
      const { data } = await httpClient.post<ReferenceItem>(createUrl, dto)
      return data
    },
    update: async (id: ID, dto: Record<string, unknown>): Promise<ReferenceItem> => {
      const { data } = await httpClient.patch<ReferenceItem>(itemUrl(id), dto)
      return data
    },
    remove: async (id: ID): Promise<void> => {
      await httpClient.delete(deleteUrl(id))
    },
  }
}

export type ReferenceApi = ReturnType<typeof makeReferenceApi>
