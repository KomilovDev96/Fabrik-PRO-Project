import { useQuery } from '@tanstack/react-query'
import { userApi } from './userApi'

/** User options for pickers (warehouse responsible, assignees, …). Cached 1 min. */
export function useUserOptions(search?: string) {
  return useQuery({
    queryKey: ['users', 'options', search ?? ''],
    queryFn: () => userApi.options(search),
    staleTime: 60_000,
  })
}
