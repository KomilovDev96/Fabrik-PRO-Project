import { useQuery } from '@tanstack/react-query'
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
function pick(data: RawList | RawCat[]): RawCat[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

/** Income category options (Daromad toifasi). */
export function useIncomeCategoryOptions(search?: string) {
  return useQuery({
    queryKey: ['income-categories', 'options', search ?? ''],
    queryFn: async () => {
      const { data } = await httpClient.get<RawList | RawCat[]>('/admin/income-categories', {
        params: { Page: 1, Limit: 100, Search: search || undefined },
      })
      return pick(data).map((c) => ({ value: c.id, label: c.title || `#${c.id}` }))
    },
    staleTime: 60_000,
  })
}
