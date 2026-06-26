import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { incomeApi } from './incomeApi'
import type { CreateIncomeDto, Income, IncomeListParams, UpdateIncomeDto } from '../model/types'

export const incomeKeys = {
  all: ['incomes'] as const,
  lists: () => [...incomeKeys.all, 'list'] as const,
  list: (p: IncomeListParams) => [...incomeKeys.lists(), p] as const,
  detail: (id: ID) => [...incomeKeys.all, 'detail', id] as const,
}

export function useIncomes(params: IncomeListParams) {
  return useQuery({
    queryKey: incomeKeys.list(params),
    queryFn: () => incomeApi.list(params),
    placeholderData: keepPreviousData,
  })
}
export function useIncome(id: ID | undefined) {
  return useQuery({
    queryKey: incomeKeys.detail(id ?? 0),
    queryFn: () => incomeApi.getById(id as ID),
    enabled: id != null,
  })
}
export function useCreateIncome() {
  const qc = useQueryClient()
  return useMutation<Income, ApiError, CreateIncomeDto>({
    mutationFn: (dto) => incomeApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: incomeKeys.lists() }),
  })
}
export function useUpdateIncome() {
  const qc = useQueryClient()
  return useMutation<Income, ApiError, { id: ID; dto: UpdateIncomeDto }>({
    mutationFn: ({ id, dto }) => incomeApi.update(id, dto),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: incomeKeys.lists() })
      void qc.invalidateQueries({ queryKey: incomeKeys.detail(id) })
    },
  })
}
export function useDeleteIncome() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => incomeApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: incomeKeys.lists() }),
  })
}
export function useDeleteIncomes() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({
    mutationFn: (ids) => incomeApi.removeMany(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: incomeKeys.lists() }),
  })
}
