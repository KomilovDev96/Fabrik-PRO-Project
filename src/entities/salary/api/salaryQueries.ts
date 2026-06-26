import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { salaryApi } from './salaryApi'
import type { CreateSalaryDto, Salary, SalaryListParams, UpdateSalaryDto } from '../model/types'

export const salaryKeys = {
  all: ['salaries'] as const,
  lists: () => [...salaryKeys.all, 'list'] as const,
  list: (p: SalaryListParams) => [...salaryKeys.lists(), p] as const,
  detail: (id: ID) => [...salaryKeys.all, 'detail', id] as const,
}

export function useSalaries(params: SalaryListParams) {
  return useQuery({ queryKey: salaryKeys.list(params), queryFn: () => salaryApi.list(params), placeholderData: keepPreviousData })
}
export function useSalary(id: ID | undefined) {
  return useQuery({ queryKey: salaryKeys.detail(id ?? 0), queryFn: () => salaryApi.getById(id as ID), enabled: id != null })
}
export function useCreateSalary() {
  const qc = useQueryClient()
  return useMutation<Salary, ApiError, CreateSalaryDto>({ mutationFn: (dto) => salaryApi.create(dto), onSuccess: () => qc.invalidateQueries({ queryKey: salaryKeys.lists() }) })
}
export function useUpdateSalary() {
  const qc = useQueryClient()
  return useMutation<Salary, ApiError, { id: ID; dto: UpdateSalaryDto }>({
    mutationFn: ({ id, dto }) => salaryApi.update(id, dto),
    onSuccess: (_d, { id }) => { void qc.invalidateQueries({ queryKey: salaryKeys.lists() }); void qc.invalidateQueries({ queryKey: salaryKeys.detail(id) }) },
  })
}
export function useDeleteSalary() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({ mutationFn: (id) => salaryApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: salaryKeys.lists() }) })
}
export function useDeleteSalaries() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({ mutationFn: (ids) => salaryApi.removeMany(ids), onSuccess: () => qc.invalidateQueries({ queryKey: salaryKeys.lists() }) })
}
