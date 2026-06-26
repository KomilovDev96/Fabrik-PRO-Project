import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { outcomeApi } from './outcomeApi'
import type { CreateOutcomeDto, Outcome, OutcomeListParams, UpdateOutcomeDto } from '../model/types'

export const outcomeKeys = {
  all: ['outcomes'] as const,
  lists: () => [...outcomeKeys.all, 'list'] as const,
  list: (p: OutcomeListParams) => [...outcomeKeys.lists(), p] as const,
  detail: (id: ID) => [...outcomeKeys.all, 'detail', id] as const,
}

export function useOutcomes(params: OutcomeListParams) {
  return useQuery({
    queryKey: outcomeKeys.list(params),
    queryFn: () => outcomeApi.list(params),
    placeholderData: keepPreviousData,
  })
}
export function useOutcome(id: ID | undefined) {
  return useQuery({
    queryKey: outcomeKeys.detail(id ?? 0),
    queryFn: () => outcomeApi.getById(id as ID),
    enabled: id != null,
  })
}
export function useCreateOutcome() {
  const qc = useQueryClient()
  return useMutation<Outcome, ApiError, CreateOutcomeDto>({
    mutationFn: (dto) => outcomeApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: outcomeKeys.lists() }),
  })
}
export function useUpdateOutcome() {
  const qc = useQueryClient()
  return useMutation<Outcome, ApiError, { id: ID; dto: UpdateOutcomeDto }>({
    mutationFn: ({ id, dto }) => outcomeApi.update(id, dto),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: outcomeKeys.lists() })
      void qc.invalidateQueries({ queryKey: outcomeKeys.detail(id) })
    },
  })
}
export function useDeleteOutcome() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => outcomeApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: outcomeKeys.lists() }),
  })
}
export function useDeleteOutcomes() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({
    mutationFn: (ids) => outcomeApi.removeMany(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: outcomeKeys.lists() }),
  })
}
