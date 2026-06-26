import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { payrollApi } from './payrollApi'
import type {
  CreatePayrollDto,
  PayrollEntry,
  PayrollKind,
  PayrollListParams,
  UpdatePayrollDto,
} from '../model/types'

/** Query keys namespaced by kind so the four ledgers never collide in the cache. */
export const payrollKeys = {
  all: (kind: PayrollKind) => ['payroll', kind] as const,
  lists: (kind: PayrollKind) => [...payrollKeys.all(kind), 'list'] as const,
  list: (kind: PayrollKind, params: PayrollListParams) => [...payrollKeys.lists(kind), params] as const,
  detail: (kind: PayrollKind, id: ID) => [...payrollKeys.all(kind), 'detail', id] as const,
}

export function usePayrollList(kind: PayrollKind, params: PayrollListParams) {
  return useQuery({
    queryKey: payrollKeys.list(kind, params),
    queryFn: () => payrollApi.list(kind, params),
    placeholderData: keepPreviousData,
  })
}

export function usePayrollEntry(kind: PayrollKind, id: ID | undefined) {
  return useQuery({
    queryKey: payrollKeys.detail(kind, id ?? 0),
    queryFn: () => payrollApi.getById(kind, id as ID),
    enabled: id != null,
  })
}

export function useCreatePayroll(kind: PayrollKind) {
  const qc = useQueryClient()
  return useMutation<PayrollEntry, ApiError, CreatePayrollDto>({
    mutationFn: (dto) => payrollApi.create(kind, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: payrollKeys.lists(kind) }),
  })
}

export function useUpdatePayroll(kind: PayrollKind) {
  const qc = useQueryClient()
  return useMutation<PayrollEntry, ApiError, { id: ID; dto: UpdatePayrollDto }>({
    mutationFn: ({ id, dto }) => payrollApi.update(kind, id, dto),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: payrollKeys.lists(kind) })
      void qc.invalidateQueries({ queryKey: payrollKeys.detail(kind, id) })
    },
  })
}

export function useDeletePayroll(kind: PayrollKind) {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => payrollApi.remove(kind, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: payrollKeys.lists(kind) }),
  })
}

export function useDeletePayrolls(kind: PayrollKind) {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({
    mutationFn: (ids) => payrollApi.removeMany(kind, ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: payrollKeys.lists(kind) }),
  })
}
