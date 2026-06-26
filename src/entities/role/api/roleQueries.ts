import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError, ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'
import { roleApi } from './roleApi'
import type { CreateRoleDto, Role, UpdateMethod, UpdateRoleDto } from '../model/types'

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (p: ListParams) => [...roleKeys.lists(), p] as const,
}

/** Role options for pickers (user role, …). Cached 1 min. */
export function useRoleOptions(search?: string) {
  return useQuery({
    queryKey: ['roles', 'options', search ?? ''],
    queryFn: () => roleApi.options(search),
    staleTime: 60_000,
  })
}

export function useRoles(params: ListParams) {
  return useQuery({ queryKey: roleKeys.list(params), queryFn: () => roleApi.list(params), placeholderData: keepPreviousData })
}

export function usePermissions() {
  return useQuery({ queryKey: ['permissions', 'all'], queryFn: () => roleApi.permissions(), staleTime: 5 * 60_000 })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation<Role, ApiError, CreateRoleDto>({ mutationFn: (dto) => roleApi.create(dto), onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.lists() }) })
}
export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation<Role, ApiError, { id: ID; dto: UpdateRoleDto }>({ mutationFn: ({ id, dto }) => roleApi.update(id, dto), onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.lists() }) })
}
export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({ mutationFn: (id) => roleApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.lists() }) })
}
export function useSetRolePermissions() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, { id: ID; permissions: number[]; method?: UpdateMethod }>({
    mutationFn: ({ id, permissions, method }) => roleApi.setPermissions(id, permissions, method),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.lists() }),
  })
}
