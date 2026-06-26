import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { CreateOrderDto, Order, OrderDetail, OrderListParams, UpdateOrderDto } from '../model/types'

// REST resource under /admin (header-only — no line items on this contract):
//   GET /admin/orders · GET /{id} · POST · PATCH /{id} · DELETE /{id} · DELETE ?ids=
const RESOURCE = '/admin/orders'

interface RawList {
  data?: Order[]
  Data?: Order[]
  items?: Order[]
  Items?: Order[]
  result?: Order[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

/** Map list params + filters → backend query names (PascalCase, per the admin spec). */
function toQuery(params: OrderListParams): Record<string, unknown> {
  return {
    Page: params.page,
    Limit: params.pageSize,
    Search: params.search || undefined,
    Status: params.status || undefined,
    WarehouseId: params.warehouseId || undefined,
    ClientId: params.clientId || undefined,
    CreatedStart: params.createdStart || undefined,
    CreatedEnd: params.createdEnd || undefined,
  }
}

function pickItems(data: RawList | Order[]): Order[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

function pickTotal(res: AxiosResponse<RawList | Order[]>, items: Order[], params: OrderListParams): number {
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

export const orderApi = {
  list: async (params: OrderListParams): Promise<Paginated<Order>> => {
    const res = await httpClient.get<RawList | Order[]>(RESOURCE, { params: toQuery(params) })
    const items = pickItems(res.data)
    return {
      items,
      total: pickTotal(res, items, params),
      page: params.page ?? 1,
      pageSize: params.pageSize ?? items.length,
    }
  },

  getById: async (id: ID): Promise<OrderDetail> => {
    const { data } = await httpClient.get<OrderDetail>(`${RESOURCE}/${id}`)
    return data
  },

  create: async (dto: CreateOrderDto): Promise<Order> => {
    const { data } = await httpClient.post<Order>(RESOURCE, dto)
    return data
  },

  update: async (id: ID, dto: UpdateOrderDto): Promise<Order> => {
    const { data } = await httpClient.patch<Order>(`${RESOURCE}/${id}`, dto)
    return data
  },

  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },

  removeMany: async (ids: ID[]): Promise<void> => {
    await httpClient.delete(RESOURCE, { params: { ids }, paramsSerializer: { indexes: null } })
  },

  /** Orders as <Select> options (id + client). Used by the client-payment form. */
  options: async (search?: string): Promise<{ value: number; label: string }[]> => {
    const res = await httpClient.get<RawList | Order[]>(RESOURCE, {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pickItems(res.data).map((o) => ({ value: o.id, label: `#${o.id}${o.client ? ` — ${o.client}` : ''}` }))
  },
}
