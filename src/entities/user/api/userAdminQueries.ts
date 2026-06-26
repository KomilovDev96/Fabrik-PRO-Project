import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { userAdminApi } from './userAdminApi'
import type { AdminUser, AdminUserDetail, CreateUserDto, UpdateUserDto, UserListParams } from '../model/adminUser'

export const userKeys = {
  all: ['admin-users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  detail: (id: ID) => [...userKeys.all, 'detail', id] as const,
}

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userAdminApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useUser(id: ID | undefined) {
  return useQuery<AdminUserDetail, ApiError>({
    queryKey: userKeys.detail(id ?? 0),
    queryFn: () => userAdminApi.getById(id as ID),
    enabled: id != null,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation<AdminUser, ApiError, CreateUserDto>({
    mutationFn: (dto) => userAdminApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation<AdminUser, ApiError, { id: ID; dto: UpdateUserDto }>({
    mutationFn: ({ id, dto }) => userAdminApi.update(id, dto),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: userKeys.lists() })
      void qc.invalidateQueries({ queryKey: userKeys.detail(id) })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => userAdminApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  })
}

/** Bulk delete = sequential single deletes (UserAdmin has no safe bulk endpoint). */
export function useDeleteUsers() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => userAdminApi.remove(id)))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  })
}
