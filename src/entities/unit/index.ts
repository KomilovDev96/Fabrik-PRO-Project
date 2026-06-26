import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/shared/api'

interface Raw {
  id: number
  title?: string | null
  shortCode?: string | null
}
interface RawList {
  data?: Raw[]
  Data?: Raw[]
  items?: Raw[]
  Items?: Raw[]
  result?: Raw[]
}
function pick(data: RawList | Raw[]): Raw[] {
  if (Array.isArray(data)) return data
  return data.data ?? data.Data ?? data.items ?? data.Items ?? data.result ?? []
}

/** Unit options (O'lchov birliklari) for the supply line-items picker. */
export function useUnitOptions(search?: string) {
  return useQuery({
    queryKey: ['units', 'options', search ?? ''],
    queryFn: async () => {
      const { data } = await httpClient.get<RawList | Raw[]>('/admin/units', {
        params: { Page: 1, Limit: 100, Search: search || undefined },
      })
      return pick(data).map((x) => ({ value: x.id, label: x.shortCode ? `${x.title} (${x.shortCode})` : x.title || `#${x.id}` }))
    },
    staleTime: 60_000,
  })
}
