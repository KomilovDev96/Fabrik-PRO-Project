import { useQuery } from '@tanstack/react-query'
import { departmentApi } from './departmentApi'

/** Department options for pickers (user department, …). Cached 1 min. */
export function useDepartmentOptions(search?: string) {
  return useQuery({
    queryKey: ['departments', 'options', search ?? ''],
    queryFn: () => departmentApi.options(search),
    staleTime: 60_000,
  })
}
