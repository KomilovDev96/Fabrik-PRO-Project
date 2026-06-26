import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/shared/api'

interface RawModel {
  id: number
  title?: string | null
}
interface RawList {
  data?: RawModel[]
  Data?: RawModel[]
  items?: RawModel[]
  Items?: RawModel[]
  result?: RawModel[]
}
function pick(data: RawList | RawModel[]): RawModel[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

/** Product-model options (for Part/Size pickers in Mahsulot model). */
export function useProductModelOptions(search?: string) {
  return useQuery({
    queryKey: ['product-models', 'options', search ?? ''],
    queryFn: async () => {
      const { data } = await httpClient.get<RawList | RawModel[]>('/admin/product-models', {
        params: { Page: 1, Limit: 100, Search: search || undefined },
      })
      return pick(data).map((m) => ({ value: m.id, label: m.title || `#${m.id}` }))
    },
    staleTime: 60_000,
  })
}
