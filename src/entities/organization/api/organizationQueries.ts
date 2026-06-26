import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { organizationApi } from './organizationApi'
import type { Organization, UpdateOrganizationDto } from '../model/types'

export const organizationKeys = {
  all: ['organizations'] as const,
  list: () => [...organizationKeys.all, 'list'] as const,
  current: () => [...organizationKeys.all, 'current'] as const,
}

/** Organization options for pickers (client org, …). Cached 1 min. */
export function useOrganizationOptions(search?: string) {
  return useQuery({
    queryKey: ['organizations', 'options', search ?? ''],
    queryFn: () => organizationApi.options(search),
    staleTime: 60_000,
  })
}

/**
 * The "current" organization for the Sozlamalar → Account tab. The admin API has
 * no GetMe-org endpoint, so we take the first organization from the list.
 */
export function useCurrentOrganization() {
  return useQuery<Organization | undefined>({
    queryKey: organizationKeys.current(),
    queryFn: async () => (await organizationApi.list())[0],
  })
}

export function useUpdateOrganization() {
  const qc = useQueryClient()
  return useMutation<Organization, ApiError, { id: ID; dto: UpdateOrganizationDto }>({
    mutationFn: ({ id, dto }) => organizationApi.update(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: organizationKeys.current() })
      void qc.invalidateQueries({ queryKey: organizationKeys.list() })
    },
  })
}
