import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError, ListParams } from '@/shared/api'
import type { ID } from '@/shared/types'
import { cashboxApi } from './cashboxApi'
import type { CashBox, CreateCashBoxDto, UpdateCashBoxDto } from '../model/types'

/** Centralized query-key factory — precise, refactor-safe cache invalidation. */
export const cashboxKeys = {
  all: ['cashboxes'] as const,
  lists: () => [...cashboxKeys.all, 'list'] as const,
  list: (params: ListParams) => [...cashboxKeys.lists(), params] as const,
  details: () => [...cashboxKeys.all, 'detail'] as const,
  detail: (id: ID) => [...cashboxKeys.details(), id] as const,
}

/** Paginated list. `keepPreviousData` keeps the table stable while paging/searching. */
export function useCashBoxes(params: ListParams) {
  return useQuery({
    queryKey: cashboxKeys.list(params),
    queryFn: () => cashboxApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Cash-box options for finance pickers. Cached 1 min. */
export function useCashBoxOptions(search?: string) {
  return useQuery({
    queryKey: ['cashboxes', 'options', search ?? ''],
    queryFn: () => cashboxApi.options(search),
    staleTime: 60_000,
  })
}

/** Single cash box (used to prefill the edit form). */
export function useCashBox(id: ID | undefined) {
  return useQuery({
    queryKey: cashboxKeys.detail(id ?? 0),
    queryFn: () => cashboxApi.getById(id as ID),
    enabled: id != null,
  })
}

export function useCreateCashBox() {
  const qc = useQueryClient()
  return useMutation<CashBox, ApiError, CreateCashBoxDto>({
    mutationFn: (dto) => cashboxApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashboxKeys.lists() }),
  })
}

export function useUpdateCashBox() {
  const qc = useQueryClient()
  return useMutation<CashBox, ApiError, { id: ID; dto: UpdateCashBoxDto }>({
    mutationFn: ({ id, dto }) => cashboxApi.update(id, dto),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: cashboxKeys.lists() })
      void qc.invalidateQueries({ queryKey: cashboxKeys.detail(id) })
    },
  })
}

export function useDeleteCashBox() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => cashboxApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashboxKeys.lists() }),
  })
}
