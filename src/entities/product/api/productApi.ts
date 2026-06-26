import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { ListParams, Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { CreateProductDto, Product, UpdateProductDto } from '../model/types'

const RESOURCE = '/admin/products'

interface RawList {
  data?: Product[]
  Data?: Product[]
  items?: Product[]
  Items?: Product[]
  result?: Product[]
  total?: number
  totalCount?: number
  TotalCount?: number
}

function toQuery(p: ListParams): Record<string, unknown> {
  return { Page: p.page, Limit: p.pageSize, Search: p.search || undefined }
}
function pickItems(data: RawList | Product[]): Product[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}
function pickTotal(res: AxiosResponse<RawList | Product[]>, items: Product[], p: ListParams): number {
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

export const productApi = {
  list: async (params: ListParams): Promise<Paginated<Product>> => {
    const res = await httpClient.get<RawList | Product[]>(RESOURCE, { params: toQuery(params) })
    const items = pickItems(res.data)
    return { items, total: pickTotal(res, items, params), page: params.page ?? 1, pageSize: params.pageSize ?? items.length }
  },
  getById: async (id: ID): Promise<Product> => {
    const { data } = await httpClient.get<Product>(`${RESOURCE}/${id}`)
    return data
  },
  create: async (dto: CreateProductDto): Promise<Product> => {
    const { data } = await httpClient.post<Product>(RESOURCE, dto)
    return data
  },
  update: async (id: ID, dto: UpdateProductDto): Promise<Product> => {
    const { data } = await httpClient.patch<Product>(`${RESOURCE}/${id}`, dto)
    return data
  },
  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
  removeMany: async (ids: ID[]): Promise<void> => {
    await httpClient.delete(RESOURCE, { params: { ids }, paramsSerializer: { indexes: null } })
  },
  options: async (search?: string): Promise<{ value: number; label: string }[]> => {
    const res = await httpClient.get<RawList | Product[]>(RESOURCE, {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pickItems(res.data).map((x) => ({ value: x.id, label: x.title || `#${x.id}` }))
  },
}
