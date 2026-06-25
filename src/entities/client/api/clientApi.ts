import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { ListParams, Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { Client, CreateClientDto, UpdateClientDto } from '../model/types'

// Unlike warehouses (RPC-style), the client admin resource is REST under /admin:
//   GET /admin/clients · GET /admin/clients/{id} · POST · PATCH /{id} · DELETE /{id}
const RESOURCE = '/admin/clients'

/** Envelope variants the backend may wrap a list in (it usually returns a bare array). */
interface RawList {
  data?: Client[]
  Data?: Client[]
  items?: Client[]
  Items?: Client[]
  result?: Client[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

/** Map generic list params → backend query names (PascalCase, as in the admin spec). */
function toQuery(params: ListParams): Record<string, unknown> {
  return {
    Page: params.page,
    Limit: params.pageSize,
    Search: params.search || undefined,
  }
}

function pickItems(data: RawList | Client[]): Client[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

/**
 * Resolve the total record count:
 *  1. `X-Total-Count` response header (readable via the dev proxy / same-origin),
 *  2. a `total`/`totalCount` field in an envelope,
 *  3. heuristic fallback so the pager stays usable.
 */
function pickTotal(res: AxiosResponse<RawList | Client[]>, items: Client[], params: ListParams): number {
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

export const clientApi = {
  list: async (params: ListParams): Promise<Paginated<Client>> => {
    const res = await httpClient.get<RawList | Client[]>(RESOURCE, { params: toQuery(params) })
    const items = pickItems(res.data)
    return {
      items,
      total: pickTotal(res, items, params),
      page: params.page ?? 1,
      pageSize: params.pageSize ?? items.length,
    }
  },

  getById: async (id: ID): Promise<Client> => {
    const { data } = await httpClient.get<Client>(`${RESOURCE}/${id}`)
    return data
  },

  create: async (dto: CreateClientDto): Promise<Client> => {
    const { data } = await httpClient.post<Client>(RESOURCE, dto)
    return data
  },

  update: async (id: ID, dto: UpdateClientDto): Promise<Client> => {
    const { data } = await httpClient.patch<Client>(`${RESOURCE}/${id}`, dto)
    return data
  },

  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },

  /** Clients as <Select> options (id + title). Used by forms that pick a client (orders, …). */
  options: async (search?: string): Promise<{ value: number; label: string }[]> => {
    const res = await httpClient.get<RawList | Client[]>(RESOURCE, {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pickItems(res.data).map((c) => ({ value: c.id, label: c.title || c.contactName || `#${c.id}` }))
  },

  /** Bulk delete via `DELETE /admin/clients?ids=1&ids=2` (repeat keys for ASP.NET binding). */
  removeMany: async (ids: ID[]): Promise<void> => {
    await httpClient.delete(RESOURCE, { params: { ids }, paramsSerializer: { indexes: null } })
  },
}
