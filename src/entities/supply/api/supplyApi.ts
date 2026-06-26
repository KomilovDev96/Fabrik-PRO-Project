import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { CreateSupplyDto, Supply, SupplyListParams } from '../model/types'

const RESOURCE = '/admin/supplies'

interface RawList {
  data?: Supply[]
  Data?: Supply[]
  items?: Supply[]
  Items?: Supply[]
  result?: Supply[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function pickItems(data: RawList | Supply[]): Supply[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}
function pickTotal(res: AxiosResponse<RawList | Supply[]>, items: Supply[], p: SupplyListParams): number {
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

export const supplyApi = {
  list: async (params: SupplyListParams): Promise<Paginated<Supply>> => {
    const res = await httpClient.get<RawList | Supply[]>(RESOURCE, {
      params: { Page: params.page, Limit: params.pageSize, Search: params.search || undefined, SupplierId: params.supplierId || undefined, WarehouseId: params.warehouseId || undefined },
    })
    const items = pickItems(res.data)
    return { items, total: pickTotal(res, items, params), page: params.page ?? 1, pageSize: params.pageSize ?? items.length }
  },
  create: async (dto: CreateSupplyDto): Promise<Supply> => {
    const { data } = await httpClient.post<Supply>(RESOURCE, dto)
    return data
  },
  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
  removeMany: async (ids: ID[]): Promise<void> => {
    await httpClient.delete(RESOURCE, { params: { ids }, paramsSerializer: { indexes: null } })
  },
}
