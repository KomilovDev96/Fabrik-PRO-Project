import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { ListParams, Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { CreateSupplierDto, Supplier, UpdateSupplierDto } from '../model/types'

const RESOURCE = '/admin/suppliers'

interface RawList {
  data?: Supplier[]
  Data?: Supplier[]
  items?: Supplier[]
  Items?: Supplier[]
  result?: Supplier[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function toQuery(p: ListParams): Record<string, unknown> {
  return { Page: p.page, Limit: p.pageSize, Search: p.search || undefined }
}
function pickItems(data: RawList | Supplier[]): Supplier[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}
function pickTotal(res: AxiosResponse<RawList | Supplier[]>, items: Supplier[], p: ListParams): number {
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

export const supplierApi = {
  list: async (params: ListParams): Promise<Paginated<Supplier>> => {
    const res = await httpClient.get<RawList | Supplier[]>(RESOURCE, { params: toQuery(params) })
    const items = pickItems(res.data)
    return { items, total: pickTotal(res, items, params), page: params.page ?? 1, pageSize: params.pageSize ?? items.length }
  },
  getById: async (id: ID): Promise<Supplier> => {
    const { data } = await httpClient.get<Supplier>(`${RESOURCE}/${id}`)
    return data
  },
  create: async (dto: CreateSupplierDto): Promise<Supplier> => {
    const { data } = await httpClient.post<Supplier>(RESOURCE, dto)
    return data
  },
  update: async (id: ID, dto: UpdateSupplierDto): Promise<Supplier> => {
    const { data } = await httpClient.patch<Supplier>(`${RESOURCE}/${id}`, dto)
    return data
  },
  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
  removeMany: async (ids: ID[]): Promise<void> => {
    await httpClient.delete(RESOURCE, { params: { ids }, paramsSerializer: { indexes: null } })
  },
  options: async (search?: string): Promise<{ value: number; label: string }[]> => {
    const res = await httpClient.get<RawList | Supplier[]>(RESOURCE, {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pickItems(res.data).map((x) => ({ value: x.id, label: x.title || x.contactName || `#${x.id}` }))
  },
}
