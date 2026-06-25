import { useQuery } from '@tanstack/react-query'
import { organizationApi } from './organizationApi'

/** Organization options for pickers (client org, …). Cached 1 min. */
export function useOrganizationOptions(search?: string) {
  return useQuery({
    queryKey: ['organizations', 'options', search ?? ''],
    queryFn: () => organizationApi.options(search),
    staleTime: 60_000,
  })
}
