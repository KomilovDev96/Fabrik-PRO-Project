import type { AxiosResponse } from 'axios'
import { httpClient } from '@/shared/api'
import type { ListParams, Paginated } from '@/shared/api'
import type { ID } from '@/shared/types'
import type { CreateItemDto, Item, ItemCategory, UpdateItemDto } from '../model/types'

// Items use REST-style routes (unlike Warehouse): /items, /items/{id}
const ITEMS = '/items'
const CATEGORIES = '/item-categories'

interface RawItem {
  id: number
  title: string
  categoryId?: number
  category?: string | { id?: number; title?: string }
}
type RawList = RawItem[] | { data?: RawItem[]; items?: RawItem[]; result?: RawItem[] }

function pick<T>(data: T[] | Record<string, unknown>, ...keys: string[]): T[] {
  if (Array.isArray(data)) return data
  for (const k of keys) {
    const v = (data as Record<string, unknown>)[k]
    if (Array.isArray(v)) return v as T[]
  }
  return []
}

/** Normalize a raw item: flatten the category object/string into a display title. */
function adaptItem(raw: RawItem): Item {
  const category =
    typeof raw.category === 'string' ? raw.category : (raw.category?.title ?? undefined)
  const categoryId = raw.categoryId ?? (typeof raw.category === 'object' ? raw.category?.id : undefined)
  return { id: raw.id, title: raw.title, category, categoryId }
}

function totalFromHeaders(res: AxiosResponse, fallback: number): number {
  const h = res.headers['x-total-count']
  const n = h != null ? Number(h) : NaN
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

function toQuery(params: ListParams & { categoryId?: number }): Record<string, unknown> {
  return {
    Page: params.page,
    Limit: params.pageSize,
    Search: params.search || undefined,
    CategoryId: params.categoryId || undefined,
  }
}

export const itemApi = {
  list: async (params: ListParams & { categoryId?: number }): Promise<Paginated<Item>> => {
    const res = await httpClient.get<RawList>(ITEMS, { params: toQuery(params) })
    const items = pick<RawItem>(res.data, 'data', 'items', 'result').map(adaptItem)
    return {
      items,
      total: totalFromHeaders(res, items.length),
      page: params.page ?? 1,
      pageSize: params.pageSize ?? items.length,
    }
  },

  getById: async (id: ID): Promise<Item> => {
    const { data } = await httpClient.get<RawItem | { data: RawItem }>(`${ITEMS}/${id}`)
    return adaptItem('data' in data ? data.data : data)
  },

  create: async (dto: CreateItemDto): Promise<Item> => {
    const { data } = await httpClient.post<RawItem>(ITEMS, dto)
    return adaptItem(data)
  },

  update: async (id: ID, dto: UpdateItemDto): Promise<Item> => {
    const { data } = await httpClient.patch<RawItem>(`${ITEMS}/${id}`, dto)
    return adaptItem(data)
  },

  remove: async (id: ID): Promise<void> => {
    await httpClient.delete(`${ITEMS}/${id}`)
  },

  categories: async (): Promise<ItemCategory[]> => {
    const { data } = await httpClient.get<ItemCategory[] | { data?: ItemCategory[] }>(CATEGORIES, {
      params: { Page: 1, Limit: 200 },
    })
    return pick<ItemCategory>(data as ItemCategory[] | Record<string, unknown>, 'data', 'items', 'result')
  },
}
