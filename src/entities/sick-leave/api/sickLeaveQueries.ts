import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { sickLeaveApi } from './sickLeaveApi'
import type { CreateSickLeaveDto, SickLeave, SickLeaveListParams, UpdateSickLeaveDto } from '../model/types'

export const sickLeaveKeys = {
  all: ['sick-leaves'] as const,
  lists: () => [...sickLeaveKeys.all, 'list'] as const,
  list: (p: SickLeaveListParams) => [...sickLeaveKeys.lists(), p] as const,
  detail: (id: ID) => [...sickLeaveKeys.all, 'detail', id] as const,
}

export function useSickLeaves(params: SickLeaveListParams) {
  return useQuery({
    queryKey: sickLeaveKeys.list(params),
    queryFn: () => sickLeaveApi.list(params),
    placeholderData: keepPreviousData,
  })
}
export function useSickLeave(id: ID | undefined) {
  return useQuery({
    queryKey: sickLeaveKeys.detail(id ?? 0),
    queryFn: () => sickLeaveApi.getById(id as ID),
    enabled: id != null,
  })
}
export function useCreateSickLeave() {
  const qc = useQueryClient()
  return useMutation<SickLeave, ApiError, CreateSickLeaveDto>({
    mutationFn: (dto) => sickLeaveApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: sickLeaveKeys.lists() }),
  })
}
export function useUpdateSickLeave() {
  const qc = useQueryClient()
  return useMutation<SickLeave, ApiError, { id: ID; dto: UpdateSickLeaveDto }>({
    mutationFn: ({ id, dto }) => sickLeaveApi.update(id, dto),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: sickLeaveKeys.lists() })
      void qc.invalidateQueries({ queryKey: sickLeaveKeys.detail(id) })
    },
  })
}
export function useDeleteSickLeave() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => sickLeaveApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sickLeaveKeys.lists() }),
  })
}
export function useDeleteSickLeaves() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({
    mutationFn: (ids) => sickLeaveApi.removeMany(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: sickLeaveKeys.lists() }),
  })
}
