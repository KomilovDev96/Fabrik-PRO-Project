import { useQuery } from '@tanstack/react-query'
import { businessCategoryApi } from './businessCategoryApi'

/** Business-category options (organization category). Cached 1 min. */
export function useBusinessCategoryOptions(search?: string) {
  return useQuery({
    queryKey: ['business-categories', 'options', search ?? ''],
    queryFn: () => businessCategoryApi.options(search),
    staleTime: 60_000,
  })
}
