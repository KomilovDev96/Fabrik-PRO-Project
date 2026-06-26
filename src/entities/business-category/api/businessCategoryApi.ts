import { httpClient } from '@/shared/api'

interface RawCat {
  id: number
  title?: string | null
}
interface RawList {
  data?: RawCat[]
  Data?: RawCat[]
  items?: RawCat[]
  Items?: RawCat[]
  result?: RawCat[]
}
export interface BusinessCategoryOption {
  value: number
  label: string
}
function pick(data: RawList | RawCat[]): RawCat[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}
export const businessCategoryApi = {
  /** Business categories as <Select> options (organization category). */
  options: async (search?: string): Promise<BusinessCategoryOption[]> => {
    const { data } = await httpClient.get<RawList | RawCat[]>('/admin/business-categories', {
      params: { Page: 1, Limit: 100, Search: search || undefined },
    })
    return pick(data).map((c) => ({ value: c.id, label: c.title || `#${c.id}` }))
  },
}
